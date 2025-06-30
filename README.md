# Sistema de Blog Personal con Análisis Emocional

Un sistema completo de blog personal que permite a los usuarios escribir publicaciones, seleccionar manualmente su estado emocional y visualizar estadísticas detalladas de sus emociones a lo largo del tiempo.

## Características Principales

### Funcionalidades del Blog
- Autenticación segura con JWT
- Crear, editar y eliminar publicaciones
- Búsqueda por contenido y estado emocional
- Selección manual del estado emocional por publicación

### Análisis Emocional
- Estadísticas emocionales por fecha
- Análisis por rango de fechas personalizado
- Visualización gráfica de tendencias emocionales
- Identificación de emociones más frecuentes
- Dashboard con métricas detalladas

### Estados Emocionales
- Positivo 😊 (Puntuación: +2)
- Neutral 😐 (Puntuación: 0)
- Negativo 😔 (Puntuación: -2)

## Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework progresivo de JavaScript
- **TypeScript** - Tipado estático para JavaScript
- **Vue Router** - Enrutamiento del lado del cliente
- **Vite** - Herramienta de construcción rápida
- **CSS3** - Estilos modernos y responsive

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **CORS** - Manejo de políticas de origen cruzado

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- MongoDB (local o MongoDB Atlas)
- npm


### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-blog-emocional
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
El sistema está preconfigurado para usar MongoDB Atlas. Si desea usar su propia base de datos, modifique la variable `MONGODB_URI` en `server/index.js`.

### 4. Ejecutar en modo desarrollo

#### Frontend (Puerto 5173)
```bash
npm run dev
```

#### Backend (Puerto 3000)
```bash
npm run server
```

### 5. Construir para producción
```bash
npm run build
```

### 6. Ejecutar en producción
```bash
npm start
```

## Credenciales de Demo

Para probar el sistema, utulizar estas credenciales predeterminadas:

- **Email:** `demo@example.com`
- **Contraseña:** `password123`

>Nota de Seguridad: En producción, eliminar el usuario demo.

Repositorio GitHub
Link: https://github.com/MatyxxdxUDLA/MVC_BLOG.git

Recursos de aprendizaje:
https://www.youtube.com/watch?v=_7UQPve99r4&t=208s

Video principal de apoyo:
https://www.youtube.com/watch?v=HkIGAqAP1GY&t=855s

Página deployada:
Link: https://mvc-blog-hz8l.onrender.com/

Video explicativo:
Link: https://youtu.be/wU5DxUuWiJw

