# 💳 Módulo de Deudas y Cobros (Debts)

Este módulo contiene toda la lógica de presentación, componentes, hooks y utilidades relacionadas con la gestión de **Deudas** y **Cuentas por Cobrar** del usuario, soportando amortizaciones y pagos parciales acumulativos.

Permite registrar compromisos financieros con entidades (comercios, empresas o personas), monitorear el progreso de cancelación a través de barras visuales porcentuales, y registrar abonos parciales hasta saldar la deuda en su totalidad.

---

## 🗺️ Estructura del Módulo

```text
src/modules/debts/
├── components/
│   ├── DebtMetrics.tsx       # Tarjetas de resumen financiero (Debo, Me Deben, Balance Neto)
│   ├── debtMetrics.css       # Estilos de las tarjetas de métricas
│   ├── DebtCard.tsx          # Tarjeta individual con barra de progreso y acciones
│   ├── debtCard.css          # Estilos de la tarjeta, badges y barra de progreso
│   ├── DebtForm.tsx          # Formulario reactivo para alta y edición de deudas
│   ├── PaymentForm.tsx       # Formulario simplificado para registrar pagos parciales
│   └── index.ts              # Barril de exportación de componentes
├── hooks/
│   └── useDebts.ts           # Lógica de peticiones al backend y sincronización de estado
├── index.ts                  # Barril principal del módulo
└── README.md                 # Esta documentación (estás aquí)
```

---

## 🧩 Componentes

### 1. `DebtMetrics`
Panel superior que consolida la salud financiera de las deudas activas en tres tarjetas independientes con diseño Light Mode:
- **Debo (Por Pagar)**: Sumatoria de los saldos pendientes de deudas de tipo `Payable` (excluyendo deudas con estado `Settled`). Resaltado en rojo pastel suave (`#dc2626` / fondo `#fee2e2`).
- **Me Deben (Por Cobrar)**: Sumatoria de los saldos pendientes de acreencias de tipo `Receivable`. Resaltado en verde pastel suave (`#16a34a` / fondo `#dcfce7`).
- **Balance Neto**: Diferencia contable (`totalReceivable - totalPayable`). Refleja dinámicamente si el usuario tiene una posición neta a favor o en contra.

### 2. `DebtCard`
Tarjeta individual que representa una deuda o cuenta por cobrar:
- **Diseño Light Mode**: Fondo blanco (`#ffffff`), borde sutil (`#e2e8f0`), esquinas redondeadas (`1rem`) y sombras tenues.
- **Píldora de Tipo y Badge de Estado**:
  - `Payable` ("Debo") y `Receivable` ("Me deben").
  - `Pending` (Pendiente, amarillo/ámbar), `Partial` (Parcialmente pagada, índigo/azul), `Settled` (Saldada, verde).
- **Barra de Progreso Dinámica**:
  - Calcula el porcentaje de amortización: `(paidAmount / totalAmount) * 100`.
  - Color adaptativo: Verde suave si es dinero a cobrar (`fill-receivable`), y naranja/rojo suave si es dinero a pagar (`fill-payable`).
  - Muestra el saldo restante exacto mientras la deuda continúe abierta.
- **Acciones Rápidas**:
  - Botón **"Registrar Pago"** (se deshabilita automáticamente cuando la deuda pasa a `Settled`).
  - Botones iconográficos de **Editar** y **Eliminar**.

### 3. `DebtForm`
Formulario reactivo construido sobre el componente genérico `<Form>` con Render Props:
- Conecta con `useEntities` para poblar el selector de Entidades/Personas activas.
- Permite seleccionar el tipo de compromiso (`Payable` vs `Receivable`).
- Valida montos positivos, campos requeridos y fecha de vencimiento opcional.

### 4. `PaymentForm`
Formulario dedicado para registrar abonos parciales:
- Muestra una caja resumen con la entidad, el tipo (Pago/Egreso vs Cobro/Ingreso), el monto original, total abonado hasta el momento y saldo restante por saldar.
- Integra `useAccounts` con un selector obligatorio de **Cuenta de Origen** (si es deuda a pagar) o **Cuenta de Destino** (si es deuda a cobrar), mostrando el saldo disponible en tiempo real.
- Precompleta la fecha con el día actual y valida que el monto ingresado sea positivo.
- En caso de fondos insuficientes en la cuenta elegida, el error 400 es capturado y renderizado en `<MessageError>` sin cerrar el modal.
- Permite adjuntar notas aclaratorias o números de comprobante de transferencia.

---

## 🔄 Integración con Transacciones y Cuentas (Doble Impacto)

El flujo de amortización de deudas está estrechamente acoplado con el módulo de `Transactions` y `Accounts`:
1. **Registro Atómico (`addPayment`)**:
   - Todo el proceso corre dentro de una transacción `db.transaction(async (tx) => { ... })`.
   - Si la deuda es `Payable` (Egreso) y la cuenta elegida no es tarjeta de crédito, valida que el saldo cubra el monto; de lo contrario aborta con `400 Bad Request` ("Saldo insuficiente").
   - Inserta el registro en `DebtPayments` guardando la referencia `transactionID`.
   - Crea automáticamente la transacción asociada en `Transactions` con tipo `Expense` (Payable) o `Income` (Receivable) vinculada a la misma entidad.
   - Modifica el saldo de la cuenta en `Accounts` (resta en egreso, suma en ingreso).
   - Recalcula el `status` de la deuda (`Pending`, `Partial` o `Settled`).
2. **Reversión Atómica (`deletePayment`)**:
   - Rastrea el `transactionID` vinculado al pago.
   - Restaura el saldo original en la cuenta involucrada en `Accounts`.
   - Elimina la transacción de `Transactions`.
   - Elimina el abono de `DebtPayments` y recalcula el estado de la deuda.

## 🪝 Hook de API (`useDebts.ts`)

Encapsula la comunicación con los endpoints REST del backend (`/api/debts`):
- `fetchDebts`: Trae todas las deudas con su entidad asociada y pagos acumulados (`GET /debts`). Normaliza los campos `paidAmount` y `remainingAmount`.
- `createDebt`: Registra una nueva deuda (`POST /debts`).
- `updateDebt`: Modifica datos de la deuda recalculando el estado de forma automática (`PATCH /debts/:id`).
- `deleteDebt`: Elimina la deuda y su historial de pagos en cascada (`DELETE /debts/:id`).
- `addPayment`: Registra un nuevo abono (`POST /debts/:id/payments`), provocando que el backend actualice el estado a `Partial` o `Settled`.
- `deletePayment`: Elimina un pago específico (`DELETE /debts/payments/:paymentId`).
- `clearError` y `clearSuccess`: Limpieza inmediata de alertas para evitar estados residuales en la UI.

---

## 📄 Integración en `DebtsPage.tsx`

1. **Filtros en Memoria**:
   Botones de acceso rápido para filtrar entre "Todas", "Debo", "Me Deben" y "Saldadas", combinados con un buscador en tiempo real por nombre de entidad o descripción.
2. **Ciclo de Vida de Modales**:
   - Todos los modales (`ModalPost` y `ModalConfirm`) residen permanentemente en el DOM para asegurar la compatibilidad con Bootstrap JS, condicionando solo su contenido interno.
   - Antes de abrir cualquier modal se limpian preventivamente las alertas (`clearError()`, `clearSuccess()`).
   - Tras una operación exitosa, se activa `isSuccessClosing(true)` para bloquear botones y se espera un timeout de 3 segundos antes de cerrar el modal y vaciar la deuda seleccionada.
