# Instrucciones para Desarrollo

## Ejecutar Backend (Spring Boot)
El backend estará disponible en: http://localhost:8080

## Ejecutar Frontend (servidor simple)
El frontend estará disponible en: http://localhost:3000

## API Endpoints Disponibles Ejemplo:
- GET    /pacientes          - Obtener todos los pacientes
- POST   /pacientes          - Crear nuevo paciente
- GET    /pacientes/{id}     - Obtener paciente por ID
- DELETE /pacientes/{id}     - Eliminar paciente
- GET    /pacientes/query?nombre={nombre} - Buscar por nombre

### Variables de Entorno para Producción
En producción, cambiar en 'modulo'-service.js:
- Para trabajar utilizando render (repositorio github)
```javascript
const API_BASE_URL = 'https://springbootpsicoclinic.onrender.com';
```
- Para trabajar de manera local
```javascript
const API_BASE_URL = 'http://localhost:8080';
```