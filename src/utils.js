import { FESTIVOS_2026 } from "./constants.js";

// =====================
// FORMATOS
// =====================

export const fmtEur = (n) =>
  n == null || isNaN(n)
    ? "—"
    : new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2
      }).format(n);

export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

export const fmtDateShort = (ts) =>
  new Date(ts).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short"
  });

export const fmtRelative = (ts) => {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  return fmtDateShort(ts);
};

// =====================
// HELPERS FECHAS
// =====================

export const ymd = (d) => d.toISOString().split("T")[0];

export const isSameDay = (a, b) => a.toDateString() === b.toDateString();

export const isWeekend = (d) => {
  const x = d.getDay();
  return x === 0 || x === 6;
};

export const isFestivo = (d) => FESTIVOS_2026.includes(ymd(d));

export const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// =====================
// LÓGICA CALENDARIO
// =====================

export function getAvailability(date, today, palabras) {
  if (date < today && !isSameDay(date, today)) return "past";

  const minDays = 2;
  for (let i = 0; i <= minDays; i++) {
    if (isSameDay(date, addDays(today, i))) return "blocked";
  }

  if (palabras > 1500) {
    const extraBlocked = addDays(today, minDays + Math.floor(palabras / 1500));
    if (date <= extraBlocked) return "blocked";
  }

  if (isWeekend(date) || isFestivo(date)) return "weekend";
  return "available";
}

// =====================
// ESTADO DE PAGOS
// =====================

export function getJobPaymentStatus(jobId, invoices) {
  const invs = invoices.filter((i) => i.jobIds?.includes(jobId));
  if (invs.length === 0) return "pending";
  if (invs.every((i) => i.status === "paid")) return "paid";
  return "invoiced";
}

// =====================
// GOOGLE DRIVE HELPERS
// =====================

const DRIVE_FOLDER_NAME = "Portal-Colaboradores";
const DRIVE_FILE_NAMES = {
  collaborators: "collaborators.json",
  jobs: "jobs.json",
  invoices: "invoices.json",
  adminConfig: "adminConfig.json"
};

let gapiLoaded = false;
let gdriveAuth = false;

// Cargar Google API
export async function initGoogleDrive() {
  return new Promise((resolve) => {
    if (gapiLoaded) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      gapi.load("client:auth2", async () => {
        try {
          await gapi.client.init({
            apiKey: "YOUR_API_KEY", // Será reemplazado por el usuario
            clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com", // Será reemplazado por el usuario
            scope: "https://www.googleapis.com/auth/drive.file",
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
          });
          gapiLoaded = true;
          resolve(true);
        } catch (err) {
          console.error("Error inicializando Google Drive:", err);
          resolve(false);
        }
      });
    };
    document.head.appendChild(script);
  });
}

// Autenticarse con Google
export async function signInGoogle() {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    if (!auth2.isSignedIn.get()) {
      await auth2.signIn();
    }
    gdriveAuth = true;
    return true;
  } catch (err) {
    console.error("Error en login Google:", err);
    return false;
  }
}

// Obtener o crear carpeta en Drive
async function getFolderId() {
  try {
    const response = await gapi.client.drive.files.list({
      spaces: "drive",
      fields: "files(id, name)",
      pageSize: 10,
      q: `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    });

    let folderId = response.result.files?.[0]?.id;

    if (!folderId) {
      // Crear carpeta si no existe
      const createRes = await gapi.client.drive.files.create({
        resource: {
          name: DRIVE_FOLDER_NAME,
          mimeType: "application/vnd.google-apps.folder"
        },
        fields: "id"
      });
      folderId = createRes.result.id;
    }

    return folderId;
  } catch (err) {
    console.error("Error obteniendo carpeta:", err);
    return null;
  }
}

// Cargar datos desde Google Drive
export async function loadShared(key) {
  if (!gdriveAuth) {
    console.warn("No autenticado con Google Drive");
    return null;
  }

  try {
    const fileName = DRIVE_FILE_NAMES[key];
    if (!fileName) return null;

    const folderId = await getFolderId();
    if (!folderId) return null;

    const response = await gapi.client.drive.files.list({
      spaces: "drive",
      fields: "files(id, name)",
      pageSize: 1,
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`
    });

    if (!response.result.files?.length) return null;

    const fileId = response.result.files[0].id;
    const fileContent = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: "media"
    });

    return fileContent.result;
  } catch (err) {
    console.error(`Error cargando ${key}:`, err);
    return null;
  }
}

// Guardar datos en Google Drive
export async function saveShared(key, data) {
  if (!gdriveAuth) {
    console.warn("No autenticado con Google Drive");
    return false;
  }

  try {
    const fileName = DRIVE_FILE_NAMES[key];
    if (!fileName) return false;

    const folderId = await getFolderId();
    if (!folderId) return false;

    // Buscar si el archivo ya existe
    const listRes = await gapi.client.drive.files.list({
      spaces: "drive",
      fields: "files(id)",
      pageSize: 1,
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`
    });

    const fileId = listRes.result.files?.[0]?.id;
    const fileContent = JSON.stringify(data);

    if (fileId) {
      // Actualizar archivo existente
      await gapi.client.drive.files.update({
        fileId: fileId,
        resource: {
          name: fileName,
          mimeType: "application/json"
        },
        media: {
          mimeType: "application/json",
          body: fileContent
        }
      });
    } else {
      // Crear archivo nuevo
      await gapi.client.drive.files.create({
        resource: {
          name: fileName,
          mimeType: "application/json",
          parents: [folderId]
        },
        media: {
          mimeType: "application/json",
          body: fileContent
        }
      });
    }

    return true;
  } catch (err) {
    console.error(`Error guardando ${key}:`, err);
    return false;
  }
}

// Cerrar sesión de Google
export async function signOutGoogle() {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signOut();
    gdriveAuth = false;
    return true;
  } catch (err) {
    console.error("Error en logout:", err);
    return false;
  }
}

// Obtener estado de autenticación
export function isGoogleDriveAuth() {
  return gdriveAuth;
}

// =====================
// GENERADORES DE IDs
// =====================

export const genId = (prefix) =>
  `${prefix}${Math.random().toString(36).substring(2, 9)}`;

export const genCollaboratorId = () => genId("c");
export const genJobId = () => genId("j");
export const genInvoiceId = () => genId("inv");

// =====================
// VALIDACIONES
// =====================

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateUsername = (username) =>
  username.trim().length >= 2 && /^[a-z0-9_-]+$/.test(username.toLowerCase());

export const validatePassword = (password) => password.length >= 3;

// =====================
// BÚSQUEDAS Y FILTRADOS
// =====================

export function findCollaborator(collaborators, id) {
  return collaborators.find((c) => c.id === id);
}

export function findJob(jobs, id) {
  return jobs.find((j) => j.id === id);
}

export function findInvoice(invoices, id) {
  return invoices.find((i) => i.id === id);
}

export function getCollaboratorJobs(jobs, collaboratorId) {
  return jobs.filter((j) => j.collaboratorId === collaboratorId);
}

export function getCollaboratorInvoices(invoices, collaboratorId) {
  return invoices.filter((i) => i.collaboratorId === collaboratorId);
}

// =====================
// CÁLCULOS MONETARIOS
// =====================

export function getTotalJobsAmount(jobs) {
  return jobs.reduce((sum, job) => sum + (job.agreedPrice || job.proposedPrice || 0), 0);
}

export function getTotalInvoicesAmount(invoices) {
  return invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
}

export function getPaidAmount(invoices) {
  return invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
}

export function getPendingAmount(invoices) {
  return invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
}

// =====================
// ESTADÍSTICAS
// =====================

export function getJobStats(jobs) {
  return {
    total: jobs.length,
    delivered: jobs.filter((j) => j.status === "delivered").length,
    inProgress: jobs.filter((j) => j.status === "in_progress").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    negotiating: jobs.filter((j) => j.status === "negotiating").length,
  };
}

export function getCollaboratorStats(collaborators, jobs, invoices) {
  return collaborators.map((collab) => {
    const collabJobs = getCollaboratorJobs(jobs, collab.id);
    const collabInvoices = getCollaboratorInvoices(invoices, collab.id);
    
    return {
      id: collab.id,
      name: collab.name,
      totalJobs: collabJobs.length,
      totalAmount: getTotalJobsAmount(collabJobs),
      invoicedAmount: getTotalInvoicesAmount(collabInvoices),
      paidAmount: getPaidAmount(collabInvoices),
    };
  });
}
