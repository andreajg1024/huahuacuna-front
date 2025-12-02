# Implementación Completa: Módulos Projects y Sponsorships

## 📋 Resumen General

Se han implementado **18 endpoints** con logging completo y manejo de errores:
- ✅ **10 endpoints** del módulo Projects
- ✅ **8 endpoints** del módulo Sponsorships

---

## 🏗️ MÓDULO PROJECTS (10 endpoints)

### 📁 Archivos Creados
- `src/services/projects.service.new.ts` - Servicio con todos los endpoints
- `src/hooks/useProjects.new.ts` - Hook con todas las funciones

---

### 🌐 Endpoints Públicos

#### 1. GET /projects/public
**Función:** `getPublicProjects(params?)`

**Parámetros:**
```typescript
{
  skip?: number;
  take?: number;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
```

**Códigos de Error:**
- `GET_PUBLIC_PROJECTS_ERROR` - Error general al obtener proyectos
- `GET_PUBLIC_PROJECTS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] getPublicProjects - Params: {...}
[ProjectsService] Request URL: /projects/public?...
[ProjectsService] getPublicProjects - Success/Error: {...}
[useProjects] getPublicProjects - Start/Success/Error
```

---

#### 2. GET /projects/public/:slug
**Función:** `getPublicProjectBySlug(slug)`

**Parámetros:**
- `slug: string` - Identificador único del proyecto

**Códigos de Error:**
- `INVALID_SLUG` - Slug vacío o inválido
- `PROJECT_NOT_FOUND` (404) - Proyecto no encontrado
- `GET_PROJECT_BY_SLUG_ERROR` - Error general
- `GET_PROJECT_BY_SLUG_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] getPublicProjectBySlug - Slug: xxx
[ProjectsService] getPublicProjectBySlug - Success/Error: {...}
[useProjects] getPublicProjectBySlug - Start/Success/Error
```

---

#### 3. POST /projects/:id/volunteers
**Función:** `registerVolunteer(projectId, data)`

**Parámetros:**
```typescript
{
  projectId: number;
  data: {
    fullName: string;
    email: string;
    phone: string;
    skills: string;
    availability: string;
    message: string;
  }
}
```

**Códigos de Error:**
- `INVALID_PROJECT_ID` - ID de proyecto inválido
- `FULLNAME_REQUIRED` - Nombre completo requerido
- `INVALID_EMAIL` - Email inválido
- `PHONE_REQUIRED` - Teléfono requerido
- `INVALID_REGISTRATION_DATA` (400) - Datos inválidos
- `PROJECT_NOT_FOUND` (404) - Proyecto no encontrado
- `ALREADY_REGISTERED` (409) - Ya registrado como voluntario
- `REGISTER_VOLUNTEER_ERROR` - Error general
- `REGISTER_VOLUNTEER_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] registerVolunteer - ProjectID: X, Data: {...}
[ProjectsService] registerVolunteer - Success/Error: {...}
[useProjects] registerVolunteer - Start/Success/Error
```

---

### 🔐 Endpoints Admin

#### 4. POST /projects (Admin)
**Función:** `createProject(data)`

**Parámetros:**
```typescript
{
  title: string;
  description: string;
  objective: string;
  beneficiaries: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  coverImage: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
}
```

**Códigos de Error:**
- `TITLE_REQUIRED` - Título requerido
- `DESCRIPTION_REQUIRED` - Descripción requerida
- `OBJECTIVE_REQUIRED` - Objetivo requerido
- `BENEFICIARIES_REQUIRED` - Beneficiarios requeridos
- `INVALID_START_DATE` - Fecha de inicio inválida
- `INVALID_END_DATE` - Fecha de fin inválida
- `INVALID_DATE_RANGE` - Rango de fechas inválido
- `INVALID_PROJECT_DATA` (400) - Datos inválidos
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `CREATE_PROJECT_ERROR` - Error general
- `CREATE_PROJECT_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] createProject - Data: {...}
[ProjectsService] createProject - Success/Error: {...}
[useProjects] createProject - Start/Success/Error
[useProjects] createProject - Not authenticated (si aplica)
```

---

#### 5. GET /projects (Admin)
**Función:** `getAdminProjects(params?)`

**Parámetros:**
```typescript
{
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  skip?: number;
  take?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
```

**Códigos de Error:**
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `GET_ADMIN_PROJECTS_ERROR` - Error general
- `GET_ADMIN_PROJECTS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] getAdminProjects - Params: {...}
[ProjectsService] Request URL: /projects?...
[ProjectsService] getAdminProjects - Success/Error: {...}
[useProjects] getAdminProjects - Start/Success/Error
```

---

#### 6. PUT /projects/:id (Admin)
**Función:** `updateProject(id, data)`

**Parámetros:**
```typescript
{
  id: number;
  data: {
    title?: string;
    description?: string;
    objective?: string;
    beneficiaries?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
    images?: string[];
    metaDescription?: string;
    metaKeywords?: string[];
  }
}
```

**Códigos de Error:**
- `INVALID_PROJECT_ID` - ID inválido
- `INVALID_DATES` - Fechas inválidas
- `INVALID_DATE_RANGE` - Rango de fechas inválido
- `INVALID_UPDATE_DATA` (400) - Datos inválidos
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `PROJECT_NOT_FOUND` (404) - Proyecto no encontrado
- `UPDATE_PROJECT_ERROR` - Error general
- `UPDATE_PROJECT_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] updateProject - ID: X, Data: {...}
[ProjectsService] updateProject - Success/Error: {...}
[useProjects] updateProject - Start/Success/Error
```

---

#### 7. POST /projects/:id/publish (Admin)
**Función:** `publishProject(id)`

**Parámetros:**
- `id: number` - ID del proyecto

**Códigos de Error:**
- `INVALID_PROJECT_ID` - ID inválido
- `CANNOT_PUBLISH` (400) - No puede ser publicado
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `PROJECT_NOT_FOUND` (404) - Proyecto no encontrado
- `PUBLISH_PROJECT_ERROR` - Error general
- `PUBLISH_PROJECT_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] publishProject - ID: X
[ProjectsService] publishProject - Success/Error: {...}
[useProjects] publishProject - Start/Success/Error
```

---

#### 8. DELETE /projects/:id (Admin)
**Función:** `deleteProject(id)`

**Parámetros:**
- `id: number` - ID del proyecto

**Códigos de Error:**
- `INVALID_PROJECT_ID` - ID inválido
- `CANNOT_DELETE` (400) - No puede ser eliminado
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `PROJECT_NOT_FOUND` (404) - Proyecto no encontrado
- `DELETE_PROJECT_ERROR` - Error general
- `DELETE_PROJECT_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] deleteProject - ID: X
[ProjectsService] deleteProject - Success/Error
[useProjects] deleteProject - Start/Success/Error
```

---

#### 9. GET /projects/volunteers (Admin)
**Función:** `getVolunteers(params?)`

**Parámetros:**
```typescript
{
  projectId?: number;
  contacted?: boolean;
  skip?: number;
  take?: number;
}
```

**Códigos de Error:**
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `GET_VOLUNTEERS_ERROR` - Error general
- `GET_VOLUNTEERS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] getVolunteers - Params: {...}
[ProjectsService] Request URL: /projects/volunteers?...
[ProjectsService] getVolunteers - Success/Error: {...}
[useProjects] getVolunteers - Start/Success/Error
```

---

#### 10. POST /projects/volunteers/:id/contacted (Admin)
**Función:** `markVolunteerContacted(id, notes)`

**Parámetros:**
```typescript
{
  id: number;
  notes: string;
}
```

**Códigos de Error:**
- `INVALID_VOLUNTEER_ID` - ID de voluntario inválido
- `NOTES_REQUIRED` - Notas requeridas
- `INVALID_DATA` (400) - Datos inválidos
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos
- `VOLUNTEER_NOT_FOUND` (404) - Voluntario no encontrado
- `MARK_CONTACTED_ERROR` - Error general
- `MARK_CONTACTED_EXCEPTION` - Excepción no controlada

**Logs:**
```
[ProjectsService] markVolunteerContacted - ID: X, Data: {...}
[ProjectsService] markVolunteerContacted - Success/Error: {...}
[useProjects] markVolunteerContacted - Start/Success/Error
```

---

## 🤝 MÓDULO SPONSORSHIPS (8 endpoints)

### 📁 Archivos Creados
- `src/services/sponsorships.service.new.ts` - Servicio con todos los endpoints
- `src/hooks/useSponsorship.new.ts` - Hook con todas las funciones

---

### 👤 Endpoints Padrino

#### 1. POST /sponsorships/requests (Padrino)
**Función:** `createSponsorshipRequest(childId, reason)`

**Parámetros:**
```typescript
{
  childId: number;
  reason: string; // Min: 10, Max: 500 caracteres
}
```

**Códigos de Error:**
- `INVALID_CHILD_ID` - ID de niño inválido
- `REASON_REQUIRED` - Razón requerida
- `REASON_TOO_SHORT` - Razón menor a 10 caracteres
- `REASON_TOO_LONG` - Razón mayor a 500 caracteres
- `INVALID_REQUEST_DATA` (400) - Datos inválidos
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de padrino
- `CHILD_NOT_FOUND` (404) - Niño no encontrado o no disponible
- `DUPLICATE_REQUEST` (409) - Solicitud duplicada
- `CREATE_REQUEST_ERROR` - Error general
- `CREATE_REQUEST_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] createSponsorshipRequest - Data: {...}
[SponsorshipsService] createSponsorshipRequest - Success/Error: {...}
[useSponsorship] createSponsorshipRequest - Start/Success/Error
```

---

#### 5. GET /sponsorships/my (Padrino)
**Función:** `getMySponsorships(params?)`

**Parámetros:**
```typescript
{
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}
```

**Códigos de Error:**
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de padrino
- `GET_MY_SPONSORSHIPS_ERROR` - Error general
- `GET_MY_SPONSORSHIPS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] getMySponsorships - Params: {...}
[SponsorshipsService] Request URL: /sponsorships/my?...
[SponsorshipsService] getMySponsorships - Success/Error: {...}
[useSponsorship] getMySponsorships - Start/Success/Error
```

---

#### 7. GET /sponsorships/:id (Admin/Padrino)
**Función:** `getSponsorshipDetails(id)`

**Parámetros:**
- `id: number` - ID del apadrinamiento

**Códigos de Error:**
- `INVALID_SPONSORSHIP_ID` - ID inválido
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permiso para ver este apadrinamiento
- `SPONSORSHIP_NOT_FOUND` (404) - Apadrinamiento no encontrado
- `GET_SPONSORSHIP_DETAILS_ERROR` - Error general
- `GET_SPONSORSHIP_DETAILS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] getSponsorshipDetails - ID: X
[SponsorshipsService] getSponsorshipDetails - Success/Error: {...}
[useSponsorship] getSponsorshipDetails - Start/Success/Error
```

---

#### 8. POST /sponsorships/:id/cancel (Admin/Padrino)
**Función:** `cancelSponsorship(id, cancellationReason)`

**Parámetros:**
```typescript
{
  id: number;
  cancellationReason: string; // Min: 10 caracteres
}
```

**Códigos de Error:**
- `INVALID_SPONSORSHIP_ID` - ID inválido
- `CANCELLATION_REASON_REQUIRED` - Razón requerida
- `REASON_TOO_SHORT` - Razón menor a 10 caracteres
- `CANNOT_CANCEL` (400) - No se puede cancelar
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permiso para cancelar
- `SPONSORSHIP_NOT_FOUND` (404) - Apadrinamiento no encontrado
- `CANCEL_SPONSORSHIP_ERROR` - Error general
- `CANCEL_SPONSORSHIP_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] cancelSponsorship - ID: X, Data: {...}
[SponsorshipsService] cancelSponsorship - Success/Error: {...}
[useSponsorship] cancelSponsorship - Start/Success/Error
```

---

### 🔐 Endpoints Admin

#### 2. POST /sponsorships/requests/approve (Admin)
**Función:** `approveSponsorshipRequest(requestId)`

**Parámetros:**
- `requestId: number` - ID de la solicitud

**Códigos de Error:**
- `INVALID_REQUEST_ID` - ID de solicitud inválido
- `CANNOT_APPROVE` (400) - No puede ser aprobada
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de administrador
- `REQUEST_NOT_FOUND` (404) - Solicitud no encontrada
- `ALREADY_PROCESSED` (409) - Solicitud ya procesada
- `APPROVE_REQUEST_ERROR` - Error general
- `APPROVE_REQUEST_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] approveSponsorshipRequest - Data: {...}
[SponsorshipsService] approveSponsorshipRequest - Success/Error: {...}
[useSponsorship] approveSponsorshipRequest - Start/Success/Error
```

---

#### 3. POST /sponsorships/requests/reject (Admin)
**Función:** `rejectSponsorshipRequest(requestId, rejectionReason)`

**Parámetros:**
```typescript
{
  requestId: number;
  rejectionReason: string; // Min: 10 caracteres
}
```

**Códigos de Error:**
- `INVALID_REQUEST_ID` - ID de solicitud inválido
- `REJECTION_REASON_REQUIRED` - Razón requerida
- `REASON_TOO_SHORT` - Razón menor a 10 caracteres
- `CANNOT_REJECT` (400) - No puede ser rechazada
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de administrador
- `REQUEST_NOT_FOUND` (404) - Solicitud no encontrada
- `ALREADY_PROCESSED` (409) - Solicitud ya procesada
- `REJECT_REQUEST_ERROR` - Error general
- `REJECT_REQUEST_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] rejectSponsorshipRequest - Data: {...}
[SponsorshipsService] rejectSponsorshipRequest - Success/Error: {...}
[useSponsorship] rejectSponsorshipRequest - Start/Success/Error
```

---

#### 4. GET /sponsorships/requests/pending (Admin)
**Función:** `getPendingRequests(params?)`

**Parámetros:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Códigos de Error:**
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de administrador
- `GET_PENDING_REQUESTS_ERROR` - Error general
- `GET_PENDING_REQUESTS_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] getPendingRequests - Params: {...}
[SponsorshipsService] Request URL: /sponsorships/requests/pending?...
[SponsorshipsService] getPendingRequests - Success/Error: {...}
[useSponsorship] getPendingRequests - Start/Success/Error
```

---

#### 6. GET /sponsorships/history (Admin)
**Función:** `getSponsorshipHistory(params?)`

**Parámetros:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Códigos de Error:**
- `UNAUTHORIZED` (401) - No autorizado
- `FORBIDDEN` (403) - Sin permisos de administrador
- `GET_SPONSORSHIP_HISTORY_ERROR` - Error general
- `GET_SPONSORSHIP_HISTORY_EXCEPTION` - Excepción no controlada

**Logs:**
```
[SponsorshipsService] getSponsorshipHistory - Params: {...}
[SponsorshipsService] Request URL: /sponsorships/history?...
[SponsorshipsService] getSponsorshipHistory - Success/Error: {...}
[useSponsorship] getSponsorshipHistory - Start/Success/Error
```

---

## 📊 Códigos de Error HTTP Comunes

| Código | Significado | Acciones en UI |
|--------|-------------|----------------|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Mostrar mensaje de validación al usuario |
| **401** | Unauthorized | Redirigir a login, mensaje "Tu sesión ha expirado" |
| **403** | Forbidden | Mostrar "No tienes permisos suficientes" |
| **404** | Not Found | Mostrar "Recurso no encontrado" |
| **409** | Conflict | Mostrar mensaje específico del conflicto |

---

## 🔍 Ejemplo de Uso de Logs

### En Consola del Navegador:

```javascript
// Ejemplo: Crear proyecto
[useProjects] createProject - Start: { title: "Nuevo Proyecto", ... }
[ProjectsService] createProject - Data: { title: "Nuevo Proyecto", ... }
[ProjectsService] createProject - Success: { id: 1, title: "Nuevo Proyecto", ... }
[useProjects] createProject - Success: { id: 1, ... }

// Ejemplo: Error al crear proyecto
[useProjects] createProject - Start: { title: "", ... }
[ProjectsService] createProject - Data: { title: "", ... }
[ProjectsService] createProject - Error: { message: "El título es requerido", code: "TITLE_REQUIRED" }
[useProjects] createProject - Error: { message: "El título es requerido", ... }

// Ejemplo: Error 401
[useProjects] createProject - Start: { ... }
[ProjectsService] createProject - Data: { ... }
[ProjectsService] createProject - Error: { message: "No autorizado", code: "UNAUTHORIZED", statusCode: 401 }
[useProjects] createProject - Error: { message: "Tu sesión ha expirado", ... }
```

---

## 📦 Uso de los Hooks

### Hook de Projects:

```typescript
import { useProjects } from '@/hooks/useProjects.new';

function MyComponent() {
  const {
    loading,
    error,
    
    // Públicos
    getPublicProjects,
    getPublicProjectBySlug,
    registerVolunteer,
    
    // Admin
    createProject,
    getAdminProjects,
    updateProject,
    publishProject,
    deleteProject,
    getVolunteers,
    markVolunteerContacted,
  } = useProjects();

  // Ejemplo de uso
  const handleCreateProject = async () => {
    const result = await createProject({
      title: "Nuevo Proyecto",
      description: "Descripción del proyecto",
      // ... más campos
    });
    
    if (result.success) {
      console.log("Proyecto creado:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  };
}
```

### Hook de Sponsorships:

```typescript
import { useSponsorship } from '@/hooks/useSponsorship.new';

function MyComponent() {
  const {
    loading,
    error,
    
    // Padrino
    createSponsorshipRequest,
    getMySponsorships,
    getSponsorshipDetails,
    cancelSponsorship,
    
    // Admin
    approveSponsorshipRequest,
    rejectSponsorshipRequest,
    getPendingRequests,
    getSponsorshipHistory,
  } = useSponsorship();

  // Ejemplo de uso
  const handleRequestSponsorship = async (childId: number) => {
    const result = await createSponsorshipRequest(
      childId,
      "Quiero apadrinar a este niño porque..."
    );
    
    if (result.success) {
      console.log("Solicitud creada:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  };
}
```

---

## ✅ Checklist de Implementación

### Projects Module
- ✅ Servicio: `projects.service.new.ts`
- ✅ Hook: `useProjects.new.ts`
- ✅ 10 endpoints implementados
- ✅ Logging completo en servicio
- ✅ Logging completo en hook
- ✅ Manejo de errores HTTP (400, 401, 403, 404, 409)
- ✅ Validaciones de datos
- ✅ Mensajes de toast específicos

### Sponsorships Module
- ✅ Servicio: `sponsorships.service.new.ts`
- ✅ Hook: `useSponsorship.new.ts`
- ✅ 8 endpoints implementados
- ✅ Logging completo en servicio
- ✅ Logging completo en hook
- ✅ Manejo de errores HTTP (400, 401, 403, 404, 409)
- ✅ Validaciones de datos
- ✅ Mensajes de toast específicos

---

## 🚀 Próximos Pasos

1. **Renombrar archivos** (cuando estés listo para usarlos):
   ```bash
   mv src/services/projects.service.new.ts src/services/projects.service.ts
   mv src/hooks/useProjects.new.ts src/hooks/useProjects.ts
   mv src/services/sponsorships.service.new.ts src/services/sponsorships.service.ts
   mv src/hooks/useSponsorship.new.ts src/hooks/useSponsorship.ts
   ```

2. **Actualizar imports** en componentes que usen estos servicios

3. **Probar cada endpoint** con casos de éxito y error

4. **Verificar logs** en la consola del navegador

5. **Ajustar mensajes** de error según necesidades del UX

---

## 📝 Notas Importantes

- Todos los logs se pueden ver en la **consola del navegador** (F12)
- Los errores HTTP se manejan con códigos específicos
- Los mensajes de toast son específicos según el tipo de error
- La autenticación se verifica antes de cada operación que la requiera
- Los datos se validan antes de enviarlos al backend
- Todos los endpoints retornan objetos con estructura `{ success, data?, error? }`

---

**Fecha de implementación:** 1 de diciembre de 2025
**Total de funciones implementadas:** 18 endpoints completos
