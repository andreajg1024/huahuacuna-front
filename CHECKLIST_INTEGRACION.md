# ✅ Checklist de Integración - Fundación Huahuacuna

## 📋 Pre-Implementación

- [ ] Revisar todos los documentos de guía creados:
  - [ ] `CAMBIOS_PERFILES_KAFKA.md`
  - [ ] `BACKEND_LOGGING_IMPLEMENTATION.md`
  - [ ] `INTEGRACION_GUIDE.md`
  - [ ] `RESUMEN_VISUAL_CAMBIOS.md`

- [ ] Hacer backup del código actual
  ```bash
  git checkout -b backup-pre-integracion
  git add .
  git commit -m "Backup antes de integración de cambios"
  git checkout feat/migrate-vite-to-next
  ```

---

## 📦 Instalación de Dependencias

- [ ] Instalar jsPDF
  ```bash
  npm install jspdf
  ```

- [ ] Verificar que estén instaladas:
  - [ ] `lucide-react`
  - [ ] `sonner`
  - [ ] `react-router-dom` (o tu sistema de routing)

---

## 🖼️ Assets

- [ ] Agregar logo de Huahuacuna
  - Ruta: `/public/logo-huahuacuna.png`
  - Dimensiones: 500x200px (recomendado)
  - Formato: PNG con transparencia

---

## 🔧 Integración Frontend

### App.tsx / Routing Principal

- [ ] Importar componentes nuevos:
  ```typescript
  import { UserManagementPage } from './components/admin/UserManagementPage';
  import { PadrinoDocuments } from './components/profile/PadrinoDocuments';
  ```

- [ ] Agregar casos de navegación:
  - [ ] `case 'user-management':`
  - [ ] `case 'my-documents':`

- [ ] Actualizar componentes existentes con `onNavigate`:
  - [ ] `<AdminManagementPage onNavigate={setCurrentPage} />`
  - [ ] `<UserManagementPage onNavigate={setCurrentPage} />`
  - [ ] `<PadrinoDocuments onNavigate={setCurrentPage} />`

### Header Component

- [ ] Verificar que Header se muestre cuando usuario está logueado
- [ ] Permitir navegación al inicio sin cerrar sesión
- [ ] Validar que sea visible en todas las vistas autenticadas

### SuperAdminDashboard

- [ ] Cambiar navegación de "Gestión de Usuarios" a `'user-management'`
- [ ] Verificar que no aparezcan módulos eliminados

### PadrinoDashboard

- [ ] Cambiar navegación de "Documentos" a `'my-documents'`
- [ ] Verificar validación de mensajes (solo con niño apadrinado)

---

## 🗄️ Backend

### Endpoint de Logging

- [ ] Crear tabla `frontend_error_logs` en base de datos
  ```sql
  -- Ver script completo en BACKEND_LOGGING_IMPLEMENTATION.md
  ```

- [ ] Implementar servicio `FrontendErrorLogService`
- [ ] Implementar controller `LogsController`
- [ ] Crear rutas en `logs.routes.ts`
- [ ] Registrar rutas en app principal:
  ```typescript
  app.use('/api/logs', logsRoutes);
  ```

- [ ] Configurar variables de entorno:
  ```env
  LOG_LEVEL=info
  FRONTEND_ERROR_LOGGING_ENABLED=true
  SLACK_WEBHOOK_URL=https://hooks.slack.com/...  # Opcional
  ```

### Testing del Endpoint

- [ ] Test con curl:
  ```bash
  curl -X POST http://localhost:4000/api/logs/frontend-error \
    -H "Content-Type: application/json" \
    -d '{"topic":"test","payload":{},"error":{"message":"test"},"timestamp":"2025-12-02T00:00:00Z","userAgent":"test"}'
  ```

- [ ] Verificar respuesta exitosa
- [ ] Verificar que se guarde en base de datos

---

## 🧪 Testing Frontend

### Super Admin

- [ ] Login como super admin
- [ ] Verificar dashboard limpio (sin módulos eliminados)
- [ ] Click en "Gestión de Usuarios"
  - [ ] Página carga correctamente
  - [ ] Botón "Volver" funciona
  - [ ] Puede crear usuario
  - [ ] Puede activar/desactivar
  - [ ] Filtros funcionan

- [ ] Click en "Gestión de Administradores"
  - [ ] Página carga correctamente
  - [ ] Botón "Volver" funciona
  - [ ] Puede crear admin

- [ ] Click en "Gestión de Donaciones"
  - [ ] No hay headers duplicados
  - [ ] Botón "Volver" funciona
  - [ ] Puede exportar

- [ ] Click en "Gestión de Voluntarios"
  - [ ] No hay headers duplicados
  - [ ] Botón "Volver" funciona

### Admin

- [ ] Login como admin
- [ ] Verificar acceso a funciones según permisos
- [ ] Botones "Volver" funcionan en todas las páginas

### Padrino

- [ ] Login como padrino CON niño apadrinado
  - [ ] Dashboard muestra información del niño
  - [ ] Puede acceder a "Mensajes"
  - [ ] Click en "Documentos"
    - [ ] Página carga
    - [ ] Botón "Volver" funciona
    - [ ] Puede generar PDF
    - [ ] PDF contiene logo ✅
    - [ ] PDF contiene datos correctos ✅

- [ ] Login como padrino SIN niño apadrinado
  - [ ] Dashboard muestra CTA para apadrinar
  - [ ] Mensajes muestra error/toast
  - [ ] Otros módulos funcionan

### Navegación General

- [ ] Header visible en todas las vistas (cuando logueado)
- [ ] Puede navegar al inicio sin logout
- [ ] Todos los botones "Volver" están presentes
- [ ] No hay headers duplicados en ninguna página
- [ ] Transitions suaves entre páginas

---

## 🔍 Testing de Kafka Logging

- [ ] Provocar error de Kafka (ej: timeout)
- [ ] Verificar consola del navegador:
  ```
  [ApiClient] sendToKafka - Topic: xxx
  [ApiClient] Request Error: ...
  ```

- [ ] Verificar que se envíe a backend
- [ ] Verificar log en base de datos
- [ ] Si configurado, verificar alerta (Slack/Email)

---

## 📊 Testing de Certificados PDF

- [ ] Descargar certificado
- [ ] Abrir PDF
- [ ] Verificar elementos:
  - [ ] Logo de Huahuacuna visible
  - [ ] Nombre del padrino correcto
  - [ ] Cédula del padrino correcta
  - [ ] Año de donación correcto
  - [ ] Monto en números correcto
  - [ ] Monto en letras correcto
  - [ ] Fecha actual correcta
  - [ ] Formato profesional

---

## 🎨 Testing Responsive

- [ ] Desktop (1920x1080)
  - [ ] Dashboard super admin
  - [ ] Dashboard padrino
  - [ ] Gestión de usuarios
  - [ ] Documentos

- [ ] Tablet (768px)
  - [ ] Todas las páginas se adaptan
  - [ ] Grids se reorganizan

- [ ] Mobile (375px)
  - [ ] Navegación funciona
  - [ ] Botones accesibles
  - [ ] Textos legibles

---

## 🔒 Testing de Permisos

- [ ] Usuario no autenticado no puede acceder a páginas protegidas
- [ ] Padrino no puede acceder a páginas de admin
- [ ] Admin no puede acceder a páginas de super admin
- [ ] Super admin puede acceder a todo

---

## 🐛 Testing de Errores

- [ ] Error de red: muestra mensaje apropiado
- [ ] Timeout de Kafka: se registra correctamente
- [ ] PDF sin logo: maneja gracefully
- [ ] Datos faltantes: muestra placeholders

---

## 📝 Documentación

- [ ] Actualizar README.md con nuevas funcionalidades
- [ ] Documentar endpoints nuevos en API docs
- [ ] Agregar screenshots de nuevas páginas
- [ ] Actualizar guía de usuario

---

## 🚀 Deployment

### Pre-Deploy

- [ ] Todos los tests pasan ✅
- [ ] No hay console.errors en producción
- [ ] Build se genera sin errores:
  ```bash
  npm run build
  ```

- [ ] Verificar tamaño del bundle
- [ ] Optimizar imágenes si es necesario

### Variables de Entorno

- [ ] Configurar en producción:
  ```env
  NEXT_PUBLIC_API_BASE_URL=https://api.huahuacuna.org
  ```

- [ ] Backend configurado con:
  ```env
  FRONTEND_ERROR_LOGGING_ENABLED=true
  SLACK_WEBHOOK_URL=...
  ```

### Deploy Backend

- [ ] Migrar base de datos:
  ```bash
  npx prisma migrate deploy
  ```

- [ ] Verificar endpoint de logging activo
- [ ] Verificar CORS configurado

### Deploy Frontend

- [ ] Deploy a staging
- [ ] Smoke tests en staging
- [ ] Deploy a producción
- [ ] Smoke tests en producción

---

## 📊 Post-Deploy Monitoring

### Primera Hora

- [ ] Verificar logs de errores
- [ ] Verificar métricas de uso
- [ ] Monitorear alertas

### Primer Día

- [ ] Revisar feedback de usuarios
- [ ] Verificar generación de certificados
- [ ] Revisar logs de Kafka
- [ ] Verificar performance

### Primera Semana

- [ ] Recopilar métricas:
  - Errores de Kafka
  - Certificados generados
  - Usuarios creados
  - Navegación más usada

- [ ] Ajustes basados en uso real

---

## 🎯 Métricas de Éxito

- [ ] **Reducción de Errores:** Baseline establecido
- [ ] **Satisfacción del Usuario:** Encuesta enviada
- [ ] **Performance:** Tiempo de carga < 3s
- [ ] **Certificados:** Generación exitosa > 95%
- [ ] **Logging:** Captura de errores > 90%

---

## 📞 Contactos de Soporte

Si hay problemas durante la integración:

1. **Frontend Issues:**
   - Revisar consola del navegador
   - Verificar network tab
   - Revisar documentos de guía

2. **Backend Issues:**
   - Revisar logs del servidor
   - Verificar base de datos
   - Verificar endpoints activos

3. **PDF Generation:**
   - Verificar logo existe
   - Verificar datos del usuario
   - Revisar consola de jsPDF

---

## ✨ Finalización

- [ ] Todos los items del checklist completados
- [ ] Documentación actualizada
- [ ] Tests pasando
- [ ] Deploy exitoso
- [ ] Usuarios notificados de cambios

### Celebrar 🎉

- [ ] Todo funcionando correctamente
- [ ] Usuarios satisfechos
- [ ] Sistema más robusto
- [ ] Mejor experiencia de usuario

---

**Fecha de Inicio:** _______________
**Fecha de Finalización:** _______________
**Responsable:** _______________

**Notas Adicionales:**
_______________________________________________
_______________________________________________
_______________________________________________
