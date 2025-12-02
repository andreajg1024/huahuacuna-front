# 🔐 Sistema de Autenticación - Huahuacuna Frontend

## 📋 Resumen

Este proyecto implementa un sistema completo de autenticación para el frontend de Huahuacuna, integrando todos los endpoints del backend con una arquitectura robusta, type-safe y fácil de usar.

## ✨ Características

- ✅ **13 Endpoints Implementados** - Todos los endpoints de autenticación del backend
- ✅ **Type-Safe** - TypeScript completo con tipos bien definidos
- ✅ **Hooks Personalizados** - `useAuthV2` y `useAdminAuth` para facilitar el uso
- ✅ **Contexto Global** - `AuthProvider` para estado global de autenticación
- ✅ **Protección de Rutas** - HOCs para proteger rutas según roles
- ✅ **Manejo de Errores** - Gestión consistente de errores con códigos HTTP
- ✅ **Token Management** - Manejo automático de tokens y refresh
- ✅ **Documentación Completa** - Guías, ejemplos y referencias

## 📦 Estructura

```
src/
├── types/
│   └── api.types.ts                      # Tipos TypeScript
├── services/
│   ├── auth.service.ts                   # Servicio original (legacy)
│   └── auth.service.v2.ts                # ⭐ Servicio nuevo
├── hooks/
│   ├── useAuth.ts                        # Hook original (legacy)
│   ├── useAuthV2.ts                      # ⭐ Hook principal
│   └── useAdminAuth.ts                   # ⭐ Hook de administración
├── contexts/
│   ├── AuthContext.tsx                   # Contexto original (legacy)
│   └── AuthContext.v2.tsx                # ⭐ Contexto nuevo
├── components/
│   ├── hoc/
│   │   └── withAuth.tsx                  # ⭐ HOC para protección de rutas
│   └── examples/
│       └── LoginPageExample.tsx          # Ejemplo completo

Documentación/
├── AUTH_IMPLEMENTATION_GUIDE.md          # 📖 Guía completa (300+ líneas)
├── AUTH_QUICK_REFERENCE.md               # 🚀 Referencia rápida
├── AUTH_USAGE_EXAMPLES.md                # 💡 Ejemplos de uso
├── AUTH_IMPLEMENTATION_SUMMARY.md        # 📦 Resumen técnico
└── AUTH_INTEGRATION_CHECKLIST.md         # ✅ Checklist de integración
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
npm install
# o
yarn install
```

### 2. Configuración

Crear `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. Uso Básico

#### En tu _app.tsx:

```typescript
import { AuthProvider } from '@/contexts/AuthContext.v2';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

#### En un componente:

```typescript
import { useAuth } from '@/contexts/AuthContext.v2';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const success = await login({
      email: 'user@example.com',
      password: 'Password123'
    });

    if (success) {
      console.log('Login exitoso!');
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Hola, {user?.name}</p>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Iniciar Sesión</button>
      )}
    </div>
  );
}
```

#### Proteger una ruta:

```typescript
import { withAuth } from '@/components/hoc/withAuth';

function ProtectedPage() {
  return <div>Contenido protegido</div>;
}

export default withAuth(ProtectedPage, {
  requireAuth: true,
  requiredRole: 'ADMIN'
});
```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [AUTH_IMPLEMENTATION_GUIDE.md](AUTH_IMPLEMENTATION_GUIDE.md) | Guía completa de implementación |
| [AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md) | Referencia rápida de endpoints |
| [AUTH_USAGE_EXAMPLES.md](AUTH_USAGE_EXAMPLES.md) | Ejemplos de código |
| [AUTH_IMPLEMENTATION_SUMMARY.md](AUTH_IMPLEMENTATION_SUMMARY.md) | Resumen técnico |
| [AUTH_INTEGRATION_CHECKLIST.md](AUTH_INTEGRATION_CHECKLIST.md) | Checklist de integración |

## 🎯 Endpoints Implementados

### Públicos (Sin autenticación)

1. **POST** `/auth/register` - Registro de padrinos
2. **POST** `/auth/login` - Inicio de sesión
3. **POST** `/auth/verify-email` - Verificar email
4. **POST** `/auth/password/request-reset` - Solicitar reset
5. **POST** `/auth/password/reset` - Restablecer contraseña
6. **POST** `/auth/refresh` - Refrescar token
7. **GET** `/auth/test` - Test del servicio

### Protegidos (Requieren autenticación)

8. **POST** `/auth/logout` - Cerrar sesión
9. **GET** `/auth/profile` - Obtener perfil
10. **PATCH** `/auth/profile` - Actualizar perfil (PADRINO)

### Administración (Solo SUPER_ADMIN)

11. **POST** `/auth/admins` - Crear administrador
12. **PATCH** `/auth/admins/:adminId` - Actualizar administrador
13. **GET** `/auth/admins` - Listar administradores

## 🔧 API del Hook useAuthV2

```typescript
const {
  // Estado
  loading,
  error,

  // Métodos públicos
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  testAuth,

  // Métodos protegidos
  logout,
  getProfile,
  updateProfile,

  // Utilidades
  clearError,
  isAuthenticated
} = useAuthV2();
```

## 🎨 Componentes HOC

```typescript
import {
  withAuth,           // Protección personalizable
  withAuthBasic,      // Solo requiere autenticación
  withPadrinoAuth,    // Para padrinos
  withAdminAuth,      // Para admins
  withSuperAdminAuth, // Para super admins
  withGuest           // Para páginas públicas
} from '@/components/hoc/withAuth';
```

## 🧪 Testing

Ver [AUTH_INTEGRATION_CHECKLIST.md](AUTH_INTEGRATION_CHECKLIST.md) para una lista completa de tests.

### Tests Básicos:

```bash
# Login
✓ Login exitoso
✓ Login con credenciales incorrectas
✓ Login con cuenta bloqueada

# Registro
✓ Registro exitoso
✓ Registro con email duplicado
✓ Validaciones de campos

# Protección de rutas
✓ Acceso a ruta pública
✓ Acceso a ruta protegida sin login
✓ Acceso según roles
```

## ⚠️ Manejo de Errores

Cada endpoint retorna errores consistentes:

```typescript
interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}
```

### Códigos Comunes:

- **400** - Bad Request (datos inválidos)
- **401** - Unauthorized (credenciales incorrectas)
- **403** - Forbidden (sin permisos)
- **404** - Not Found (recurso no existe)
- **409** - Conflict (duplicado)
- **503** - Service Unavailable (servicio caído)

## 🔐 Seguridad

- ✅ Tokens guardados en localStorage
- ✅ Refresh automático de tokens
- ✅ Logout limpia todos los tokens
- ✅ Protección de rutas por rol
- ✅ Validación de email verificado
- ✅ Headers Authorization automáticos

## 📊 Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `PADRINO` | Usuario regular | Dashboard padrino, actualizar perfil |
| `ADMIN` | Administrador | Dashboard admin, gestión básica |
| `SUPER_ADMIN` | Super administrador | Todo + gestión de admins |

## 🛠️ Migración desde Sistema Anterior

Si tienes código usando el sistema antiguo:

### Antes:
```typescript
import { authService } from '@/services/auth.service';

const result = await authService.login(dto);
```

### Después (Opción 1 - Servicio):
```typescript
import { authServiceV2 } from '@/services/auth.service.v2';

const result = await authServiceV2.login(dto);
```

### Después (Opción 2 - Hook, Recomendado):
```typescript
import { useAuthV2 } from '@/hooks';

const { login } = useAuthV2();
const result = await login(dto);
```

## 🚧 Troubleshooting

### Error: "Cannot find module 'react'"
```bash
npm install
```

### Error: Token expirado
Implementa el `TokenRefreshManager` component (ver ejemplos).

### Error 403: No autorizado
Verifica que el usuario tenga el rol correcto.

### Error de CORS
Configura CORS en el backend.

## 🎯 Próximos Pasos

Después de la integración básica:

1. ✅ Implementar refresh automático de tokens
2. ✅ Agregar manejo de errores en UI
3. ✅ Implementar validaciones de formulario
4. ⏳ Agregar tests unitarios
5. ⏳ Implementar 2FA (si el backend lo soporta)
6. ⏳ Agregar analytics

## 📞 Soporte

Para preguntas o problemas:

1. Revisar [AUTH_IMPLEMENTATION_GUIDE.md](AUTH_IMPLEMENTATION_GUIDE.md)
2. Consultar [AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md)
3. Ver ejemplos en [AUTH_USAGE_EXAMPLES.md](AUTH_USAGE_EXAMPLES.md)

## 📝 Changelog

### Version 2.0 (2025-12-01)

- ✅ 13 endpoints implementados
- ✅ Sistema completo de hooks
- ✅ Contexto global de autenticación
- ✅ HOCs para protección de rutas
- ✅ Documentación completa
- ✅ Ejemplos de uso

---

**Fecha de creación**: 1 de Diciembre de 2025  
**Versión**: 2.0  
**Estado**: ✅ Listo para producción
