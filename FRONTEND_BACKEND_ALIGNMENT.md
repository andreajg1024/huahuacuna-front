# Correcciones de Integración Frontend-Backend
## Fecha: 2 de Diciembre 2025

## Resumen Ejecutivo

Se realizó un análisis completo de TODOS los módulos del sistema para identificar discrepancias entre los parámetros que espera el backend vs lo que envía el frontend. Se corrigieron los módulos más críticos.

---

## Módulos Analizados

| Módulo | Estado Antes | Estado Después | Prioridad |
|--------|--------------|----------------|-----------|
| **Children (Bitácora)** | ⚠️ Integrado con errores (9 campos mal mapeados) | ✅ **CORREGIDO** | 🔴 ALTA |
| **Projects** | ❌ NO integrado (30+ campos) | ✅ **CORREGIDO E INTEGRADO** | 🔴 CRÍTICA |
| **Sponsorships** | ✅ Correctamente integrado | ✅ Sin cambios necesarios | 🟢 OK |
| **Donations** | ❌ NO integrado (20+ campos) | ⏳ Pendiente | 🔴 CRÍTICA |
| **News** | ❌ NO integrado (15 campos) | ⏳ Pendiente | 🟡 MEDIA |
| **Volunteering** | ❌ NO integrado (20+ campos) | ⏳ Pendiente | 🔴 CRÍTICA |

---

## 1. ✅ CHILDREN / BITÁCORA - CORREGIDO

### Problema
El contexto recibía datos en formato `Child` (frontend) pero los enviaba directamente como `any` al servicio que esperaba `CreateChildDTO` (backend).

### Discrepancias Corregidas

| Campo Frontend | Campo Backend | Problema | Solución |
|----------------|---------------|----------|----------|
| `nombre` | `firstName` | Nombre diferente | Mapeado correctamente |
| `apellidos` | `lastName` | Nombre diferente | Mapeado correctamente |
| `fechaNacimiento` | `dateOfBirth` | Nombre diferente | Mapeado correctamente |
| `genero: 'masculino'\|'femenino'` | `gender: 'MALE'\|'FEMALE'` | Valores diferentes | Convertido con ternario |
| `historia` | `shortDescription` + `fullStory` | Campos diferentes | Mapeado a ambos |
| `jornada` | `schedule` | Nombre diferente | Mapeado correctamente |
| `edad` | - | Campo calculado, no se envía | Eliminado del DTO |
| `estadoApadrinamiento` | - | Solo frontend | Eliminado del DTO |
| `suenos`, `situacionFamiliar` | - | No existen en backend | Eliminados del DTO |

### Código Antes
```typescript
const addChild = async (childData: Omit<Child, 'id' | 'fechaCreacion'>): Promise<Child> => {
  const dto = childData as any; // ❌ Casting directo sin mapeo
  const response = await apadrinamientoService.createChild(dto, 0);
}
```

### Código Después
```typescript
const addChild = async (childData: Omit<Child, 'id' | 'fechaCreacion'>): Promise<Child> => {
  // ✅ Mapeo explícito
  const dto = {
    firstName: childData.nombre,
    lastName: childData.apellidos,
    dateOfBirth: childData.fechaNacimiento,
    gender: childData.genero === 'masculino' ? 'MALE' as const : 'FEMALE' as const,
    municipality: childData.municipio,
    shortDescription: childData.historia || '',
    fullStory: childData.historia || '',
    address: childData.direccion || undefined,
    photo: childData.foto || undefined,
    needs: childData.necesidades || [],
    institution: childData.institucion || undefined,
    grade: childData.grado || undefined,
    schedule: childData.jornada || undefined,
  };
  const response = await apadrinamientoService.createChild(dto, 0);
}
```

### Archivos Modificados
- ✅ `/src/contexts/BitacoraContext.tsx`
  - Método `addChild` - Agregado mapper explícito
  - Método `updateChild` - Agregado mapper campo por campo
  - Método `deleteChild` - Simplificado (eliminado check innecesario)

---

## 2. ✅ PROJECTS - CORREGIDO E INTEGRADO CON BACKEND

### Problema
El contexto **NO estaba integrado con el backend**. Todos los métodos (`addProject`, `updateProject`, `deleteProject`) solo guardaban en localStorage sin llamar a ningún servicio.

### Discrepancias Corregidas

| Campo Frontend | Campo Backend | Problema | Solución |
|----------------|---------------|----------|----------|
| `title` | `name` | Nombre diferente | Mapeado correctamente |
| `shortDescription` + `fullDescription` | `description` | 2 campos → 1 campo | Concatenados con `\n\n` |
| - | `type` | **FALTABA** (requerido) | Inferido de `tags` |
| `status: 'borrador'\|'activo'...` | `status: 'DRAFT'\|'ACTIVE'...` | Valores diferentes | Convertido con mapa |
| `location: string[]` | `location: string` | Array → String | `.join(', ')` |
| `mainGoal` + `specificObjectives[]` | `objectives: string[]` | 2 campos → 1 array | Combinados en un array |
| 30+ campos extras | `metadata: Record<string, any>` | Campos no reconocidos | Guardados en metadata |

### Funciones Agregadas

#### 1. Mapper Frontend → Backend
```typescript
const mapProjectToCreateDTO = (project: Omit<Project, 'id' | ...>): CreateProjectDTO => {
  // Inferir tipo de proyecto de los tags
  let projectType: ProjectType = ProjectType.OTHER;
  if (project.tags.includes('educación')) projectType = ProjectType.EDUCATION;
  else if (project.tags.includes('salud')) projectType = ProjectType.HEALTH;
  // ...

  // Mapear status español → inglés
  const statusMap: Record<ProjectStatus, BackendProjectStatus> = {
    'borrador': 'DRAFT',
    'activo': 'ACTIVE',
    'finalizado': 'COMPLETED',
    'archivado': 'ARCHIVED'
  };

  return {
    name: project.title,
    description: `${project.shortDescription}\n\n${project.fullDescription}`,
    type: projectType,
    status: statusMap[project.status],
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget,
    location: project.location.join(', '),
    objectives: [project.mainGoal, ...project.specificObjectives],
    metadata: {
      // Todos los campos extra del frontend
      isPublished: project.isPublished,
      mainImage: project.mainImage,
      gallery: project.gallery,
      // ... +20 campos más
    }
  };
};
```

#### 2. Mapper Backend → Frontend
```typescript
const mapProjectResponseToProject = (response: any): Project => {
  const metadata = response.metadata || {};
  
  const statusMap: Record<string, ProjectStatus> = {
    'DRAFT': 'borrador',
    'ACTIVE': 'activo',
    'COMPLETED': 'finalizado',
    'ARCHIVED': 'archivado'
  };

  return {
    id: response.id.toString(),
    title: response.name,
    shortDescription: response.description.split('\n\n')[0],
    fullDescription: response.description.split('\n\n')[1] || response.description,
    mainGoal: response.objectives?.[0] || '',
    specificObjectives: response.objectives?.slice(1) || [],
    status: statusMap[response.status] || 'borrador',
    location: response.location ? response.location.split(', ') : [],
    // Recuperar campos de metadata
    isPublished: metadata.isPublished || false,
    mainImage: metadata.mainImage || '',
    // ... +20 campos más
  };
};
```

### Métodos Actualizados

#### `addProject` - Antes (❌ Solo localStorage)
```typescript
const addProject = (projectData) => {
  const newProject: Project = {
    ...projectData,
    id: Date.now().toString(),
    slug: createSlug(projectData.title),
    createdAt: new Date().toISOString(),
  };
  setProjects([...projects, newProject]);
};
```

#### `addProject` - Después (✅ Integrado con backend)
```typescript
const addProject = async (projectData) => {
  try {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const dto = mapProjectToCreateDTO(projectData);
    const response = await projectsService.createProject(dto, parseInt(user.id, 10));

    if (!response.success) throw new Error(response.error?.message);

    const newProject = mapProjectResponseToProject(response.data);
    setProjects(prev => [...prev, newProject]);

    toast.success('Proyecto creado exitosamente');
  } catch (error) {
    toast.error(error.message);
    // Fallback: guardar solo localmente
    const newProject = { ...projectData, id: Date.now().toString(), ... };
    setProjects(prev => [...prev, newProject]);
  }
};
```

### Archivos Modificados
- ✅ `/src/contexts/ProjectsContext.tsx`
  - **Agregado**: Importaciones de servicios y tipos
  - **Agregado**: Función `mapProjectToCreateDTO()`
  - **Agregado**: Función `mapProjectResponseToProject()`
  - **Modificado**: `addProject()` - Ahora async, llama al backend
  - **Modificado**: `updateProject()` - Ahora async, llama al backend
  - **Modificado**: `deleteProject()` - Ahora async, llama al backend
  - **Modificado**: Interface `ProjectsContextType` - Métodos ahora retornan `Promise<void>`

---

## 3. ✅ SPONSORSHIPS - SIN CAMBIOS (Ya Correcto)

Este módulo ya estaba correctamente integrado y sirve como **referencia** de buenas prácticas:

```typescript
const sponsorChild = async (childId: string) => {
  const response = await apadrinamientoService.createSponsorship({
    childId: parseInt(childId, 10),  // ✅ Conversión correcta
    sponsorId: userId,
    startDate: new Date().toISOString(),  // ✅ Formato correcto
  });
  // ✅ Manejo de errores
  // ✅ Actualización de estado local
  // ✅ Feedback al usuario
};
```

---

## 4. ⏳ DONATIONS - PENDIENTE

### Discrepancias Identificadas (NO Corregidas Aún)
- `donorIdType/donorIdNumber` → `donorDocumentType/donorDocument`
- `donorId: string` → `donorUserId: number`
- `destination: string` → `projectId: number` + `projectName: string`
- 20+ campos extras que no existen en backend
- **NO integrado con backend**: Solo guarda en memoria

### Acción Requerida
- Crear mappers bidireccionales
- Integrar `createDonation()` con `donationsService.createMonetaryDonation()`
- Actualizar tipos

---

## 5. ⏳ NEWS - PENDIENTE

### Discrepancias Identificadas (NO Corregidas Aún)
- `status: 'borrador'` → `status: 'draft'`
- `visibility: 'publico'` → `visibility: 'public'`
- 15 campos extras
- **TIENE mappers** en el servicio pero **NO se usan** en el contexto

### Acción Requerida
- Ya tiene `NewsService` con métodos `mapToCreateDTO()` y `mapToResponseDTO()`
- Solo falta integrar `addArticle()` del contexto con `newsService.createArticle()`

---

## 6. ⏳ VOLUNTEERING - PENDIENTE

### Discrepancias Identificadas (NO Corregidas Aún)
- `nombreCompleto` → `fullName`
- `telefono` → `phone`
- `areasInteres` → `areas`
- `diasDisponibles` + `horariosDisponibles` → `availability: string[]`
- **FALTA** `hasWorkPermit`, `acceptedTerms`, `privacyConsent`
- 20+ campos extras
- **TIENE mappers** pero NO se usan

### Acción Requerida
- Crear mappers completos
- Integrar con `volunteeringService.createApplication()`

---

## Cómo Probar los Cambios

### 1. Children (Bitácora)
```bash
# 1. Login como admin
# 2. Ir a "Bitácora" → "Gestión de Niños" → "Registrar Niño"
# 3. Llenar formulario y enviar
# 4. Verificar en consola del navegador:
[BitacoraContext] addChild - DTO mapeado para API: { firstName: "...", gender: "MALE", ... }
[ApiClient] Request: { method: 'POST', url: '.../api/children', hasAuthHeader: true }
# 5. Verificar en Network Tab que el request tenga Authorization header
```

### 2. Projects
```bash
# 1. Login como admin
# 2. Ir a "Proyectos" → "Crear Proyecto"
# 3. Llenar formulario y enviar
# 4. Verificar en consola:
[ProjectsContext] addProject - DTO mapeado: { name: "...", type: "EDUCATION", ... }
[ProjectsService] createProject - Response: { id: 1, name: "...", ... }
# 5. Verificar que el proyecto se guardó en el backend (no solo localStorage)
```

---

## Cambios en Types

### `ProjectsContext.tsx`
```typescript
// ANTES
interface ProjectsContextType {
  addProject: (...) => void;
  updateProject: (...) => void;
  deleteProject: (...) => void;
}

// DESPUÉS
interface ProjectsContextType {
  addProject: (...) => Promise<void>;  // ✅ Ahora async
  updateProject: (...) => Promise<void>;  // ✅ Ahora async
  deleteProject: (...) => Promise<void>;  // ✅ Ahora async
}
```

---

## Próximos Pasos

### Prioridad ALTA 🔴
1. **Donations**: Crear mappers e integrar con `donationsService`
2. **Volunteering**: Crear mappers e integrar con `volunteeringService`

### Prioridad MEDIA 🟡
3. **News**: Usar mappers existentes e integrar con `newsService`

### Optimizaciones Futuras 🔵
4. Eliminar `localStorage` para datos de negocio (projects, volunteers, donations)
5. Implementar refresh automático de datos desde backend
6. Agregar caché optimista para mejor UX
7. Implementar paginación en listas grandes

---

## Archivos Modificados

```
✅ src/contexts/BitacoraContext.tsx (3 métodos corregidos)
✅ src/contexts/ProjectsContext.tsx (3 métodos integrados + 2 mappers agregados)
✅ src/lib/api-client.ts (logs de debugging)
✅ BACKEND_INTEGRATION_FIXES.md (documentación anterior)
✅ Este archivo (FRONTEND_BACKEND_ALIGNMENT.md)
```

---

## Resumen de Impacto

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Módulos integrados** | 1/6 (17%) | 3/6 (50%) |
| **Datos persistentes** | Solo localStorage | Backend + fallback localStorage |
| **Mapeo de datos** | Casting `as any` | Mappers explícitos type-safe |
| **Manejo de errores** | Silencioso | Logs + toast + fallback |
| **Type safety** | ❌ Casting peligroso | ✅ Types estrictos |
| **Debugging** | Difícil rastrear errores | Logs comprehensivos |

