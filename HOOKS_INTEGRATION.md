# 🎣 Guía de Integración de Hooks

## 📋 Resumen de Hooks Disponibles

El proyecto cuenta con **13 hooks personalizados** completamente integrados y listos para usar:

### 🔐 Autenticación
- `useAuth` - Autenticación completa (login, register, verify, etc.)
- `useAuthV2` - Versión alternativa de autenticación
- `useAdminAuth` - Gestión de administradores (solo SUPER_ADMIN)

### 👶 Niños y Apadrinamientos
- `useChildren` - CRUD de niños
- `useSponsorship` - Operaciones básicas de apadrinamiento
- `useSponsorships` - Gestión completa de apadrinamientos (solicitudes, aprobaciones, etc.)

### 📊 Proyectos y Actividad
- `useProjects` - CRUD de proyectos
- `useActivityLogs` - Registros de actividad

### 📝 Bitácora y Chat
- `useBitacoraEntries` - Gestión de entradas de bitácora
- `useChat` - Mensajería y conversaciones

### 🎉 Eventos y Donaciones
- `useEvents` - CRUD de eventos
- `useDonations` - Gestión de donaciones

### 📰 Noticias y Voluntariado
- `useNews` - CRUD de artículos de noticias
- `useVolunteering` - Gestión de aplicaciones de voluntariado

---

## 🚀 Cómo Usar los Hooks

### Ejemplo 1: Hook de Noticias (`useNews`)

```typescript
import { useNews } from '@/hooks';
import { useState, useEffect } from 'react';

function NewsPage() {
  const { 
    loading, 
    error, 
    listArticles, 
    createArticle, 
    publishArticle,
    clearError 
  } = useNews();
  
  const [articles, setArticles] = useState([]);

  // Cargar artículos al montar
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const result = await listArticles({ status: 'published' });
    if (result.success) {
      setArticles(result.data);
    }
  };

  // Crear nuevo artículo
  const handleCreate = async (data) => {
    const result = await createArticle({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.image,
      featuredImageAlt: data.imageAlt,
      primaryCategory: data.category,
      metaDescription: data.metaDesc,
      status: 'draft',
    });

    if (result.success) {
      loadArticles();
    }
  };

  // Publicar artículo
  const handlePublish = async (articleId) => {
    const result = await publishArticle(articleId);
    if (result.success) {
      loadArticles();
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {articles.map(article => (
        <ArticleCard 
          key={article.id} 
          article={article}
          onPublish={handlePublish}
        />
      ))}
    </div>
  );
}
```

### Ejemplo 2: Hook de Voluntariado (`useVolunteering`)

```typescript
import { useVolunteering } from '@/hooks';
import { useState } from 'react';

function VolunteerForm() {
  const { loading, error, createApplication, clearError } = useVolunteering();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    areas: [],
    motivation: '',
    availability: [],
    acceptedTerms: false,
    privacyConsent: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await createApplication(formData);
    
    if (result.success) {
      // Resetear formulario
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        areas: [],
        motivation: '',
        availability: [],
        acceptedTerms: false,
        privacyConsent: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="Nombre completo"
        required
      />

      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />

      <textarea
        value={formData.motivation}
        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
        placeholder="¿Por qué quieres ser voluntario?"
        required
      />

      <label>
        <input
          type="checkbox"
          checked={formData.acceptedTerms}
          onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
        />
        Acepto términos y condiciones
      </label>

      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Aplicación'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Hook de Niños (`useChildren`)

```typescript
import { useChildren } from '@/hooks';
import { useEffect, useState } from 'react';

function ChildrenList() {
  const { 
    loading, 
    error, 
    getAllChildren, 
    filterChildren,
    getAvailableChildren,
    deleteChild 
  } = useChildren();
  
  const [children, setChildren] = useState([]);
  const [filters, setFilters] = useState({
    gender: undefined,
    minAge: undefined,
    maxAge: undefined,
  });

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    const result = await getAllChildren();
    if (result) {
      setChildren(result);
    }
  };

  const handleFilter = async () => {
    const result = await filterChildren(filters);
    if (result) {
      setChildren(result);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este niño?')) {
      const result = await deleteChild(id);
      if (result) {
        loadChildren();
      }
    }
  };

  return (
    <div>
      <div className="filters">
        <select 
          value={filters.gender || ''} 
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Femenino</option>
        </select>
        
        <button onClick={handleFilter}>Filtrar</button>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div>Error: {error.message}</div>}

      <div className="children-grid">
        {children.map(child => (
          <ChildCard 
            key={child.id} 
            child={child}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
```

### Ejemplo 4: Hook de Donaciones (`useDonations`)

```typescript
import { useDonations } from '@/hooks';

function DonationForm() {
  const { 
    loading, 
    error, 
    createMonetaryDonation,
    createInKindDonation 
  } = useDonations();

  const handleMonetaryDonation = async (amount, method) => {
    const result = await createMonetaryDonation({
      amount,
      paymentMethod: method,
      isRecurrent: false,
    });

    if (result) {
      console.log('Donación creada:', result);
    }
  };

  const handleInKindDonation = async (items) => {
    const result = await createInKindDonation({
      items: items,
      estimatedValue: 0,
    });

    if (result) {
      console.log('Donación en especie creada:', result);
    }
  };

  return (
    <div>
      <h2>Realizar Donación</h2>
      {/* Formulario aquí */}
      {loading && <p>Procesando...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Ejemplo 5: Hook de Eventos (`useEvents`)

```typescript
import { useEvents } from '@/hooks';
import { useState, useEffect } from 'react';

function EventsPage() {
  const { 
    loading, 
    error, 
    getPublishedEvents,
    registerToEvent 
  } = useEvents();
  
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const result = await getPublishedEvents({ limit: 10 });
    if (result) {
      setEvents(result.events);
    }
  };

  const handleRegister = async (eventId) => {
    const result = await registerToEvent({
      eventId,
      attendeeName: 'Juan Pérez',
      attendeeEmail: 'juan@example.com',
    });

    if (result) {
      alert('¡Registro exitoso!');
    }
  };

  return (
    <div>
      <h1>Eventos Próximos</h1>
      {loading && <div>Cargando eventos...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div className="events-list">
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event}
            onRegister={() => handleRegister(event.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Patrón de Uso Común

Todos los hooks siguen el mismo patrón:

```typescript
const {
  loading,      // boolean - indica si hay una operación en progreso
  error,        // ApiError | string | null - error actual
  clearError,   // función para limpiar errores
  ...methods    // métodos específicos del hook
} = useHook();
```

### Estados que retorna cada hook:

1. **`loading`**: `true` cuando hay una operación en curso
2. **`error`**: contiene el error si algo salió mal
3. **Métodos**: funciones async que retornan:
   - `{ success: true, data: T }` en caso de éxito
   - `{ success: false, error: string }` en caso de error
   - `T | null` dependiendo del hook

---

## 📦 Importación

Todos los hooks se pueden importar desde el barrel export:

```typescript
// ✅ Recomendado - Import individual
import { useNews, useVolunteering, useChildren } from '@/hooks';

// ✅ También válido
import { useAuth } from '@/hooks/useAuth';
```

---

## 🔄 Integración con Contextos

Los hooks pueden usarse junto con los contextos para estado global:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks';

function MyComponent() {
  const { user } = useAuth(); // Del contexto
  const { createChild } = useChildren(); // Del hook
  
  const handleCreate = async (data) => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }
    
    await createChild(data);
  };
}
```

---

## ⚡ Características Principales

### 1. Manejo Automático de Estados
- Los hooks manejan `loading` y `error` automáticamente
- No necesitas usar `useState` para estos estados

### 2. Notificaciones con Toast
- Los hooks muestran notificaciones automáticamente usando `sonner`
- Puedes desactivar esto si prefieres manejarlas manualmente

### 3. Validación Local
- Muchos hooks incluyen validaciones antes de llamar al API
- Esto reduce llamadas innecesarias y mejora la UX

### 4. Type Safety
- Todos los hooks están completamente tipados con TypeScript
- Intellisense completo en tu IDE

---

## 🛠️ Tips de Uso

### 1. Manejo de Errores

```typescript
const { error, clearError } = useNews();

useEffect(() => {
  if (error) {
    // Mostrar modal de error
    showErrorModal(error);
    
    // Limpiar error después de 5 segundos
    const timer = setTimeout(clearError, 5000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

### 2. Loading States

```typescript
const { loading, listArticles } = useNews();

if (loading) {
  return <Spinner />;
}

// O con skeleton
if (loading) {
  return <SkeletonList count={5} />;
}
```

### 3. Recargar Datos

```typescript
const { listArticles } = useNews();
const [articles, setArticles] = useState([]);

const loadData = async () => {
  const result = await listArticles();
  if (result.success) {
    setArticles(result.data);
  }
};

// Recargar cada 30 segundos
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 📚 Documentación de Cada Hook

### useAuth
**Ubicación**: `src/hooks/useAuth.ts`  
**Servicios**: `authService`  
**Funciones**: register, login, verifyEmail, requestPasswordReset, resetPassword, refreshToken, logout, getProfile, updateProfile, createAdmin, updateAdmin

### useChildren
**Ubicación**: `src/hooks/useChildren.ts`  
**Servicios**: `childrenService`  
**Funciones**: createChild, getAvailableChildren, filterChildren, getAllChildren, getChildById, updateChild, deleteChild

### useNews
**Ubicación**: `src/hooks/useNews.ts`  
**Servicios**: `newsService`  
**Funciones**: createArticle, updateArticle, deleteArticle, listArticles, getArticleById, publishArticle, archiveArticle

### useVolunteering
**Ubicación**: `src/hooks/useVolunteering.ts`  
**Servicios**: `volunteeringService`  
**Funciones**: createApplication, updateApplication, listApplications, getApplicationById, approveApplication, rejectApplication, markAsUnderReview

### useDonations
**Ubicación**: `src/hooks/useDonations.ts`  
**Servicios**: `donationsService`  
**Funciones**: createMonetaryDonation, createInKindDonation, getAllDonations, getMyDonations, approveDonation, getDonationInfo, createDonationInfo, updateDonationInfo, getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial

### useEvents
**Ubicación**: `src/hooks/useEvents.ts`  
**Servicios**: `eventsService`  
**Funciones**: createEvent, updateEvent, publishEvent, deleteEvent, getAllEvents, getPublishedEvents, getEventBySlug, registerToEvent, getEventRegistrations, checkIn, getEventStatistics

### useProjects
**Ubicación**: `src/hooks/useProjects.ts`  
**Servicios**: `projectsService`  
**Funciones**: createProject, updateProject, deleteProject, listProjects, getProject, addChildToProject, removeChildFromProject

### useSponsorship / useSponsorships
**Ubicación**: `src/hooks/useSponsorship.ts`, `src/hooks/useSponsorships.ts`  
**Servicios**: `apadrinamientoService`  
**Funciones**: Ver archivos individuales para listado completo

### useBitacoraEntries
**Ubicación**: `src/hooks/useBitacoraEntries.ts`  
**Servicios**: `bitacoraService`  
**Funciones**: createEntry, updateEntry, deleteEntry, listEntries, getEntry

### useActivityLogs
**Ubicación**: `src/hooks/useActivityLogs.ts`  
**Servicios**: `activityLogsService`  
**Funciones**: createActivityLog, listActivityLogs, getActivityLog

### useChat
**Ubicación**: `src/hooks/useChat.ts`  
**Servicios**: `chatService`  
**Funciones**: createConversation, getConversations, getMessages, sendMessage, markAsRead, getUnreadCount

---

## ✅ Checklist de Integración

- [x] ✅ Hook `useAuth` - Autenticación
- [x] ✅ Hook `useAuthV2` - Autenticación v2
- [x] ✅ Hook `useAdminAuth` - Admin
- [x] ✅ Hook `useChildren` - Niños
- [x] ✅ Hook `useSponsorship` - Apadrinamiento básico
- [x] ✅ Hook `useSponsorships` - Apadrinamiento completo
- [x] ✅ Hook `useProjects` - Proyectos
- [x] ✅ Hook `useActivityLogs` - Activity Logs
- [x] ✅ Hook `useBitacoraEntries` - Bitácora
- [x] ✅ Hook `useChat` - Chat
- [x] ✅ Hook `useEvents` - Eventos
- [x] ✅ Hook `useDonations` - Donaciones
- [x] ✅ Hook `useNews` - Noticias ⭐ NUEVO
- [x] ✅ Hook `useVolunteering` - Voluntariado ⭐ NUEVO
- [x] ✅ Todos exportados en `src/hooks/index.ts`

---

## 🎉 ¡Listo para Usar!

Todos los hooks están completamente integrados y listos para usar en tu aplicación. Simplemente importa el hook que necesites y comienza a desarrollar.

Para dudas o problemas, revisa:
1. La documentación de cada hook individual
2. Los tipos en `src/types/api.types.ts`
3. Los servicios en `src/services/`
