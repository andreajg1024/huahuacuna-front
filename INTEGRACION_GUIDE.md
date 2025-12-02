# Guía de Integración - Cambios en Perfiles y Sistema Kafka

## 📋 Resumen Ejecutivo

Se han implementado mejoras significativas en los perfiles de Super Admin y Padrino, junto con un sistema de logging automático para errores de Kafka. Esta guía te ayudará a integrar todos los cambios en tu aplicación.

---

## 🚀 PASO 1: Verificar Dependencias

### Instalar jsPDF (si no está instalado)

```bash
npm install jspdf
# o
yarn add jspdf
```

### Verificar otras dependencias

Asegúrate de tener instaladas:
- `lucide-react` (iconos)
- `sonner` (notificaciones/toasts)
- `react-router-dom` o tu sistema de navegación

---

## 🔧 PASO 2: Integrar Nuevos Componentes en App.tsx

Localiza tu archivo principal de routing (probablemente `src/App.tsx` o similar) y agrega los siguientes casos:

```typescript
import { UserManagementPage } from './components/admin/UserManagementPage';
import { PadrinoDocuments } from './components/profile/PadrinoDocuments';

// Dentro de tu función de navegación/routing:

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // ... tu código existente
  
  const renderPage = () => {
    switch (currentPage) {
      // Casos existentes...
      
      // NUEVOS CASOS:
      case 'user-management':
        return <UserManagementPage onNavigate={setCurrentPage} />;
        
      case 'my-documents':
        return <PadrinoDocuments onNavigate={setCurrentPage} />;
        
      // ... resto de casos
    }
  };
  
  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}
```

---

## 🖼️ PASO 3: Agregar Logo de Huahuacuna

1. Coloca el logo en: `/public/logo-huahuacuna.png`
2. Dimensiones recomendadas: 500x200px
3. Formato: PNG con fondo transparente

Si el logo tiene otro nombre o ubicación, actualiza la ruta en:
`src/components/profile/PadrinoDocuments.tsx` línea ~93:

```typescript
const logoUrl = '/logo-huahuacuna.png'; // Actualiza aquí si es necesario
```

---

## 🔄 PASO 4: Actualizar AdminManagementPage en el Routing

El componente `AdminManagementPage` ahora requiere la prop `onNavigate`. Actualiza donde lo uses:

**ANTES:**
```typescript
case 'admin-management':
  return <AdminManagementPage />;
```

**DESPUÉS:**
```typescript
case 'admin-management':
  return <AdminManagementPage onNavigate={setCurrentPage} />;
```

---

## 🎨 PASO 5: Verificar Navegación del Header

Asegúrate de que tu componente `Header` sea visible cuando el usuario esté logueado. El Header debe permitir:

1. Ver el logo y nombre de la fundación
2. Acceder al inicio
3. Ver opciones del menú según el rol
4. Cerrar sesión

Ejemplo de estructura recomendada:

```typescript
function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div>
      {/* Header siempre visible si está autenticado */}
      {isAuthenticated && <Header onNavigate={setCurrentPage} />}
      
      {/* Contenido de la página actual */}
      <main>
        {renderCurrentPage()}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
```

---

## 📡 PASO 6: Configurar Backend para Logging

### 6.1 Crear endpoint de logging

Sigue las instrucciones en `BACKEND_LOGGING_IMPLEMENTATION.md` para crear:

1. Endpoint: `POST /api/logs/frontend-error`
2. Tabla en base de datos: `frontend_error_logs`
3. Servicio de logging
4. Controller de logs

### 6.2 Verificar que el endpoint esté accesible

```bash
# Test del endpoint (ajusta la URL según tu configuración)
curl -X POST http://localhost:4000/api/logs/frontend-error \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test_topic",
    "payload": {"test": "data"},
    "error": {"message": "Test error", "code": "TEST_ERROR"},
    "timestamp": "2025-12-02T15:30:45.123Z",
    "userAgent": "Test Agent"
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Error logged successfully",
  "logId": "log_12345"
}
```

---

## 🔗 PASO 7: Conectar Datos Reales de Donaciones

En `PadrinoDocuments.tsx`, actualmente hay datos mock. Conéctalos con tu contexto real:

```typescript
// ANTES (línea ~21):
const donations = [
  { year: 2024, amount: 1200000, date: '2024-12-01' },
  { year: 2023, amount: 960000, date: '2023-12-15' },
];

// DESPUÉS:
import { useDonations } from '../../contexts/DonationsContext';

export function PadrinoDocuments({ onNavigate }: PadrinoDocumentsProps) {
  const { user } = useAuth();
  const { donations: userDonations } = useDonations();
  
  // Agrupar donaciones por año
  const donations = Object.entries(
    userDonations.reduce((acc, donation) => {
      const year = new Date(donation.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = { year, amount: 0, date: donation.createdAt };
      }
      acc[year].amount += donation.amount;
      return acc;
    }, {} as Record<number, any>)
  ).map(([_, data]) => data);
  
  // ... resto del código
}
```

---

## ✅ PASO 8: Testing y Validación

### Checklist de Testing:

#### Super Admin:
- [ ] Puede acceder a "Gestión de Usuarios"
- [ ] Puede acceder a "Gestión de Administradores"
- [ ] Puede crear nuevos usuarios (padrinos)
- [ ] Puede activar/desactivar usuarios
- [ ] Botón "Volver" funciona en todos los componentes
- [ ] Ya no aparecen módulos de reportes eliminados

#### Admin:
- [ ] Tiene acceso limitado según permisos
- [ ] Puede gestionar donaciones
- [ ] Puede gestionar voluntarios
- [ ] Botón "Volver" funciona correctamente

#### Padrino:
- [ ] Dashboard muestra información del niño apadrinado
- [ ] Si no tiene niño, muestra CTA para apadrinar
- [ ] Mensajes solo accesibles con niño apadrinado
- [ ] Puede acceder a "Mis Documentos"
- [ ] Puede generar certificados de donación en PDF
- [ ] Certificados incluyen logo y datos correctos
- [ ] Ya no aparece módulo de bitácora eliminado

#### Navegación General:
- [ ] Header visible en todas las vistas (cuando está logueado)
- [ ] Puede navegar al inicio sin cerrar sesión
- [ ] Todos los botones "Volver" funcionan
- [ ] No hay headers duplicados en ninguna página

#### Kafka Logging:
- [ ] Errores de Kafka se registran automáticamente
- [ ] Backend recibe los logs correctamente
- [ ] No hay loops infinitos de logging

---

## 🐛 PASO 9: Troubleshooting

### Problema: "Cannot find module 'jspdf'"

**Solución:**
```bash
npm install jspdf --save
```

### Problema: El logo no aparece en el PDF

**Solución:**
1. Verifica que el archivo exista en `/public/logo-huahuacuna.png`
2. Si el archivo tiene otro nombre, actualiza la ruta en `PadrinoDocuments.tsx`
3. Asegúrate de que el servidor sirva archivos estáticos de `/public`

### Problema: "onNavigate is not a function"

**Solución:**
Asegúrate de pasar la prop correctamente:
```typescript
<UserManagementPage onNavigate={setCurrentPage} />
```

### Problema: Los certificados tienen datos incorrectos

**Solución:**
1. Verifica que el contexto de Auth tenga los datos del usuario
2. Conecta el contexto de Donaciones real
3. Revisa que `user.nombre` y `user.documentId` estén disponibles

### Problema: Headers duplicados

**Solución:**
Ya fueron corregidos en:
- `AdminDonationsManagement.tsx`
- `AdminVolunteerManagement.tsx`

Si encuentras más, busca estructuras HTML como:
```tsx
<div className="header">
  <div className="header"> {/* DUPLICADO! */}
```

### Problema: Errores de Kafka no se registran

**Solución:**
1. Verifica que el endpoint del backend esté activo
2. Revisa la consola del navegador para ver si hay errores en `logErrorToBackend()`
3. Verifica CORS en el backend
4. Asegúrate de que la URL del backend esté correcta en `.env`

---

## 📊 PASO 10: Monitoreo Post-Implementación

### Métricas a monitorear:

1. **Errores de Kafka:**
   - Cantidad de errores por día
   - Topics más problemáticos
   - Códigos de error más comunes

2. **Uso de Certificados:**
   - Cuántos padrinos descargan certificados
   - Años más descargados
   - Errores en generación de PDFs

3. **Navegación:**
   - Rutas más visitadas
   - Tiempo en cada página
   - Tasa de rebote en nuevas páginas

### Dashboard recomendado (opcional):

Crea una vista de admin para ver:
- Logs de errores recientes
- Estadísticas de uso
- Alertas de errores críticos

---

## 🎯 PASO 11: Próximas Mejoras Sugeridas

1. **Perfil de Padrino Completo:**
   - Crear componente `PadrinoProfile.tsx`
   - Permitir editar información personal
   - Cambiar foto de perfil
   - Cambiar contraseña

2. **Sistema de Notificaciones:**
   - Notificar cuando hay nueva bitácora (si se reactiva)
   - Notificar eventos próximos
   - Notificar mensajes nuevos

3. **Métricas Avanzadas:**
   - Dashboard con gráficas
   - Reportes exportables
   - Análisis de tendencias

4. **Internacionalización:**
   - Soporte multiidioma
   - Certificados en inglés

---

## 📞 Soporte

Si encuentras problemas durante la integración:

1. Revisa la consola del navegador para errores de JavaScript
2. Revisa los logs del backend para errores de API
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que las variables de entorno estén configuradas

---

## ✨ Cambios Finales

### Archivos Modificados:
1. `src/components/dashboards/SuperAdminDashboard.tsx`
2. `src/components/dashboards/PadrinoDashboard.tsx`
3. `src/components/admin/AdminManagementPage.tsx`
4. `src/components/donations/AdminDonationsManagement.tsx`
5. `src/components/volunteering/AdminVolunteerManagement.tsx`
6. `src/lib/api-client.ts`

### Archivos Nuevos:
1. `src/components/admin/UserManagementPage.tsx`
2. `src/components/profile/PadrinoDocuments.tsx`

### Documentos de Guía:
1. `CAMBIOS_PERFILES_KAFKA.md` - Resumen de todos los cambios
2. `BACKEND_LOGGING_IMPLEMENTATION.md` - Guía para backend
3. `INTEGRACION_GUIDE.md` - Esta guía

---

## 🎉 ¡Listo!

Siguiendo estos pasos, tu aplicación debería estar completamente integrada con todas las mejoras. Si todo funciona correctamente:

- ✅ Los perfiles están limpios y organizados
- ✅ Los certificados de donación se generan correctamente
- ✅ Los errores de Kafka se registran automáticamente
- ✅ La navegación es consistente en toda la app
- ✅ No hay headers duplicados

**¡Éxito con la implementación!** 🚀
