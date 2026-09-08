# 🏷️ Módulo de Categorías (Categories)

Este módulo contiene toda la lógica de presentación, componentes, hooks y utilidades relacionadas con la gestión de las **Categorías** del usuario.

Las categorías se utilizan para agrupar, clasificar y ordenar las transacciones (ingresos y egresos), permitiendo luego un análisis detallado de los movimientos financieros (ej: "Supermercado", "Sueldo", "Entretenimiento").

## 🗺️ Estructura del Módulo

```text
src/modules/categories/
├── components/
│   ├── CategoryForm.tsx        # Formulario reutilizable para crear/editar categorías
│   ├── CategoryTable.tsx       # Tabla de datos para listar las categorías
│   └── categoryTable.css       # Estilos de la tabla, layout fijo y truncamiento de textos
├── hooks/
│   └── useCategories.ts        # Lógica de peticiones al backend y manejo de estado local
├── index.ts                    # Archivo barril (exportaciones públicas)
└── README.md                   # Esta documentación (estás aquí)
```

## 🧩 Componentes

### 1. `CategoryTable`
Es el núcleo visual del módulo. Presenta todas las categorías (activas o inactivas) utilizando una estructura de tabla tradicional, pero altamente optimizada para la UX.
- **Layout Fijo (`table-layout: fixed`)**: Obliga a las columnas a respetar proporciones de diseño establecidas (Nombre 25%, Descripción 45%, Estado 15%, Acciones 15%), impidiendo que textos exageradamente largos deformen toda la interfaz.
- **Manejo de Overflow (`.truncate-text`)**: Los campos de texto libre (Nombre y Descripción) se cortan visualmente con puntos suspensivos ("...") si superan el límite visual de su columna, manteniendo la tabla impecable. Al mismo tiempo, usan el atributo HTML nativo `title` para que el texto completo pueda ser leído al posar el cursor sobre la celda.
- **Renderizado de Estados**: Las filas completas correspondientes a categorías dadas de baja (`Inactive`) se colorean de gris suave e invisibilizan ligeramente su tipografía para diferenciarse al instante de las activas, además de ocultar el botón de "Editar".

### 2. `CategoryForm`
Formulario reactivo y escalable construido sobre el componente genérico de la UI (`Form.tsx`) utilizando el patrón de "Render Props".
- Permite reutilizar exactamente el mismo código para Crear (POST) y Actualizar (PATCH).
- Delega el control de `react-hook-form` hacia abajo, brindando `control` y `errors` a cada input.
- **Validaciones en tiempo real**: Refleja la lógica estricta del backend directamente en la interfaz. Por ejemplo, la descripción posee una regla nativa `maxLength: 255`, bloqueando la escritura excesiva y mostrando un mensaje amigable al usuario.

## 🪝 Hooks (`useCategories.ts`)

Encapsula la comunicación con la API (Axios) y gestiona los estados de respuesta (`loading`, `error`, `success`, `categories`). Sus métodos principales:
- `fetchCategories`: Trae todas las categorías vinculadas al usuario activo (`GET /categories`).
- `createCategory`: Registra una nueva categoría (`POST /categories`).
- `updateCategory`: Edita los datos de una categoría (`PATCH /categories/:id`).
- `deactivateCategory`: Ejecuta un "Soft-Delete" (`DELETE /categories/:id`), cambiando el estado a `Inactive`. Esto garantiza que los gastos antiguos clasificados con esta categoría no queden huérfanos o corrompan la integridad de la base de datos.
- `reactivateCategory`: Revierte el soft-delete enviando un `{ status: 'Active' }` al endpoint de actualización.

## 📄 Uso e Integración en `CategoriesPage.tsx`

La página `src/pages/CategoriesPage.tsx` funciona como el controlador maestro del módulo:
- **Dos Bloques Limpios (`BodyContent`)**: Divide visualmente los controles (el input de búsqueda y el menú desplegable del estado de filtro) y los datos (la tabla) en dos cajas blancas (`BodyContent`) perfectamente centradas y contenidas (`max-width: 1000px`), otorgando un respiro visual óptimo en monitores ultra-wide.
- **Manejo Avanzado de Modales Bootstrap**: 
  - Evita el clásico error de React al intentar abrir Modales de forma dinámica: Renderiza el cascarón de los modales siempre de manera estática en el DOM (garantizando que Bootstrap JS siempre encuentre los IDs), y hace condicional su contenido interno.
  - Al abrir cualquier modal, inmediatamente limpia los estados de éxito o error previos (ej: `clearSuccess()`), evitando "fugas de memoria" visuales o mensajes fantasmas.
- **Timing del UX (Loaders Integrados)**: Los modales de confirmación inyectan `isProcessing` durante la ejecución de las peticiones a la API. Automáticamente muestran un _spinner_ en lugar de los textos de confirmación, desactivando botones; una vez procesado por la base de datos, el loader da paso inmediato a un _alert_ de éxito que el usuario puede leer relajadamente por 3 segundos exactos antes de que el modal se autoborre.

## 🎨 Convenciones de Diseño Clave
- **Filtros Flexibles**: La búsqueda local filtra eficientemente el estado general de las categorías aplicando funciones de orden superior de JS (`.filter()`, `.includes()`) transformando el string en minúscula para evitar problemas de case-sensitivity, e ignorando la distinción de acentos o mayúsculas.
- **Minimalismo en Datos Ausentes**: Si una categoría no posee una descripción opcional, la tabla inyecta automáticamente un sutil guion (`-`) para no dejar huecos incómodos y darle consistencia a la cuadrícula.
