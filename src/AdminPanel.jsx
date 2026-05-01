import React, { useState } from "react";
import { Settings, Lock, Eye, EyeOff, Save } from "lucide-react";

// =====================
// PANEL ADMIN
// =====================

export default function AdminPanel({ adminConfig, onUpdateConfig }) {
  const [adminPassword, setAdminPassword] = useState(adminConfig.password || "");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleUpdatePassword = () => {
    setMessage("");
    setMessageType("");

    if (!newAdminPassword.trim()) {
      setMessage("La nueva contraseña no puede estar vacía");
      setMessageType("error");
      return;
    }

    if (newAdminPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      setMessageType("error");
      return;
    }

    if (newAdminPassword === adminPassword) {
      setMessage("La nueva contraseña debe ser diferente a la actual");
      setMessageType("error");
      return;
    }

    onUpdateConfig({
      ...adminConfig,
      password: newAdminPassword
    });

    setAdminPassword(newAdminPassword);
    setNewAdminPassword("");
    setConfirmPassword("");
    setMessage("Contraseña de administrador actualizada correctamente");
    setMessageType("success");
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#2C2C2A" }}>
        Configuración del Sistema
      </h2>

      <div style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "5px",
        padding: "24px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px"
        }}>
          <Settings size={18} style={{ color: "#185FA5" }} />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
            Seguridad
          </h3>
        </div>

        <div style={{
          background: "#FFF7ED",
          border: "1px solid #F4D5A8",
          borderRadius: "4px",
          padding: "12px",
          marginBottom: "24px",
          fontSize: "12px",
          color: "#8B5A1F",
          lineHeight: "1.5"
        }}>
          ⚠️ <strong>Importante:</strong> La contraseña de administrador controla el acceso al panel de configuración del sistema. Guárdala en un lugar seguro.
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "11px",
            color: "#5F5E5A",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Nueva contraseña de administrador
          </label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type={showPwd ? "text" : "password"}
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 36px 10px 12px",
                border: "1px solid #D3D1C7",
                borderRadius: "4px",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
              placeholder="Nueva contraseña"
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

          <label style={{
            display: "block",
            fontSize: "11px",
            color: "#5F5E5A",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Confirmar contraseña
          </label>
          <input
            type={showPwd ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #D3D1C7",
              borderRadius: "4px",
              fontSize: "13px",
              boxSizing: "border-box"
            }}
            placeholder="Confirmar contraseña"
          />
        </div>

        {message && (
          <div style={{
            background: messageType === "success" ? "#E1F5EE" : "#FBE9E7",
            border: `1px solid ${messageType === "success" ? "#B6E0CE" : "#F1C5BE"}`,
            color: messageType === "success" ? "#0F6E56" : "#A33327",
            padding: "12px",
            borderRadius: "4px",
            fontSize: "12px",
            marginBottom: "16px"
          }}>
            {messageType === "success" ? "✓ " : "✗ "}
            {message}
          </div>
        )}

        <button
          onClick={handleUpdatePassword}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#185FA5",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <Save size={14} /> Guardar cambios
        </button>
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: "32px",
        padding: "16px",
        background: "#F9F8F6",
        borderRadius: "5px",
        fontSize: "12px",
        color: "#888780",
        lineHeight: "1.6"
      }}>
        <h4 style={{ margin: "0 0 8px", color: "#5F5E5A", fontWeight: "600" }}>
          Información del sistema
        </h4>
        <p style={{ margin: "4px 0" }}>
          <strong>Versión:</strong> Portal v1.0
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Colaboradores:</strong> El sistema almacena automáticamente todos los cambios
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Acceso:</strong> Admin (contraseña) | Colaboradores (usuario + contraseña)
        </p>
      </div>
    </div>
  );
}
