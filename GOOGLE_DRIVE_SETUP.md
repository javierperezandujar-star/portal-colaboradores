# Configuración de Google Drive API

## 📋 Pasos para obtener tus credenciales

### 1️⃣ Crear un proyecto en Google Cloud Console

1. Ve a: https://console.cloud.google.com
2. Click en "Crear proyecto"
3. Dale un nombre: "Portal Colaboradores"
4. Click en "Crear"

### 2️⃣ Habilitar Google Drive API

1. En el menú, busca "APIs y servicios"
2. Click en "Habilitar APIs y servicios"
3. Busca "Google Drive API"
4. Click en el resultado
5. Click en "Habilitar"

### 3️⃣ Crear credenciales OAuth 2.0

1. Ve a "Credenciales" en el menú izquierdo
2. Click en "Crear credenciales"
3. Selecciona "ID de cliente de OAuth"
4. Tipo de aplicación: "Aplicación web"
5. En "URIs autorizados de JavaScript", agrega:
   - `http://localhost:3000`
   - `http://localhost:5173` (por si usas Vite)
   - Tu dominio en producción (ej: `https://tudominio.com`)
6. Click en "Crear"
7. **Copia el "ID de cliente"** (Client ID)

### 4️⃣ Obtener la API Key

1. En "Credenciales", click en "Crear credenciales"
2. Selecciona "Clave de API"
3. **Copia la clave** (API Key)

---

## 🔧 Configurar en tu proyecto

### En `src/utils.js`, reemplaza:

```javascript
// Línea ~20
apiKey: "YOUR_API_KEY",
clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",

// Por:
apiKey: "tu_api_key_aqui",
clientId: "tu_client_id.apps.googleusercontent.com",
```

**Ejemplo:**
```javascript
apiKey: "AIzaSyDx7f9K8m0n1o2p3q4r5s6t7u8v9w0x1y",
clientId: "123456789-abc123def456.apps.googleusercontent.com",
```

---

## 📁 Estructura en Google Drive

El portal automáticamente creará:
```
Mi Drive/
└── Portal-Colaboradores/
    ├── collaborators.json
    ├── jobs.json
    ├── invoices.json
    └── adminConfig.json
```

---

## 🚀 Probar la conexión

1. Ejecuta `npm run dev`
2. Abre http://localhost:3000
3. Click en "Conectar con Google Drive"
4. Autoriza el acceso
5. Se cargarán automáticamente los datos

---

## ⚠️ Problemas comunes

### "Error: Invalid client ID"
- Verifica que copiaste correctamente el Client ID
- Asegúrate de que `http://localhost:3000` está en "URIs autorizados"

### "Error: No se puede acceder a Google Drive"
- Recarga la página (Ctrl+R)
- Verifica que habilitaste Google Drive API
- Intenta en navegador incógnito

### "Los datos no se guardan"
- Abre la consola (F12) y busca mensajes de error
- Verifica que tienes permisos en Google Drive
- Intenta crear un nuevo proyecto desde cero

---

## 🔒 Seguridad

⚠️ **NUNCA compartir:**
- Tu Client ID completo en repositorios públicos
- Tu API Key en repositorios públicos

✅ **HACER:**
- Guardar las credenciales en variables de entorno (`.env`)
- Usar `.env.example` para mostrar estructura

---

## 📝 Ejemplo de .env

```
VITE_GOOGLE_API_KEY=AIzaSyDx7f9K8m0n...
VITE_GOOGLE_CLIENT_ID=123456789-abc123...@apps.googleusercontent.com
```

Y en `utils.js`:
```javascript
apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
```

---

## ✅ ¡Listo!

Ya puedes guardar todos tus datos en Google Drive automáticamente.

Los datos se sincronizarán cada vez que hagas cambios.
