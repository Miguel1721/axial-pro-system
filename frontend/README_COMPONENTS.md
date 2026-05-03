# 📦 Componentes UI y Hooks - Guía Rápida

## 🚀 Instalación y Uso Rápido

### Importación de Componentes
```jsx
// Importar componentes individuales
import { Button, Card, Modal } from './components/ui';

// Importar hooks personalizados
import { useDebounce, useLocalStorage } from './hooks';
```

## 📚 Estructura de Archivos

```
src/
├── components/
│   ├── ui/                      # Componentes UI Base
│   │   ├── Button.jsx           # Botones con variantes y estados
│   │   ├── Card.jsx             # Cards con subcomponentes
│   │   ├── Input.jsx            # Inputs con validación
│   │   ├── Select.jsx           # Selects dropdown
│   │   ├── Modal.jsx            # Modales accesibles
│   │   ├── Skeleton.jsx         # Loading skeletons
│   │   ├── Badge.jsx            # Badges y status
│   │   ├── index.js             # Export centralizado
│   │   └── USAGE_EXAMPLES.md    # Ejemplos detallados
│   ├── Layout.jsx               # Layout principal
│   ├── DashboardAdmin.jsx       # Dashboard actual
│   └── DashboardAdminOptimized.jsx # Dashboard optimizado
├── hooks/
│   ├── useDebounce.js           # Debouncing de valores
│   ├── useLocalStorage.js       # Gestión de localStorage
│   ├── useApi.js                # Llamadas a API (temporal)
│   └── index.js                 # Export centralizado
├── pages/                       # Páginas de la aplicación
├── context/                     # Context providers
└── utils/                       # Utilidades
```

## 🎨 Componentes Disponibles

### Button
```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Guardar
</Button>

<Button variant="danger" isLoading={true}>
  Eliminando...
</Button>

<Button variant="ghost" leftIcon={<Icon />}>
  Cancelar
</Button>
```

**Variantes:** `primary`, `secondary`, `success`, `danger`, `ghost`, `outline`
**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`

### Card
```jsx
<Card hover variant="primary">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

**Variantes:** `default`, `primary`, `success`, `warning`, `danger`

### Input
```jsx
<Input
  label="Nombre"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  helperText="Escribe tu nombre completo"
/>
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título del Modal"
  size="lg"
>
  <ModalBody>
    Contenido del modal
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>Cerrar</Button>
    <Button onClick={handleConfirm}>Confirmar</Button>
  </ModalFooter>
</Modal>
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`

### Skeleton
```jsx
// Skeleton simple
<Skeleton variant="text" width="100%" height={20} />

// Skeletons predefinidos
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonList items={5} />
<SkeletonTable rows={5} columns={4} />
<SkeletonDashboard />
```

### Badge
```jsx
<Badge variant="success">Activo</Badge>
<Badge variant="danger" dot>Crítico</Badge>

<StatusBadge status="confirmed" />
<CountBadge count={5} />
```

**Variantes:** `default`, `primary`, `success`, `warning`, `danger`, `info`, `outline`

## 🪝 Hooks Personalizados

### useDebounce
```jsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  searchApi(debouncedSearch);
}, [debouncedSearch]);
```

### useLocalStorage
```jsx
const [theme, setTheme] = useLocalStorage('theme', 'light');
const [user, setUser, removeUser] = useLocalStorage('user', null);
```

### useApi (Temporal)
```jsx
const { data, loading, error, refetch } = useApi('/api/pacientes');

const { mutate, loading: mutating } = useMutation();
await mutate('/api/pacientes', {
  method: 'POST',
  body: JSON.stringify(newPatient)
});
```

## 📋 Plan de Migración

### Paso 1: Reemplazar botones existentes
```jsx
// ANTES
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
  Click
</button>

// DESPUÉS
import { Button } from './components/ui';
<Button variant="primary">Click</Button>
```

### Paso 2: Reemplazar cards
```jsx
// ANTES
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <h3 className="text-lg font-semibold">Título</h3>
  <p className="text-gray-600">Contenido</p>
</div>

// DESPUÉS
import { Card, CardHeader, CardTitle, CardContent } from './components/ui';
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Paso 3: Reemplazar loading states
```jsx
// ANTES
{loading && (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
)}

// DESPUÉS
import { Skeleton, SkeletonCard, SkeletonDashboard } from './components/ui';

{loading && <SkeletonDashboard />}
{loading && <SkeletonCard />}
{loading && <Skeleton variant="text" width="100%" />}
```

## 🎯 Beneficios Clave

1. **Consistencia**: Todos los componentes comparten el mismo estilo
2. **Accesibilidad**: WCAG AA compliant por defecto
3. **Mantenibilidad**: Un solo lugar para hacer cambios
4. **Type Safety**: Mejor autocompletado en IDEs
5. **Documentación**: Ejemplos completos disponibles

## 📖 Documentación Completa

- **Ejemplos Detallados**: `./components/ui/USAGE_EXAMPLES.md`
- **Plan de Mejoras**: `./FRONTEND_IMPROVEMENTS_PLAN.md`
- **Resumen Ejecutivo**: `./PROGRESS_SUMMARY.md`

## 🚀 Próximos Pasos

1. **Migrar componentes existentes**: Reemplazar implementaciones antiguas
2. **Optimizar performance**: Implementar React.memo en más componentes
3. **React Query**: Migrar de useApi temporal a React Query
4. **Testing**: Escribir tests para nuevos componentes
5. **Storybook**: Crear documentación visual de componentes

---

**Versión**: 1.0.0
**Última actualización**: 2026-05-03
**Estado**: Listo para producción 🚀