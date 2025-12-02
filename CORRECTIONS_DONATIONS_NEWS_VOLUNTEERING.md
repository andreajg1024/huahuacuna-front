# Correcciones de Donations, News y Volunteering

## ✅ Problemas Identificados y Soluciones

### 1. **Donations (DonationsContext.tsx)**

#### Discrepancias Frontend → Backend
```typescript
// ❌ ANTES (Frontend)
donorIdType: string;
donorId: string;
donorIdNumber: string;

// ✅ DESPUÉS (Backend espera)
donorDocumentType: string;
donorUserId?: number; // opcional
donorDocument: string;
```

#### Solución
1. Crear mapper bidireccional `mapDonationToCreateDTO()` y `mapDonationResponseToDonation()`
2. Cambiar `addDonation()` de síncrono a asíncrono
3. Integrar con `donationsService.createMonetaryDonation()`
4. Agregar logging de payload size

---

### 2. **News (NewsContext.tsx)**

#### Discrepancias Frontend → Backend
```typescript
// ❌ ANTES (Frontend)
status: 'borrador' | 'programado' | 'publicado' | 'archivado'
visibility: 'publico' | 'privado' | 'protegido'

// ✅ DESPUÉS (Backend espera)
status: 'draft' | 'scheduled' | 'published' | 'archived'
visibility: 'public' | 'private' | 'protected'
```

#### Solución
1. **YA EXISTEN** mappers en `news.service.ts`:
   - `mapNewsStatus()`: 'borrador' → 'draft'
   - `mapVisibility()`: 'publico' → 'public'
   - `convertArticleToApiFormat()`: convierte todo el objeto
2. Cambiar `addArticle()` de síncrono a asíncrono
3. Integrar con `newsService.createArticle()`
4. Agregar logging de payload size

---

### 3. **Volunteering (VolunteeringContext.tsx)**

#### Discrepancias Frontend → Backend
```typescript
// ❌ ANTES (Frontend)
nombreCompleto: string;
telefono: string;
areasInteres: VolunteerArea[];
// Faltan campos requeridos

// ✅ DESPUÉS (Backend espera)
fullName: string;
phone: string;
areas: string[];
hasWorkPermit: boolean;  // NUEVO - requerido
acceptedTerms: boolean;  // NUEVO - requerido
privacyConsent: boolean; // NUEVO - requerido
```

#### Solución
1. Crear mapper bidireccional `mapApplicationToCreateDTO()` y `mapApplicationResponseToApplication()`
2. Cambiar `addApplication()` de síncrono a asíncrono
3. Agregar campos faltantes: `hasWorkPermit`, `acceptedTerms`, `privacyConsent`
4. Integrar con `volunteeringService.createApplication()`
5. Agregar logging de payload size

---

## 🔄 Patrón de Implementación

Seguir el mismo patrón usado en **ProjectsContext**:

1. **Importar servicio y tipos** del backend
2. **Crear mapper bidireccional** (Frontend ↔ Backend)
3. **Cambiar método a async** y agregar try-catch
4. **Llamar al servicio** con DTO mapeado
5. **Convertir respuesta** de vuelta a formato local
6. **Agregar logging** de tamaño de payload
7. **Mantener fallback** a localStorage en caso de error

---

## 📝 Notas Importantes

### PayloadTooLargeError Prevention
- ✅ **NO enviar base64** de imágenes (límite 100KB)
- ✅ **Solo enviar URLs** de imágenes
- ✅ **Log payload size** antes de enviar
- ✅ Implementar upload de imágenes a servidor separado (TODO futuro)

### Validaciones Backend
- Donations: Valida `donorDocument`, `amount > 0`, `paymentMethod` válido
- News: Valida `title` (5-200), `excerpt` (20-500), URLs válidas
- Volunteering: Valida `fullName` (3-100), `email` válido, `areas.length > 0`

---

## 🎯 Checklist de Corrección

### Donations
- [ ] Importar `CreateMonetaryDonationDTO` de `@/services/donations.service`
- [ ] Crear `mapDonationToCreateDTO()` con mapeo de campos
- [ ] Crear `mapDonationResponseToDonation()` para respuesta
- [ ] Cambiar `addDonation()` a async
- [ ] Integrar con `donationsService.createMonetaryDonation()`
- [ ] Agregar logging de payload size
- [ ] Probar creación de donación

### News
- [ ] Importar `CreateNewsDTO` de `@/types/api.types`
- [ ] Importar `NewsService` instanciado
- [ ] Usar `newsService.convertArticleToApiFormat()` existente
- [ ] Cambiar `addArticle()` a async
- [ ] Integrar con `newsService.createArticle()`
- [ ] Agregar logging de payload size
- [ ] Probar creación de artículo

### Volunteering
- [ ] Importar `CreateVolunteeringApplicationDTO` de `@/types/api.types`
- [ ] Crear `mapApplicationToCreateDTO()` con TODOS los campos
- [ ] Agregar campos faltantes: `hasWorkPermit`, `acceptedTerms`, `privacyConsent`
- [ ] Crear `mapApplicationResponseToApplication()` para respuesta
- [ ] Cambiar `addApplication()` a async
- [ ] Integrar con `volunteeringService.createApplication()`
- [ ] Agregar logging de payload size
- [ ] Probar creación de aplicación
