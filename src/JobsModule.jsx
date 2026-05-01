import React, { useState, useRef, useMemo } from "react";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Loader2,
  Plus, ChevronLeft, ChevronRight, Clock, MessageSquare,
  X, Edit3, ArrowLeft, TrendingUp, Briefcase, Eye, EyeOff,
} from "lucide-react";
import { STATUS_META, CONTRACT_METHODS, LANGUAGES } from "./constants.js";
import {
  fmtEur, fmtDate, fmtDateShort, getAvailability, addDays,
  genJobId, getJobPaymentStatus
} from "./utils.js";

// =====================
// COMPONENTE PRINCIPAL DE JOBS
// =====================

export function JobsModule({
  jobs,
  collaborators,
  invoices,
  onSaveJob,
  onDeleteJob,
  currentCollaboratorId,
  isAdmin
}) {
  const [view, setView] = useState("list"); // list, detail, new, edit
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const filteredJobs = filterStatus === "all"
    ? jobs
    : jobs.filter((j) => j.status === filterStatus);

  const userJobs = currentCollaboratorId
    ? filteredJobs.filter((j) => j.collaboratorId === currentCollaboratorId)
    : filteredJobs;

  if (view === "detail" && selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        collaborators={collaborators}
        invoices={invoices}
        onEdit={() => setView("edit")}
        onDelete={() => {
          onDeleteJob(selectedJob.id);
          setView("list");
          setSelectedJobId(null);
        }}
        onBack={() => {
          setView("list");
          setSelectedJobId(null);
        }}
        isAdmin={isAdmin}
      />
    );
  }

  if (view === "new" || view === "edit") {
    return (
      <JobForm
        job={view === "edit" ? selectedJob : null}
        collaborators={collaborators}
        onSave={(jobData) => {
          onSaveJob(jobData);
          setView("list");
          setSelectedJobId(null);
        }}
        onCancel={() => {
          setView("list");
          setSelectedJobId(null);
        }}
        currentCollaboratorId={currentCollaboratorId}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <JobList
      jobs={userJobs}
      collaborators={collaborators}
      filterStatus={filterStatus}
      onFilterChange={setFilterStatus}
      onSelectJob={(jobId) => {
        setSelectedJobId(jobId);
        setView("detail");
      }}
      onNewJob={() => setView("new")}
      isAdmin={isAdmin}
      invoices={invoices}
    />
  );
}

// =====================
// LISTA DE TRABAJOS
// =====================

function JobList({
  jobs,
  collaborators,
  filterStatus,
  onFilterChange,
  onSelectJob,
  onNewJob,
  isAdmin,
  invoices
}) {
  const statusOptions = ["all", "pending", "negotiating", "accepted", "in_progress", "delivered", "rejected"];

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#2C2C2A" }}>Trabajos</h2>
        {isAdmin && (
          <button
            onClick={onNewJob}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#185FA5",
              color: "white",
              border: "none",
              padding: "9px 14px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            <Plus size={16} /> Nuevo trabajo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "8px" }}>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: filterStatus === status ? "1px solid #185FA5" : "1px solid #D3D1C7",
              background: filterStatus === status ? "#E6F1FB" : "white",
              color: filterStatus === status ? "#185FA5" : "#5F5E5A",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: filterStatus === status ? "500" : "400"
            }}
          >
            {status === "all" ? "Todos" : STATUS_META[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Lista de trabajos */}
      <div style={{ display: "grid", gap: "8px" }}>
        {jobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888780", padding: "24px", fontSize: "14px" }}>
            No hay trabajos en esta categoría
          </p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              collaborator={collaborators.find((c) => c.id === job.collaboratorId)}
              paymentStatus={getJobPaymentStatus(job.id, invoices)}
              onClick={() => onSelectJob(job.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =====================
// TARJETA DE TRABAJO
// =====================

function JobCard({ job, collaborator, paymentStatus, onClick }) {
  const meta = STATUS_META[job.status] || {};
  const paymentMeta = {
    pending: { label: "Pendiente", color: "#8B5A1F" },
    invoiced: { label: "Facturado", color: "#185FA5" },
    paid: { label: "Pagado", color: "#0F6E56" }
  }[paymentStatus];

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "5px",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            {job.fileName}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#888780" }}>
            {job.sourceLang.toUpperCase()} → {job.targetLang.toUpperCase()} • {job.words} palabras
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{
            background: meta.bg,
            color: meta.color,
            padding: "4px 8px",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: "500",
            whiteSpace: "nowrap"
          }}>
            {meta.label}
          </span>
          <span style={{
            background: "#F5F5F5",
            color: paymentMeta.color,
            padding: "4px 8px",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: "500",
            whiteSpace: "nowrap"
          }}>
            {paymentMeta.label}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
        <span style={{ color: "#5F5E5A" }}>
          {collaborator?.name || "Sin asignar"}
        </span>
        <span style={{ color: "#2C2C2A", fontWeight: "500" }}>
          {fmtEur(job.agreedPrice || job.proposedPrice)}
        </span>
      </div>
    </div>
  );
}

// =====================
// DETALLE DE TRABAJO
// =====================

function JobDetail({ job, collaborators, invoices, onEdit, onDelete, onBack, isAdmin }) {
  const collaborator = collaborators.find((c) => c.id === job.collaboratorId);
  const meta = STATUS_META[job.status] || {};
  const paymentStatus = getJobPaymentStatus(job.id, invoices);

  return (
    <div style={{ padding: "16px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "1px solid #D3D1C7",
          padding: "6px 8px",
          borderRadius: "4px",
          cursor: "pointer",
          color: "#5F5E5A",
          fontSize: "12px",
          marginBottom: "16px"
        }}
      >
        <ArrowLeft size={14} /> Atrás
      </button>

      <div style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "5px",
        padding: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
            {job.fileName}
          </h2>
          {isAdmin && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={onEdit} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#185FA5",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer"
              }}>
                <Edit3 size={14} /> Editar
              </button>
              <button onClick={onDelete} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#A33327",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer"
              }}>
                <X size={14} /> Eliminar
              </button>
            </div>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px"
        }}>
          <div>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Idiomas</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
              {job.sourceLang.toUpperCase()} → {job.targetLang.toUpperCase()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Palabras</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
              {job.words} palabras
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</p>
            <span style={{
              display: "inline-block",
              background: meta.bg,
              color: meta.color,
              padding: "4px 8px",
              borderRadius: "3px",
              fontSize: "11px",
              fontWeight: "500"
            }}>
              {meta.label}
            </span>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Precio</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
              {fmtEur(job.agreedPrice || job.proposedPrice)}
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #E5E3DC", paddingTop: "16px" }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Descripción</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#5F5E5A", lineHeight: "1.5" }}>
            {job.description || "Sin descripción"}
          </p>
        </div>

        {job.notes && (
          <div style={{ borderTop: "1px solid #E5E3DC", paddingTop: "16px", marginTop: "16px" }}>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notas</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#5F5E5A", lineHeight: "1.5" }}>
              {job.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================
// FORMULARIO DE TRABAJO
// =====================

function JobForm({ job, collaborators, onSave, onCancel, currentCollaboratorId, isAdmin }) {
  const [fileName, setFileName] = useState(job?.fileName || "");
  const [sourceLang, setSourceLang] = useState(job?.sourceLang || "es");
  const [targetLang, setTargetLang] = useState(job?.targetLang || "en");
  const [words, setWords] = useState(job?.words || "");
  const [description, setDescription] = useState(job?.description || "");
  const [proposedPrice, setProposedPrice] = useState(job?.proposedPrice || "");
  const [status, setStatus] = useState(job?.status || "pending");
  const [collaboratorId, setCollaboratorId] = useState(job?.collaboratorId || currentCollaboratorId);

  const handleSave = () => {
    if (!fileName.trim() || !words || !proposedPrice) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    onSave({
      ...job,
      id: job?.id || genJobId(),
      fileName: fileName.trim(),
      sourceLang,
      targetLang,
      words: parseInt(words),
      description: description.trim(),
      proposedPrice: parseFloat(proposedPrice),
      status,
      collaboratorId,
      createdAt: job?.createdAt || Date.now()
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
        {job ? "Editar trabajo" : "Nuevo trabajo"}
      </h2>

      <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "5px", padding: "16px" }}>
        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Nombre del archivo *
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
          placeholder="documento.pdf"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Idioma origen
            </label>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} style={{
              width: "100%",
              padding: "9px 10px",
              border: "1px solid #D3D1C7",
              borderRadius: "4px",
              fontSize: "13px"
            }}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Idioma destino
            </label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{
              width: "100%",
              padding: "9px 10px",
              border: "1px solid #D3D1C7",
              borderRadius: "4px",
              fontSize: "13px"
            }}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Palabras *
            </label>
            <input
              type="number"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid #D3D1C7",
                borderRadius: "4px",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
              placeholder="500"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Precio propuesto *
            </label>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid #D3D1C7",
                borderRadius: "4px",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
              placeholder="50.00"
            />
          </div>
        </div>

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            minHeight: "100px",
            marginBottom: "16px",
            boxSizing: "border-box",
            fontFamily: "system-ui, sans-serif"
          }}
          placeholder="Detalles del trabajo..."
        />

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Estado
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{
          width: "100%",
          padding: "9px 10px",
          border: "1px solid #D3D1C7",
          borderRadius: "4px",
          fontSize: "13px",
          marginBottom: "16px"
        }}>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <button onClick={onCancel} style={{
            background: "transparent",
            border: "1px solid #D3D1C7",
            color: "#5F5E5A",
            padding: "9px 16px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif"
          }}>
            Cancelar
          </button>
          <button onClick={handleSave} style={{
            background: "#185FA5",
            color: "white",
            border: "none",
            padding: "9px 16px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500"
          }}>
            {job ? "Actualizar" : "Crear"} trabajo
          </button>
        </div>
      </div>
    </div>
  );
}
