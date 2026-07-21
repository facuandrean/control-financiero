# Control Financiero

## Visión general

Este proyecto es una aplicación para registrar y consultar movimientos financieros personales o de negocio. Su objetivo principal es ayudar a un usuario a organizar ingresos, egresos, cuentas, categorías, entidades y deudas relacionadas con sus operaciones financieras.

La lógica de negocio está centrada en un modelo simple pero potente:

- un usuario gestiona sus propios datos;
- cada movimiento financiero se asocia a una cuenta, una categoría y una entidad;
- las transacciones pueden clasificarse como ingreso o egreso;
- las cuentas, categorías, entidades y deudas pueden activarse o desactivarse sin perder su historial;
- el módulo de deudas sigue un modelo maestro-detalle para controlar deudas y sus ítems individuales.

---

## Entidades principales

### 1. Usuario
Representa la persona que utiliza la aplicación.

Funciones principales:
- autenticar y administrar su cuenta;
- ser dueño de todos los registros financieros asociados;
- mantener aislados sus datos del resto de usuarios.

En la base de datos, el usuario es la entidad raíz de todo el sistema.

### 2. Cuenta
Representa un medio de movimiento de dinero, como:
- efectivo;
- tarjeta de crédito;
- tarjeta de débito;
- transferencia;
- cheque.

Funciones principales:
- almacenar el lugar donde se originan o reciben los fondos;
- servir como referencia para cada transacción.

Cada transacción debe estar vinculada a una cuenta específica.

### 3. Categoría
Representa la clasificación del movimiento financiero.

Funciones principales:
- agrupar operaciones por tipo o concepto;
- facilitar reportes y análisis por rubro.

Ejemplos de categorías podrían ser:
- alimentación;
- transporte;
- sueldo;
- ventas;
- servicios.

### 4. Entidad
Representa una contraparte o un actor involucrado en la operación.

Puede utilizarse para identificar:
- personas;
- proveedores;
- clientes;
- empresas;
- terceros con los que se interactúa financieramente.

Funciones principales:
- contextualizar el movimiento;
- indicar a quién o a qué se le pagó, cobró o se relacionó la operación.

### 5. Transacción
Es el registro central del sistema. Representa un ingreso o un egreso realizado en una cuenta, categorizado y asociado a una entidad.

Funciones principales:
- registrar un movimiento financiero real;
- reflejar el valor, tipo y estado de la operación;
- servir como base para reportes y seguimiento del flujo de caja.

### 6. Cuenta de deuda (DebtAccount)
Es la entidad maestra del módulo de deudas.

Representa a la persona o entidad con la que existe una relación de deuda, por ejemplo:
- alguien que te debe dinero;
- alguien a quien le debes dinero.

Funciones principales:
- registrar el contexto general de la deuda;
- distinguir si la deuda es de tipo "Cobrar" o "Pagar";
- llevar el estado general de la relación, como "Open" o "Settled".

### 7. Ítem de deuda (DebtItem)
Es la entidad detalle del módulo de deudas.

Representa cada concepto o movimiento parcial que compone una deuda general.

Funciones principales:
- descomponer una deuda en partidas individuales;
- registrar montos específicos por concepto;
- marcar cada partida como "Pending" o "Paid".

Ejemplos de ítems:
- peluquería;
- buzo comprado;
- préstamo parcial;
- servicio prestado.

---

## Relaciones entre entidades

El modelo de negocio puede resumirse de la siguiente manera:

- Un usuario tiene muchas cuentas, categorías, entidades, transacciones, cuentas de deuda e ítems de deuda.
- Una cuenta puede tener muchas transacciones.
- Una categoría puede tener muchas transacciones.
- Una entidad puede tener muchas transacciones.
- Una cuenta de deuda puede tener muchos ítems de deuda.
- Un ítem de deuda pertenece a una única cuenta de deuda.
- Una transacción pertenece a exactamente una cuenta, una categoría, una entidad y un usuario.

### Relación conceptual

```text
Usuario
  ├── Cuentas
  ├── Categorías
  ├── Entidades
  ├── Transacciones
  ├── DebtAccounts
  └── DebtItems

Cuenta ──< Transacciones >── Categoría
   │
   └──< Transacciones >── Entidad

DebtAccount ──< DebtItems
```

---

## Reglas de negocio principales

1. Cada registro está ligado a un usuario.
   - Los datos son privados por usuario.
   - No existe un concepto de “movimiento compartido” entre usuarios.

2. Las transacciones son el núcleo del sistema.
   - Toda operación financiera debe registrarse como una transacción.
   - La transacción debe indicar al menos un monto, un tipo y una cuenta.

3. Cada transacción puede clasificarse como ingreso o egreso.
   - Esto permite distinguir entradas y salidas de dinero.

4. Las entidades auxiliares mejoran el contexto.
   - Una transacción no solo representa un monto, sino también quién o qué está involucrado.

5. Las deudas se manejan en dos niveles.
   - El nivel maestro representa la relación general con una persona o entidad.
   - El nivel detalle representa los conceptos o importes parciales que la componen.

6. Los registros pueden estar activos, cerrados o saldados.
   - Esto permite mantener historiales sin perder información.

---

## Flujo típico de uso

Un flujo común dentro de la aplicación sería:

1. El usuario crea una o más cuentas.
2. Define categorías para organizar sus operaciones.
3. Registra entidades relacionadas con sus movimientos.
4. Crea transacciones vinculadas a esas cuentas, categorías y entidades.
5. Registra cuentas de deuda y descompone cada deuda en ítems específicos.
6. Consulta y analiza sus movimientos y saldos según el contexto.

---

## Resumen ejecutivo

La aplicación modela el control financiero como un sistema de gestión de movimientos organizados por:
- usuario;
- cuenta;
- categoría;
- entidad;
- transacción;
- cuenta de deuda;
- ítem de deuda.

Este enfoque permite llevar un registro claro de cómo entra y sale el dinero, dónde se mueve, con quién o qué se relaciona cada operación y cómo se estructuran las deudas en partidas manejables.
