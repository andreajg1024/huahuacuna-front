# 🔄 Guía de Migración - Sistema de Autenticación

Esta guía te ayudará a migrar del sistema de autenticación anterior al nuevo sistema v2.

## 📋 Tabla de Contenidos

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Migración Paso a Paso](#migración-paso-a-paso)
3. [Tabla de Equivalencias](#tabla-de-equivalencias)
4. [Ejemplos de Migración](#ejemplos-de-migración)
5. [FAQ](#faq)

---

## 🔍 Resumen de Cambios

### Lo que cambió:

| Aspecto | Antes (v1) | Ahora (v2) |
|---------|------------|------------|
| **Servicio** | `auth.service.ts` | `auth.service.v2.ts` |
| **Hook** | `useAuth.ts` | `useAuthV2.ts` |
| **Contexto** | `AuthContext.tsx` | `AuthContext.v2.tsx` |
| **Tipos** | Parciales | Completos (13 endpoints) |
| **Manejo de errores** | Inconsistente | Estandarizado con `ApiResponse` |
| **Token refresh** | Manual | Automático (con helper) |
| **Protección de rutas** | Manual | HOCs (`withAuth`, etc.) |

### Lo que se agregó:

- ✨ Hook de administración (`useAdminAuth`)
- ✨ HOCs para protección de rutas
- ✨ Tipos completos para todos los endpoints
- ✨ Documentación exhaustiva
- ✨ Ejemplos de código

---

## 🚀 Migración Paso a Paso

### Opción 1: Migración Gradual (Recomendado)

Ambos sistemas pueden coexistir. Migra componentes uno por uno.

#### Paso 1: Mantener ambos providers

```typescript
// pages/_app.tsx
import { AuthProvider as AuthProviderV1 } from '@/contexts/AuthContext';
import { AuthProvider as AuthProviderV2 } from '@/contexts/AuthContext.v2';

export default function App({ Component, pageProps }) {
  return (
    <AuthProviderV1>
      <AuthProviderV2>
        <Component {...pageProps} />
      </AuthProviderV2>
    </AuthProviderV1>
  );
}
```

#### Paso 2: Migrar componentes individualmente

Elige un componente y migra:

```typescript
// Antes
import { useAuth } from '@/contexts/AuthContext';

// Después
import { useAuth } from '@/contexts/AuthContext.v2';
```

#### Paso 3: Una vez todos migrados, remover v1

```typescript
// pages/_app.tsx
import { AuthProvider } from '@/contexts/AuthContext.v2';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

### Opción 2: Migración Completa (Big Bang)

Reemplaza todo de una vez.

#### Paso 1: Backup del código actual

```bash
git checkout -b backup-auth-v1
git commit -am "Backup before auth migration"
git checkout main
```

#### Paso 2: Actualizar _app.tsx

```typescript
// pages/_app.tsx
import { AuthProvider } from '@/contexts/AuthContext.v2';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

#### Paso 3: Actualizar todos los imports

Buscar y reemplazar:
- `from '@/contexts/AuthContext'` → `from '@/contexts/AuthContext.v2'`
- `from '@/hooks/useAuth'` → `from '@/hooks/useAuthV2'`
- `from '@/services/auth.service'` → `from '@/services/auth.service.v2'`

#### Paso 4: Actualizar llamadas según la nueva API

Ver [Tabla de Equivalencias](#tabla-de-equivalencias)

---

## 📊 Tabla de Equivalencias

### Contexto

| v1 | v2 |
|----|-----|
| `const { user, login, logout } = useAuth()` | ✅ Igual |
| `const { register } = useAuth()` | ✅ Igual |
| No disponible | ✅ `hasRole()` |
| No disponible | ✅ `isEmailVerified()` |
| `refreshProfile()` | ✅ Igual |

### Hook useAuth

| v1 | v2 |
|----|-----|
| `useAuth()` hook básico | `useAuthV2()` hook completo |
| `login()` | ✅ Igual |
| `register()` | ✅ Igual |
| `verifyEmail()` | ✅ Igual |
| No disponible | ✅ `requestPasswordReset()` |
| No disponible | ✅ `resetPassword()` |
| No disponible | ✅ `refreshToken()` |
| No disponible | ✅ `testAuth()` |
| `logout()` | ✅ Igual |
| `getProfile()` | ✅ Igual |
| `updateProfile()` | ✅ Igual |

### Hook de Administración

| v1 | v2 |
|----|-----|
| No disponible | ✅ `useAdminAuth()` |
| `createAdmin()` en useAuth | `createAdmin()` en useAdminAuth |
| `updateAdmin()` en useAuth | `updateAdmin()` en useAdminAuth |
| No disponible | ✅ `getAdmins()` en useAdminAuth |

### Servicio

| v1 | v2 |
|----|-----|
| `authService.login()` | `authServiceV2.login()` |
| `authService.register()` | `authServiceV2.register()` |
| Manejo manual de tokens | Automático |
| Errores inconsistentes | `ApiResponse<T>` estandarizado |

### Tipos

| v1 | v2 |
|----|-----|
| `RegisterPadrinoDTO` | ✅ `RegisterDTO` (alias disponible) |
| `LoginDTO` | ✅ Igual |
| `UserResponse` | ✅ Mejorado con más campos |
| Tipos parciales | ✅ Tipos completos para 13 endpoints |

---

## 💡 Ejemplos de Migración

### Ejemplo 1: Componente de Login

#### Antes (v1):

```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Redirección manual
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </form>
  );
}
```

#### Después (v2):

```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.v2';
import { withGuest } from '@/components/hoc/withAuth';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const success = await login({ email, password });

    if (!success) {
      setError('Credenciales incorrectas');
    }
    // Redirección automática por el contexto
  };

  return (
    <form>
      {error && <div className="error">{error}</div>}
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Login'}
      </button>
    </form>
  );
}

export default withGuest(LoginPage);
```

### Ejemplo 2: Página Protegida

#### Antes (v1):

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!user) return <div>Loading...</div>;

  return <div>Dashboard de {user.name}</div>;
}

export default DashboardPage;
```

#### Después (v2):

```typescript
import { useAuth } from '@/contexts/AuthContext.v2';
import { withAuth } from '@/components/hoc/withAuth';

function DashboardPage() {
  const { user } = useAuth();

  return <div>Dashboard de {user?.name}</div>;
}

export default withAuth(DashboardPage, {
  requireAuth: true
});
```

### Ejemplo 3: Verificar Rol

#### Antes (v1):

```typescript
function AdminPanel() {
  const { user } = useAuth();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div>No autorizado</div>;
  }

  return <div>Panel de Admin</div>;
}
```

#### Después (v2):

```typescript
import { withAdminAuth } from '@/components/hoc/withAuth';

function AdminPanel() {
  return <div>Panel de Admin</div>;
}

export default withAdminAuth(AdminPanel);
```

### Ejemplo 4: Actualizar Perfil

#### Antes (v1):

```typescript
const { updateProfile } = useAuth();

const handleUpdate = async () => {
  try {
    await updateProfile({
      phone: '123456789',
      address: 'Nueva dirección'
    });
    alert('Perfil actualizado');
  } catch (error) {
    alert('Error');
  }
};
```

#### Después (v2):

```typescript
const { updateUserProfile } = useAuth();
const { updateProfile, loading, error } = useAuthV2();

const handleUpdate = async () => {
  const updated = await updateProfile({
    phone: '123456789',
    address: 'Nueva dirección'
  });

  if (updated) {
    updateUserProfile(updated); // Actualizar contexto
    alert('Perfil actualizado');
  } else {
    alert(error?.message || 'Error');
  }
};
```

### Ejemplo 5: Gestión de Admins

#### Antes (v1):

```typescript
const { createAdmin } = useAuth();

const handleCreate = async () => {
  try {
    await createAdmin({
      name: 'Nuevo Admin',
      email: 'admin@org.com',
      password: 'SecurePass123',
      role: 'ADMIN'
    });
  } catch (error) {
    alert('Error');
  }
};
```

#### Después (v2):

```typescript
import { useAdminAuth } from '@/hooks';

const { createAdmin, loading, error } = useAdminAuth();

const handleCreate = async () => {
  const newAdmin = await createAdmin({
    name: 'Nuevo Admin',
    email: 'admin@org.com',
    password: 'SecurePass123',
    role: 'ADMIN'
  });

  if (newAdmin) {
    alert(`Admin creado: ${newAdmin.name}`);
  } else {
    alert(error?.message || 'Error');
  }
};
```

---

## ❓ FAQ

### ¿Puedo usar ambos sistemas al mismo tiempo?

Sí, durante la migración puedes tener ambos providers activos. Solo asegúrate de usar el correcto en cada componente.

### ¿Debo migrar todos los componentes a la vez?

No, puedes migrar gradualmente componente por componente.

### ¿Los tokens del sistema anterior funcionan con el nuevo?

Sí, si usas los mismos nombres en localStorage (`auth_token`, `refresh_token`).

### ¿Qué pasa con los usuarios ya autenticados?

Seguirán autenticados si los tokens son compatibles.

### ¿Debo actualizar el backend?

No, el backend no cambia. Solo cambió la forma de consumirlo en el frontend.

### ¿Puedo seguir usando el servicio directamente?

Sí, pero se recomienda usar los hooks para aprovechar estados de carga y errores.

### ¿Qué hacer si encuentro un bug?

1. Verifica la documentación
2. Revisa los ejemplos
3. Compara con el código de ejemplo
4. Revisa logs en consola

### ¿Cómo debugging si algo no funciona?

```typescript
// Agregar logs temporales
const { login, error } = useAuthV2();

useEffect(() => {
  if (error) {
    console.log('Error de auth:', error);
  }
}, [error]);
```

---

## ✅ Checklist de Migración

Por componente:

- [ ] Actualizar imports
- [ ] Cambiar de `useAuth()` a nuevo hook si aplica
- [ ] Actualizar manejo de estados (loading, error)
- [ ] Actualizar tipos si es necesario
- [ ] Implementar HOCs si aplica
- [ ] Probar el componente
- [ ] Verificar manejo de errores
- [ ] Verificar redirecciones

---

## 🎯 Recomendaciones

1. **Comenzar con páginas de auth** (login, register)
2. **Luego migrar protección de rutas**
3. **Después perfiles y dashboards**
4. **Finalmente administración**

---

## 📚 Recursos

- [AUTH_IMPLEMENTATION_GUIDE.md](AUTH_IMPLEMENTATION_GUIDE.md) - Guía completa
- [AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md) - Referencia rápida
- [AUTH_USAGE_EXAMPLES.md](AUTH_USAGE_EXAMPLES.md) - Ejemplos completos

---

**Actualizado**: 1 de Diciembre de 2025
