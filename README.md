# Portal de Colaboradores 🎯

Sistema completo para gestionar colaboradores, trabajos de traducción y facturas con **sincronización automática en Google Drive**.

## 🎯 Características principales

✅ **Autenticación Google Drive** - Datos sincronizados en la nube
✅ **Módulo de Trabajos** - Crear, editar, eliminar trabajos
✅ **Módulo de Facturas** - Gestión de pagos y facturas
✅ **Módulo de Colaboradores** - Perfiles y gestión de usuarios
✅ **Panel Admin** - Configuración y seguridad
✅ **Interfaz Responsiva** - Funciona en cualquier dispositivo
✅ **Sin dependencias CSS** - Todo con estilos inline

## 📁 Estructura del Proyecto

```
portal-colaboradores/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                 # Componente raíz + autenticación Google
│   ├── index.jsx               # Punto de entrada React
│   ├── constants.js            # Constantes y datos por defecto
│   ├── utils.js                # Funciones y Google Drive API
│   ├── JobsModule.jsx          # Módulo de trabajos
│   ├── InvoicesModule.jsx      # Módulo de facturas
│   ├── UsersModule.jsx         # Módulo de colaboradores
│   ├── AdminPanel.jsx          # Panel de administración
│   └── README.md               # Documentación técnica
├── package.json                # Dependencias
├── vite.config.js              # Configuración Vite
├── GOOGLE_DRIVE_SETUP.md       # Guía de configuración Google Drive
├── INICIO_RAPIDO.txt           # Primeros pasos
└── README.md                   # Este archivo
```

## 🚀 Instalación rápida

### 1️⃣ Clonar o descargar archivos

```bash
# Descargar los archivos del proyecto
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar Google Drive (IMPORTANTE)

1. Lee `GOOGLE_DRIVE_SETUP.md`
2. Crea un proyecto en Google Cloud Console
3. Obtén tu `Client ID` y `API Key`
4. Edita `src/utils.js` línea ~20:

```javascript
apiKey: "TU_API_KEY_AQUI",
clientId: "TU_CLIENT_ID.apps.googleusercontent.com",
```

### 4️⃣ Ejecutar

```bash
npm run dev
```

Abre http://localhost:3000

## 🔐 Credenciales de Demo

### Acceso como Colaborador
- Usuario: `marie`
- Contraseña: `marie123`

Otros colaboradores:
- `jean` / `jean123`
- `lucia` / `lucia123`

### Acceso como Administrador
- Contraseña: `admin`

Puedes cambiar estas credenciales en Admin → Configuración

## 💾 Cómo funciona el almacenamiento

### Sincronización automática:

1. **Al iniciar sesión**: Los datos se cargan desde Google Drive
2. **Al hacer cambios**: Se guardan automáticamente en Drive
3. **Estructuring en Drive**:

```
Mi Drive/
└── Portal-Colaboradores/
    ├── collaborators.json
    ├── jobs.json
    ├── invoices.json
    └── adminConfig.json
```

### Ventajas:
- ✅ Datos siempre sincronizados
- ✅ Accesible desde cualquier dispositivo
- ✅ Backup automático en Google
- ✅ Compartible con otros usuarios
- ✅ Sin servidor necesario

## 📋 Funcionalidades por rol

### Para Colaboradores
- Ver trabajos asignados
- Consultar estado y precios
- Ver mis facturas
- Seguimiento de pagos

### Para Administrador
- Crear/editar/eliminar trabajos
- Crear/editar/eliminar facturas
- Gestionar perfiles de colaboradores
- Cambiar contraseña de administrador
- Ver estadísticas completas

## 🔧 Cómo hacer cambios

### Agregar nuevo campo a trabajos

1. Abre `src/JobsModule.jsx`
2. Busca `JobForm`
3. Agrega tu input nuevo
4. Guarda (se sincroniza automáticamente en Drive)

### Cambiar colores o estilos

- Los colores están como hexadecimales en cada componente
- Busca el color (ej: `#185FA5`) y cámbialo
- Los estilos son inline, no hay CSS externo

### Crear un nuevo módulo

Sigue el patrón de `JobsModule.jsx`:
```javascript
export function MyModule({ data, onSave, onDelete, isAdmin }) {
  // Vista lista
  // Vista detalle
  // Formulario
}
```

## 📚 Documentación

- **GOOGLE_DRIVE_SETUP.md** → Configuración de Google Drive
- **INICIO_RAPIDO.txt** → Primeros pasos
- **src/README.md** → Documentación técnica
- **ESTRUCTURA.txt** → Mapa visual de carpetas

## 🐛 Solución de problemas

### "Error: Invalid client ID"
- Verifica que copiaste correctamente el Client ID
- Asegúrate que `http://localhost:3000` está autorizado

### "Los datos no se guardan"
- Abre consola (F12) para ver errores
- Verifica que Google Drive está autorizado
- Recarga la página

### "No puedo conectar con Google Drive"
- Recarga la página (Ctrl+R)
- Intenta en navegador incógnito
- Verifica que habilitaste Google Drive API

## 🚀 Desplegar a producción

### 1. Compilar

```bash
npm run build
```

Crea carpeta `dist/` lista para hostear.

### 2. Configurar dominio en Google Cloud

- Ve a Google Cloud Console
- En Credenciales → OAuth 2.0
- Agrega tu dominio a "URIs autorizados":
  - `https://tudominio.com`
  - `https://www.tudominio.com`

### 3. Actualizar `src/utils.js`

```javascript
// Cambiar localhost por tu dominio
scope: "https://www.googleapis.com/auth/drive.file",
```

### 4. Hostear

Sube la carpeta `dist/` a tu servidor web.

## 📝 Tecnologías

- **React 18** - Framework UI
- **Vite** - Bundler y servidor dev
- **lucide-react** - Iconos
- **Google Drive API v3** - Almacenamiento en nube

## 📖 Variables de entorno

Opcional - para mayor seguridad:

```bash
# .env
VITE_GOOGLE_API_KEY=tu_api_key
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

## ✅ Checklist antes de usar en producción

- [ ] Configuré Google Drive API correctamente
- [ ] Cambié las contraseñas de demo
- [ ] Probé en navegador incógnito
- [ ] Probé crear, editar y eliminar datos
- [ ] Verifiqué que los datos se guardan en Drive
- [ ] Configuré el dominio en Google Cloud

## 🤝 Soporte

Si tienes problemas:
1. Abre la consola del navegador (F12)
2. Busca mensajes de error
3. Revisa `GOOGLE_DRIVE_SETUP.md`
4. Verifica que Google Drive API está habilitada

## 📝 Licencia

MIT - Libre para usar y modificar

---

**¡Listo para empezar!** Sigue los pasos en `GOOGLE_DRIVE_SETUP.md` 🚀
