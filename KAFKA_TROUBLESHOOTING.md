# 🔍 Diagnóstico Kafka - "Response without match"

## ❌ Error Actual

```
WARN [RequestQueue] Response without match
{
  "timestamp": "2025-12-02T06:05:19.749Z",
  "logger": "kafkajs",
  "clientId": "gateway-apadrinamiento-client",
  "broker": "localhost:9092",
  "correlationId": 1163
}
```

## 🎯 Qué Significa

Este error indica que:
- ✅ El **frontend** envió correctamente la petición
- ✅ El **gateway** la recibió y la envió a Kafka
- ❌ La **respuesta** del microservicio no llegó o no pudo ser correlacionada
- ❌ El **correlationId** no coincide con ninguna petición pendiente

## 🔍 Causas Comunes

### 1. **Microservicio no está corriendo**
```bash
# Verificar que el microservicio de apadrinamiento esté corriendo
ps aux | grep "apadrinamiento"

# O revisar los logs del microservicio
# Deberías ver mensajes como:
# [NestJS] MicroserviceModule dependencies initialized
# [Kafka] Consumer connected to topic: apadrinamiento_children_create
```

### 2. **Timeout de Kafka demasiado corto**
El gateway puede estar esperando menos tiempo del que tarda el microservicio en responder.

**Solución en el Backend (Gateway):**
```typescript
// gateway/src/config/kafka.config.ts
{
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
      requestTimeout: 30000,  // ⬅️ Aumentar a 30 segundos
      retry: {
        retries: 3,
        initialRetryTime: 300,
      },
    },
  },
}
```

### 3. **Microservicio no respondiendo al topic correcto**
Verificar que el microservicio esté escuchando el topic correcto:

```typescript
// En el microservicio de apadrinamiento
@MessagePattern('apadrinamiento_children_create')  // ⬅️ Debe coincidir exactamente
async createChild(@Payload() data: any) {
  const { dto, userId } = data;
  // ...
  return childResponse; // ⬅️ DEBE retornar algo
}
```

### 4. **Error en el microservicio sin capturar**
Si el microservicio lanza una excepción no capturada, puede no enviar respuesta.

**Verificar logs del microservicio:**
```bash
# Deberías ver:
[ApadrinamientoService] Received message: apadrinamiento_children_create
[ApadrinamientoService] Creating child: { dto: {...}, userId: 1 }
[ApadrinamientoService] Child created successfully

# Si ves un error aquí, el microservicio está fallando
```

## ✅ Checklist de Diagnóstico

### En el Backend (Gateway)
- [ ] Verificar que Kafka esté corriendo: `docker ps | grep kafka`
- [ ] Verificar logs del gateway: `npm run start:dev` en la carpeta del gateway
- [ ] Ver si llega la petición al gateway: Debería haber un log `[Kafka] Sending to topic: apadrinamiento_children_create`
- [ ] Verificar timeout de Kafka en `kafka.config.ts`

### En el Microservicio de Apadrinamiento
- [ ] Verificar que el microservicio esté corriendo: `ps aux | grep apadrinamiento`
- [ ] Ver logs del microservicio: `npm run start:dev` en la carpeta del microservicio
- [ ] Verificar que el topic coincida exactamente: `apadrinamiento_children_create`
- [ ] Confirmar que el handler devuelve una respuesta: `return childResponse;`
- [ ] Revisar si hay excepciones no capturadas

### En el Frontend (Ya Corregido)
- [x] Cambiado de REST a Kafka: `apiClient.sendToKafka()`
- [x] Topic correcto: `KafkaTopic.CHILDREN_CREATE`
- [x] Payload correcto: `{ dto, userId }`
- [x] Timeout aumentado a 30 segundos
- [x] Logging completo agregado

## 🛠️ Soluciones Rápidas

### Solución 1: Reiniciar el Microservicio
```bash
# Detener el microservicio
pm2 stop apadrinamiento-service
# O si usas npm:
# pkill -f "apadrinamiento"

# Reiniciar
cd /path/to/apadrinamiento-microservice
npm run start:dev
```

### Solución 2: Verificar Kafka
```bash
# Entrar al contenedor de Kafka
docker exec -it kafka bash

# Listar topics
kafka-topics --list --bootstrap-server localhost:9092

# Ver mensajes en el topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic apadrinamiento_children_create --from-beginning
```

### Solución 3: Aumentar Timeout del Gateway
Editar `gateway/src/config/kafka.config.ts`:

```typescript
{
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
      requestTimeout: 60000,  // ⬅️ Aumentar a 60 segundos
      retry: {
        retries: 5,
        initialRetryTime: 500,
        maxRetryTime: 5000,
      },
    },
    consumer: {
      groupId: 'gateway-apadrinamiento-consumer',
      retry: {
        retries: 10,
      },
    },
  },
}
```

### Solución 4: Agregar Logging en el Microservicio
```typescript
// En el microservicio de apadrinamiento
@MessagePattern('apadrinamiento_children_create')
async createChild(@Payload() data: any) {
  console.log('[MICROSERVICE] ✅ Received message:', data);
  
  try {
    const { dto, userId } = data;
    console.log('[MICROSERVICE] 📝 Creating child:', dto);
    
    const child = await this.childrenService.create(dto, userId);
    
    console.log('[MICROSERVICE] ✅ Child created:', child.id);
    return child; // ⬅️ IMPORTANTE: Retornar la respuesta
    
  } catch (error) {
    console.error('[MICROSERVICE] ❌ Error creating child:', error);
    throw new RpcException({
      message: error.message,
      code: 'CREATE_CHILD_ERROR',
    });
  }
}
```

## 📊 Logs Esperados

### Frontend (Consola del Navegador)
```
[ChildForm] Enviando datos: { firstName: "Juan", ... }
[ChildForm] Tamaño aproximado: 523 bytes
[BitacoraContext] addChild - DTO recibido: { firstName: "Juan", ... }
[BitacoraContext] Tamaño del payload: 523 bytes
[ApadrinamientoService] createChild - Start { dto: {...}, userId: 0 }
[ApadrinamientoService] Payload size: 536 bytes
[ApadrinamientoService] Sending to Kafka topic: apadrinamiento_children_create
[ApiClient] sendToKafka - Topic: apadrinamiento_children_create
[ApiClient] sendToKafka - Payload: { dto: {...}, userId: 0 }
[ApiClient] sendToKafka - Payload size: 536 bytes
[ApiClient] Request: POST http://localhost:4000/kafka/apadrinamiento_children_create
[ApiClient] Response: { status: 201, ok: true, data: {...} }
[ApadrinamientoService] createChild - Response received in 1245ms: {...}
```

### Backend Gateway (Consola del Servidor)
```
[Nest] INFO [RouterExplorer] Mapped {/kafka/apadrinamiento_children_create, POST}
[Nest] INFO [KafkaController] Received Kafka request: apadrinamiento_children_create
[Nest] INFO [KafkaService] Sending to topic: apadrinamiento_children_create
[Nest] INFO [KafkaService] Response received: { id: 123, firstName: "Juan", ... }
```

### Microservicio Apadrinamiento (Consola del Microservicio)
```
[Nest] INFO [NestMicroservice] Microservice is listening
[Nest] INFO [ServerKafka] Kafka consumer connected
[MICROSERVICE] ✅ Received message: { dto: {...}, userId: 0 }
[MICROSERVICE] 📝 Creating child: { firstName: "Juan", ... }
[MICROSERVICE] ✅ Child created: 123
```

## 🚨 Si Nada Funciona

1. **Verificar que todos los servicios estén corriendo:**
   ```bash
   docker ps  # Kafka debe estar running
   ps aux | grep node  # Gateway y microservicio deben estar activos
   ```

2. **Ver todos los logs en tiempo real:**
   ```bash
   # Terminal 1: Gateway
   cd /path/to/gateway && npm run start:dev
   
   # Terminal 2: Microservicio
   cd /path/to/apadrinamiento-service && npm run start:dev
   
   # Terminal 3: Frontend
   cd /path/to/frontend && npm run dev
   ```

3. **Probar con Postman/curl directamente al gateway:**
   ```bash
   curl -X POST http://localhost:4000/kafka/apadrinamiento_children_create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "dto": {
         "firstName": "Test",
         "lastName": "User",
         "dateOfBirth": "2015-01-01",
         "gender": "MALE",
         "municipality": "Armenia",
         "shortDescription": "Test",
         "fullStory": "Test story"
       },
       "userId": 1
     }'
   ```

## 📞 Próximos Pasos

1. Verifica los logs del **gateway** y del **microservicio**
2. Confirma que el microservicio esté escuchando en el topic correcto
3. Asegúrate de que el microservicio **retorne** una respuesta
4. Si es necesario, aumenta el timeout de Kafka a 60 segundos
5. Reporta qué logs ves en cada servicio para diagnóstico adicional
