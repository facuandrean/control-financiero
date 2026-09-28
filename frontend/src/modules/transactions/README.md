# 💸 Módulo de Transacciones (Transactions)

El módulo de **Transacciones** es el núcleo operativo de la aplicación de Control Financiero. Vincula de forma bidireccional las **Cuentas**, **Categorías** y **Entidades** comerciales o personales, permitiendo registrar ingresos, egresos y transferencias entre cuentas.

---

## 🗺️ Estructura del Módulo

```text
src/modules/transactions/
├── components/
│   ├── TransactionMetrics.tsx    # Tarjetas de resumen (Ingresos, Egresos, Balance)
│   ├── transactionMetrics.css    # Estilos de las métricas
│   ├── TransactionList.tsx       # Lista agrupada visualmente por fechas
│   ├── transactionList.css       # Estilos de la lista y badges
│   ├── TransactionForm.tsx       # Formulario reactivo con pestañas (Tabs)
│   ├── transactionForm.css       # Estilos de las pestañas
│   └── index.ts                  # Barril de componentes
├── hooks/
│   └── useTransactions.ts        # Hook para operaciones CRUD y comunicación con la API
├── index.ts                      # Barril principal del módulo
└── README.md                     # Documentación técnica (este archivo)
```

---

## ⚡ Arquitectura de Doble Impacto (Double-Impact Ledger)

Cada transacción creada, actualizada o eliminada impacta directa y atómicamente en la tabla de **Cuentas (`accounts`)** mediante transacciones de base de datos (`db.transaction`).

### 1. Creación de Transacciones (`POST /transactions`)
- **Ingreso (`Income`)**:
  - Suma el monto (`amount`) a la cuenta seleccionada (`accountID`).
- **Egreso (`Expense`)**:
  - Verifica si la cuenta de origen tiene fondos suficientes (`amount <= account.amount`).
  - *Excepción de Tarjeta de Crédito*: Si la cuenta es de tipo `"Tarjeta de Crédito"`, no se bloquea por saldo.
  - Si no alcanza el saldo en cuentas de débito/efectivo/billeteras, el backend rechaza con `400 Bad Request` ("Saldo insuficiente en la cuenta origen").
  - Resta el monto a la cuenta seleccionada.
- **Transferencia (`Transfer`)**:
  - Verifica que la cuenta origen tenga saldo suficiente (a menos que sea tarjeta de crédito).
  - Valida que la cuenta destino sea diferente a la origen (`toAccountID !== accountID`).
  - Resta el monto en la cuenta origen (`accountID`).
  - Suma el monto en la cuenta destino (`toAccountID`).

### 2. Eliminación de Transacciones (`DELETE /transactions/:id`)
El servicio invierte el efecto histórico de la transacción eliminada:
- **Si era `Income`**: Se resta `amount` de `accountID`.
- **Si era `Expense`**: Se suma `amount` a `accountID` (se repone el dinero).
- **Si era `Transfer`**: Se reintegra `amount` a la cuenta origen (`accountID`) y se descuenta `amount` de la cuenta destino (`toAccountID`).

### 3. Modificación de Transacciones (`PATCH /transactions/:id`)
Para mantener la integridad matemática:
1. Se **revierte** primero el impacto de la transacción previa en las cuentas involucradas.
2. Se evalúa el nuevo estado propuesto contra los saldos resultantes (validando saldo suficiente si el nuevo monto o tipo lo exige).
3. Se **aplica** el nuevo impacto correspondiente al nuevo tipo, monto o cuentas seleccionadas.

---

## 📅 Agrupamiento por Fechas en la UI (`TransactionList.tsx`)

A diferencia de una tabla tradicional, la interfaz renderiza una lista secuencial agrupada cronológicamente:
1. **Normalización de Clave de Fecha**:
   Se extrae la porción `YYYY-MM-DD` de cada fecha registrada.
2. **Particionado en Memoria**:
   Se indexan los registros en un diccionario agrupador `Record<string, Transaction[]>`.
3. **Encabezados Inteligentes**:
   - Si la fecha corresponde al día de hoy: `"Hoy, 27 de Septiembre"`.
   - Si corresponde al día de ayer: `"Ayer, 26 de Septiembre"`.
   - Para días anteriores: `"15 de Septiembre de 2026"`.
4. **Presentación de Ítems**:
   - Cada tarjeta de transacción refleja de forma clara el tipo (Ingreso, Egreso, Transferencia con ícono correspondiente).
   - En transferencias muestra el flujo directo: `Cuenta Origen ➔ Cuenta Destino`.
   - En ingresos/egresos refleja la Entidad, Categoría y Cuenta asociada.
   - El monto se muestra formateado en moneda local (`+$X` en verde o `-$X` en rojo).

---

## 📑 Formulario con Pestañas (`TransactionForm.tsx`)

El formulario incluye un selector de pestañas en la parte superior:
- **`[ Egreso ]`**: Pide Cuenta, Monto, Fecha, Categoría, Entidad y Descripción.
- **`[ Ingreso ]`**: Pide Cuenta, Monto, Fecha, Categoría, Entidad y Descripción.
- **`[ Transferencia ]`**: Pide Cuenta Origen, Cuenta Destino, Monto, Fecha y Descripción (oculta los selectores de categoría y entidad).

---

## 🔒 Ciclo de Vida y UX de Modales

- Los modales `<ModalPost>` y `<ModalConfirm>` se mantienen **permanentemente en el DOM**, condicionando únicamente su contenido interno.
- Se ejecuta preventivamente `clearError()` y `clearSuccess()` antes de invocar `openModal`.
- Manejan el prop `loading={loading || isSuccessClosing}` para deshabilitar botones durante peticiones activas.
- Si el backend rechaza una operación (por ejemplo: saldo insuficiente), el mensaje devuelto se renderiza dentro del modal con `<MessageError>`.
- Tras un éxito, se activa `isSuccessClosing = true` durante 3000ms para permitir al usuario ver la confirmación antes de cerrar el modal y vaciar el estado.
