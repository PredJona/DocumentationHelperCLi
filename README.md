# DocumentationHelperCLi (`doccontext`)

`doccontext` es una herramienta CLI para analizar la salud y calidad de la documentación en repositorios y proyectos Node.js y TypeScript. Escanea la estructura del proyecto, inspecciona archivos Markdown, detecta enlaces rotos, evalúa la cobertura de scripts y variables de entorno, y calcula una puntuación general de calidad documental de 0 a 100.

## Qué resuelve

Manejar la documentación en proyectos de software en evolución suele generar desfases y descuidos. `doccontext` automatiza la verificación de:
- **Existencia de documentación base:** Asegura la presencia de un archivo `README.md`.
- **Integridad de enlaces (`DOC002`):** Detecta enlaces locales rotos dentro de los archivos Markdown (incluyendo soporte para anclas y parámetros de búsqueda).
- **Sincronización de scripts (`DOC003`, `DOC006`):** Verifica que los scripts definidos en `package.json` estén documentados en el README y, a su vez, que los scripts mencionados en el README existan realmente en `package.json`.
- **Variables de entorno (`DOC004`):** Identifica variables de entorno utilizadas en el código (`process.env.*`) que no estén declaradas en el archivo `.env.example`.
- **Versión de Node.js (`DOC005`):** Alerta sobre contradicciones entre la versión de Node.js mencionada en la documentación y las configuraciones del proyecto (`package.json`, `.nvmrc` o `Dockerfile`).
- **Calidad mínima del README (`DOC007`):** Recomienda mejoras si el README está vacío, es demasiado corto o carece de instrucciones básicas de instalación y uso.

## Instalación local

Puedes instalar y ejecutar `doccontext` localmente clonando el repositorio:

```bash
git clone https://github.com/PredJona/DocumentationHelperCLi.git
cd DocumentationHelperCLi
npm install
npm run build
```

Una vez compilado, puedes usar el CLI mediante el script de desarrollo o directamente desde la carpeta `dist`:

```bash
node dist/index.js analyze .
```

## Uso de `analyze`

El comando principal es `analyze`, el cual toma una ruta opcional al directorio que deseas analizar (por defecto usa el directorio actual `.`).

```bash
# Analizar el directorio actual
node dist/index.js analyze .

# Analizar un subdirectorio específico con salida JSON
node dist/index.js analyze ./mi-proyecto --format json

# Mostrar información detallada de archivo y evidencia
node dist/index.js analyze . --verbose
```

### Opciones del comando

| Opción | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `-f, --format <type>` | Formato de salida de los resultados (`text` o `json`). | `text` |
| `-v, --verbose` | Incluye información detallada sobre el archivo, línea y evidencia en el formato de texto. | `false` |
| `--fail-on <level>` | Nivel de severidad para devolver código de salida de error (`error`, `warning` o `never`). | `error` |

## Ejemplo de salida texto

Salida predeterminada al analizar un proyecto en terminal (`--format text`):

```text
Documentation Health Analysis
==================================================
Analyzed Path: /path/to/project
Score: 85 / 100
Summary: 1 total finding(s) (1 error(s), 0 warning(s), 0 suggestion(s))

Findings:
  [ERROR] [DOC001] README.md does not exist.
```

Salida al analizar un proyecto sin incidencias:

```text
Documentation Health Analysis
==================================================
Analyzed Path: /path/to/project
Score: 100 / 100
Summary: 0 total finding(s) (0 error(s), 0 warning(s), 0 suggestion(s))

No issues found! Great job on your documentation.
```

## Ejemplo JSON

Salida estructurada y estable al ejecutar con la opción `--format json`:

```json
{
  "score": 85,
  "summary": {
    "totalFindings": 1,
    "errors": 1,
    "warnings": 0,
    "suggestions": 0
  },
  "findings": [
    {
      "ruleId": "DOC001",
      "severity": "error",
      "message": "README.md does not exist."
    }
  ],
  "analyzedPath": "/path/to/project",
  "rulesRun": [
    "DOC001",
    "DOC002",
    "DOC003",
    "DOC004",
    "DOC005",
    "DOC006",
    "DOC007"
  ]
}
```

## Explicación de la puntuación

El análisis comienza con una puntuación base de **100 puntos**. Se aplican deducciones acumulativas por cada hallazgo detectado según su nivel de severidad:

- **`error` (-15 puntos):** Problemas críticos o instrucciones rotas (por ejemplo, falta de `README.md`, enlaces locales rotos o comandos de ejecución inexistentes).
- **`warning` (-7 puntos):** Omisiones o posibles desajustes que pueden confundir a los desarrolladores (por ejemplo, scripts o variables de entorno no documentados, o contradicciones en versiones del runtime).
- **`suggestion` (-3 puntos):** Recomendaciones de calidad documental para enriquecer el contenido (por ejemplo, README demasiado corto o sin sección clara de instalación/uso).

La puntuación mínima posible es **0** (`Math.max(0, score)`).

## Limitaciones del MVP

Actualmente, `doccontext` es un Producto Viable Mínimo (MVP) diseñado con un enfoque conservador y estricto en Node.js/TypeScript sin dependencias excesivas:
- **Comparación de versiones acotada (`DOC005`):** La validación entre versiones de Node.js en el README y la configuración del proyecto no utiliza librerías externas de SemVer completas (`semver`). Implementa un análisis relacional y por versión mayor para evitar falsos positivos comunes (ej. `>=20` vs `20.11.0`), pero no cubre rangos semver complejos avanzados.
- **Detección léxica de variables (`DOC004`):** La extracción de variables en código busca expresiones directas de la forma `process.env.NOMBRE`. No detecta desestructuraciones dinámicas complejas (ej. `const { [varName]: val } = process.env`).
- **Análisis de enlaces locales (`DOC002`):** Solo verifica enlaces relativos a archivos del proyecto; no realiza peticiones HTTP para comprobar la disponibilidad de enlaces web externos (`http` / `https`).
- **Comprobación de scripts (`DOC003`, `DOC006`):** Omite automáticamente scripts del ciclo de vida interno (`prepare`, `prebuild`, `postinstall`, etc.) y verifica coincidencias de palabras exactas o invocaciones explícitas en el README.

## Desarrollo

Para contribuir o modificar el proyecto en un entorno de desarrollo local, utiliza los siguientes comandos:

```bash
# Compilar el proyecto TypeScript
npm run build

# Ejecutar la suite de pruebas unitarias e integración con Vitest
npm test

# Ejecutar el CLI en modo desarrollo usando tsx
npm run dev -- analyze . --verbose
```
