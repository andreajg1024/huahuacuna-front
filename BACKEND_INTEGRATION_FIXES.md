# Correcciones de Integración con Backend

## Fecha: 2 de Diciembre 2025

## Problema Reportado
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
[BitacoraContext] addChild - Error: Authorization header is missing.
```

## Cambios Realizados

### 1. ✅ Eliminación de Hooks *DB.ts
Se eliminaron los hooks experimentales que no se estaban usando:
- `useProjectsDB.ts`
- `useChildrenDB.ts`
- `useSponsorshipsDB.ts`
- `useDonationsDB.ts`
- `useNewsDB.ts`
- `useEventsDB.ts`

**Razón**: Estos hooks duplicaban funcionalidad y causaban confusión. La lógica de persistencia debe manejarse a través de los Contexts existentes.

---

### 2. 🔧 Corrección de Token en `api-client.ts`

#### Problema
El `apiClient` buscaba el token en `localStorage.getItem('token')` pero el `authService` lo guarda como `'auth_token'`.

#### Solución
```typescript
// ANTES
private getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// DESPUÉS
private getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Intentar obtener el token de diferentes keys por compatibilidad
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('accessToken') || 
                localStorage.getItem('token');
  console.log('[ApiClient] getAuthToken - Token encontrado:', 
              token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  return token;
}
```

---

### 3. 📊 Logs de Debugging Mejorados

Se agregaron logs comprehensivos en `api-client.ts` para detectar problemas de autenticación:

```typescript
private buildHeaders(requiresAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[ApiClient] buildHeaders - Authorization header agregado');
    } else {
      console.warn('[ApiClient] buildHeaders - NO SE ENCONTRÓ TOKEN');
    }
  }

  return headers;
}
```

```typescript
private async request<T>(endpoint: string, config: RequestConfig = {}) {
  // ... código ...
  
  console.log('[ApiClient] Request:', {
    method: fetchConfig.method || 'GET',
    url,
    hasAuthHeader: !!headers['Authorization'],
    headers
  });
  
  // ... código ...
}
```

---

## Flujo de Autenticación Correcto

### 1. Login
```typescript
authService.login({ email, password })
  ↓
Guarda en localStorage:
  - 'auth_token': accessToken ✅
  - 'refresh_token': refreshToken ✅
  - 'auth_user': JSON.stringify(user) ✅
```

### 2. Creación de Niño
```typescript
ChildFormPage.handleSubmit()
  ↓
BitacoraContext.addChild(childData)
  ↓
apadrinamientoService.createChild(dto, 0)
  ↓
apiClient.post('/api/children', dto)
  ↓
getAuthToken() → 'auth_token' ✅
  ↓
buildHeaders() → Authorization: Bearer <token> ✅
  ↓
fetch() con headers correctos ✅
```

---

## Validación de Parámetros Backend vs Frontend

### CreateChildDTO (Backend esperado)
```typescript
interface CreateChildDTO {
  firstName: string;           // ✅ REQUERIDO
  lastName: string;            // ✅ REQUERIDO
  dateOfBirth: string;         // ✅ REQUERIDO (ISO format)
  gender: 'MALE' | 'FEMALE';   // ✅ REQUERIDO
  municipality: string;         // ✅ REQUERIDO
  shortDescription: string;     // ✅ REQUERIDO
  fullStory: string;           // ✅ REQUERIDO
  ethnicity?: string;          // ⚪ OPCIONAL
  specialCondition?: string;   // ⚪ OPCIONAL
  address?: string;            // ⚪ OPCIONAL
  photo?: string;              // ⚪ OPCIONAL (URL)
  photos?: string[];           // ⚪ OPCIONAL (URLs)
  needs?: string[];            // ⚪ OPCIONAL
  institution?: string;        // ⚪ OPCIONAL
  grade?: string;              // ⚪ OPCIONAL
  schedule?: string;           // ⚪ OPCIONAL
}
```

### ChildFormPage (Frontend envía)
```typescript
const childData = {
  firstName: formData.firstName.trim(),          // ✅
  lastName: formData.lastName.trim(),            // ✅
  dateOfBirth: formData.dateOfBirth,             // ✅
  gender: formData.gender,                       // ✅
  municipality: formData.municipality,           // ✅
  shortDescription: formData.shortDescription.trim(), // ✅
  fullStory: formData.fullStory.trim(),          // ✅
  ethnicity: formData.ethnicity?.trim() || undefined,
  specialCondition: formData.specialCondition?.trim() || undefined,
  address: formData.address?.trim() || undefined,
  photo: formData.photo || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
  photos: [],
  needs: formData.needs.length > 0 ? formData.needs : undefined,
};
```

**✅ Los parámetros coinciden perfectamente**

---

## Testing

### 1. Verificar que el token se guarde correctamente
```javascript
// En Chrome DevTools Console después de login:
localStorage.getItem('auth_token')
// Debe retornar: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Verificar headers en Network Tab
```
Request URL: http://localhost:4000/api/children
Request Method: POST
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

### 3. Verificar logs en consola
```
[ApiClient] getAuthToken - Token encontrado: eyJhbGciOiJIUzI1NiIs...
[ApiClient] buildHeaders - Authorization header agregado
[ApiClient] Request: { method: 'POST', url: 'http://localhost:4000/api/children', hasAuthHeader: true }
```

---

## Posibles Problemas Restantes

### Si aún sale 401:
1. **Token expirado**: Verificar que el token no haya expirado
   ```javascript
   // Decodificar token JWT (en DevTools)
   const token = localStorage.getItem('auth_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expira:', new Date(payload.exp * 1000));
   ```

2. **Backend no acepta el token**: Verificar en logs del backend que el token sea válido

3. **CORS**: Verificar que el backend acepte el header Authorization
   ```javascript
   // Backend debe tener:
   app.use(cors({
     credentials: true,
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

4. **Ruta incorrecta**: Verificar que `/api/children` sea la ruta correcta en el backend

---

## Próximos Pasos

1. ✅ Probar creación de niño con estos cambios
2. ⏳ Si persiste 401, verificar logs del backend
3. ⏳ Validar que todos los demás módulos usen el mismo patrón
4. ⏳ Implementar refresh token automático si el token expira

---

## Archivos Modificados

- ✅ `/src/lib/api-client.ts` - Corregido getAuthToken() y agregados logs
- ✅ Eliminados hooks `*DB.ts` (6 archivos)

## Archivos Sin Cambios (Ya Correctos)

- ✅ `/src/services/apadrinamiento.service.ts` - Usa apiClient.post correctamente
- ✅ `/src/contexts/BitacoraContext.tsx` - Llama al servicio correctamente  
- ✅ `/src/components/bitacora/ChildFormPage.tsx` - Envía parámetros correctos
- ✅ `/src/services/auth.service.ts` - Guarda token como 'auth_token'
- ✅ `/src/contexts/AuthContext.tsx` - Maneja autenticación correctamente
