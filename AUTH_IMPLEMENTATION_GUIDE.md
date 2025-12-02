# Guía de Implementación de Auth Endpoints

Esta guía detalla la implementación completa de todos los endpoints de autenticación en el frontend de Huahuacuna.

## 📋 Tabla de Contenidos

1. [Resumen de Endpoints](#resumen-de-endpoints)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tipos TypeScript](#tipos-typescript)
4. [Servicio de Autenticación](#servicio-de-autenticación)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 Resumen de Endpoints

### Endpoints Públicos (Sin Autenticación)

| Método | Endpoint | Descripción | Errores Comunes |
|--------|----------|-------------|-----------------|
| `POST` | `/auth/register` | Registro de padrinos | 409, 503 |
| `POST` | `/auth/login` | Inicio de sesión | 401, 403, 503 |
| `POST` | `/auth/verify-email` | Verificar email | 400 |
| `POST` | `/auth/password/request-reset` | Solicitar reset | - |
| `POST` | `/auth/password/reset` | Restablecer contraseña | 400 |
| `POST` | `/auth/refresh` | Refrescar token | 401 |
| `GET` | `/auth/test` | Test del servicio | - |

### Endpoints Protegidos (Requieren Autenticación)

| Método | Endpoint | Descripción | Rol Requerido | Errores |
|--------|----------|-------------|---------------|---------|
| `POST` | `/auth/logout` | Cerrar sesión | Cualquiera | - |
| `GET` | `/auth/profile` | Obtener perfil | Cualquiera | - |
| `PATCH` | `/auth/profile` | Actualizar perfil | PADRINO | 403, 404 |

### Endpoints de Administración (Solo SUPER_ADMIN)

| Método | Endpoint | Descripción | Errores |
|--------|----------|-------------|---------|
| `POST` | `/auth/admins` | Crear admin | 403, 409 |
| `PATCH` | `/auth/admins/:adminId` | Actualizar admin | 403, 404 |
| `GET` | `/auth/admins` | Listar admins | 403 |

---

## 📁 Estructura de Archivos

```
src/
├── types/
│   └── api.types.ts                 # Tipos actualizados con todos los DTOs
├── services/
│   ├── auth.service.ts              # Servicio original (legacy)
│   └── auth.service.v2.ts           # Servicio nuevo completo ✨
├── hooks/
│   ├── useAuth.ts                   # Hook original (legacy)
│   ├── useAuthV2.ts                 # Hook nuevo completo ✨
│   ├── useAdminAuth.ts              # Hook para administración ✨
│   └── index.ts                     # Exportaciones centralizadas
└── services/
    └── index.ts                     # Exportaciones centralizadas
```

---

## 🔷 Tipos TypeScript

### DTOs de Request/Response

Todos los tipos están definidos en `src/types/api.types.ts`:

```typescript
// Registro
interface RegisterDTO {
  name: string;        // min 3, max 100
  email: string;       // email válido
  password: string;    // min 8, mayúscula+minúscula+número
  phone: string;       // min 7, max 20
  documentId: string;  // min 5, max 20
  address: string;     // min 5, max 200
}

interface RegisterResponse {
  message: string;
  userId: number;
}

// Login
interface LoginDTO {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

// Usuario
interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: 'PADRINO' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  avatar?: string;
  emailVerified: boolean;
  phone?: string;
  documentId?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}
```

---

## 🔧 Servicio de Autenticación

### AuthServiceV2 - Servicio Completo

Ubicación: `src/services/auth.service.v2.ts`

#### Características:
- ✅ Manejo automático de tokens
- ✅ Manejo consistente de errores
- ✅ Type-safe con TypeScript
- ✅ Singleton pattern
- ✅ Métodos helpers

#### Uso Básico:

```typescript
import { authServiceV2 } from '@/services/auth.service.v2';

// Ejemplo: Login
const result = await authServiceV2.login({
  email: 'usuario@ejemplo.com',
  password: 'Password123'
});

if (result.success && result.data) {
  console.log('Usuario:', result.data.user);
  console.log('Token:', result.data.accessToken);
  // Los tokens se guardan automáticamente en localStorage
} else {
  console.error('Error:', result.error?.message);
}
```

#### Métodos Disponibles:

```typescript
class AuthServiceV2 {
  // Públicos
  register(dto: RegisterDTO): Promise<ApiResponse<RegisterResponse>>
  login(dto: LoginDTO): Promise<ApiResponse<LoginResponse>>
  verifyEmail(dto: VerifyEmailDTO): Promise<ApiResponse<VerifyEmailResponse>>
  requestPasswordReset(dto: RequestPasswordResetDTO): Promise<ApiResponse<...>>
  resetPassword(dto: ResetPasswordDTO): Promise<ApiResponse<...>>
  refreshToken(dto: RefreshTokenDTO): Promise<ApiResponse<...>>
  testAuth(): Promise<ApiResponse<AuthTestResponse>>

  // Protegidos
  logout(dto: LogoutDTO): Promise<ApiResponse<LogoutResponse>>
  getProfile(): Promise<ApiResponse<UserResponse>>
  updateProfile(dto: UpdateProfileDTO): Promise<ApiResponse<UserResponse>>

  // Admin
  createAdmin(dto: CreateAdminDTO): Promise<ApiResponse<UserResponse>>
  updateAdmin(adminId: number, dto: UpdateAdminDTO): Promise<ApiResponse<...>>
  getAdmins(): Promise<ApiResponse<AdminListItemResponse[]>>

  // Helpers
  isAuthenticated(): boolean
  getTokens(): { accessToken: string | null; refreshToken: string | null }
  clearTokens(): void
}
```

---

## 🪝 Hooks Personalizados

### useAuthV2 - Hook Principal

Ubicación: `src/hooks/useAuthV2.ts`

#### Características:
- ✅ Estados de carga automáticos
- ✅ Manejo de errores centralizado
- ✅ Type-safe
- ✅ Optimizado con useCallback

#### Uso:

```typescript
import { useAuthV2 } from '@/hooks';

function LoginComponent() {
  const { login, loading, error, clearError } = useAuthV2();

  const handleLogin = async () => {
    const result = await login({
      email: 'usuario@ejemplo.com',
      password: 'Password123'
    });

    if (result) {
      // Login exitoso
      console.log('Bienvenido:', result.user.name);
      console.log('Token:', result.accessToken);
    } else {
      // Ver error en el estado
      console.error('Error:', error?.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
      {error && <p>{error.message}</p>}
    </div>
  );
}
```

#### API del Hook:

```typescript
interface UseAuthV2Return {
  // Estado
  loading: boolean;
  error: ApiError | null;

  // Métodos públicos
  register: (dto: RegisterDTO) => Promise<RegisterResponse | null>;
  login: (dto: LoginDTO) => Promise<LoginResponse | null>;
  verifyEmail: (dto: VerifyEmailDTO) => Promise<VerifyEmailResponse | null>;
  requestPasswordReset: (dto: RequestPasswordResetDTO) => Promise<...>;
  resetPassword: (dto: ResetPasswordDTO) => Promise<...>;
  refreshToken: (dto: RefreshTokenDTO) => Promise<...>;
  testAuth: () => Promise<boolean>;

  // Métodos protegidos
  logout: (dto: LogoutDTO) => Promise<boolean>;
  getProfile: () => Promise<UserResponse | null>;
  updateProfile: (dto: UpdateProfileDTO) => Promise<UserResponse | null>;

  // Utilidades
  clearError: () => void;
  isAuthenticated: () => boolean;
}
```

### useAdminAuth - Hook de Administración

Ubicación: `src/hooks/useAdminAuth.ts`

Para operaciones exclusivas de SUPER_ADMIN.

#### Uso:

```typescript
import { useAdminAuth } from '@/hooks';

function AdminManagement() {
  const { 
    createAdmin, 
    updateAdmin, 
    getAdmins, 
    admins, 
    loading, 
    error 
  } = useAdminAuth();

  useEffect(() => {
    getAdmins(); // Cargar lista al montar
  }, [getAdmins]);

  const handleCreateAdmin = async () => {
    const newAdmin = await createAdmin({
      name: 'Nuevo Admin',
      email: 'admin@org.com',
      password: 'SecurePass123',
      role: 'ADMIN'
    });

    if (newAdmin) {
      console.log('Admin creado:', newAdmin);
      refreshAdmins(); // Actualizar lista
    }
  };

  return (
    <div>
      <button onClick={handleCreateAdmin}>Crear Admin</button>
      {admins.map(admin => (
        <div key={admin.id}>{admin.name}</div>
      ))}
    </div>
  );
}
```

---

## 💡 Ejemplos de Uso

### 1. Registro de Usuario

```typescript
import { useAuthV2 } from '@/hooks';

function RegisterPage() {
  const { register, loading, error } = useAuthV2();

  const handleSubmit = async (formData) => {
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      documentId: formData.documentId,
      address: formData.address,
    });

    if (result) {
      alert(`Usuario registrado: ${result.message}`);
      // Redirigir a verificación de email
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}
```

### 2. Login con Manejo de Errores

```typescript
function LoginPage() {
  const { login, loading, error } = useAuthV2();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });

    if (result) {
      // Guardar usuario en contexto/estado global si es necesario
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirigir según rol
      if (result.user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (result.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/padrino/dashboard');
      }
    } else {
      // El error ya está en el estado
      if (error?.statusCode === 401) {
        alert('Credenciales incorrectas');
      } else if (error?.statusCode === 403) {
        alert('Cuenta bloqueada o inactiva');
      }
    }
  };

  return (
    <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
  );
}
```

### 3. Verificación de Email

```typescript
function VerifyEmailPage() {
  const { verifyEmail } = useAuthV2();
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      handleVerify(token as string);
    }
  }, [token]);

  const handleVerify = async (token: string) => {
    const result = await verifyEmail({ token });

    if (result) {
      alert(result.message);
      router.push('/login');
    }
  };

  return <div>Verificando email...</div>;
}
```

### 4. Recuperación de Contraseña

```typescript
function PasswordRecoveryPage() {
  const { requestPasswordReset, loading } = useAuthV2();

  const handleRequest = async (email: string) => {
    const result = await requestPasswordReset({ email });

    if (result) {
      // Siempre muestra el mismo mensaje por seguridad
      alert(result.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleRequest(email);
    }}>
      <input type="email" placeholder="Tu email" />
      <button type="submit" disabled={loading}>
        Solicitar Recuperación
      </button>
    </form>
  );
}
```

### 5. Actualizar Perfil de Usuario

```typescript
function ProfilePage() {
  const { updateProfile, getProfile, loading } = useAuthV2();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getProfile();
    if (profile) setUser(profile);
  };

  const handleUpdate = async (data: UpdateProfileDTO) => {
    const updated = await updateProfile(data);

    if (updated) {
      setUser(updated);
      alert('Perfil actualizado exitosamente');
    }
  };

  return (
    <div>
      <h1>Mi Perfil</h1>
      {user && (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdate({
            phone: newPhone,
            address: newAddress,
            avatar: newAvatar,
          });
        }}>
          {/* Campos editables */}
        </form>
      )}
    </div>
  );
}
```

### 6. Gestión de Administradores

```typescript
function AdminManagementPage() {
  const { 
    admins, 
    getAdmins, 
    createAdmin, 
    updateAdmin, 
    loading 
  } = useAdminAuth();

  useEffect(() => {
    getAdmins();
  }, []);

  const handleCreate = async () => {
    const newAdmin = await createAdmin({
      name: 'Juan Admin',
      email: 'juan@org.com',
      password: 'SecurePass123',
      role: 'ADMIN',
    });

    if (newAdmin) {
      getAdmins(); // Refrescar lista
    }
  };

  const handleSuspend = async (adminId: number) => {
    const updated = await updateAdmin(adminId, {
      status: 'SUSPENDED',
    });

    if (updated) {
      getAdmins(); // Refrescar lista
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Crear Admin</button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin.id}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.role}</td>
              <td>{admin.status}</td>
              <td>
                <button onClick={() => handleSuspend(admin.id)}>
                  Suspender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 7. Refrescar Token Automáticamente

```typescript
import { useEffect } from 'react';
import { useAuthV2 } from '@/hooks';

function TokenRefreshManager() {
  const { refreshToken, isAuthenticated } = useAuthV2();

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Refrescar token cada 14 minutos (antes de que expire a los 15)
    const interval = setInterval(async () => {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (refreshTokenValue) {
        const result = await refreshToken({ 
          refreshToken: refreshTokenValue 
        });

        if (!result) {
          // Token refresh falló, cerrar sesión
          window.location.href = '/login';
        }
      }
    }, 14 * 60 * 1000); // 14 minutos

    return () => clearInterval(interval);
  }, [refreshToken, isAuthenticated]);

  return null;
}
```

### 8. Logout Completo

```typescript
function LogoutButton() {
  const { logout } = useAuthV2();
  const router = useRouter();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      await logout({ refreshToken });
    }

    // Los tokens ya se limpiaron automáticamente
    router.push('/login');
  };

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Error Comunes

```typescript
interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}
```

### Por Endpoint:

#### POST /auth/register
- **409 Conflict**: Email o documento ya registrado
- **503 Service Unavailable**: Servicio de auth no disponible

#### POST /auth/login
- **401 Unauthorized**: Credenciales inválidas
- **403 Forbidden**: Cuenta bloqueada/inactiva/no verificada
- **503 Service Unavailable**: Microservicio no responde

#### POST /auth/verify-email
- **400 Bad Request**: Token inválido o expirado

#### POST /auth/password/reset
- **400 Bad Request**: Token inválido o expirado

#### POST /auth/refresh
- **401 Unauthorized**: Refresh token inválido o revocado

#### PATCH /auth/profile
- **403 Forbidden**: Usuario no es PADRINO
- **404 Not Found**: Usuario no encontrado

#### POST /auth/admins
- **403 Forbidden**: Solo super-admins
- **409 Conflict**: Email ya registrado

#### PATCH /auth/admins/:adminId
- **403 Forbidden**: Solo super-admins o intentar actualizarse a sí mismo
- **404 Not Found**: Administrador no encontrado

#### GET /auth/admins
- **403 Forbidden**: Solo super-admins

### Manejo en Componentes:

```typescript
const { login, error, clearError } = useAuthV2();

// Mostrar error
{error && (
  <Alert severity="error" onClose={clearError}>
    {error.message}
    {error.statusCode && ` (Código: ${error.statusCode})`}
  </Alert>
)}

// Manejo específico por código
if (error?.statusCode === 409) {
  // Email ya registrado
} else if (error?.statusCode === 401) {
  // Credenciales inválidas
} else if (error?.statusCode === 403) {
  // Sin permisos
}
```

---

## 🎨 Integración con Contexto de Auth

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthV2 } from '@/hooks';
import { UserResponse } from '@/types/api.types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const { 
    login: authLogin, 
    logout: authLogout, 
    getProfile 
  } = useAuthV2();

  useEffect(() => {
    // Cargar perfil al montar si hay token
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getProfile();
    if (profile) setUser(profile);
  };

  const login = async (email: string, password: string) => {
    const result = await authLogin({ email, password });
    
    if (result) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await authLogout({ refreshToken });
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      refreshProfile: loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 🚀 Migración desde el Servicio Anterior

Si estás usando el servicio antiguo (`auth.service.ts`), migrar es simple:

### Antes:
```typescript
import { authService } from '@/services/auth.service';

const result = await authService.login(loginDto);
```

### Después:
```typescript
import { authServiceV2 } from '@/services/auth.service.v2';

const result = await authServiceV2.login(loginDto);
```

O mejor aún, usa el hook:
```typescript
import { useAuthV2 } from '@/hooks';

const { login } = useAuthV2();
const result = await login(loginDto);
```

---

## ✅ Checklist de Implementación

- [x] Tipos TypeScript actualizados
- [x] Servicio AuthServiceV2 completo
- [x] Hook useAuthV2 implementado
- [x] Hook useAdminAuth para administración
- [x] Exportaciones centralizadas
- [x] Documentación completa

### Próximos Pasos Sugeridos:

- [ ] Integrar con componentes de UI existentes
- [ ] Actualizar AuthContext para usar nuevos hooks
- [ ] Implementar token refresh automático
- [ ] Agregar tests unitarios
- [ ] Implementar manejo de rate limiting
- [ ] Agregar logs y analytics

---

## 📚 Referencias

- **Tipos**: `src/types/api.types.ts`
- **Servicio**: `src/services/auth.service.v2.ts`
- **Hooks**: `src/hooks/useAuthV2.ts`, `src/hooks/useAdminAuth.ts`
- **Backend API**: Ver documentación de endpoints del backend

---

**Fecha de creación**: 1 de Diciembre de 2025  
**Versión**: 2.0  
**Autor**: Sistema de Autenticación Huahuacuna
