# Accounts

Las cuentas del sistema se dividen en dos grandes grupos: **cuentas de dinero propio (líquido)** y **cuentas de crédito (deuda)**.

## 1. Cuentas de Dinero Propio (Líquido)

Representan plata real disponible para gastar de inmediato. Aumentan con ingresos y disminuyen con gastos.

### Efectivo

* **Qué es**: Billetes físicos en mano, billetera o guardados en casa.
* **En el sistema**: Solo maneja un saldo disponible. No tiene bancos emisores, números de tarjeta, días de vencimiento ni límites.

* **Datos que usa**: Nombre, Entidad ("Efectivo"), Saldo inicial y descripción.

### Billetera Virtual

* **Qué es**: Proveedores de servicios de pago o fintechs como Mercado Pago, Ualá, Lemon o Personal Pay (operan con CVU).

* **En el sistema**: Dinero digital líquido. Si el usuario paga con la tarjeta prepaga de Mercado Pago, la plata sale de acá.

* **Datos que usa**: Nombre, Entidad, Saldo disponible y, opcionalmente, los últimos 4 dígitos de la tarjeta prepaga física asociada.

### Caja de Ahorro

* **Qué es**: Cuenta bancaria tradicional (Santander, BBVA, Galicia, Bancor) respaldada por CBU.

* **En el sistema**: Es la cuenta donde cobrás el sueldo o tenés ahorros bancarios. Aquí es donde vive la tarjeta de débito: la tarjeta de débito no es una cuenta separada, sino la llave plástica para extraer o pagar con los fondos de esta caja de ahorro.

* **Datos que usa**: Nombre, Banco, Saldo disponible y los últimos 4 dígitos de la tarjeta de débito vinculada (opcional).

### Cuenta Corriente

* **Qué es**: Cuenta bancaria pensada para comercios, empresas o profesionales independientes.

* **En el sistema**: Funciona casi igual que una caja de ahorro, con la diferencia de que permite cheques y "girar en descubierto" (quedar en saldo negativo acordado con el banco sin rebotar pagos).

* **Datos que usa**: Nombre, Banco, Saldo y últimos 4 dígitos opcionales.

## Cuentas de Crédito (Endeudamiento)
No almacenan dinero que te pertenece; representan una línea de préstamo que te otorga una entidad financiera.

### Tarjeta de Crédito

* **Qué es**: Plásticos de crédito bancarios o de financieras (Visa, Mastercard, Amex, Naranja X).

* **En el sistema**: El monto cargado representa deuda acumulada a pagar, no saldo a favor. Se compara directamente contra un cupo total de endeudamiento para saber cuánto margen te queda.

* **Datos exclusivos que usa**:
  * **creditLimit**: Límite máximo total otorgado por el banco (ej: $800.000).
  * **closingDay**: Día del mes en que corta el resumen (los consumos posteriores pasan al mes siguiente).
  * **dueDate**: Día del mes límite para pagar el resumen.
  * **lastDigits**: Últimos 4 dígitos para identificar el plástico en la lista.