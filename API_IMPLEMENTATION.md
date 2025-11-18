# 🎯 Resumen de Integración Backend - Crear Niño

## ✅ Archivos Creados

### 1. **Capa de API**
- **`src/lib/api-client.ts`** - Cliente HTTP base con soporte para Kafka
- **`src/types/api.types.ts`** - Tipos TypeScript para requests/responses
- **`src/services/apadrinamiento.service.ts`** - Servicio específico de apadrinamiento

### 2. **Integración**
- **`src/contexts/BitacoraContext.tsx`** - Actualizado para usar API real en `addChild()`

### 3. **Documentación y Ejemplos**
- **`INTEGRATION.md`** - Documentación completa de la integración
- **`src/components/examples/CreateChildExample.tsx`** - Componente de ejemplo
- **`.env.local`** - Variables de entorno configuradas

---

## 🚀 Cómo Usar

### Configuración Inicial

1. **Variables de Entorno** (`.env.local`):
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

2. **Instalar dependencias** (ya están):
```bash
npm install
```

---

## 📝 Endpoint Implementado

### **Crear Niño**
- **Kafka Topic**: `apadrinamiento_children_create`
- **Método**: POST a `/kafka/apadrinamiento_children_create`
- **Autenticación**: Bearer token (automático)

### Request Format
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

### Response Format
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez López",
  "dateOfBirth": "2015-05-20",
  "gender": "MALE",
  "municipality": "Armenia",
  "shortDescription": "Quiere ser ingeniero",
  "fullStory": "Juan es un niño alegre...",
  "address": "Calle 10 #5-23",
  "photo": "https://example.com/photo.jpg",
  "photos": ["https://example.com/photo1.jpg"],
  "createdAt": "2025-11-18T03:20:29.923Z",
  "updatedAt": "2025-11-18T03:20:29.923Z"
}
```

---

## 💻 Ejemplos de Uso

### Opción 1: Usando el Context (Recomendado)

```tsx
import { useBitacora } from '@/contexts/BitacoraContext';

function MyComponent() {
  const { addChild } = useBitacora();

  const handleCreate = async () => {
    const newChild = await addChild({
      nombre: 'Juan',
      apellidos: 'Pérez López',
      fechaNacimiento: '2015-05-20',
      edad: 9,
      genero: 'masculino',
      municipio: 'Armenia',
      direccion: 'Calle 10 #5-23',
      institucion: 'Colegio José Holguín',
      grado: '4° Primaria',
      foto: 'https://example.com/photo.jpg',
      historia: 'Juan es un niño alegre...',
      suenos: 'Quiere ser ingeniero',
      situacionFamiliar: 'Vive con su abuela',
      necesidades: ['Material escolar'],
      estadoApadrinamiento: 'disponible',
      jornada: 'mañana'
    });
    
    console.log('Niño creado:', newChild);
  };
}
```

### Opción 2: Usando el Servicio Directamente

```tsx
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { CreateChildDTO } from '@/types/api.types';

async function createChild() {
  const dto: CreateChildDTO = {
    firstName: 'Juan',
    lastName: 'Pérez López',
    dateOfBirth: '2015-05-20',
    gender: 'MALE',
    municipality: 'Armenia',
    shortDescription: 'Quiere ser ingeniero',
    fullStory: 'Juan es un niño alegre...',
    address: 'Calle 10 #5-23',
    photo: 'https://example.com/photo.jpg'
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

## 🔍 Validaciones Automáticas

El servicio valida todos los campos antes de enviar:

- ✅ `firstName`: 2-50 caracteres
- ✅ `lastName`: 2-50 caracteres
- ✅ `dateOfBirth`: formato ISO 8601 (YYYY-MM-DD)
- ✅ `gender`: debe ser "MALE" o "FEMALE"
- ✅ `municipality`: 2-100 caracteres
- ✅ `shortDescription`: requerido, máximo 200 caracteres
- ✅ `fullStory`: requerido
- ✅ Campos opcionales tienen validación de longitud/formato

---

## 🔄 Mapeo de Datos

El servicio incluye helpers automáticos:

### Local → API
```typescript
apadrinamientoService.convertToApiFormat({
  nombre: 'Juan',        // → firstName: 'Juan'
  genero: 'masculino'    // → gender: 'MALE'
  // ...
});
```

### API → Local
```typescript
apadrinamientoService.convertFromApiFormat(apiResponse);
// Convierte la respuesta de la API al formato usado en el frontend
```

---

## 🛡️ Manejo de Errores

### Con Fallback Automático
El `BitacoraContext` tiene fallback a mock data si la API falla:

```tsx
try {
  // Intenta usar API real
  const response = await apadrinamientoService.createChild(dto, userId);
  return response.data;
} catch (error) {
  // Fallback a mock para desarrollo
  console.error('Error, usando mock data');
  return mockChild;
}
```

### Sin Fallback
```tsx
const response = await apadrinamientoService.createChild(dto, userId);

if (!response.success) {
  alert(response.error?.message);
  console.error(response.error?.details);
}
```

---

## 🔐 Autenticación

El cliente API automáticamente:
1. Lee el token desde `localStorage.getItem('token')`
2. Lo agrega al header: `Authorization: Bearer {token}`
3. Lo envía en cada request

**No necesitas configurar nada manualmente.**

---

## 📦 Estructura del Proyecto

```
src/
├── lib/
│   └── api-client.ts              # Cliente HTTP base
├── types/
│   └── api.types.ts               # Tipos TypeScript
├── services/
│   └── apadrinamiento.service.ts  # Servicio de apadrinamiento
├── contexts/
│   └── BitacoraContext.tsx        # Context actualizado
└── components/
    └── examples/
        └── CreateChildExample.tsx # Ejemplo de uso
```

---

## 🧪 Testing Local

### 1. Sin Backend (Mock)
```bash
# No configurar NEXT_PUBLIC_API_BASE_URL
npm run dev
```
Los datos se guardan en memoria (mock).

### 2. Con Backend Local
```bash
# En .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

npm run dev
```

### 3. Con Backend Remoto
```bash
# En .env.local:
NEXT_PUBLIC_API_BASE_URL=https://api.huahuacuna.org

npm run dev
```

---

## 📚 Documentación Adicional

- **`INTEGRATION.md`** - Documentación detallada con más ejemplos
- **`src/components/examples/CreateChildExample.tsx`** - Componente funcional de ejemplo

---

## ✅ Próximos Pasos

Para agregar más endpoints:

1. Agregar tipos en `src/types/api.types.ts`
2. Agregar métodos en `src/services/apadrinamiento.service.ts`
3. Integrar en el contexto correspondiente
4. Actualizar documentación

---

## 🆘 Troubleshooting

### Error: "Usuario no autenticado"
- Verifica que el usuario esté logueado
- Confirma que `localStorage.getItem('token')` existe

### Error: "NETWORK_ERROR"
- Verifica que el backend esté corriendo
- Confirma la URL en `.env.local`
- Revisa CORS en el backend

### Error de validación
- Revisa los mensajes de error en consola
- Verifica que los datos cumplan las validaciones
- Consulta `INTEGRATION.md` para ver las reglas

---

## 📝 Notas Importantes

1. **El endpoint asume que el backend expone**: `/kafka/{topic}`
   - Si tu backend usa otra ruta, edita `api-client.ts` método `sendToKafka()`

2. **El userId se obtiene automáticamente del usuario logueado**
   - Se convierte de string a number automáticamente

3. **Las fotos se esperan como URLs**
   - Si necesitas subir archivos, habrá que agregar un endpoint separado

4. **El formulario existente en `ChildFormPage` ya usa `addChild()`**
   - La integración ya está funcionando allí también

---

## ✨ Resumen

- ✅ Endpoint "Crear Niño" completamente integrado
- ✅ Validaciones automáticas
- ✅ Manejo de errores robusto
- ✅ Fallback a mock para desarrollo
- ✅ TypeScript types completos
- ✅ Documentación y ejemplos
- ✅ Build exitoso sin errores

**¡Listo para usar!** 🎉
