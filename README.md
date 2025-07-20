# TestCentral - Testing Automation Platform

> **Tesis de Grado** - Plataforma de automatización de pruebas para Backend APIs

## 📋 Descripción

TestCentral es una plataforma web moderna diseñada para la automatización de pruebas de APIs Backend. Desarrollada como proyecto de tesis, proporciona una interfaz intuitiva para gestionar proyectos, endpoints, casos de prueba y monitoreo de ejecuciones.

## ✨ Características Actuales

### 🚀 Funcionalidades Implementadas

- **Dashboard Interactivo**: Vista general del estado de las pruebas
- **Gestión de Proyectos**: Organización y administración de proyectos de testing
- **Administración de Endpoints**: Configuración y gestión de endpoints de API
- **Casos de Prueba**: Creación y administración de test cases
- **Centro de Ejecución**: Monitoreo de ejecuciones de pruebas en tiempo real
- **Reportes y Analytics**: Visualización de métricas y tendencias
- **Sistema de Logs**: Monitoreo detallado del sistema
- **Configuraciones**: Panel de configuración completo
- **Autenticación Opcional**: Sistema de login para funciones avanzadas
- **Tema Oscuro/Claro**: Soporte completo para ambos temas
- **Sidebar Colapsable**: Navegación optimizada para desktop y móvil

### 🚧 Implementaciones Futuras (Tesis)

- **Asistente de IA**: Generación automática de casos de prueba
- **Colaboración en Equipo**: Compartir proyectos entre miembros del equipo
- **Reportes Avanzados**: Analytics detallados con IA
- **Soporte Prioritario**: Sistema de help desk integrado

## 🛠️ Stack Tecnológico

### Frontend

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Build tool y desarrollo
- **React Router 6** - Enrutamiento SPA
- **TailwindCSS** - Framework de CSS utility-first
- **Radix UI** - Componentes accesibles sin estilo
- **Lucide React** - Iconografía moderna
- **Framer Motion** - Animaciones fluidas

### Backend

- **Express.js** - Servidor web minimalista
- **Zod** - Validación de esquemas
- **TypeScript** - Tipado en backend

### Desarrollo y Build

- **SWC** - Compilador rápido para JavaScript/TypeScript
- **Vitest** - Framework de testing
- **Prettier** - Formateo de c��digo

## 📦 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd testcentral
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno (opcional)**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## 🚀 Desarrollo

### Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts disponibles

| Comando                | Descripción                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo      |
| `npm run build`        | Construye el proyecto para producción |
| `npm run build:client` | Construye solo el cliente             |
| `npm run build:server` | Construye solo el servidor            |
| `npm run start`        | Inicia el servidor de producción      |
| `npm run test`         | Ejecuta las pruebas                   |
| `npm run typecheck`    | Verifica tipos de TypeScript          |
| `npm run format.fix`   | Formatea el código con Prettier       |

## 🌐 Despliegue

### Opción 1: Netlify (Recomendado)

#### Despliegue Automático

1. Conecta tu repositorio a Netlify
2. Netlify detectará automáticamente la configuración desde `netlify.toml`
3. El sitio se desplegará automáticamente en cada push

#### Despliegue Manual

```bash
# Construir el proyecto
npm run build:client

# Desplegar a Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist/spa
```

### Opción 2: Vercel

1. **Instalar Vercel CLI**

```bash
npm install -g vercel
```

2. **Desplegar**

```bash
npm run build:client
vercel --prod
```

### Opción 3: Servidor Propio

1. **Construir el proyecto**

```bash
npm run build
```

2. **Ejecutar en producción**

```bash
npm start
```

### Opción 4: Docker

1. **Crear Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. **Construir y ejecutar**

```bash
docker build -t testcentral .
docker run -p 3000:3000 testcentral
```

## 📁 Estructura del Proyecto

```
testcentral/
├── client/                 # Frontend React
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes UI base (Radix)
│   │   ├── Layout.tsx     # Layout principal
│   │   └── ...
│   ├── contexts/          # Context providers
│   ├── pages/             # Páginas de la aplicación
│   │   ├── settings/      # Páginas de configuración
│   │   └── ...
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades y helpers
│   └── App.tsx            # Componente raíz
├── server/                # Backend Express
│   ├── routes/            # Rutas de API
│   └── index.ts           # Servidor principal
├── shared/                # Código compartido
├── netlify/               # Funciones de Netlify
├── public/                # Archivos estáticos
└── dist/                  # Archivos construidos
```

## 💻 Uso

### Acceso a la Aplicación

1. **Modo Invitado**: Todas las funciones básicas están disponibles sin login
2. **Modo Autenticado**: Login opcional para funciones futuras

### Cuentas de Demo

Para probar el sistema de autenticación:

- **Email**: `test@example.com`
- **Password**: Cualquier contraseña

### Navegación

- **Dashboard**: Vista general y métricas
- **Projects**: Gestión de proyectos de testing
- **Endpoints**: Configuración de APIs a probar
- **Test Cases**: Creación de casos de prueba
- **Execution**: Monitoreo de ejecuciones
- **Reports**: Analytics y reportes
- **Logs**: Monitoreo del sistema
- **AI Assistant**: 🚧 Función futura
- **Settings**: Configuración de la plataforma

## 🔧 Configuración

### Temas

- Cambio automático según preferencias del sistema
- Toggle manual en la barra superior
- Persistencia en localStorage

### Sidebar

- Colapsable con toggle
- Responsive para móvil y desktop
- Estado persistente

### Configuraciones Disponibles

- **Profile**: Información del usuario
- **Security**: Configuración de seguridad
- **GitHub**: Integración con repositorios
- **OpenAI**: Configuración de IA (futuro)
- **Tokens**: Gestión de API tokens
- **Notifications**: Preferencias de notificaciones
- **Appearance**: Personalización visual
- **Export**: Exportación de datos
- **Danger Zone**: Operaciones críticas

## 🚧 Roadmap (Tesis)

### Fase 1: Fundamentos ✅

- [x] Interfaz de usuario base
- [x] Sistema de navegación
- [x] Autenticación básica
- [x] Configuraciones

### Fase 2: Core Features (En Desarrollo)

- [ ] API de backend funcional
- [ ] Gestión real de proyectos
- [ ] Ejecución de pruebas
- [ ] Base de datos

### Fase 3: Funciones Avanzadas (Futuro)

- [ ] Integración con IA
- [ ] Análisis avanzado
- [ ] Colaboración en equipo
- [ ] Integraciones externas

## 🧪 Testing

```bash
# Ejecutar pruebas
npm run test

# Ejecutar con watch mode
npm run test -- --watch

# Verificar cobertura
npm run test -- --coverage
```

## 🤝 Contribución

Como este es un proyecto de tesis, las contribuciones están limitadas. Sin embargo, se agradecen:

- Reportes de bugs
- Sugerencias de mejoras
- Feedback sobre UX/UI

## 📄 Licencia

Este proyecto es parte de una tesis de grado y está sujeto a las regulaciones académicas correspondientes.

## 👨‍💻 Autor

**Bryan Enrique Garay Benavidez**  
Proyecto de Tesis - Testing Automation Platform

---

## 📞 Soporte

Para consultas relacionadas con el proyecto de tesis, contactar al autor a través de los canales académicos oficiales.

## 🔗 Enlaces Útiles

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Nota**: Este README será actualizado conforme avance el desarrollo de la tesis.
