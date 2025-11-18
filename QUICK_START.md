# 🚀 Quick Start - Integración Backend

## ⚡ Inicio Rápido (3 pasos)

### 1. Configurar Backend URL
```bash
# Editar .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000" > .env.local
```

### 2. Iniciar Desarrollo
```bash
npm run dev
```

### 3. Usar en tu Código
```typescript
import { useBitacora } from '@/contexts/BitacoraContext';

function MyComponent() {
  const { addChild } = useBitacora();
  
  const crear = async () => {
    await addChild({
      nombre: 'Juan',
      apellidos: 'Pérez',
      fechaNacimiento: '2015-05-20',
      edad: 9,
      genero: 'masculino',
      municipio: 'Armenia',
      direccion: 'Calle 10 #5-23',
      institucion: 'Colegio X',
      grado: '4°',
      foto: 'https://...',
      historia: '...',
      suenos: '...',
      situacionFamiliar: '...',
      necesidades: [],
      estadoApadrinamiento: 'disponible',
      jornada: 'mañana'
    });
  };
}
```

---

## 🧪 Probar Endpoint

```bash
# Probar sin frontend
BACKEND_URL=http://localhost:4000 TOKEN=tu-token node test-api.js
```

---

## 📚 Documentación Completa

- **[API_IMPLEMENTATION.md](./API_IMPLEMENTATION.md)** - Guía completa con ejemplos
- **[INTEGRATION.md](./INTEGRATION.md)** - Documentación técnica detallada
- **[INTEGRATION_SUMMARY.txt](./INTEGRATION_SUMMARY.txt)** - Resumen ejecutivo

---

## ✅ ¿Qué está implementado?

- ✅ Endpoint: **Crear Niño** (`apadrinamiento_children_create`)
- ✅ Cliente HTTP con autenticación automática
- ✅ Validaciones del lado del cliente
- ✅ Mapeo automático de datos (local ↔ API)
- ✅ Manejo de errores con fallback
- ✅ TypeScript types completos
- ✅ Documentación y ejemplos

---

## 🎯 Formato del Endpoint

**Kafka Topic:** `apadrinamiento_children_create`

**Request:**
```json
{
  "dto": {
    "firstName": "Juan",
    "lastName": "Pérez López",
    "dateOfBirth": "2015-05-20",
    "gender": "MALE",
    "municipality": "Armenia",
    "shortDescription": "Sueños...",
    "fullStory": "Historia completa...",
    "address": "Calle 10 #5-23",
    "photo": "https://...",
    "photos": ["https://..."]
  },
  "userId": 1
}
```

**Response:**
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez López",
  "dateOfBirth": "2015-05-20",
  "gender": "MALE",
  "municipality": "Armenia",
  "shortDescription": "Sueños...",
  "fullStory": "Historia completa...",
  "createdAt": "2025-11-18T03:20:29.923Z",
  "updatedAt": "2025-11-18T03:20:29.923Z"
}
```

---

## 🔧 Archivos Importantes

```
src/
├── lib/
│   └── api-client.ts              # Cliente HTTP base
├── types/
│   └── api.types.ts               # Tipos TypeScript
├── services/
│   └── apadrinamiento.service.ts  # Servicio de API
└── contexts/
    └── BitacoraContext.tsx        # Context integrado
```

---

## 💡 Tips

1. **Token de autenticación**: Se lee automáticamente de `localStorage.getItem('token')`
2. **Validaciones**: Todas automáticas antes de enviar
3. **Fallback**: Si falla la API, usa mock data en desarrollo
4. **Debugging**: Revisar Network tab en DevTools

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Usuario no autenticado" | Verificar que `localStorage.getItem('token')` existe |
| "NETWORK_ERROR" | Verificar que backend esté corriendo en la URL configurada |
| Error de validación | Revisar mensajes en consola, ajustar datos según validaciones |
| CORS error | Configurar CORS en el backend |

---

## ✨ ¡Listo para usar!

Todo está configurado y funcionando. Lee la documentación completa en:
- `API_IMPLEMENTATION.md` para ejemplos prácticos
- `INTEGRATION.md` para detalles técnicos
