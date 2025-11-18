# 🎣 Guía de Hooks Personalizados

## 📚 ¿Qué son los Hooks?

Los **hooks personalizados** son funciones reutilizables que encapsulan lógica de estado y efectos secundarios. En este proyecto, los usamos para:

1. **Manejar llamadas a la API**
2. **Gestionar estados de loading/error**
3. **Mostrar notificaciones**
4. **Reutilizar lógica entre componentes**

---

## 🏗️ Estructura de Carpetas

```
src/
├── hooks/                    # Custom hooks
│   ├── useChildren.ts       # Hook para niños
│   ├── useBitacoraEntries.ts # Hook para bitácora
│   ├── useSponsorship.ts    # Hook para apadrinamientos
│   └── index.ts             # Exportaciones
├── services/                 # Servicios (lógica de API)
├── contexts/                 # Contextos (estado global)
└── components/               # Componentes UI
```

---

## 🎯 Ventajas de Usar Hooks

### ✅ Sin Hooks (Código en Componente)
```typescript
function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const createChild = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = parseInt(user.id, 10);
      const dto = service.convertToApiFormat(data);
      const response = await service.createChild(dto, userId);
      
      if (!response.success) {
        throw new Error(response.error?.message);
      }
      
      toast.success('Niño creado');
      // ... más código
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ... 200 líneas más de lógica similar
}
```

### ✅ Con Hooks (Código Limpio)
```typescript
function MyComponent() {
  const { loading, error, createChild } = useChildren();
  
  const handleCreate = async (data) => {
    const result = await createChild(data);
    if (result.success) {
      // Hacer algo con result.data
    }
  };
  
  // Componente enfocado solo en UI
}
```

---

## 📖 Hooks Disponibles

### 1. **useChildren** 

Maneja todas las operaciones con niños.

**Uso:**
```typescript
import { useChildren } from '@/hooks';

function MyComponent() {
  const {
    loading,
    error,
    createChild,
    updateChild,
    deleteChild,
    listChildren,
    getChild,
  } = useChildren();
  
  // Crear niño
  const handleCreate = async () => {
    const result = await createChild({
      nombre: 'Juan',
      apellidos: 'Pérez',
      fechaNacimiento: '2015-05-20',
      genero: 'masculino',
      municipio: 'Armenia',
      // ... más campos
    });
    
    if (result.success) {
      console.log('Niño creado:', result.data);
    }
  };
  
  // Listar niños
  useEffect(() => {
    const load = async () => {
      const result = await listChildren();
      if (result.success) {
        setChildren(result.data);
      }
    };
    load();
  }, []);
  
  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleCreate}>Crear Niño</button>
    </div>
  );
}
```

**Request/Response:**
```typescript
// createChild
Request: { nombre, apellidos, fechaNacimiento, ... }
Response: { success: boolean, data?: Child, error?: string }

// updateChild
Request: (id: string, updates: Partial<Child>)
Response: { success: boolean, data?: Child, error?: string }

// deleteChild
Request: (id: string)
Response: { success: boolean, error?: string }

// listChildren
Request: (filters?: any)
Response: { success: boolean, data: Child[], error?: string }

// getChild
Request: (id: string)
Response: { success: boolean, data?: Child, error?: string }
```

---

### 2. **useBitacoraEntries**

Maneja operaciones de bitácora (fotos/videos).

**Uso:**
```typescript
import { useBitacoraEntries } from '@/hooks';

function BitacoraComponent() {
  const {
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    listEntries,
  } = useBitacoraEntries();
  
  // Crear entrada
  const handleUpload = async (childId: string) => {
    const result = await createEntry({
      childId,
      tipo: 'foto',
      url: 'https://example.com/photo.jpg',
      descripcion: 'Descripción...',
      fechaActividad: new Date().toISOString(),
      categoria: 'Educación',
      etiquetas: ['escuela', 'estudio'],
      visibilidad: 'publico',
      tamano: 1024000,
    });
    
    if (result.success) {
      console.log('Entrada creada:', result.data);
    }
  };
  
  // Listar entradas de un niño
  useEffect(() => {
    const load = async () => {
      const result = await listEntries(childId);
      if (result.success) {
        setEntries(result.data);
      }
    };
    load();
  }, [childId]);
  
  return <div>{/* UI */}</div>;
}
```

**Request/Response:**
```typescript
// createEntry
Request: { childId, tipo, url, descripcion, ... }
Response: { success: boolean, data?: Entry, error?: string }

// updateEntry
Request: (id: string, updates: Partial<Entry>)
Response: { success: boolean, error?: string }

// deleteEntry
Request: (id: string, reason: string)
Response: { success: boolean, error?: string }

// listEntries
Request: (childId?: string)
Response: { success: boolean, data: Entry[], error?: string }
```

---

### 3. **useSponsorship**

Maneja apadrinamientos y mensajes.

**Uso:**
```typescript
import { useSponsorship } from '@/hooks';

function SponsorshipComponent() {
  const {
    loading,
    error,
    createSponsorship,
    endSponsorship,
    listSponsorships,
    sendMessage,
    listMessages,
    markMessagesAsRead,
  } = useSponsorship();
  
  // Apadrinar niño
  const handleSponsor = async (childId: number) => {
    const result = await createSponsorship(childId);
    if (result.success) {
      console.log('Apadrinamiento creado:', result.data);
    }
  };
  
  // Enviar mensaje
  const handleSendMessage = async (sponsorshipId: number) => {
    const result = await sendMessage(
      sponsorshipId, 
      'Hola, ¿cómo está el niño?'
    );
    
    if (result.success) {
      setMessages(prev => [...prev, result.data]);
    }
  };
  
  // Cargar mensajes
  useEffect(() => {
    const load = async () => {
      const result = await listMessages(sponsorshipId);
      if (result.success) {
        setMessages(result.data);
      }
    };
    load();
  }, [sponsorshipId]);
  
  return <div>{/* UI */}</div>;
}
```

**Request/Response:**
```typescript
// createSponsorship
Request: (childId: number)
Response: { success: boolean, data?: Sponsorship, error?: string }

// endSponsorship
Request: (sponsorshipId: number, reason: string)
Response: { success: boolean, error?: string }

// listSponsorships
Request: (filters?: any)
Response: { success: boolean, data: Sponsorship[], error?: string }

// sendMessage
Request: (sponsorshipId: number, message: string)
Response: { success: boolean, data?: Message, error?: string }

// listMessages
Request: (sponsorshipId: number)
Response: { success: boolean, data: Message[], error?: string }

// markMessagesAsRead
Request: (sponsorshipId: number)
Response: { success: boolean, error?: string }
```

---

## 🎨 Patrones de Uso

### Patrón 1: Crear y Actualizar Lista

```typescript
function MyList() {
  const { loading, createChild } = useChildren();
  const [children, setChildren] = useState([]);
  
  const handleCreate = async (data) => {
    const result = await createChild(data);
    if (result.success) {
      // Agregar a la lista local
      setChildren(prev => [...prev, result.data]);
    }
  };
  
  return <div>{/* UI */}</div>;
}
```

### Patrón 2: Cargar Datos al Montar

```typescript
function MyList() {
  const { loading, listChildren } = useChildren();
  const [children, setChildren] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      const result = await listChildren();
      if (result.success) {
        setChildren(result.data);
      }
    };
    loadData();
  }, []);
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {children.map(child => <ChildCard key={child.id} {...child} />)}
    </div>
  );
}
```

### Patrón 3: Eliminar con Confirmación

```typescript
function ChildItem({ child }) {
  const { loading, deleteChild } = useChildren();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleDelete = async () => {
    const result = await deleteChild(child.id);
    if (result.success) {
      // Remover de la lista local
      onDeleted(child.id);
    }
  };
  
  return (
    <div>
      <button onClick={() => setShowConfirm(true)}>Eliminar</button>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleDelete}
          loading={loading}
        />
      )}
    </div>
  );
}
```

### Patrón 4: Formulario con Validación

```typescript
function CreateChildForm() {
  const { loading, error, createChild } = useChildren();
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones locales
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }
    
    // Crear con el hook
    const result = await createChild(formData);
    
    if (result.success) {
      // Reset form
      setFormData({});
      // Cerrar modal
      onClose();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert>{error}</Alert>}
      <Input 
        value={formData.nombre}
        onChange={e => setFormData({...formData, nombre: e.target.value})}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Niño'}
      </Button>
    </form>
  );
}
```

---

## 🔄 Comparación: Contexto vs Hook

### ¿Cuándo usar Contexto?
- Cuando necesitas **estado global** compartido
- Para datos que muchos componentes necesitan
- Ejemplo: Usuario autenticado, tema, idioma

### ¿Cuándo usar Hook?
- Para **operaciones específicas** de API
- Cuando necesitas **loading/error states locales**
- Para **reutilizar lógica** entre componentes

### Ejemplo Combinado:
```typescript
// Context: Estado global
function MyApp() {
  const { children } = useBitacora(); // Estado global
  return <ChildrenList />;
}

// Hook: Operación específica
function ChildrenList() {
  const { children } = useBitacora(); // Del contexto
  const { loading, deleteChild } = useChildren(); // Hook local
  
  const handleDelete = async (id) => {
    await deleteChild(id);
    // El contexto se actualizará automáticamente
  };
}
```

---

## ✅ Mejores Prácticas

### 1. Siempre maneja el resultado
```typescript
// ❌ Malo
await createChild(data);

// ✅ Bueno
const result = await createChild(data);
if (result.success) {
  // Actualizar UI
} else {
  // Manejar error
}
```

### 2. Usa loading states
```typescript
// ✅ Bueno
<Button disabled={loading}>
  {loading ? 'Guardando...' : 'Guardar'}
</Button>
```

### 3. Muestra errores al usuario
```typescript
// ✅ Bueno
{error && (
  <Alert variant="destructive">
    {error}
  </Alert>
)}
```

### 4. Limpia al desmontar
```typescript
// ✅ Bueno
useEffect(() => {
  let cancelled = false;
  
  const loadData = async () => {
    const result = await listChildren();
    if (!cancelled && result.success) {
      setChildren(result.data);
    }
  };
  
  loadData();
  
  return () => {
    cancelled = true;
  };
}, []);
```

---

## 🎯 Resumen

### Hooks vs Llamadas Directas

| Aspecto | Sin Hooks | Con Hooks |
|---------|-----------|-----------|
| **Código** | 50+ líneas | 5-10 líneas |
| **Reutilización** | Difícil | Fácil |
| **Testing** | Complejo | Simple |
| **Loading/Error** | Manual | Automático |
| **Notifications** | Manual | Automático |

### ¿Son Necesarios los Hooks?

**SÍ, absolutamente recomendados** porque:

1. ✅ **Código más limpio** - Los componentes se enfocan en UI
2. ✅ **Reutilización** - Usa la misma lógica en múltiples lugares
3. ✅ **Mantenimiento** - Cambios en un solo lugar
4. ✅ **Testing** - Testea hooks independientemente
5. ✅ **Estados automáticos** - Loading/error states gratis
6. ✅ **Notificaciones** - Toast automático en éxito/error

---

## 📝 Ejemplo Completo

Ver `src/components/examples/HookUsageExample.tsx` para un ejemplo funcional completo.

---

## 🚀 Próximos Pasos

1. Crear hooks para proyectos: `useProjects`
2. Crear hooks para donaciones: `useDonations`
3. Crear hooks para noticias: `useNews`
4. Crear hooks para voluntariado: `useVolunteering`

Todos siguiendo el mismo patrón establecido! 🎉
