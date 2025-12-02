# Instrucciones para Backend - Sistema de Logging de Errores de Kafka

## Objetivo
Implementar un endpoint que reciba y almacene errores que ocurren en el frontend cuando se realizan peticiones a través de Kafka, permitiendo un mejor monitoreo y debugging del sistema.

---

## 📡 Endpoint Requerido

### **POST /api/logs/frontend-error**

**Descripción:** Recibe errores del frontend relacionados con peticiones Kafka fallidas.

**Headers:**
```
Content-Type: application/json
```

**Body (TypeScript Interface):**
```typescript
interface FrontendErrorLog {
  topic: string;           // Topic de Kafka que falló
  payload: any;            // Payload que se intentó enviar
  error: {
    message: string;       // Mensaje de error
    code?: string;         // Código de error (opcional)
    details?: any;         // Detalles adicionales
  };
  timestamp: string;       // ISO 8601 timestamp
  userAgent: string;       // User agent del navegador
}
```

**Ejemplo de Request:**
```json
{
  "topic": "apadrinamiento_children_create",
  "payload": {
    "nombre": "Juan Pérez",
    "edad": 8,
    "grado": "3ro Primaria"
  },
  "error": {
    "message": "Network timeout after 30s",
    "code": "TIMEOUT",
    "details": {
      "timeout": 30000
    }
  },
  "timestamp": "2025-12-02T15:30:45.123Z",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Error logged successfully",
  "logId": "log_12345"
}
```

**Response Error (500):**
```json
{
  "success": false,
  "error": {
    "message": "Failed to save error log",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## 🗄️ Modelo de Base de Datos Sugerido

### Tabla: `frontend_error_logs`

```sql
CREATE TABLE frontend_error_logs (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT NOT NULL,
  error_code VARCHAR(100),
  error_details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  user_id INTEGER REFERENCES users(id),  -- Si está autenticado
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by INTEGER REFERENCES users(id),
  notes TEXT
);

-- Índices para mejorar performance
CREATE INDEX idx_frontend_errors_topic ON frontend_error_logs(topic);
CREATE INDEX idx_frontend_errors_timestamp ON frontend_error_logs(timestamp);
CREATE INDEX idx_frontend_errors_created_at ON frontend_error_logs(created_at);
CREATE INDEX idx_frontend_errors_resolved ON frontend_error_logs(resolved);
CREATE INDEX idx_frontend_errors_error_code ON frontend_error_logs(error_code);
```

---

## 🔧 Implementación Sugerida (Node.js/Express)

### Controller: `logsController.ts`

```typescript
import { Request, Response } from 'express';
import { FrontendErrorLogService } from '../services/frontendErrorLog.service';

export class LogsController {
  private errorLogService: FrontendErrorLogService;

  constructor() {
    this.errorLogService = new FrontendErrorLogService();
  }

  async logFrontendError(req: Request, res: Response) {
    try {
      const {
        topic,
        payload,
        error,
        timestamp,
        userAgent
      } = req.body;

      // Validación básica
      if (!topic || !payload || !error || !timestamp) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'VALIDATION_ERROR'
          }
        });
      }

      // Extraer información adicional del request
      const userId = req.user?.id; // Si hay autenticación
      const sessionId = req.session?.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Guardar log en base de datos
      const log = await this.errorLogService.create({
        topic,
        payload,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        timestamp: new Date(timestamp),
        userAgent,
        userId,
        sessionId,
        ipAddress
      });

      // Enviar alerta si es crítico (opcional)
      if (this.isCriticalError(error.code)) {
        await this.sendAlert(log);
      }

      return res.status(200).json({
        success: true,
        message: 'Error logged successfully',
        logId: log.id
      });

    } catch (err) {
      console.error('Error saving frontend error log:', err);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to save error log',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  private isCriticalError(errorCode?: string): boolean {
    const criticalCodes = [
      'TIMEOUT',
      'NETWORK_ERROR',
      'HTTP_500',
      'HTTP_503'
    ];
    return errorCode ? criticalCodes.includes(errorCode) : false;
  }

  private async sendAlert(log: any): Promise<void> {
    // Implementar integración con:
    // - Slack
    // - Email
    // - SMS
    // - Sentry
    // - DataDog
    console.log('🚨 CRITICAL ERROR:', {
      topic: log.topic,
      error: log.errorMessage,
      timestamp: log.timestamp
    });
  }
}
```

### Service: `frontendErrorLog.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateErrorLogDTO {
  topic: string;
  payload: any;
  errorMessage: string;
  errorCode?: string;
  errorDetails?: any;
  timestamp: Date;
  userAgent: string;
  userId?: number;
  sessionId?: string;
  ipAddress?: string;
}

export class FrontendErrorLogService {
  async create(data: CreateErrorLogDTO) {
    return await prisma.frontendErrorLog.create({
      data: {
        topic: data.topic,
        payload: data.payload,
        errorMessage: data.errorMessage,
        errorCode: data.errorCode,
        errorDetails: data.errorDetails,
        timestamp: data.timestamp,
        userAgent: data.userAgent,
        userId: data.userId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
      }
    });
  }

  async findRecent(limit: number = 100) {
    return await prisma.frontendErrorLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async findByTopic(topic: string, limit: number = 50) {
    return await prisma.frontendErrorLog.findMany({
      where: { topic },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUnresolved() {
    return await prisma.frontendErrorLog.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsResolved(id: number, resolvedBy: number, notes?: string) {
    return await prisma.frontendErrorLog.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        notes
      }
    });
  }

  async getStatistics(startDate: Date, endDate: Date) {
    const errors = await prisma.frontendErrorLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Agrupar por topic
    const byTopic = errors.reduce((acc, err) => {
      acc[err.topic] = (acc[err.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por código de error
    const byErrorCode = errors.reduce((acc, err) => {
      const code = err.errorCode || 'UNKNOWN';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
      byTopic,
      byErrorCode
    };
  }
}
```

### Routes: `logs.routes.ts`

```typescript
import { Router } from 'express';
import { LogsController } from '../controllers/logs.controller';

const router = Router();
const logsController = new LogsController();

// Endpoint público (sin autenticación) para recibir logs
router.post('/frontend-error', (req, res) => 
  logsController.logFrontendError(req, res)
);

// Endpoints protegidos para admin
router.get('/frontend-errors/recent', 
  authenticate, 
  authorizeAdmin,
  (req, res) => logsController.getRecentErrors(req, res)
);

router.get('/frontend-errors/unresolved',
  authenticate,
  authorizeAdmin,
  (req, res) => logsController.getUnresolvedErrors(req, res)
);

router.patch('/frontend-errors/:id/resolve',
  authenticate,
  authorizeAdmin,
  (req, res) => logsController.resolveError(req, res)
);

router.get('/frontend-errors/statistics',
  authenticate,
  authorizeAdmin,
  (req, res) => logsController.getStatistics(req, res)
);

export default router;
```

### Registro en app principal: `app.ts`

```typescript
import logsRoutes from './routes/logs.routes';

// ...

app.use('/api/logs', logsRoutes);
```

---

## 📊 Dashboard de Monitoreo (Opcional)

Crear una página en el admin para visualizar errores:

### Endpoints adicionales para dashboard:

1. **GET /api/logs/frontend-errors/recent**
   - Lista los últimos 100 errores
   
2. **GET /api/logs/frontend-errors/unresolved**
   - Lista errores no resueltos
   
3. **GET /api/logs/frontend-errors/statistics**
   - Estadísticas agrupadas por topic, código de error, etc.
   
4. **PATCH /api/logs/frontend-errors/:id/resolve**
   - Marca un error como resuelto

---

## 🔔 Integración con Servicios de Alerta

### Slack Webhook:

```typescript
async function sendSlackAlert(log: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: '🚨 Critical Frontend Error',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Topic:* ${log.topic}\n*Error:* ${log.errorMessage}\n*Time:* ${log.timestamp}`
          }
        }
      ]
    })
  });
}
```

### Sentry:

```typescript
import * as Sentry from '@sentry/node';

async function sendToSentry(log: any) {
  Sentry.captureException(new Error(log.errorMessage), {
    tags: {
      topic: log.topic,
      errorCode: log.errorCode
    },
    extra: {
      payload: log.payload,
      errorDetails: log.errorDetails
    }
  });
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `frontend_error_logs` en la base de datos
- [ ] Implementar `FrontendErrorLogService`
- [ ] Implementar `LogsController`
- [ ] Crear rutas en `logs.routes.ts`
- [ ] Registrar rutas en app principal
- [ ] Agregar variables de entorno necesarias
- [ ] Implementar sistema de alertas (Slack/Email)
- [ ] Testing del endpoint
- [ ] Documentar en Swagger/OpenAPI
- [ ] Configurar monitoreo (opcional)
- [ ] Crear dashboard de visualización (opcional)

---

## 🧪 Testing

```bash
# Test del endpoint
curl -X POST http://localhost:4000/api/logs/frontend-error \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test_topic",
    "payload": {"test": "data"},
    "error": {
      "message": "Test error",
      "code": "TEST_ERROR"
    },
    "timestamp": "2025-12-02T15:30:45.123Z",
    "userAgent": "Test Agent"
  }'
```

---

## 📝 Variables de Entorno

Agregar a `.env`:

```env
# Logging Configuration
LOG_LEVEL=info
FRONTEND_ERROR_LOGGING_ENABLED=true

# Alerting (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SENTRY_DSN=https://your-sentry-dsn

# Email Alerts (opcional)
ALERT_EMAIL=alerts@huahuacuna.org
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
