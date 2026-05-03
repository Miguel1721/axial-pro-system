# 📘 Ejemplos de Uso - Componentes UI Mejorados

## 🎯 Antes vs Después

### Antes (Código Original)
```jsx
// Código duplicado e inconsistente
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Guardar
</button>

<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Título</h3>
  <p className="text-gray-600 dark:text-gray-400">Contenido</p>
</div>
```

### Después (Con Nuevos Componentes UI)
```jsx
import { Button, Card } from '@/components/ui';

// Componentes consistentes y reutilizables
<Button variant="primary" size="md">
  Guardar
</Button>

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Contenido</CardDescription>
  </CardHeader>
</Card>
```

## 📋 Ejemplos Prácticos

### 1. Botones con Estados
```jsx
import { Button } from '@/components/ui';
import { Loader2, Save, Trash2 } from 'lucide-react';

function ActionButtons() {
  return (
    <div className="flex gap-3">
      {/* Botón normal */}
      <Button variant="primary" onClick={handleSave}>
        <Save className="w-4 h-4" />
        Guardar
      </Button>

      {/* Botón con loading */}
      <Button variant="primary" isLoading={loading}>
        Guardando...
      </Button>

      {/* Botón peligroso */}
      <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
        Eliminar
      </Button>

      {/* Botón ghost */}
      <Button variant="ghost" onClick={handleCancel}>
        Cancelar
      </Button>
    </div>
  );
}
```

### 2. Cards con Contenido
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

function PatientCard({ patient }) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
        <CardDescription>Paciente ID: {patient.id}</CardDescription>
      </CardHeader>

      <CardContent>
        <p>Email: {patient.email}</p>
        <p>Teléfono: {patient.phone}</p>
      </CardContent>

      <CardFooter>
        <Button variant="primary" size="sm">Ver Detalles</Button>
      </CardFooter>
    </Card>
  );
}
```

### 3. Formularios con Input
```jsx
import { Input } from '@/components/ui';

function PatientForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nombre Completo"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={errors.name}
        helperText="Ej: Juan Pérez García"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
        helperText="paciente@ejemplo.com"
        required
      />

      <Input
        label="Teléfono"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        helperText="+34 600 000 000"
      />

      <Button type="submit" isLoading={loading}>
        Registrar Paciente
      </Button>
    </form>
  );
}
```

### 4. Modales
```jsx
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui';
import { Button } from '@/components/ui';

function AppointmentModal({ isOpen, onClose, appointment }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Cita"
      size="lg"
    >
      <ModalBody>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Paciente</h4>
            <p>{appointment.patientName}</p>
          </div>

          <div>
            <h4 className="font-semibold">Servicio</h4>
            <p>{appointment.service}</p>
          </div>

          <div>
            <h4 className="font-semibold">Fecha y Hora</h4>
            <p>{appointment.date} - {appointment.time}</p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### 5. Skeletons para Loading
```jsx
import { Skeleton, SkeletonCard, SkeletonList, SkeletonDashboard } from '@/components/ui';

function DashboardWithLoading({ data, loading }) {
  if (loading) {
    return <SkeletonDashboard />;
  }

  return <DashboardContent data={data} />;
}

function PatientList({ patients, loading }) {
  if (loading) {
    return <SkeletonList items={5} />;
  }

  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}
```

### 6. Badges de Estado
```jsx
import { Badge, StatusBadge, CountBadge } from '@/components/ui';

function StatusExamples() {
  return (
    <div className="flex gap-3">
      {/* Badge simple */}
      <Badge variant="primary">Nuevo</Badge>
      <Badge variant="success">Activo</Badge>
      <Badge variant="warning">Pendiente</Badge>
      <Badge variant="danger">Crítico</Badge>

      {/* Status badge */}
      <StatusBadge status="confirmed" />
      <StatusBadge status="pending" />
      <StatusBadge status="in_progress" />

      {/* Count badge */}
      <div className="relative">
        <Bell className="w-6 h-6" />
        <CountBadge count={5} className="absolute -top-2 -right-2" />
      </div>
    </div>
  );
}
```

## 🔄 Hooks Personalizados

### useDebounce para Búsqueda
```jsx
import { useDebounce } from '@/hooks';
import { Input } from '@/components/ui';

function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchPatients(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <Input
      label="Buscar Pacientes"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Escribe para buscar..."
    />
  );
}
```

### useLocalStorage para Preferencias
```jsx
import { useLocalStorage } from '@/hooks';

function ThemeSettings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="system">Sistema</option>
    </select>
  );
}
```

### useApi para Llamadas a API (Temporal)
```jsx
import { useApi } from '@/hooks';
import { SkeletonList } from '@/components/ui';

function PatientsList() {
  const { data: patients, loading, error, refetch } = useApi('/api/pacientes');

  if (loading) return <SkeletonList items={5} />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}
```

## 🎨 Variantes Disponibles

### Button Variants
- `primary` - Principal
- `secondary` - Secundario
- `success` - Éxito
- `danger` - Peligro
- `ghost` - Transparente
- `outline` - Borde

### Card Variants
- `default` - Por defecto
- `primary` - Primario
- `success` - Éxito
- `warning` - Advertencia
- `danger` - Peligro

### Badge Variants
- `default` - Por defecto
- `primary` - Primario
- `success` - Éxito
- `warning` - Advertencia
- `danger` - Peligro
- `info` - Información
- `outline` - Borde

### Sizes (Disponibles para Button, Badge, etc.)
- `xs` - Extra pequeño
- `sm` - Pequeño
- `md` - Mediano (default)
- `lg` - Grande
- `xl` - Extra grande

## 🚀 Beneficios

1. **Consistencia**: Todos los componentes lucen y se comportan igual
2. **Mantenibilidad**: Cambios en un solo lugar afectan a toda la app
3. **Accesibilidad**: WCAG AA compliant por defecto
4. **Productividad**: Menos código, más rápido desarrollar
5. **Type Safety**: Mejor autocompletado y menos errores

## 📝 Próximos Pasos

1. Reemplazar implementaciones antiguas con nuevos componentes
2. Crear tests para nuevos componentes
3. Documentar componentes en Storybook
4. Optimizar componentes existentes con React.memo