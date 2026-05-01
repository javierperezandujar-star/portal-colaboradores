// =====================
// CONSTANTES GLOBALES
// =====================

export const LANGUAGES = [
  { code: "fr", name: "Francés" },
  { code: "es", name: "Español" },
  { code: "en", name: "Inglés" },
  { code: "de", name: "Alemán" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Portugués" },
  { code: "ca", name: "Catalán" },
  { code: "ar", name: "Árabe" },
  { code: "other", name: "Otro" },
];

export const FESTIVOS_2026 = [
  "2026-01-01", "2026-01-06", "2026-04-03", "2026-05-01",
  "2026-08-15", "2026-10-12", "2026-11-01", "2026-12-06",
  "2026-12-08", "2026-12-25"
];

export const DEFAULT_ADMIN_CONFIG = {
  username: "admin",
  password: "admin"
};

export const STATUS_META = {
  pending:     { label: "Pendiente de revisión", bg: "#FFF7ED", color: "#8B5A1F", border: "#F4D5A8" },
  negotiating: { label: "En negociación",        bg: "#E6F1FB", color: "#185FA5", border: "#B6D4F0" },
  accepted:    { label: "Aceptado",              bg: "#E1F5EE", color: "#0F6E56", border: "#B6E0CE" },
  rejected:    { label: "Rechazado",             bg: "#FBE9E7", color: "#A33327", border: "#F1C5BE" },
  in_progress: { label: "En curso",              bg: "#E6F1FB", color: "#185FA5", border: "#B6D4F0" },
  delivered:   { label: "Entregado",             bg: "#F1EFE8", color: "#5F5E5A", border: "#E5E3DC" },
};

export const PAYMENT_META = {
  pending:  { label: "Pendiente de cobro", bg: "#FFF7ED", color: "#8B5A1F" },
  invoiced: { label: "Facturado",          bg: "#E6F1FB", color: "#185FA5" },
  paid:     { label: "Pagado",             bg: "#E1F5EE", color: "#0F6E56" },
};

export const CONTRACT_METHODS = [
  "Presupuesto aprobado",
  "Contrato firmado",
  "PO (Purchase Order)",
  "Informal / confianza",
  "Otro"
];

// =====================
// DATOS POR DEFECTO
// =====================

export const DEFAULT_COLLABORATORS = [
  {
    id: "c1",
    name: "Marie Dupont",
    company: "Traduxion SARL",
    username: "marie",
    password: "marie123",
    email: "marie@traduxion.fr",
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: "c2",
    name: "Jean Martin",
    company: "Atelier Linguistique",
    username: "jean",
    password: "jean123",
    email: "jean.martin@atelierlinguistique.com",
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: "c3",
    name: "Lucia Rossi",
    company: "Mediterraneo Traducciones",
    username: "lucia",
    password: "lucia123",
    email: "lucia@mediterraneo.es",
    createdAt: Date.now() - 86400000 * 15
  },
];

export const DEFAULT_JOBS = [
  {
    id: "j1",
    collaboratorId: "c1",
    fileName: "Acta_nacimiento_LeRoy.pdf",
    projectName: null,
    sourceLang: "fr",
    targetLang: "es",
    words: 412,
    pages: 2,
    complexity: "media",
    legibility: "buena",
    proposedDeliveryDate: Date.now() - 86400000 * 10,
    description: "Cliente particular para gestión de matrimonio.",
    status: "delivered",
    proposedPrice: 45,
    agreedPrice: 45,
    notes: null,
    contractMethod: "Presupuesto aprobado",
    createdAt: Date.now() - 86400000 * 14
  },
  {
    id: "j2",
    collaboratorId: "c1",
    fileName: "Diploma_Sorbonne_Bertrand.pdf",
    projectName: null,
    sourceLang: "fr",
    targetLang: "es",
    words: 280,
    pages: 1,
    complexity: "baja",
    legibility: "excelente",
    proposedDeliveryDate: Date.now() + 86400000 * 3,
    description: "Apostillado. Cliente pide jurada con sello físico.",
    status: "accepted",
    proposedPrice: 35,
    agreedPrice: 35,
    notes: null,
    contractMethod: "Presupuesto aprobado",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "j3",
    collaboratorId: "c1",
    fileName: "Certificat_medical_Moreau.pdf",
    projectName: null,
    sourceLang: "fr",
    targetLang: "es",
    words: 156,
    pages: 1,
    complexity: "alta",
    legibility: "media",
    proposedDeliveryDate: Date.now() + 86400000 * 5,
    description: "Letra del médico difícil. Hay campos por validar.",
    status: "pending",
    proposedPrice: 28,
    agreedPrice: null,
    notes: null,
    contractMethod: null,
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: "j4",
    collaboratorId: "c2",
    fileName: "Contrato_arrendamiento.pdf",
    projectName: null,
    sourceLang: "es",
    targetLang: "fr",
    words: 1820,
    pages: 6,
    complexity: "alta",
    legibility: "excelente",
    proposedDeliveryDate: Date.now() + 86400000 * 7,
    description: "Contrato comercial. Cliente final es notaría francesa.",
    status: "negotiating",
    proposedPrice: 220,
    agreedPrice: null,
    notes: null,
    contractMethod: "Contrato firmado",
    createdAt: Date.now() - 86400000 * 1
  },
];

export const DEFAULT_INVOICES = [
  {
    id: "inv1",
    collaboratorId: "c1",
    number: "F-2026-001",
    issueDate: Date.now() - 86400000 * 5,
    amount: 45,
    jobIds: ["j1"],
    fileUrl: null,
    fileName: null,
    status: "paid",
    paidDate: Date.now() - 86400000 * 1,
    notes: "Factura por acta de nacimiento.",
    createdAt: Date.now() - 86400000 * 5
  },
];
