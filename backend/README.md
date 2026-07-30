# Aztec PM - Backend

Este es el servicio backend para Aztec Project Management, construido con **Python 3.13** y **FastAPI**.

## Arquitectura

Implementamos **Clean Architecture (Arquitectura Limpia)** para asegurar que la lógica de negocio central esté completamente aislada de frameworks externos, bases de datos y mecanismos de entrega.

### Estructura en Capas
- **Core (`core/`):** Contiene los modelos de dominio, excepciones personalizadas y el `RiskEngineService`, el cual ejecuta la lógica de negocio para calcular los riesgos del portafolio sin depender de ningún detalle específico de la base de datos.
- **Application (`application/`):** Contiene los Casos de Uso (ej., `ProjectService`, `TaskService`). Estos servicios orquestan el flujo de datos entre las interfaces del repositorio y la lógica de negocio central.
- **Infrastructure (`infrastructure/`):** Implementa el acceso a la base de datos utilizando `SQLAlchemy` (asíncrono), `Alembic` para las migraciones y PostgreSQL. Contiene los repositorios concretos (ej., `SQLAlchemyProjectRepository`).
- **API (`api/`):** El mecanismo de entrega. Routers de FastAPI, modelos de petición/respuesta (Pydantic) y las definiciones de inyección de dependencias.

### ¿Por qué Clean Architecture?
1. **Testabilidad:** Podemos probar el `RiskEngineService` de forma completamente aislada de la base de datos.
2. **Mantenibilidad:** A medida que Aztec PM escale, podemos cambiar la base de datos subyacente o el framework web sin tocar las reglas de negocio.
3. **Separación de Responsabilidades:** Los desarrolladores saben exactamente dónde colocar las reglas de negocio versus las consultas a la base de datos.

## Motor de Riesgos (Risk Engine) y Priorización

El `RiskEngineService` ejecuta un algoritmo de priorización ponderado. Analiza métricas como la cantidad de tareas vencidas y los estados bloqueados para asignar un puntaje de riesgo (`risk_score`) y un nivel de riesgo (`risk_level`: Bajo, Medio, Alto). Este cálculo se ejecuta automáticamente al crear y actualizar proyectos.

## Configuración y Ejecución

El backend está diseñado para ser ejecutado a través de Docker Compose desde el directorio raíz:

```bash
docker compose up --build backend
```

Durante el arranque, el script `entrypoint.sh` ejecuta automáticamente las migraciones de Alembic y corre `seed.py`, el cual puebla la base de datos utilizando el archivo Excel original de Aztec proporcionado.

## Pruebas (Testing)

Las pruebas están escritas utilizando `pytest` y `httpx` para pruebas de API asíncronas, usando una base de datos en memoria `aiosqlite` aislada para prevenir efectos secundarios.

Para correr la suite de pruebas localmente (asumiendo que hay un entorno virtual activo y las dependencias están instaladas):

```bash
pytest
```
