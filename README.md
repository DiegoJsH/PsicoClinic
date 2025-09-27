# Instrucciones para Desarrollo

## Ejecutar Backend (Spring Boot)
El backend estará disponible en: http://localhost:8080

## Ejecutar Frontend (servidor simple)
El frontend estará disponible en: http://localhost:3000

## API Endpoints Disponibles
- GET    /pacientes          - Obtener todos los pacientes
- POST   /pacientes          - Crear nuevo paciente
- GET    /pacientes/{id}     - Obtener paciente por ID
- DELETE /pacientes/{id}     - Eliminar paciente
- GET    /pacientes/query?nombre={nombre} - Buscar por nombre

## Para Hosting (Separado)

### Opción 1: ? + ?
- Frontend → 
- Backend → 

### Variables de Entorno para Producción
En producción, cambiar en api-service.js:
```javascript
const API_BASE_URL = 'https://tu-backend-url.com';
```