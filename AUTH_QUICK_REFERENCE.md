# 🚀 Auth Endpoints - Referencia Rápida

## Importaciones

```typescript
// Servicio
import { authServiceV2 } from '@/services/auth.service.v2';

// Hooks
import { useAuthV2, useAdminAuth } from '@/hooks';

// Tipos
import { 
  RegisterDTO, 
  LoginDTO, 
  UserResponse, 
  LoginResponse 
} from '@/types/api.types';
```

---

## 📍 Endpoints y Uso

### 1. POST /auth/register
**Registro de nuevos padrinos**

```typescript
// Con Hook
const { register, loading, error } = useAuthV2();
const result = await register({
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  password: 'Password123',
  phone: '987654321',
  documentId: '12345678',
  address: 'Av. Principal 123'
});

// Con Servicio Directo
const response = await authServiceV2.register(registerDto);
if (response.success) {
  console.log(response.data.message, response.data.userId);
}
```

**Errores**: 409 (ya registrado), 503 (servicio no disponible)

---

### 2. POST /auth/login
**Inicio de sesión**

```typescript
// Con Hook
const { login, loading, error } = useAuthV2();
const result = await login({
  email: 'juan@ejemplo.com',
  password: 'Password123'
});

if (result) {
  console.log('Usuario:', result.user);
  console.log('Token:', result.accessToken);
  // Tokens guardados automáticamente
}

// Con Servicio Directo
const response = await authServiceV2.login(loginDto);
```

**Errores**: 401 (credenciales inválidas), 403 (cuenta bloqueada), 503

---

### 3. POST /auth/verify-email
**Verificar email con token**

```typescript
// Con Hook
const { verifyEmail } = useAuthV2();
const result = await verifyEmail({ token: 'abc123...' });

if (result) {
  alert(result.message);
}

// Con Servicio Directo
const response = await authServiceV2.verifyEmail({ token });
```

**Errores**: 400 (token inválido o expirado)

---

### 4. POST /auth/password/request-reset
**Solicitar restablecimiento de contraseña**

```typescript
// Con Hook
const { requestPasswordReset } = useAuthV2();
const result = await requestPasswordReset({ 
  email: 'juan@ejemplo.com' 
});

// Siempre retorna el mismo mensaje por seguridad
if (result) {
  alert(result.message);
}
```

---

### 5. POST /auth/password/reset
**Restablecer contraseña**

```typescript
// Con Hook
const { resetPassword } = useAuthV2();
const result = await resetPassword({
  token: 'reset-token-123',
  newPassword: 'NewPassword123'
});

if (result) {
  alert('Contraseña restablecida');
  router.push('/login');
}
```

**Errores**: 400 (token inválido o expirado)

---

### 6. POST /auth/refresh
**Refrescar access token**

```typescript
// Con Hook
const { refreshToken } = useAuthV2();
const refreshTokenValue = localStorage.getItem('refresh_token');

const result = await refreshToken({ 
  refreshToken: refreshTokenValue 
});

if (result) {
  console.log('Nuevo token:', result.accessToken);
  // Se guarda automáticamente
}
```

**Errores**: 401 (refresh token inválido)

---

### 7. POST /auth/logout
**Cerrar sesión** (Requiere Auth)

```typescript
// Con Hook
const { logout } = useAuthV2();
const refreshToken = localStorage.getItem('refresh_token');

const success = await logout({ refreshToken });
// Tokens limpios automáticamente

if (success) {
  router.push('/login');
}
```

---

### 8. GET /auth/profile
**Obtener perfil** (Requiere Auth)

```typescript
// Con Hook
const { getProfile } = useAuthV2();
const user = await getProfile();

if (user) {
  console.log('Mi perfil:', user);
}

// En un componente
function ProfilePage() {
  const { getProfile } = useAuthV2();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile().then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

---

### 9. PATCH /auth/profile
**Actualizar perfil** (Requiere Auth + PADRINO)

```typescript
// Con Hook
const { updateProfile } = useAuthV2();
const updated = await updateProfile({
  phone: '999888777',
  address: 'Nueva dirección 456',
  avatar: 'https://ejemplo.com/avatar.jpg'
});

if (updated) {
  console.log('Perfil actualizado:', updated);
}
```

**Errores**: 403 (no es PADRINO), 404 (usuario no encontrado)

---

### 10. POST /auth/admins
**Crear administrador** (Requiere SUPER_ADMIN)

```typescript
// Con Hook
const { createAdmin } = useAdminAuth();
const newAdmin = await createAdmin({
  name: 'Admin User',
  email: 'admin@org.com',
  password: 'SecurePass123',
  role: 'ADMIN' // o 'SUPER_ADMIN'
});

if (newAdmin) {
  console.log('Admin creado:', newAdmin);
}
```

**Errores**: 403 (no es SUPER_ADMIN), 409 (email ya existe)

---

### 11. PATCH /auth/admins/:adminId
**Actualizar administrador** (Requiere SUPER_ADMIN)

```typescript
// Con Hook
const { updateAdmin } = useAdminAuth();
const updated = await updateAdmin(adminId, {
  name: 'Nuevo nombre',
  status: 'SUSPENDED' // o 'ACTIVE', 'INACTIVE'
});

if (updated) {
  console.log('Admin actualizado:', updated);
}
```

**Errores**: 403 (no es SUPER_ADMIN), 404 (admin no encontrado)

---

### 12. GET /auth/admins
**Listar administradores** (Requiere SUPER_ADMIN)

```typescript
// Con Hook
const { getAdmins, admins, loading } = useAdminAuth();

useEffect(() => {
  getAdmins();
}, []);

// admins contiene la lista automáticamente

// O manualmente
const adminsList = await getAdmins();
console.log(adminsList);
```

**Errores**: 403 (no es SUPER_ADMIN)

---

### 13. GET /auth/test
**Test del servicio**

```typescript
// Con Hook
const { testAuth } = useAuthV2();
const isWorking = await testAuth();

if (isWorking) {
  console.log('Servicio funcionando correctamente');
}

// Con Servicio
const response = await authServiceV2.testAuth();
console.log(response.data?.message, response.data?.timestamp);
```

---

## 🎯 Patrones Comunes

### Login Completo con Redirección

```typescript
function LoginPage() {
  const { login, loading, error } = useAuthV2();
  const router = useRouter();

  const handleLogin = async (email, password) => {
    const result = await login({ email, password });

    if (result) {
      // Guardar usuario si es necesario
      localStorage.setItem('user', JSON.stringify(result.user));

      // Redirigir según rol
      switch (result.user.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'PADRINO':
          router.push('/padrino/dashboard');
          break;
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      {error && <Alert>{error.message}</Alert>}
      <button disabled={loading}>
        {loading ? 'Cargando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### Proteger Rutas

```typescript
function ProtectedRoute({ children, requiredRole }) {
  const { getProfile, isAuthenticated } = useAuthV2();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const profile = await getProfile();
    if (!profile) {
      router.push('/login');
      return;
    }

    if (requiredRole && profile.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    setUser(profile);
    setLoading(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (!user) return null;

  return children;
}

// Uso
<ProtectedRoute requiredRole="SUPER_ADMIN">
  <AdminManagementPage />
</ProtectedRoute>
```

### Refresh Token Automático

```typescript
function useTokenRefresh() {
  const { refreshToken, isAuthenticated } = useAuthV2();

  useEffect(() => {
    if (!isAuthenticated()) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem('refresh_token');
      if (token) {
        const result = await refreshToken({ refreshToken: token });
        if (!result) {
          // Falló el refresh, cerrar sesión
          window.location.href = '/login';
        }
      }
    }, 14 * 60 * 1000); // 14 minutos

    return () => clearInterval(interval);
  }, []);
}
```

### Manejo de Errores Centralizado

```typescript
function ErrorDisplay({ error, onClose }) {
  if (!error) return null;

  const getErrorMessage = (error) => {
    switch (error.statusCode) {
      case 401:
        return 'Credenciales inválidas. Verifica tu email y contraseña.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Este registro ya existe en el sistema.';
      case 503:
        return 'Servicio temporalmente no disponible. Intenta más tarde.';
      default:
        return error.message || 'Ha ocurrido un error inesperado.';
    }
  };

  return (
    <Alert severity="error" onClose={onClose}>
      {getErrorMessage(error)}
    </Alert>
  );
}
```

---

## 🔐 Validaciones de Campos

### Validación de Registro

```typescript
const validateRegister = (data: RegisterDTO) => {
  const errors: any = {};

  if (data.name.length < 3 || data.name.length > 100) {
    errors.name = 'El nombre debe tener entre 3 y 100 caracteres';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(data.password)) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número';
  }

  if (data.phone.length < 7 || data.phone.length > 20) {
    errors.phone = 'El teléfono debe tener entre 7 y 20 caracteres';
  }

  if (data.documentId.length < 5 || data.documentId.length > 20) {
    errors.documentId = 'El documento debe tener entre 5 y 20 caracteres';
  }

  if (data.address.length < 5 || data.address.length > 200) {
    errors.address = 'La dirección debe tener entre 5 y 200 caracteres';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
```

---

## 📦 Resumen de Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `src/types/api.types.ts` | Tipos actualizados ✅ |
| `src/services/auth.service.v2.ts` | Servicio completo ✨ |
| `src/hooks/useAuthV2.ts` | Hook principal ✨ |
| `src/hooks/useAdminAuth.ts` | Hook de administración ✨ |
| `AUTH_IMPLEMENTATION_GUIDE.md` | Guía completa 📖 |
| `AUTH_QUICK_REFERENCE.md` | Esta guía 🚀 |

---

**Actualizado**: 1 de Diciembre de 2025
