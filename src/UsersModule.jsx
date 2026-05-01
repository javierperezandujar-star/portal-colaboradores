import React, { useState } from "react";
import {
  Plus, X, Edit3, ArrowLeft, User, UserPlus, Eye, EyeOff
} from "lucide-react";
import { genCollaboratorId, validateEmail } from "./utils.js";

// =====================
// COMPONENTE PRINCIPAL DE USUARIOS
// =====================

export function UsersModule({
  collaborators,
  onSaveCollaborator,
  onDeleteCollaborator,
  isAdmin
}) {
  const [view, setView] = useState("list");
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState(null);

  const selectedCollaborator = collaborators.find((c) => c.id === selectedCollaboratorId);

  if (view === "detail" && selectedCollaborator) {
    return (
      <CollaboratorDetail
        collaborator={selectedCollaborator}
        onEdit={() => setView("edit")}
        onDelete={() => {
          onDeleteCollaborator(selectedCollaborator.id);
          setView("list");
          setSelectedCollaboratorId(null);
        }}
        onBack={() => {
          setView("list");
          setSelectedCollaboratorId(null);
        }}
        isAdmin={isAdmin}
      />
    );
  }

  if (view === "new" || view === "edit") {
    return (
      <CollaboratorForm
        collaborator={view === "edit" ? selectedCollaborator : null}
        onSave={(collabData) => {
          onSaveCollaborator(collabData);
          setView("list");
          setSelectedCollaboratorId(null);
        }}
        onCancel={() => {
          setView("list");
          setSelectedCollaboratorId(null);
        }}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <CollaboratorList
      collaborators={collaborators}
      onSelectCollaborator={(collabId) => {
        setSelectedCollaboratorId(collabId);
        setView("detail");
      }}
      onNewCollaborator={() => setView("new")}
      isAdmin={isAdmin}
    />
  );
}

// =====================
// LISTA DE COLABORADORES
// =====================

function CollaboratorList({
  collaborators,
  onSelectCollaborator,
  onNewCollaborator,
  isAdmin
}) {
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#2C2C2A" }}>
          Colaboradores
        </h2>
        {isAdmin && (
          <button
            onClick={onNewCollaborator}
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
            <Plus size={16} /> Nuevo colaborador
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {collaborators.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888780", padding: "24px", fontSize: "14px" }}>
            No hay colaboradores
          </p>
        ) : (
          collaborators.map((collab) => (
            <CollaboratorCard
              key={collab.id}
              collaborator={collab}
              onClick={() => onSelectCollaborator(collab.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =====================
// TARJETA DE COLABORADOR
// =====================

function CollaboratorCard({ collaborator, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "5px",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: "#E6F1FB",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#185FA5",
          fontSize: "16px",
          fontWeight: "600"
        }}>
          {collaborator.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            {collaborator.name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888780" }}>
            {collaborator.company || "Sin empresa"} • @{collaborator.username}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: "12px", color: "#5F5E5A", textAlign: "right" }}>
          {collaborator.email}
        </p>
      </div>
    </div>
  );
}

// =====================
// DETALLE DE COLABORADOR
// =====================

function CollaboratorDetail({ collaborator, onEdit, onDelete, onBack, isAdmin }) {
  const createdDate = new Date(collaborator.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "#E6F1FB",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#185FA5",
              fontSize: "24px",
              fontWeight: "600"
            }}>
              {collaborator.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
                {collaborator.name}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888780" }}>
                Miembro desde {createdDate}
              </p>
            </div>
          </div>
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
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Correo electrónico
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500", wordBreak: "break-all" }}>
              {collaborator.email}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Usuario
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500", fontFamily: "monospace" }}>
              @{collaborator.username}
            </p>
          </div>
          {collaborator.company && (
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Empresa
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
                {collaborator.company}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================
// FORMULARIO DE COLABORADOR
// =====================

function CollaboratorForm({ collaborator, onSave, onCancel, isAdmin }) {
  const [name, setName] = useState(collaborator?.name || "");
  const [company, setCompany] = useState(collaborator?.company || "");
  const [email, setEmail] = useState(collaborator?.email || "");
  const [username, setUsername] = useState(collaborator?.username || "");
  const [password, setPassword] = useState(collaborator?.password || "");
  const [showPwd, setShowPwd] = useState(false);

  // Auto-generar username sugerido a partir del nombre
  const suggestedUsername = name.trim().toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "");
  const effectiveUsername = username.trim() || suggestedUsername;

  const canSave = 
    name.trim().length >= 2 && 
    effectiveUsername.length >= 2 && 
    password.length >= 3 && 
    validateEmail(email);

  const handleSave = () => {
    onSave({
      ...collaborator,
      id: collaborator?.id || genCollaboratorId(),
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      username: effectiveUsername,
      password,
      createdAt: collaborator?.createdAt || Date.now()
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
        {collaborator ? "Editar colaborador" : "Nuevo colaborador"}
      </h2>

      <div style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "5px",
        padding: "16px"
      }}>
        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Nombre completo *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
          placeholder="Ej. Marie Dupont"
        />

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Empresa <span style={{ color: "#888780", fontSize: "9px" }}>(opcional)</span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
          placeholder="Ej. Traduxion SARL"
        />

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Correo electrónico *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "4px",
            boxSizing: "border-box"
          }}
          placeholder="marie@example.com"
        />
        <p style={{ fontSize: "9px", color: "#888780", margin: "0 0 16px", fontStyle: "italic" }}>
          Se usará para notificaciones
        </p>

        <div style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid #D3D1C7"
        }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Credenciales de acceso
          </p>

          <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 10px",
              border: "1px solid #D3D1C7",
              borderRadius: "4px",
              fontSize: "13px",
              marginBottom: "4px",
              boxSizing: "border-box",
              fontFamily: "monospace"
            }}
            placeholder={suggestedUsername || "usuario"}
          />
          {!username && suggestedUsername && (
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 12px", fontFamily: "monospace" }}>
              Se usará "{suggestedUsername}" si lo dejas vacío
            </p>
          )}

          <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contraseña *
          </label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px 9px 10px",
                paddingRight: "36px",
                border: "1px solid #D3D1C7",
                borderRadius: "4px",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
              placeholder="••••••••"
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              type="button"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#888780",
                cursor: "pointer",
                padding: "4px",
                display: "flex"
              }}
            >
              {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

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
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              background: canSave ? "#185FA5" : "#D3D1C7",
              color: canSave ? "white" : "#888780",
              border: "none",
              padding: "9px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: canSave ? "pointer" : "not-allowed",
              fontFamily: "system-ui, sans-serif",
              fontWeight: "500"
            }}
          >
            {collaborator ? "Actualizar" : "Crear"} colaborador
          </button>
        </div>
      </div>
    </div>
  );
}
