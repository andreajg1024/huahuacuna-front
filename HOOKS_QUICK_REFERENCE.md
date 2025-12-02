# 📋 Resumen Rápido de Hooks

## Hooks Disponibles (13 total)

### 🔐 Autenticación (3)
```typescript
import { useAuth, useAuthV2, useAdminAuth } from '@/hooks';

// useAuth - Completo
const { login, register, verifyEmail, logout, getProfile, updateProfile } = useAuth();

// useAdminAuth - Solo para SUPER_ADMIN
const { createAdmin, updateAdmin, getAdmins } = useAdminAuth();
```

### 👶 Niños y Apadrinamientos (3)
```typescript
import { useChildren, useSponsorship, useSponsorships } from '@/hooks';

// useChildren
const { createChild, getAllChildren, filterChildren, updateChild, deleteChild } = useChildren();

// useSponsorship - Básico
const { createSponsorship, endSponsorship } = useSponsorship();

// useSponsorships - Completo
const { createSponsorshipRequest, approveSponsorshipRequest, cancelSponsorship } = useSponsorships();
```

### 📊 Proyectos y Actividad (2)
```typescript
import { useProjects, useActivityLogs } from '@/hooks';

// useProjects
const { createProject, updateProject, listProjects, addChildToProject } = useProjects();

// useActivityLogs
const { createActivityLog, listActivityLogs } = useActivityLogs();
```

### 📝 Bitácora y Chat (2)
```typescript
import { useBitacoraEntries, useChat } from '@/hooks';

// useBitacoraEntries
const { createEntry, updateEntry, deleteEntry, listEntries } = useBitacoraEntries();

// useChat
const { createConversation, getMessages, sendMessage, markAsRead } = useChat();
```

### 🎉 Eventos y Donaciones (2)
```typescript
import { useEvents, useDonations } from '@/hooks';

// useEvents
const { createEvent, getPublishedEvents, registerToEvent, checkIn } = useEvents();

// useDonations
const { createMonetaryDonation, createInKindDonation, getMyDonations } = useDonations();
```

### 📰 Noticias y Voluntariado (2)
```typescript
import { useNews, useVolunteering } from '@/hooks';

// useNews ⭐ NUEVO
const { createArticle, listArticles, publishArticle, archiveArticle } = useNews();

// useVolunteering ⭐ NUEVO
const { createApplication, listApplications, approveApplication } = useVolunteering();
```

---

## Estructura Común de Retorno

Todos los hooks retornan:
```typescript
{
  loading: boolean,           // Estado de carga
  error: ApiError | null,     // Error actual
  clearError: () => void,     // Limpiar error
  ...metodos                  // Métodos específicos
}
```

Los métodos retornan:
```typescript
{ success: true, data: T } | { success: false, error: string }
// O simplemente: T | null
```

---

## Ejemplo Básico

```typescript
import { useNews } from '@/hooks';
import { useEffect, useState } from 'react';

function NewsPage() {
  const { loading, error, listArticles } = useNews();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {
      const result = await listArticles({ status: 'published' });
      if (result.success) {
        setArticles(result.data);
      }
    };
    loadArticles();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {articles.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

---

## Hooks por Funcionalidad

### CRUD Completo
- `useChildren` - Niños
- `useProjects` - Proyectos
- `useEvents` - Eventos
- `useNews` - Noticias ⭐

### Formularios Públicos
- `useVolunteering` - Aplicaciones de voluntariado ⭐
- `useDonations` - Donaciones

### Gestión de Usuarios
- `useAuth` - Autenticación general
- `useAdminAuth` - Administradores

### Comunicación
- `useChat` - Mensajería
- `useBitacoraEntries` - Bitácora

### Sistema
- `useActivityLogs` - Logs de actividad
- `useSponsorships` - Sistema de apadrinamientos

---

## 🚀 Siguiente Paso

Para ejemplos detallados y guía completa, consulta:
📖 **HOOKS_INTEGRATION.md**
