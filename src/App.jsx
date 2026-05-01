import React, { useState, useEffect } from "react";
import {
  LogOut, Settings, Lock, Briefcase, User, Receipt, Cloud
} from "lucide-react";
import { DEFAULT_COLLABORATORS, DEFAULT_JOBS, DEFAULT_INVOICES, DEFAULT_ADMIN_CONFIG } from "./constants.js";
import { loadShared, saveShared, initGoogleDrive, signInGoogle, signOutGoogle } from "./utils.js";
import { JobsModule } from "./JobsModule.jsx";
import { InvoicesModule } from "./InvoicesModule.jsx";
import { UsersModule } from "./UsersModule.jsx";
import AdminPanel from "./AdminPanel.jsx";

// =====================
// APP PRINCIPAL
// =====================

export default function App() {
  // Estado global
  const [collaborators, setCollaborators] = useState(DEFAULT_COLLABORATORS);
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [invoices, setInvoices] = useState(DEFAULT_INVOICES);
  const [adminConfig, setAdminConfig] = useState(DEFAULT_ADMIN_CONFIG);

  // Sesión y navegación
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("auth");
  const [loading, setLoading] = useState(true);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [authError, setAuthError] = useState("");

  // Inicializar Google Drive al montar
  useEffect(() => {
    initGoogleAPI();
  }, []);

  // Inicializar Google API
  async function initGoogleAPI() {
    try {
      const ready = await initGoogleDrive();
      if (ready) {
        setCurrentView("google-login");
      } else {
        setAuthError("Error inicializando Google Drive. Usa datos locales.");
        setCurrentView("login");
      }
    } catch (err) {
      console.error("Error:", err);
      setAuthError("Error al cargar Google Drive");
      setCurrentView("login");
    } finally {
      setLoading(false);
    }
  }

  // Iniciar sesión con Google
  async function handleGoogleLogin() {
    try {
      setLoading(true);
      const success = await signInGoogle();
      if (success) {
        setGoogleAuth(true);
        await loadData();
        setCurrentView("login");
      } else {
        setAuthError("No se pudo autenticar con Google");
      }
    } catch (err) {
      setAuthError("Error en autenticación: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Cargar datos desde Google Drive
  async function loadData() {
    try {
      const [collabs, jobs_, invoices_, admin] = await Promise.all([
        loadShared("collaborators"),
        loadShared("jobs"),
        loadShared("invoices"),
        loadShared("adminConfig")
      ]);

      if (collabs) setCollaborators(collabs);
      if (jobs_) setJobs(jobs_);
      if (invoices_) setInvoices(invoices_);
      if (admin) setAdminConfig(admin);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  }

  // Guardar datos en Google Drive
  async function saveData(newCollabs, newJobs, newInvoices, newAdmin) {
    const tasks = [
      newCollabs && saveShared("collaborators", newCollabs),
      newJobs && saveShared("jobs", newJobs),
      newInvoices && saveShared("invoices", newInvoices),
      newAdmin && saveShared("adminConfig", newAdmin)
    ].filter(Boolean);

    await Promise.all(tasks);
  }

  // HANDLERS
  const handleAdminLogin = (password) => {
    if (password === adminConfig.password) {
      setCurrentUser({ id: "admin", name: "Admin", role: "admin" });
      setCurrentView("dashboard");
      return true;
    }
    return false;
  };

  const handleUserLogin = (username, password) => {
    const user = collaborators.find((c) => c.username === username && c.password === password);
    if (user) {
      setCurrentUser({ id: user.id, name: user.name, role: "collaborator" });
      setCurrentView("dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setCurrentView("login");
  };

  const handleGoogleLogout = async () => {
    await signOutGoogle();
    setGoogleAuth(false);
    setCurrentView("google-login");
    setCurrentUser(null);
  };

  const handleSaveJob = (job) => {
    const newJobs = jobs.some((j) => j.id === job.id)
      ? jobs.map((j) => (j.id === job.id ? job : j))
      : [...jobs, job];
    setJobs(newJobs);
    saveData(null, newJobs, null, null);
  };

  const handleDeleteJob = (jobId) => {
    const newJobs = jobs.filter((j) => j.id !== jobId);
    setJobs(newJobs);
    saveData(null, newJobs, null, null);
  };

  const handleSaveInvoice = (invoice) => {
    const newInvoices = invoices.some((i) => i.id === invoice.id)
      ? invoices.map((i) => (i.id === invoice.id ? invoice : i))
      : [...invoices, invoice];
    setInvoices(newInvoices);
    saveData(null, null, newInvoices, null);
  };

  const handleDeleteInvoice = (invoiceId) => {
    const newInvoices = invoices.filter((i) => i.id !== invoiceId);
    setInvoices(newInvoices);
    saveData(null, null, newInvoices, null);
  };

  const handleSaveCollaborator = (collaborator) => {
    const newCollaborators = collaborators.some((c) => c.id === collaborator.id)
      ? collaborators.map((c) => (c.id === collaborator.id ? collaborator : c))
      : [...collaborators, collaborator];
    setCollaborators(newCollaborators);
    saveData(newCollaborators, null, null, null);
  };

  const handleDeleteCollaborator = (collaboratorId) => {
    const newCollaborators = collaborators.filter((c) => c.id !== collaboratorId);
    setCollaborators(newCollaborators);
    saveData(newCollaborators, null, null, null);
  };

  const handleUpdateAdminConfig = (newConfig) => {
    setAdminConfig(newConfig);
    saveData(null, null, null, newConfig);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #2C2C2A 0%, #3A3935 100%)",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>Cargando portal...</p>
          <div style={{ width: "30px", height: "30px", border: "3px solid #E5E3DC", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  if (currentView === "google-login") {
    return <GoogleLoginView onLogin={handleGoogleLogin} error={authError} />;
  }

  if (currentView === "login") {
    return <LoginView onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} googleAuth={googleAuth} />;
  }

  if (currentView === "dashboard" && currentUser) {
    return (
      <DashboardView
        currentUser={currentUser}
        collaborators={collaborators}
        jobs={jobs}
        invoices={invoices}
        adminConfig={adminConfig}
        googleAuth={googleAuth}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onGoogleLogout={handleGoogleLogout}
        onSaveJob={handleSaveJob}
        onDeleteJob={handleDeleteJob}
        onSaveInvoice={handleSaveInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onSaveCollaborator={handleSaveCollaborator}
        onDeleteCollaborator={handleDeleteCollaborator}
        onUpdateAdminConfig={handleUpdateAdminConfig}
      />
    );
  }

  return null;
}

// =====================
// GOOGLE LOGIN VIEW
// =====================

function GoogleLoginView({ onLogin, error }) {
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleClick = async () => {
    setLoadingLogin(true);
    await onLogin();
    setLoadingLogin(false);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2C2C2A 0%, #3A3935 100%)"
    }}>
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          background: "#E6F1FB",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <Cloud size={32} color="#185FA5" />
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "600", color: "#2C2C2A" }}>
          Portal de Colaboradores
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#888780" }}>
          Conecta con Google Drive para guardar tus datos en la nube
        </p>

        {error && (
          <div style={{
            background: "#FBE9E7",
            border: "1px solid #F1C5BE",
            color: "#A33327",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            marginBottom: "16px"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={loadingLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: loadingLogin ? "#D3D1C7" : "#185FA5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: loadingLogin ? "not-allowed" : "pointer",
            marginBottom: "12px"
          }}
        >
          {loadingLogin ? "Conectando..." : "Conectar con Google Drive"}
        </button>

        <p style={{ fontSize: "11px", color: "#888780", margin: "12px 0 0" }}>
          ℹ️ Se abrirá una ventana para autorizar el acceso a Google Drive
        </p>
      </div>
    </div>
  );
}

// =====================
// LOGIN VIEW
// =====================

function LoginView({ onAdminLogin, onUserLogin, googleAuth }) {
  const [view, setView] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (view === "admin") {
      if (onAdminLogin(password)) {
        setUsername("");
        setPassword("");
      } else {
        setError("Contraseña de administrador incorrecta");
      }
    } else {
      if (onUserLogin(username, password)) {
        setUsername("");
        setPassword("");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2C2C2A 0%, #3A3935 100%)"
    }}>
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "40px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <h1 style={{ margin: "0 0 24px", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", textAlign: "center" }}>
          Portal de Colaboradores
        </h1>

        {googleAuth && (
          <div style={{
            background: "#E1F5EE",
            border: "1px solid #B6E0CE",
            color: "#0F6E56",
            padding: "8px 10px",
            borderRadius: "3px",
            fontSize: "10px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            ✓ Conectado a Google Drive
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            onClick={() => { setView("user"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "4px",
              border: view === "user" ? "2px solid #185FA5" : "1px solid #D3D1C7",
              background: view === "user" ? "#E6F1FB" : "white",
              color: view === "user" ? "#185FA5" : "#5F5E5A",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: view === "user" ? "600" : "400"
            }}
          >
            Colaborador
          </button>
          <button
            onClick={() => { setView("admin"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "4px",
              border: view === "admin" ? "2px solid #185FA5" : "1px solid #D3D1C7",
              background: view === "admin" ? "#E6F1FB" : "white",
              color: view === "admin" ? "#185FA5" : "#5F5E5A",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: view === "admin" ? "600" : "400"
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {view === "user" && (
            <>
              <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #D3D1C7",
                  borderRadius: "4px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  boxSizing: "border-box"
                }}
                placeholder="usuario"
              />
            </>
          )}

          <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus={view === "admin"}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #D3D1C7",
              borderRadius: "4px",
              fontSize: "13px",
              marginBottom: error ? "8px" : "20px",
              boxSizing: "border-box"
            }}
            placeholder="••••••••"
          />

          {error && (
            <p style={{ color: "#A33327", fontSize: "12px", margin: "0 0 16px", padding: "8px 10px", background: "#FBE9E7", borderRadius: "3px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#185FA5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Acceder
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "24px",
          borderTop: "1px solid #E5E3DC",
          fontSize: "11px",
          color: "#888780"
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: "600" }}>Demo:</p>
          <p style={{ margin: "4px 0" }}>👤 <code style={{ background: "#F9F8F6", padding: "2px 4px" }}>marie</code> / <code style={{ background: "#F9F8F6", padding: "2px 4px" }}>marie123</code></p>
          <p style={{ margin: "4px 0" }}>🔐 <code style={{ background: "#F9F8F6", padding: "2px 4px" }}>admin</code></p>
        </div>
      </div>
    </div>
  );
}

// =====================
// DASHBOARD VIEW
// =====================

function DashboardView({
  currentUser,
  collaborators,
  jobs,
  invoices,
  adminConfig,
  googleAuth,
  onViewChange,
  onLogout,
  onGoogleLogout,
  onSaveJob,
  onDeleteJob,
  onSaveInvoice,
  onDeleteInvoice,
  onSaveCollaborator,
  onDeleteCollaborator,
  onUpdateAdminConfig
}) {
  const [activeModule, setActiveModule] = useState("jobs");
  const isAdmin = currentUser.role === "admin";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#F5F3F0"
    }}>
      {/* Sidebar */}
      <div style={{
        width: "240px",
        background: "#2C2C2A",
        color: "white",
        padding: "16px",
        borderRight: "1px solid #3A3935",
        overflowY: "auto"
      }}>
        <h2 style={{ margin: "0 0 24px", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Portal
        </h2>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sesión
          </p>
          <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: "500" }}>
            {currentUser.name}
          </p>
          <p style={{ margin: "0", fontSize: "10px", color: "#888780" }}>
            {isAdmin ? "Administrador" : "Colaborador"}
          </p>
          {googleAuth && (
            <p style={{ margin: "4px 0 0", fontSize: "9px", color: "#0F6E56" }}>
              ☁️ Google Drive
            </p>
          )}
        </div>

        <nav style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setActiveModule("jobs")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              background: activeModule === "jobs" ? "#3A3935" : "transparent",
              border: "none",
              color: activeModule === "jobs" ? "#E5E3DC" : "#888780",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px",
              marginBottom: "6px"
            }}
          >
            <Briefcase size={14} /> Trabajos
          </button>

          <button
            onClick={() => setActiveModule("invoices")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              background: activeModule === "invoices" ? "#3A3935" : "transparent",
              border: "none",
              color: activeModule === "invoices" ? "#E5E3DC" : "#888780",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px",
              marginBottom: "6px"
            }}
          >
            <Receipt size={14} /> Facturas
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveModule("users")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  background: activeModule === "users" ? "#3A3935" : "transparent",
                  border: "none",
                  color: activeModule === "users" ? "#E5E3DC" : "#888780",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginBottom: "6px"
                }}
              >
                <User size={14} /> Colaboradores
              </button>

              <button
                onClick={() => setActiveModule("admin")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  background: activeModule === "admin" ? "#3A3935" : "transparent",
                  border: "none",
                  color: activeModule === "admin" ? "#E5E3DC" : "#888780",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginBottom: "6px"
                }}
              >
                <Settings size={14} /> Configuración
              </button>
            </>
          )}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              background: "transparent",
              border: "1px solid #4A4945",
              color: "#888780",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
          {googleAuth && (
            <button
              onClick={onGoogleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: "transparent",
                border: "1px solid #4A4945",
                color: "#888780",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              <Cloud size={14} /> Desconectar Drive
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeModule === "jobs" && (
          <JobsModule
            jobs={jobs}
            collaborators={collaborators}
            invoices={invoices}
            onSaveJob={onSaveJob}
            onDeleteJob={onDeleteJob}
            currentCollaboratorId={isAdmin ? null : currentUser.id}
            isAdmin={isAdmin}
          />
        )}

        {activeModule === "invoices" && (
          <InvoicesModule
            invoices={invoices}
            jobs={jobs}
            collaborators={collaborators}
            onSaveInvoice={onSaveInvoice}
            onDeleteInvoice={onDeleteInvoice}
            currentCollaboratorId={isAdmin ? null : currentUser.id}
            isAdmin={isAdmin}
          />
        )}

        {activeModule === "users" && isAdmin && (
          <UsersModule
            collaborators={collaborators}
            onSaveCollaborator={onSaveCollaborator}
            onDeleteCollaborator={onDeleteCollaborator}
            isAdmin={isAdmin}
          />
        )}

        {activeModule === "admin" && isAdmin && (
          <AdminPanel
            adminConfig={adminConfig}
            onUpdateConfig={onUpdateAdminConfig}
          />
        )}
      </div>
    </div>
  );
}
