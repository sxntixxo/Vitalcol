# VitalCol - Asistente de Triaje Médico

VitalCol es una aplicación web inteligente que ayuda a los usuarios a evaluar sus síntomas y encontrar centros médicos cercanos afiliados a su EPS.

## Características Principales

- **Evaluación de Síntomas**: Análisis inteligente de síntomas con recomendaciones médicas
- **Integración con EPS**: Búsqueda de centros médicos afiliados a la EPS del usuario
- **Geolocalización**: Encuentra centros médicos cercanos basados en la ubicación del usuario
- **Mapas Interactivos**: Visualización de centros médicos en mapas con Google Maps
- **Recomendaciones IA**: Utiliza OpenAI para proporcionar recomendaciones médicas personalizadas

## Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Mapas**: Google Maps API
- **IA**: OpenAI API
- **Backend**: Express.js (API endpoints)

## Configuración del Proyecto

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd vitalcol
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API Configuration  
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL ubicadas en `supabase/migrations/`
3. Configura las variables de entorno con tu URL y clave de Supabase

### 5. Configurar APIs Externas

#### Google Maps API
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Habilita las APIs: Maps JavaScript API, Places API, Geocoding API
3. Crea una clave de API y agrégala a tu archivo `.env`

#### OpenAI API
1. Crea una cuenta en [OpenAI](https://openai.com)
2. Genera una clave de API
3. Agrégala a tu archivo `.env`

### 6. Ejecutar el proyecto
```bash
npm run dev
```

## Estructura de la Base de Datos

### Tablas Principales

#### `eps`
- Almacena información de las Entidades Promotoras de Salud
- Campos: `id`, `name`, `logo_url`, `created_at`

#### `medical_facilities`
- Contiene información de centros médicos (hospitales, clínicas, IPS, etc.)
- Campos: `id`, `name`, `type`, `address`, `latitude`, `longitude`, `phone`, `schedule`, `services`, `photo_url`, `rating`

#### `eps_facility_partnerships`
- Tabla de relación entre EPS y centros médicos
- Campos: `eps_id`, `facility_id`, `created_at`

## API Endpoints

### `/api/eps`
- **GET**: Obtiene lista de todas las EPS disponibles

### `/api/eps-facilities`
- **GET**: Obtiene centros médicos afiliados a una EPS específica
- Parámetros: `epsId`, `userLat`, `userLng`, `maxDistance`, `limit`

### `/api/eps/:id/stats`
- **GET**: Obtiene estadísticas de una EPS específica

## Flujo de la Aplicación

1. **Solicitud de Ubicación**: La app solicita permiso para acceder a la ubicación del usuario
2. **Registro de Usuario**: El usuario proporciona su nombre
3. **Evaluación de Síntomas**: Selección de síntomas mediante interfaz intuitiva
4. **Recomendación IA**: Generación de recomendación médica personalizada usando OpenAI
5. **Selección de EPS**: El usuario selecciona su EPS
6. **Búsqueda de Centros**: Muestra centros médicos afiliados cercanos
7. **Visualización en Mapa**: Presenta los resultados en un mapa interactivo

## Características de Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas de Supabase
- **Políticas de acceso** configuradas para lectura pública y escritura autenticada
- **Validación de datos** usando Zod en el backend
- **Sanitización de inputs** para prevenir inyecciones

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor abre un issue en el repositorio.