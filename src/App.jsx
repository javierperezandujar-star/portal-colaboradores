import React, { useState } from "react";
import { LogOut, Settings, Briefcase, User, Receipt } from "lucide-react";
import { DEFAULT_COLLABORATORS, DEFAULT_JOBS, DEFAULT_INVOICES, DEFAULT_ADMIN_CONFIG } from "./constants.js";
import { JobsModule } from "./JobsModule.jsx";
import { InvoicesModule } from "./InvoicesModule.jsx";
import { UsersModule } from "./UsersModule.jsx";
import AdminPanel from "./AdminPanel.jsx";

export default function App() {
  const [collaborators, setCollaborators] = useState(DEFAULT_COLLABORATORS);
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [invoices, setInvoices] = useState(DEFAULT_INVOICES);
  const [adminConfig, setAdminConfig] = useState(DEFAULT_ADMIN_CONFIG);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");

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

  const handleLogout = () => { setCurrentUser(null); setCurrentView("login"); };
  const handleSaveJob = (job) => { const n = jobs.some(j=>j.id===job.id)?jobs.map(j=>j.id===job.id?job:j):[...jobs,job]; setJobs(n); };
  const handleDeleteJob = (id) => setJobs(jobs.filter(j=>j.id!==id));
  const handleSaveInvoice = (inv) => { const n = invoices.some(i=>i.id===inv.id)?invoices.map(i=>i.id===inv.id?inv:i):[...invoices,inv]; setInvoices(n); };
  const handleDeleteInvoice = (id) => setInvoices(invoices.filter(i=>i.id!==id));
  const handleSaveCollaborator = (c) => { const n = collaborators.some(x=>x.id===c.id)?collaborators.map(x=>x.id===c.id?c:x):[...collaborators,c]; setCollaborators(n); };
  const handleDeleteCollaborator = (id) => setCollaborators(collaborators.filter(c=>c.id!==id));
  const handleUpdateAdminConfig = (cfg) => setAdminConfig(cfg);

  if (currentView === "login") return <LoginView onAdminLogin={handleAdminLogin} onUserLogin={handleUserLogin} />;

  if (currentView === "dashboard" && currentUser) return (
    <DashboardView
      currentUser={currentUser} collaborators={collaborators} jobs={jobs} invoices={invoices} adminConfig={adminConfig}
      onLogout={handleLogout} onSaveJob={handleSaveJob} onDeleteJob={handleDeleteJob}
      onSaveInvoice={handleSaveInvoice} onDeleteInvoice={handleDeleteInvoice}
      onSaveCollaborator={handleSaveCollaborator} onDeleteCollaborator={handleDeleteCollaborator}
      onUpdateAdminConfig={handleUpdateAdminConfig}
    />
  );

  return null;
}

function LoginView({ onAdminLogin, onUserLogin }) {
  const [view, setView] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (view === "admin") {
      if (!onAdminLogin(password)) setError("Contraseña incorrecta");
    } else {
      if (!onUserLogin(username, password)) setError("Usuario o contraseña incorrectos");
    }
  };

  const btnStyle = (active) => ({ flex:1, padding:"10px", borderRadius:"4px", border: active?"2px solid #185FA5":"1px solid #D3D1C7", background: active?"#E6F1FB":"white", color: active?"#185FA5":"#5F5E5A", fontSize:"13px", cursor:"pointer", fontWeight: active?"600":"400" });

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"linear-gradient(135deg, #2C2C2A 0%, #3A3935 100%)" }}>
      <div style={{ background:"white", borderRadius:"8px", padding:"40px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ margin:"0 0 24px", fontSize:"24px", fontWeight:"600", color:"#2C2C2A", textAlign:"center" }}>Portal de Colaboradores</h1>
        <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
          <button onClick={() => { setView("user"); setError(""); }} style={btnStyle(view==="user")}>Colaborador</button>
          <button onClick={() => { setView("admin"); setError(""); }} style={btnStyle(view==="admin")}>Admin</button>
        </div>
        <form onSubmit={handleSubmit}>
          {view === "user" && <>
            <label style={{ display:"block", fontSize:"11px", color:"#5F5E5A", marginBottom:"6px", textTransform:"uppercase" }}>Usuario</label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"1px solid #D3D1C7", borderRadius:"4px", fontSize:"13px", marginBottom:"16px", boxSizing:"border-box" }} placeholder="usuario" />
          </>}
          <label style={{ display:"block", fontSize:"11px", color:"#5F5E5A", marginBottom:"6px", textTransform:"uppercase" }}>Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"1px solid #D3D1C7", borderRadius:"4px", fontSize:"13px", marginBottom:error?"8px":"20px", boxSizing:"border-box" }} placeholder="••••••••" />
          {error && <p style={{ color:"#A33327", fontSize:"12px", margin:"0 0 16px", padding:"8px 10px", background:"#FBE9E7", borderRadius:"3px" }}>{error}</p>}
          <button type="submit" style={{ width:"100%", padding:"10px", background:"#185FA5", color:"white", border:"none", borderRadius:"4px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Acceder</button>
        </form>
        <div style={{ marginTop:"24px", paddingTop:"24px", borderTop:"1px solid #E5E3DC", fontSize:"11px", color:"#888780" }}>
          <p style={{ margin:"0 0 8px", fontWeight:"600" }}>Demo:</p>
          <p style={{ margin:"4px 0" }}>👤 <code style={{ background:"#F9F8F6", padding:"2px 4px" }}>marie</code> / <code style={{ background:"#F9F8F6", padding:"2px 4px" }}>marie123</code></p>
          <p style={{ margin:"4px 0" }}>🔐 <code style={{ background:"#F9F8F6", padding:"2px 4px" }}>admin</code></p>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ currentUser, collaborators, jobs, invoices, adminConfig, onLogout, onSaveJob, onDeleteJob, onSaveInvoice, onDeleteInvoice, onSaveCollaborator, onDeleteCollaborator, onUpdateAdminConfig }) {
  const [activeModule, setActiveModule] = useState("jobs");
  const isAdmin = currentUser.role === "admin";

  const navBtn = (mod, icon, label) => (
    <button onClick={() => setActiveModule(mod)} style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", background: activeModule===mod?"#3A3935":"transparent", border:"none", color: activeModule===mod?"#E5E3DC":"#888780", borderRadius:"3px", cursor:"pointer", fontSize:"12px", marginBottom:"6px" }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F5F3F0" }}>
      <div style={{ width:"240px", background:"#2C2C2A", color:"white", padding:"16px", overflowY:"auto" }}>
        <h2 style={{ margin:"0 0 24px
