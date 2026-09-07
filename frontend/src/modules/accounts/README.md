# 🏦 Módulo de Cuentas (Accounts)

Este módulo contiene toda la lógica de presentación, componentes, hooks y utilidades relacionadas con la gestión de las **Cuentas Financieras** (Accounts) del usuario. 

Las cuentas representan los lugares físicos o virtuales donde el usuario maneja su dinero (Efectivo, Tarjeta de Crédito, Cuenta Corriente, Billetera Virtual, Caja de Ahorro). 

## 🗺️ Estructura del Módulo

```text
src/modules/accounts/
├── components/
│   ├── AccountDetails.tsx      # Panel derecho: Detalles completos de una cuenta
│   ├── accountDetails.css      # Estilos del panel de detalles y sus botones
│   ├── AccountForm.tsx         # Formulario reutilizable para crear/editar cuentas
│   ├── AccountListItem.tsx     # Tarjeta de la lista izquierda (master-list)
│   └── accountListItem.css     # Estilos de los ítems de la lista y animaciones hover
├── hooks/
│   └── useAccounts.ts          # Lógica de peticiones al backend y estado local
├── index.ts                    # Archivo barril (exportaciones públicas)
└── README.md                   # Esta documentación
```

## 🧩 Componentes

### 1. `AccountListItem`
Representa de forma resumida una cuenta dentro de la lista izquierda (master list).
- **Diseño**: Utiliza fondos transparentes/blancos cuando no está seleccionada, y un color de fondo pastel (dependiendo del tipo de cuenta) cuando sí lo está. 
- **Hover**: Implementado mediante CSS Variables (`--item-hover-bg`). Aplica un efecto visual sutil (10% de opacidad) al pasar el mouse por un elemento inactivo, dándole feedback instantáneo al usuario.
- **Lógica Específica**: Si la cuenta es una Tarjeta de Crédito, muestra una **barra de progreso visual** que calcula el porcentaje de uso (deuda actual vs límite de crédito) usando un `clamp()` en CSS en línea para evitar que se desborde del 100%.

### 2. `AccountDetails`
El panel derecho que muestra todos los detalles de la cuenta seleccionada.
- **Renderizado Condicional Limpio**: Solo muestra los campos optativos (como Descripción, Fechas de Cierre o Terminación) si verdaderamente tienen datos. Si están vacíos, las filas ni siquiera se renderizan para mantener el diseño minimalista.
- **Acciones**: Contiene los botones de "Editar", "Dar de baja" y "Reactivar". El botón de Editar desaparece automáticamente si la cuenta está en estado inactivo (`Inactive`).

### 3. `AccountForm`
Formulario reactivo creado con `react-hook-form`. Es **totalmente genérico y reutilizable** tanto para crear cuentas nuevas (POST) como para editarlas (PATCH).
- **Campos Dinámicos**: Si el usuario selecciona el tipo "Tarjeta de Crédito", mágicamente se renderizan los campos obligatorios para tarjetas (Límite, Día de Cierre, Día de Vencimiento) gracias a un `watch()` sobre el campo `type`. Si elige "Efectivo", desaparecen opciones innecesarias como la terminación de la tarjeta.
- **Identificadores (formID)**: Recibe la prop `formID` para poder acoplar el botón de submit de distintos Modales de Bootstrap (en AccountsPage) directamente a la instancia interna del formulario.

## 🪝 Hooks (`useAccounts.ts`)

Encapsula la comunicación con la API usando Axios y gestiona los estados globales de la página (`loading`, `error`, `success`, `accounts`). Devuelve las funciones del CRUD:
- `fetchAccounts`: Trae todas las cuentas vinculadas al usuario activo (`GET /accounts`).
- `createAccount`: Crea una cuenta nueva (`POST /accounts`). 
- `updateAccount`: Edita una cuenta existente (`PATCH /accounts/:id`). Parsea fuertemente los datos a números enteros (ej. `creditLimit`, `amount`) antes de enviarlos. Tiene la inteligencia de enviar valores `null` a los atributos de tarjetas si el usuario decide cambiar el tipo de cuenta a una opción estándar (ej. Efectivo), purificando así la base de datos.
- `deactivateAccount`: Realiza un "Soft-Delete" (`DELETE /accounts/:id`), pasando el estado a `Inactive`. Esto garantiza que no haya incosistencias con las transacciones antiguas.
- `reactivateAccount`: Revierte el soft-delete enviando un `{ status: 'Active' }` al mismo endpoint de actualización.

## 📄 Uso e Integración en `AccountsPage.tsx`

La página `src/pages/AccountsPage.tsx` orquesta todo este módulo usando un layout **Master-Detail** altamente responsivo:
- **Estado Local Inteligente**: Maneja qué cuenta está seleccionada (`selectedAccountID`), el término de búsqueda de texto, y el filtro dinámico ("Activas" vs "Inactivas"). Selecciona automáticamente el primer elemento al cargar.
- **Modales de Confirmación (`ModalConfirm`)**: Reemplazan por completo a las clásicas alertas (`window.confirm`). Usan botones con colores pasteles definidos para confirmar las altas, bajas y ediciones sin romper la inmersión del usuario.
- **Timing del UX**: Maneja temporalizadores asíncronos (`setTimeout`) para permitir que se lean los mensajes de éxito ("Cuenta guardada correctamente") durante 3 segundos en el modal antes de cerrarlo y reiniciar el estado, mejorando enormemente la Experiencia de Usuario.

## 🎨 Convenciones de Diseño Clave
- **Colores y Temática**: Las cuentas derivan su color distintivo (verde, rojo, violeta, azul, ámbar) de manera automática llamando a utilidades auxiliares como `getPastelColor` o `getSolidPastelColor` según la etiqueta de la cuenta (`tag`).
- **Estados de Red Visibles**: Absolutamente todos los botones y modales indican visualmente cuando una petición está en curso (ej. bloqueando el input y mostrando "Procesando...").
- **Flexbox Absoluto**: Se optimizó el CSS usando contenedores con `flex: 1` para que las listas de selección, los mensajes vacíos y los loaders centren automáticamente su contenido, absorban el espacio sobrante, y erradiquen las molestas barras de scroll nativas no intencionadas.
