# Integración con Backend - Documentación

## Estructura Creada

### 1. **API Client** (`/src/lib/api-client.ts`)
Cliente HTTP base para todas las comunicaciones con el backend.

**Características:**
- Inyección automática de token de autorización desde `localStorage`
- Manejo de errores centralizado
- Soporte para endpoints Kafka
- Métodos: `get`, `post`, `put`, `patch`, `delete`, `sendToKafka`

### 2. **Tipos API** (`/src/types/api.types.ts`)
Definiciones TypeScript para requests/responses de la API.

**Tipos principales:**
- `ApiResponse<T>`: Respuesta genérica de la API
- `CreateChildDTO`: DTO para crear niños
- `ChildResponse`: Respuesta del backend
- `KafkaTopic`: Enum con topics de Kafka

### 3. **Servicio Apadrinamiento** (`/src/services/apadrinamiento.service.ts`)
Servicio específico para endpoints de apadrinamiento.

**Métodos:**
- `createChild(dto, userId)`: Crear niño vía Kafka
- `convertToApiFormat()`: Convierte formato local a API
- `convertFromApiFormat()`: Convierte respuesta API a formato local

### 4. **Integración en Context** (`/src/contexts/BitacoraContext.tsx`)
Actualizado para usar la API real en lugar de mock data.

---

## Configuración

### Variables de Entorno

Crear/editar `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Para producción, cambiar a la URL del backend desplegado.

---

## Uso del Endpoint: Crear Niño

### Kafka Topic
`apadrinamiento_children_create`

### Desde un Componente React

```tsx
import { useBitacora } from '@/contexts/BitacoraContext';

function MyComponent() {
  const { addChild } = useBitacora();

  const handleCreateChild = async () => {
    try {
      const newChild = await addChild({
        nombre: 'Juan',
        apellidos: 'Pérez López',
        fechaNacimiento: '2015-05-20',
        edad: 9, // Se calcula automáticamente
        genero: 'masculino',
        foto: 'https://example.com/photo.jpg',
        municipio: 'Armenia',
        direccion: 'Calle 10 #5-23',
        institucion: 'Colegio José Holguín',
        grado: '4° Primaria',
        historia: 'Juan es un niño alegre...',
        suenos: 'Quiere ser ingeniero',
        situacionFamiliar: 'Vive con su abuela',
        necesidades: ['Material escolar', 'Apoyo educativo'],
        estadoApadrinamiento: 'disponible',
        jornada: 'mañana'
      });
      
      console.log('Niño creado:', newChild);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleCreateChild}>Crear Niño</button>;
}
```

### Uso Directo del Servicio

```tsx
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { CreateChildDTO } from '@/types/api.types';

async function createChildDirectly() {
  const dto: CreateChildDTO = {
    firstName: 'Juan',
    lastName: 'Pérez López',
    dateOfBirth: '2015-05-20',
    gender: 'MALE',
    municipality: 'Armenia',
    shortDescription: 'Quiere ser ingeniero',
    fullStory: 'Juan es un niño alegre que vive con su abuela...',
    address: 'Calle 10 #5-23',
    photo: 'https://example.com/photo.jpg',
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
  };

  const response = await apadrinamientoService.createChild(dto, 1);

  if (response.success) {
    console.log('Niño creado:', response.data);
  } else {
    console.error('Error:', response.error?.message);
  }
}
```

---

## Validaciones

El servicio valida automáticamente:

- ✅ `firstName`: 2-50 caracteres
- ✅ `lastName`: 2-50 caracteres
- ✅ `dateOfBirth`: formato ISO 8601 (ej: `2015-05-20`)
- ✅ `gender`: debe ser `MALE` o `FEMALE`
- ✅ `municipality`: 2-100 caracteres
- ✅ `shortDescription`: máximo 200 caracteres
- ✅ `fullStory`: requerido
- ✅ `ethnicity` (opcional): máximo 50 caracteres
- ✅ `specialCondition` (opcional): máximo 200 caracteres
- ✅ `address` (opcional): máximo 200 caracteres
- ✅ `photo` (opcional): debe ser URL válida
- ✅ `photos` (opcional): array de URLs válidas

---

## Mapeo de Datos

### Formato Local → API

```typescript
{
  nombre: 'Juan'           → firstName: 'Juan'
  apellidos: 'Pérez'       → lastName: 'Pérez'
  genero: 'masculino'      → gender: 'MALE'
  genero: 'femenino'       → gender: 'FEMALE'
  fechaNacimiento: '...'   → dateOfBirth: '...'
  municipio: '...'         → municipality: '...'
  suenos: '...'            → shortDescription: '...'
  historia: '...'          → fullStory: '...'
  direccion: '...'         → address: '...'
  foto: '...'              → photo: '...'
  fotos: [...]             → photos: [...]
}
```

### API → Formato Local

```typescript
{
  id: 123                  → id: '123'
  firstName: 'Juan'        → nombre: 'Juan'
  lastName: 'Pérez'        → apellidos: 'Pérez'
  gender: 'MALE'           → genero: 'masculino'
  gender: 'FEMALE'         → genero: 'femenino'
  dateOfBirth: '...'       → fechaNacimiento: '...'
  municipality: '...'      → municipio: '...'
  shortDescription: '...'  → suenos: '...'
  fullStory: '...'         → historia: '...'
  address: '...'           → direccion: '...'
  photo: '...'             → foto: '...'
  photos: [...]            → fotos: [...]
}
```

---

## Estructura del Request

El servicio envía a Kafka en este formato:

```json
{
  "dto": {
    "firstName": "Juan",
    "lastName": "Pérez López",
    "dateOfBirth": "2015-05-20",
    "gender": "MALE",
    "municipality": "Armenia",
    "shortDescription": "Quiere ser ingeniero",
    "fullStory": "Juan es un niño alegre...",
    "address": "Calle 10 #5-23",
    "photo": "https://example.com/photo.jpg",
    "photos": ["https://example.com/photo1.jpg"]
  },
  "userId": 1
}
```

---

## Manejo de Errores

### Errores de Validación
```typescript
try {
  await apadrinamientoService.createChild(invalidDTO, userId);
} catch (error) {
  // Error: "Errores de validación:\nfirstName debe tener entre 2 y 50 caracteres"
}
```

### Errores de Red
```typescript
const response = await apadrinamientoService.createChild(dto, userId);

if (!response.success) {
  console.error('Error:', response.error?.message);
  console.error('Código:', response.error?.code);
  console.error('Detalles:', response.error?.details);
}
```

### Fallback a Mock
Si la API falla, el contexto automáticamente usa mock data para desarrollo:

```typescript
// En BitacoraContext.tsx
catch (error) {
  console.error('Error creating child:', error);
  toast.error('Error al crear el niño');
  
  // Fallback a mock para desarrollo
  const newChild: Child = { ...childData, id: `child-${Date.now()}` };
  setChildrenList(prev => [...prev, newChild]);
  return newChild;
}
```

---

## Autenticación

El cliente API automáticamente:
1. Lee el token desde `localStorage.getItem('token')`
2. Lo incluye en el header: `Authorization: Bearer {token}`
3. Si no hay token, envía el request sin autorización (configurable)

### Configurar requiresAuth

```typescript
// Request CON autenticación (default)
await apiClient.post('/endpoint', data);

// Request SIN autenticación
await apiClient.post('/endpoint', data, { requiresAuth: false });
```

---

## Testing

### Test del API Client

```typescript
import { apiClient } from '@/lib/api-client';

// Mock fetch
global.fetch = jest.fn();

test('should send POST request', async () => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: 'Test' })
  });

  const response = await apiClient.post('/test', { data: 'test' });
  
  expect(response.success).toBe(true);
  expect(response.data).toEqual({ id: 1, name: 'Test' });
});
```

### Test del Servicio

```typescript
import { apadrinamientoService } from '@/services/apadrinamiento.service';

test('should validate CreateChildDTO', () => {
  const invalidDTO = {
    firstName: 'A', // Muy corto
    lastName: 'Pérez',
    dateOfBirth: '2015-05-20',
    gender: 'MALE',
    municipality: 'Armenia',
    shortDescription: 'Test',
    fullStory: 'Test'
  };

  expect(() => {
    apadrinamientoService['validateCreateChildDTO'](invalidDTO);
  }).toThrow('firstName debe tener entre 2 y 50 caracteres');
});
```

---

## Próximos Pasos

Para agregar más endpoints:

1. **Agregar tipos en `api.types.ts`**:
```typescript
export interface UpdateChildDTO {
  // ...campos
}
```

2. **Agregar métodos en el servicio**:
```typescript
async updateChild(id: number, dto: UpdateChildDTO) {
  return apiClient.sendToKafka(
    KafkaTopic.CHILDREN_UPDATE,
    { id, dto }
  );
}
```

3. **Integrar en el contexto**:
```typescript
const updateChild = async (id: string, updates: Partial<Child>) => {
  const dto = convertToUpdateDTO(updates);
  const response = await apadrinamientoService.updateChild(Number(id), dto);
  // ...
};
```

---

## Endpoints Kafka Configurados

- ✅ `apadrinamiento_children_create` - Crear niño
- ⏳ `apadrinamiento_children_update` - Actualizar niño
- ⏳ `apadrinamiento_children_delete` - Eliminar niño

---

## Soporte

Para dudas o problemas:
1. Revisar logs en consola del navegador
2. Verificar variables de entorno en `.env.local`
3. Confirmar que el backend esté corriendo
4. Revisar formato de request/response en Network tab
