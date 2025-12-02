# 🎯 Ejemplos de Uso Completos

## Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Páginas de Autenticación](#páginas-de-autenticación)
3. [Protección de Rutas](#protección-de-rutas)
4. [Gestión de Perfil](#gestión-de-perfil)
5. [Administración](#administración)
6. [Utilidades](#utilidades)

---

## 1. Configuración Inicial

### 1.1. Configurar el Provider en _app.tsx

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext.v2';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

### 1.2. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## 2. Páginas de Autenticación

### 2.1. Página de Login

```typescript
// pages/auth/login.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext.v2';
import { withGuest } from '@/components/hoc/withAuth';

function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login({ email, password });

    if (success) {
      // La redirección se maneja automáticamente en el contexto
      // o puedes personalizarla aquí
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Cargando...' : 'Entrar'}
        </button>

        <div className="text-center text-sm">
          <a href="/auth/register" className="text-blue-600">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </form>
    </div>
  );
}

// Proteger con withGuest para redirigir si ya está autenticado
export default withGuest(LoginPage);
```

### 2.2. Página de Registro

```typescript
// pages/auth/register.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext.v2';
import { withGuest } from '@/components/hoc/withAuth';
import { RegisterDTO } from '@/types/api.types';

function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterDTO>({
    name: '',
    email: '',
    password: '',
    phone: '',
    documentId: '',
    address: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await register(formData);

    if (success) {
      alert('Registro exitoso! Verifica tu email.');
      router.push('/auth/verify-email-sent');
    } else {
      setError('Error al registrar. Verifica los datos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Crear Cuenta</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nombre completo"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Contraseña (min 8 caracteres)"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Teléfono"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          value={formData.documentId}
          onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
          placeholder="Documento de identidad"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Dirección"
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}

export default withGuest(RegisterPage);
```

### 2.3. Verificación de Email

```typescript
// pages/auth/verify-email.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthV2 } from '@/hooks';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const { verifyEmail } = useAuthV2();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tokenValue: string) => {
    const result = await verifyEmail({ token: tokenValue });

    if (result) {
      setStatus('success');
      setMessage(result.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setStatus('error');
      setMessage('Token inválido o expirado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Verificando email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold">Email Verificado</h1>
            <p className="mt-2">{message}</p>
            <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="mt-2">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Ir al Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### 2.4. Recuperación de Contraseña

```typescript
// pages/auth/password-recovery.tsx
import { useState, FormEvent } from 'react';
import { useAuthV2 } from '@/hooks';
import { withGuest } from '@/components/hoc/withAuth';

function PasswordRecoveryPage() {
  const { requestPasswordReset, loading } = useAuthV2();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await requestPasswordReset({ email });

    if (result) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Email Enviado</h1>
          <p>Si el email existe, recibirás instrucciones para restablecer tu contraseña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>
        <p className="text-gray-600">
          Ingresa tu email y te enviaremos instrucciones.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
        </button>
      </form>
    </div>
  );
}

export default withGuest(PasswordRecoveryPage);
```

---

## 3. Protección de Rutas

### 3.1. Dashboard de Padrino (Protegido)

```typescript
// pages/padrino/dashboard.tsx
import { useAuth } from '@/contexts/AuthContext.v2';
import { withPadrinoAuth } from '@/components/hoc/withAuth';

function PadrinoDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard de Padrino</h1>
      <p className="mt-2">Bienvenido, {user?.name}</p>

      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

// Proteger con withPadrinoAuth
export default withPadrinoAuth(PadrinoDashboard);
```

### 3.2. Panel de Administración (Solo Admins)

```typescript
// pages/admin/dashboard.tsx
import { useAuth } from '@/contexts/AuthContext.v2';
import { withAdminAuth } from '@/components/hoc/withAuth';

function AdminDashboard() {
  const { user, hasRole } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      <p className="mt-2">Rol: {user?.role}</p>

      {hasRole('SUPER_ADMIN') && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p>Sección exclusiva para Super Admins</p>
        </div>
      )}
    </div>
  );
}

// Proteger para ADMIN y SUPER_ADMIN
export default withAdminAuth(AdminDashboard);
```

### 3.3. Gestión de Usuarios (Solo Super Admin)

```typescript
// pages/admin/users.tsx
import { withSuperAdminAuth } from '@/components/hoc/withAuth';
import { useAdminAuth } from '@/hooks';
import { useEffect } from 'react';

function UsersManagementPage() {
  const { admins, getAdmins, loading } = useAdminAuth();

  useEffect(() => {
    getAdmins();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Gestión de Administradores</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.role}</td>
                <td>{admin.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Solo SUPER_ADMIN puede acceder
export default withSuperAdminAuth(UsersManagementPage);
```

---

## 4. Gestión de Perfil

### 4.1. Página de Perfil

```typescript
// pages/profile.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.v2';
import { useAuthV2 } from '@/hooks';
import { withAuthBasic } from '@/components/hoc/withAuth';

function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { updateProfile, loading } = useAuthV2();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    const updated = await updateProfile(formData);

    if (updated) {
      updateUserProfile(updated);
      setEditing(false);
      alert('Perfil actualizado');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>

      {!editing ? (
        <div className="space-y-2">
          <p><strong>Nombre:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Teléfono:</strong> {user?.phone}</p>
          <p><strong>Dirección:</strong> {user?.address}</p>
          <p><strong>Rol:</strong> {user?.role}</p>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Teléfono"
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Dirección"
            className="w-full p-2 border rounded"
          />

          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="URL del avatar"
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>

            <button
              onClick={() => setEditing(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthBasic(ProfilePage);
```

---

## 5. Administración

### 5.1. Crear Nuevo Admin

```typescript
// pages/admin/create-admin.tsx
import { useState, FormEvent } from 'react';
import { useAdminAuth } from '@/hooks';
import { withSuperAdminAuth } from '@/components/hoc/withAuth';
import { CreateAdminDTO } from '@/types/api.types';

function CreateAdminPage() {
  const { createAdmin, loading } = useAdminAuth();
  const [formData, setFormData] = useState<CreateAdminDTO>({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newAdmin = await createAdmin(formData);

    if (newAdmin) {
      alert(`Admin creado: ${newAdmin.name}`);
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Crear Administrador</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nombre"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Contraseña"
          className="w-full p-2 border rounded"
          required
        />

        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full p-2 border rounded"
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Creando...' : 'Crear Admin'}
        </button>
      </form>
    </div>
  );
}

export default withSuperAdminAuth(CreateAdminPage);
```

---

## 6. Utilidades

### 6.1. Token Refresh Automático

```typescript
// components/TokenRefreshManager.tsx
import { useEffect } from 'react';
import { useAuthV2 } from '@/hooks';

export function TokenRefreshManager() {
  const { refreshToken, isAuthenticated } = useAuthV2();

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Refrescar cada 14 minutos (tokens expiran en 15)
    const interval = setInterval(async () => {
      const token = localStorage.getItem('refresh_token');
      
      if (token) {
        const result = await refreshToken({ refreshToken: token });
        
        if (!result) {
          // Token refresh falló - cerrar sesión
          window.location.href = '/login';
        }
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken, isAuthenticated]);

  return null;
}

// Agregar en _app.tsx:
// <TokenRefreshManager />
```

### 6.2. Header con Usuario

```typescript
// components/Header.tsx
import { useAuth } from '@/contexts/AuthContext.v2';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Huahuacuna</h1>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <span>Hola, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <a href="/login" className="bg-blue-600 px-4 py-2 rounded">
            Iniciar Sesión
          </a>
        )}
      </div>
    </header>
  );
}
```

---

**¡Listo!** Estos ejemplos cubren todos los casos de uso principales del sistema de autenticación.
