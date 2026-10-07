# 📋 INFORME DE AUDITORÍA TÉCNICA Y DE SEGURIDAD (V2)
**Proyecto**: Control Financiero (Full-Stack: Node.js / Express / Drizzle ORM + React / TypeScript / Vite)  
**Rol**: Arquitecto de Software Senior y Auditor de Seguridad  
**Fecha de Emisión**: Octubre 2026  
**Alcance**: Backend (`/backend`), Frontend (`/frontend`), Esquemas de Base de Datos y Motores Contables  

---

## 🧭 Resumen Ejecutivo

Se ha completado un escaneo exhaustivo y profundo de la arquitectura, flujos transaccionales, ledger contable, esquemas relacionales y componentes visuales de la aplicación. 

A través de esta auditoría se identificaron **6 vulnerabilidades críticas** que causan o pueden causar corrupción matemática directa en los balances de las cuentas y desincronización del ledger de deudas, **7 fallas de severidad alta** (incluyendo vulnerabilidades de CSRF/CORS, falta de sanitización de entradas y bloqueos de pantalla blanca en UI), y **5 observaciones de severidad media** sobre performance y experiencia de usuario.

A continuación se detalla cada problema, su causa raíz en el código, su impacto en el negocio y la solución técnica requerida.

---

## 🔴 SEVERIDAD CRÍTICA (Corrupción Matemática de Saldos o Fallas Transaccionales)

### 1. Violación Directa de la Inmutabilidad de Saldos (`updateAccount`)
- **Ubicación**:
  - Backend: [`backend/src/modules/accounts/accounts.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/accounts/accounts.service.ts#L47-L56)
  - Backend: [`backend/src/modules/accounts/accounts.validators.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/accounts/accounts.validators.ts#L88-L92)
  - Frontend: [`frontend/src/modules/accounts/components/AccountForm.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/modules/accounts/components/AccountForm.tsx#L47-L50)
- **Regla Incumplida**: *Regla 1 (Inmutabilidad de Saldos)*: Los saldos de las cuentas (`amount`) nunca deben modificarse directamente a través de un endpoint de edición. Solo pueden alterarse mediante transacciones (`Income`, `Expense`, `Transfer`).
- **Descripción**:
  En `accounts.service.ts`, el método `updateAccount` contiene una excepción explícita que permite la sobreescritura manual del saldo `amount` si el tipo de cuenta es `"Efectivo"` o `"Billetera virtual"`:
  ```typescript
  // accounts.service.ts: L47-L56
  const isDirectlyEditable =
    existing.type === "Efectivo" ||
    data.type === "Efectivo" ||
    existing.type === "Billetera virtual" ||
    data.type === "Billetera virtual";

  if (!isDirectlyEditable) {
    delete allowedData.amount;
  }
  ```
  Complementariamente, `AccountForm.tsx` en el frontend calcula `canEditBalance` y envía el campo `amount` en el payload de actualización para dichos tipos.
- **Impacto**:
  Un usuario puede alterar su dinero disponible arbitrariamente desde la interfaz o vía API sin que se registre ninguna transacción contable (`Transaction`). Esto destruye la trazabilidad histórica, descuadra el cálculo de ingresos/egresos del período y rompe el principio de partida contable.
- **Solución**:
  1. En `accounts.validators.ts`, remover el campo `amount` de `updateAccountSchema`.
  2. En `accounts.service.ts`, eliminar la variable `isDirectlyEditable` y hacer `delete allowedData.amount;` de forma incondicional en `updateAccount`.
  3. En `AccountForm.tsx`, cuando `isEditing` sea `true`, deshabilitar u ocultar el input de saldo inicial, impidiendo que el formulario envíe `amount` en modo edición.

---

### 2. Inversión Matemática de Saldos con Tarjetas de Crédito en Movimientos de Deuda
- **Ubicación**:
  - Backend: [`backend/src/modules/debts/debts.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/debts/debts.service.ts#L334-L342) (en `addMovement`)
  - Backend: [`backend/src/modules/debts/debts.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/debts/debts.service.ts#L439-L447) (en `deleteMovement`)
  - Backend: [`backend/src/modules/debts/debts.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/debts/debts.service.ts#L530-L538) (en `deleteDebt`)
- **Regla Incumplida**: *Regla 3 (Ledger de Deudas) y Regla 2 (Comportamiento de Tarjetas de Crédito)*.
- **Descripción**:
  En el motor principal de transacciones (`transactions.service.ts`), las tarjetas de crédito registran saldo pasivo: un gasto (`Expense`) **aumenta** el balance de la tarjeta (más deuda consumida), mientras que un ingreso (`Income`) **disminuye** el balance.
  Sin embargo, en `debts.service.ts`, al crear o revertir transacciones asociadas a un movimiento de deuda, el balance de la cuenta bancaria se actualiza con la lógica tradicional de cuentas de activo:
  ```typescript
  // debts.service.ts: L334-L338
  const newBalance =
    transactionType === "Expense"
      ? (account.amount ?? 0) - data.amount
      : (account.amount ?? 0) + data.amount;
  ```
  En ningún momento se verifica si la cuenta seleccionada en `data.accountID` es una tarjeta de crédito (`isCreditCard(account.type, account.tag)`).
- **Impacto**:
  Si un usuario paga una deuda o registra un cargo con su Tarjeta de Crédito:
  - Al crearse el movimiento, en vez de aumentar la deuda de la tarjeta, se le **resta**, inflando artificialmente el crédito disponible.
  - Al eliminarse el movimiento o la deuda, la reversión vuelve a sumar dinero en lugar de restar la deuda.
  - El saldo contable de la tarjeta de crédito queda totalmente invertido y corrupto.
- **Solución**:
  En `debts.service.ts`, importar y aplicar la función `isCreditCard` tanto en `addMovement`, `deleteMovement` y `deleteDebt`:
  ```typescript
  const isCard = isCreditCard(account.type, account.tag);
  let newBalance: number;
  if (transactionType === "Expense") {
    newBalance = isCard
      ? (account.amount ?? 0) + data.amount
      : (account.amount ?? 0) - data.amount;
  } else {
    newBalance = isCard
      ? (account.amount ?? 0) - data.amount
      : (account.amount ?? 0) + data.amount;
  }
  ```

---

### 3. Omisión Total de Validación de Límite de Crédito (`creditLimit`) en Transacciones
- **Ubicación**:
  - Backend: [`backend/src/modules/transactions/transactions.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.service.ts#L233-L242)
- **Regla Incumplida**: *Regla 2 (Validación de saldo disponible y límites de crédito)*.
- **Descripción**:
  En `createTransaction`, se valida que las cuentas tradicionales tengan saldo suficiente antes de emitir un `Expense` o `Transfer`. Sin embargo, para las tarjetas de crédito la validación se saltea intencionalmente mediante la condición `!isCreditCard(...)`, pero **nunca se verifica si el nuevo balance supera el límite de crédito (`creditLimit`)**:
  ```typescript
  // transactions.service.ts: L233-L242
  if (data.type === "Expense" || data.type === "Transfer") {
    const sourceBalance = sourceAccount.amount ?? 0;
    if (!isCreditCard(sourceAccount.type, sourceAccount.tag) && data.amount > sourceBalance) {
      throw new AppError("Saldo insuficiente en la cuenta origen", 400, "INSUFFICIENT_FUNDS");
    }
  }
  ```
- **Impacto**:
  Un usuario con una tarjeta cuyo límite es de $100.000 puede registrar consumos por $1.000.000 sin que el sistema emita error alguno. La aplicación carece de control preventivo de sobregiro o límite de financiación.
- **Solución**:
  Añadir la validación correspondiente para tarjetas de crédito:
  ```typescript
  if (isCreditCard(sourceAccount.type, sourceAccount.tag)) {
    if (sourceAccount.creditLimit && sourceAccount.creditLimit > 0) {
      const currentDebt = sourceAccount.amount ?? 0;
      if (currentDebt + data.amount > sourceAccount.creditLimit) {
        throw new AppError(
          "El monto supera el límite de crédito disponible de la tarjeta",
          400,
          "CREDIT_LIMIT_EXCEEDED"
        );
      }
    }
  }
  ```

---

### 4. Desvinculación y Reversión Incompleta en Transacciones en Cuotas (`installments`)
- **Ubicación**:
  - Backend: [`backend/src/modules/transactions/transactions.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.service.ts#L291-L305) (Creación de cuotas)
  - Backend: [`backend/src/modules/transactions/transactions.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.service.ts#L742-L780) (Eliminación)
  - Esquema: [`backend/src/modules/transactions/transactions.schema.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.schema.ts#L8-L38)
- **Regla Incumplida**: *Regla 2 (Motor de cuotas y reversión atómica)*.
- **Descripción**:
  Cuando el usuario registra una compra en cuotas (ej. $30.000 en 3 cuotas de $10.000):
  1. `createTransaction` carga los $30.000 completos al saldo de la tarjeta de crédito de una sola vez.
  2. Genera 3 registros individuales en la tabla `transactions`, cada uno por $10.000, con descripciones como `"Compra (Cuota 1/3)"`.
  3. No existe ningún identificador de grupo (`installmentGroupId` o `parentTransactionId`) en el esquema de `transactions`.
  4. Al llamar a `deleteTransaction` sobre la "Cuota 1/3", el backend solo revierte $10.000 del saldo de la tarjeta y borra esa única fila. Las cuotas 2 y 3 permanecen en el sistema, pero la tarjeta quedó con $20.000 de deuda en vez de eliminarse la compra completa.
- **Impacto**:
  Si el usuario se equivoca al ingresar una compra en cuotas y borra la transacción que ve en la pantalla actual, las cuotas de los meses siguientes continúan existiendo, y el saldo de la tarjeta queda desincronizado con respecto al monto total original.
- **Solución**:
  1. Agregar la columna `installmentGroupId: text("installment_group_id")` en `transactions.schema.ts`.
  2. Al generar las cuotas, asignar el mismo `installmentGroupId` a todas las filas generadas.
  3. En `deleteTransaction`: Si la transacción tiene `installmentGroupId`, consultar todas las cuotas hermanas del grupo, sumar sus montos, revertir la totalidad en la tarjeta de crédito y eliminar todas las cuotas del grupo en una única transacción atómica.

---

### 5. Vulnerabilidad Crítica en Endpoint Huérfano `PATCH /transactions/:id`
- **Ubicación**:
  - Backend: [`backend/src/modules/transactions/transactions.routes.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.routes.ts#L12)
  - Backend: [`backend/src/modules/transactions/transactions.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.service.ts#L606-L632)
- **Regla Incumplida**: *Regla 1 (Prohibición de edición de transacciones) y Regla 2*.
- **Descripción**:
  Aunque la interfaz de usuario ya no ofrece edición de transacciones, la ruta `router.patch("/:id", transactionController.updateTransaction)` continúa expuesta en el backend.
  Dentro de `updateTransaction` (líneas 606-632), si se solicita actualizar una transacción indicando `installments > 1`:
  - Modifica la transacción actual a `"Cuota 1"`.
  - Inserta nuevas cuotas en la base de datos **sin eliminar las cuotas previas**.
  - Suma nuevamente el monto total al balance de la tarjeta de crédito.
- **Impacto**:
  Cualquier cliente HTTP, script externo o llamada manual al endpoint corrompe de inmediato los saldos y duplica transacciones en la base de datos.
- **Solución**:
  Desactivar o remover `router.patch("/:id")` de `transactions.routes.ts` respondiendo con `405 Method Not Allowed` o eliminando el endpoint por completo, forzando la política de negocio estricta: *"Las transacciones son inmutables; para corregir, se deben eliminar y volver a crear"*.

---

### 6. Desajuste de Tipos Decimales vs Enteros (`integer`) en SQLite / Drizzle
- **Ubicación**:
  - Esquema: [`backend/src/modules/accounts/accounts.schema.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/accounts/accounts.schema.ts#L32) (`amount: integer("amount")`)
  - Esquema: [`backend/src/modules/transactions/transactions.schema.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.schema.ts#L16) (`amount: integer("amount")`)
  - Esquema: [`backend/src/modules/debts/debts.schema.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/debts/debts.schema.ts#L12) (`initialAmount: integer(...)`)
  - Validadores: [`backend/src/modules/transactions/transactions.validators.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.validators.ts#L13) (`amount: z.number().positive()`)
- **Regla Incumplida**: *Regla 2 (Precisión de centavos sin redondeo)*.
- **Descripción**:
  La base de datos utiliza `integer("amount")` en todas las tablas financieras, mientras que los validadores Zod aceptan `z.number()` con decimales flotantes (ej. `$1500.50`). Al interactuar con SQLite mediante el driver de LibSQL/Drizzle, los números con coma flotante son truncados o convertidos según la coerción nativa de SQLite.
  Además, al dividir cuotas:
  ```typescript
  const installmentAmount = Math.floor(data.amount / installmentsCount);
  const remainder = data.amount - installmentAmount * installmentsCount;
  ```
  Si `data.amount` contiene centavos decimales, `remainder` resulta en un número flotante con imprecisiones binarias típicas de IEEE-754 (ej. `0.3000000000000007`).
- **Impacto**:
  Pérdida silenciosa de centavos en registros bancarios, discrepancias entre saldos de tarjetas y sumatorias de cuotas.
- **Solución**:
  Adoptar un estándar estricto en toda la aplicación:
  - **Opción A (Recomendada en finanzas)**: Almacenar siempre montos en centavos como enteros puros (`100.50 ARS` -> `10050` en base de datos) y formatear a decimales únicamente en la capa visual.
  - **Opción B**: Cambiar en los esquemas Drizzle `integer("amount")` por `real("amount")` o `numeric("amount")` y utilizar funciones de redondeo a 2 decimales fijos (`Number(val.toFixed(2))`).

---

## 🟠 SEVERIDAD ALTA (Validación, Seguridad de Rutas y Fallos de Renderizado en UI)

### 1. Política CORS Excesivamente Permisiva con `credentials: true` y `SameSite=none`
- **Ubicación**:
  - Backend: [`backend/src/app.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/app.ts#L26-L36)
  - Backend: [`backend/src/modules/auth/auth.controller.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/auth/auth.controller.ts#L13-L18)
- **Descripción**:
  En `app.ts`:
  ```typescript
  if (allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  ```
  La regla `normalized.endsWith('.vercel.app')` autoriza a **cualquier aplicación web pública desplegada en la plataforma Vercel** a emitir peticiones con credenciales (`credentials: true`).
  Dado que en `auth.controller.ts`, las cookies `accessToken` y `refreshToken` se emiten con `sameSite: 'none'`, cualquier sitio web malicioso creado por un tercero en Vercel (ej. `sitio-malicioso.vercel.app`) puede hacer fetch con cookies de sesión activas hacia la API de Control Financiero y exfiltrar toda la información de transacciones y saldos del usuario (Cross-Origin Data Leakage / CSRF).
- **Impacto**:
  Riesgo de seguridad mayor. Exfiltración de datos financieros y manipulación de cuentas.
- **Solución**:
  Remover inmediatamente el comodín `.endsWith('.vercel.app')`. Utilizar una lista blanca estricta de dominios autorizados leída de la variable de entorno `config.frontendUrl`:
  ```typescript
  const allowedOrigins = [
    config.frontendUrl?.replace(/\/$/, ''),
    'http://localhost:5173',
  ].filter(Boolean) as string[];
  ```

---

### 2. Ausencia del Middleware de Validación Zod en Rutas de Transacciones
- **Ubicación**:
  - Backend: [`backend/src/modules/transactions/transactions.routes.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.routes.ts#L11-L12)
- **Descripción**:
  A diferencia de las rutas de cuentas (`validate(createAccountSchema)`) o deudas (`validate(createMovementSchema)`), el enrutador de transacciones no utiliza el middleware `validate(...)`:
  ```typescript
  router.post("/", transactionController.createTransaction);
  ```
  La validación se ejecuta manualmente dentro del método `createTransaction` del controlador. Si en futuras modificaciones se omite la llamada en el controlador, la ruta queda completamente desprotegida contra inyección de tipos.
- **Solución**:
  Estandarizar las rutas en `transactions.routes.ts` incorporando `validate(createTransactionSchema)`.

---

### 3. Validación Laxa de Formato de Fechas en Transacciones y Movimientos
- **Ubicación**:
  - Backend: [`backend/src/modules/transactions/transactions.validators.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.validators.ts#L20)
  - Backend: [`backend/src/modules/transactions/transactions.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/transactions/transactions.service.ts#L38-L48)
- **Descripción**:
  El validador Zod define `date: z.string().min(1).max(50)`. Cualquier cadena arbitraria (ej. `"ayer"`, `"10/05/2026"`, `"invalid"`) pasa la validación.
  En `transactions.service.ts`, la función `addMonthsToDate` asume estrictamente el formato `YYYY-MM-DD`:
  ```typescript
  const [yearStr, monthStr, dayStr] = baseDateStr.split("T")[0].split("-");
  const year = parseInt(yearStr, 10);
  ```
  Si se envía una fecha con otro formato, `year`, `month` y `day` evalúan a `NaN`, almacenando en base de datos registros con fecha corrupta `NaN-NaN-NaN`.
- **Solución**:
  Exigir formato regex estricto `YYYY-MM-DD` en los validadores Zod:
  ```typescript
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
  ```

---

### 4. Cálculo Incompleto del Patrimonio Neto (`netWorth`) en Dashboard
- **Ubicación**:
  - Backend: [`backend/src/modules/dashboard/dashboard.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/dashboard/dashboard.service.ts#L101-L107)
- **Descripción**:
  El cálculo del patrimonio neto se realiza como:
  ```typescript
  const netWorth = totalAccountsBalance - totalPendingPayableDebts;
  ```
  Solo resta las deudas pendientes que el usuario debe pagar (`Payable`), pero **ignora completamente los cobros pendientes (`Receivable`)**.
- **Impacto**:
  Si el usuario prestó $100.000 (disminuyendo el saldo de su cuenta bancaria), ese dinero no figura en las cuentas ni en el patrimonio neto, falseando la situación patrimonial real.
- **Solución**:
  Sumar las deudas activas de tipo `Receivable` al cálculo:
  ```typescript
  const totalPendingReceivables = allDebts
    .filter((debt) => debt.type === "Receivable" && debt.status !== "Settled")
    .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0);

  const netWorth = totalAccountsBalance - totalPendingPayableDebts + totalPendingReceivables;
  ```

---

### 5. Riesgo Crítico de Pantalla Blanca en `MessageInfo.tsx`
- **Ubicación**:
  - Frontend: [`frontend/src/components/ui/messages/MessageInfo.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/components/ui/messages/MessageInfo.tsx#L8-L10)
- **Descripción**:
  `MessageInfo` ejecuta directamente:
  ```typescript
  export const MessageInfo = ({ message, className = "" }: MessageInfoProps) => {
    const messages = message.split('. ');
  ```
  A diferencia de `MessageError.tsx`, que posee una guarda `if (!message) return null;`, `MessageInfo` no valida si `message` es undefined, null o no string.
- **Impacto**:
  Cualquier componente que invoque `<MessageInfo message={infoMsg} />` donde `infoMsg` resulte `undefined` provoca un error no capturado que destruye el árbol de React, mostrando una pantalla blanca al usuario.
- **Solución**:
  Añadir validación defensiva en la primera línea de `MessageInfo.tsx`:
  ```typescript
  if (!message || typeof message !== 'string') return null;
  ```

---

### 6. Vulnerabilidad de Pantalla Blanca en Búsquedas de Cuentas, Categorías y Entidades
- **Ubicación**:
  - Frontend: [`frontend/src/pages/AccountsPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/AccountsPage.tsx#L121)
  - Frontend: [`frontend/src/pages/CategoriesPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/CategoriesPage.tsx#L47)
  - Frontend: [`frontend/src/pages/EntitiesPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/EntitiesPage.tsx#L47)
- **Descripción**:
  Los filtros de búsqueda en memoria asumen que los atributos `name` y `bank` son siempre cadenas definidas:
  ```typescript
  // AccountsPage.tsx: L121
  const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.bank.toLowerCase().includes(searchTerm.toLowerCase());
  ```
  En `TransactionsPage.tsx` esto se protegió adecuadamente usando optional chaining (`t.entity?.name?.toLowerCase()`), pero en las otras 3 páginas se omitió.
- **Impacto**:
  Si la base de datos devuelve un registro con `name` o `bank` nulo o malformado, la vista de cuentas o categorías colapsa completamente al escribir en la barra de búsqueda.
- **Solución**:
  Proteger las comparaciones con optional chaining:
  ```typescript
  const matchesSearch = 
    (acc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (acc.bank?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  ```

---

### 7. Falta de Limpieza de Estado (`onHidden`) en Modales de Confirmación
- **Ubicación**:
  - Frontend: [`frontend/src/pages/AccountsPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/AccountsPage.tsx#L304-L368) (`confirm-deactivate-modal`, `confirm-reactivate-modal`)
  - Frontend: [`frontend/src/pages/CategoriesPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/CategoriesPage.tsx#L202-L255) (`confirm-deactivate-category-modal`, `confirm-reactivate-category-modal`)
  - Frontend: [`frontend/src/pages/EntitiesPage.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/pages/EntitiesPage.tsx#L202-L255) (`confirm-deactivate-entity-modal`, `confirm-reactivate-entity-modal`)
- **Descripción**:
  Los componentes `ModalConfirm` utilizados para dar de baja o reactivar registros en estas tres páginas no configuran la propiedad `onHidden`.
  Si el usuario abre el modal de confirmación y lo cancela presionando la tecla Escape o haciendo clic fuera del modal (backdrop), el estado del registro seleccionado (`selectedAccountID`, `selectedCategory`, `selectedEntity`) **permanece cargado en memoria**.
- **Impacto**:
  Posibles ejecuciones erróneas sobre registros previamente seleccionados si se disparan accesos rápidos por teclado, o retención innecesaria de objetos en memoria.
- **Solución**:
  Agregar la propiedad `onHidden={() => setSelectedItem(null)}` a todos los modales de confirmación de baja y reactivación.

---

## 🟡 SEVERIDAD MEDIA (Bugs Visuales, Experiencia de Usuario y Performance)

### 1. Demora Artificial de 3 Segundos (`3000ms`) al Cerrar Modales
- **Ubicación**:
  - Frontend: En prácticamente todos los handlers `handleCreateSubmit`, `handleDeleteConfirm` y de baja en `TransactionsPage`, `AccountsPage`, `DebtsPage`, etc.
- **Descripción**:
  Tras una operación exitosa, se ejecuta:
  ```typescript
  setTimeout(() => {
    closeModal({ idModal: '...' });
    setIsSuccessClosing(false);
  }, 3000);
  ```
  Esto bloquea la pantalla con el modal abierto durante 3 segundos enteros. Si el usuario cierra el modal manualmente durante esos 3 segundos e inicia otra acción, cuando el timeout finaliza ejecuta `closeModal` y puede cerrar accidentalmente una nueva ventana que el usuario acababa de abrir.
- **Solución**:
  Reducir el timeout a 800ms - 1200ms (tiempo suficiente para que el usuario visualice el mensaje verde de éxito) o permitir el cierre inmediato utilizando notificaciones Toast globales no bloqueantes.

---

### 2. Falta de Rotación de Refresh Tokens y Acumulación de Sesiones
- **Ubicación**:
  - Backend: [`backend/src/modules/auth/auth.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/auth/auth.service.ts#L74-L91)
- **Descripción**:
  En `validateRefreshToken`, se verifica la sesión y se emite un nuevo `accessToken`, pero se mantiene el mismo `refreshToken` durante los 7 días. Si un refresh token es interceptado, no hay detección por reutilización ni rotación continua. Asimismo, las sesiones vencidas no se purgan periódicamente de la tabla `sessions`.
- **Solución**:
  Implementar Refresh Token Rotation (reemplazar el refresh token en cada renovación y revocar la familia de tokens si se detecta reutilización) y programar una tarea cron/limpieza de sesiones expiradas.

---

### 3. Transferencias Incompletas en Widget de Transacciones Recientes del Dashboard
- **Ubicación**:
  - Backend: [`backend/src/modules/dashboard/dashboard.service.ts`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/backend/src/modules/dashboard/dashboard.service.ts#L123-L154)
- **Descripción**:
  La consulta SQL de `recentTransactions` realiza un único `leftJoin(accounts, eq(transactions.accountID, accounts.id))`. No une la cuenta destino `toAccountID`.
- **Impacto**:
  En el Dashboard, si la transacción reciente es una transferencia entre cuentas, no figura hacia qué cuenta se transfirió el dinero, mostrando información trunca en el modal de detalles (`ModalTransactionDetails`).
- **Solución**:
  Incorporar un alias `toAccounts` en `dashboard.service.ts` similar al implementado en `transactions.service.ts` y retornar `toAccountName`.

---

### 4. Re-suscripción Redundante de Event Listeners en Modales
- **Ubicación**:
  - Frontend: [`frontend/src/components/layout/modal/ModalPost.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/components/layout/modal/ModalPost.tsx#L44-L50)
  - Frontend: [`frontend/src/components/layout/modal/ModalConfirm.tsx`](file:///c:/Users/facun/OneDrive/Documents/Programación/Proyectos/control-financiero/frontend/src/components/layout/modal/ModalConfirm.tsx#L47-L53)
- **Descripción**:
  El `useEffect` de ambos modales escucha cambios en `[id, clearError, clearSuccess, onHidden]`. Dado que en la mayoría de las páginas estas funciones se pasan como inline arrows o callbacks no memorizados, el efecto se re-ejecuta en cada re-renderizado del componente padre, agregando y removiendo listeners de Bootstrap continuamente.
- **Solución**:
  Guardar los callbacks en referencias (`useRef`) dentro del modal y vincular el listener del evento `hidden.bs.modal` una única vez por ID de modal (`[id]`).

---

### 5. Inconsistencias de Casing en Tipos de Cuentas (`Billetera virtual` vs `Billetera Virtual`)
- **Ubicación**:
  - Backend: `accounts.schema.ts` (comentarios) vs `accounts.validators.ts` (`enum: ["Billetera virtual", ...]`)
  - Frontend: `AccountForm.tsx` (L49-L50: `formData.type === "Billetera virtual" || formData.type === "Billetera Virtual"`)
- **Descripción**:
  Existen discrepancias de mayúsculas/minúsculas entre lo que valida el backend y las constantes del frontend. Esto requirió introducir parches manuales con múltiples `||` en varios componentes para prevenir desajustes.
- **Solución**:
  Centralizar los tipos de cuentas en un enumerador estricto compartido (`ACCOUNT_TYPES`) y normalizar la base de datos para garantizar una única convención de casing.

---

## 🗺️ Plan de Acción Recomendado (Roadmap de Remediación)

| Prioridad | Tarea | Componentes Afectados |
| :--- | :--- | :--- |
| **P0 (Inmediato)** | Eliminar edición manual de `amount` en `updateAccount` y `AccountForm`. | `accounts.service.ts`, `accounts.validators.ts`, `AccountForm.tsx` |
| **P0 (Inmediato)** | Corregir cálculo de cuentas tipo Tarjeta de Crédito en `debts.service.ts`. | `debts.service.ts` (`addMovement`, `deleteMovement`, `deleteDebt`) |
| **P0 (Inmediato)** | Validar límite de crédito (`creditLimit`) en compras con tarjeta. | `transactions.service.ts` |
| **P0 (Inmediato)** | Desactivar / Remover endpoint peligroso `PATCH /transactions/:id`. | `transactions.routes.ts`, `transactions.controller.ts` |
| **P1 (Urgente)** | Restringir CORS eliminando comodín `.endsWith('.vercel.app')`. | `backend/src/app.ts` |
| **P1 (Urgente)** | Blindar `MessageInfo.tsx` y búsquedas en tablas contra valores null. | `MessageInfo.tsx`, `AccountsPage.tsx`, `CategoriesPage.tsx`, `EntitiesPage.tsx` |
| **P1 (Urgente)** | Vincular cuotas bajo un `installmentGroupId` para cancelaciones atómicas. | `transactions.schema.ts`, `transactions.service.ts` |
| **P2 (Medio)** | Optimizar tiempo de espera de modales (de 3s a 1s) y agregar `onHidden`. | Páginas de Cuentas, Categorías, Entidades y Deudas. |
| **P2 (Medio)** | Incorporar cobros pendientes (`Receivable`) al Patrimonio Neto en Dashboard. | `dashboard.service.ts` |
| **P3 (Bajo)** | Migrar precisión monetaria a centavos y rotación de Refresh Tokens. | Esquemas Drizzle, `auth.service.ts` |

---
*Fin del reporte de auditoría técnica.*
