import React, { useState } from "react";
import {
  Plus, X, Edit3, ArrowLeft, Euro, Receipt, Download, FileUp
} from "lucide-react";
import { PAYMENT_META } from "./constants.js";
import {
  fmtEur, fmtDate, genInvoiceId, getPaidAmount, getPendingAmount
} from "./utils.js";

// =====================
// COMPONENTE PRINCIPAL DE FACTURAS
// =====================

export function InvoicesModule({
  invoices,
  jobs,
  collaborators,
  onSaveInvoice,
  onDeleteInvoice,
  currentCollaboratorId,
  isAdmin
}) {
  const [view, setView] = useState("list");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const filteredInvoices = filterStatus === "all"
    ? invoices
    : invoices.filter((i) => i.status === filterStatus);

  const userInvoices = currentCollaboratorId
    ? filteredInvoices.filter((i) => i.collaboratorId === currentCollaboratorId)
    : filteredInvoices;

  if (view === "detail" && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        collaborators={collaborators}
        jobs={jobs}
        onEdit={() => setView("edit")}
        onDelete={() => {
          onDeleteInvoice(selectedInvoice.id);
          setView("list");
          setSelectedInvoiceId(null);
        }}
        onBack={() => {
          setView("list");
          setSelectedInvoiceId(null);
        }}
        isAdmin={isAdmin}
      />
    );
  }

  if (view === "new" || view === "edit") {
    return (
      <InvoiceForm
        invoice={view === "edit" ? selectedInvoice : null}
        jobs={jobs}
        collaborators={collaborators}
        onSave={(invoiceData) => {
          onSaveInvoice(invoiceData);
          setView("list");
          setSelectedInvoiceId(null);
        }}
        onCancel={() => {
          setView("list");
          setSelectedInvoiceId(null);
        }}
        currentCollaboratorId={currentCollaboratorId}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <InvoiceList
      invoices={userInvoices}
      collaborators={collaborators}
      jobs={jobs}
      filterStatus={filterStatus}
      onFilterChange={setFilterStatus}
      onSelectInvoice={(invoiceId) => {
        setSelectedInvoiceId(invoiceId);
        setView("detail");
      }}
      onNewInvoice={() => setView("new")}
      isAdmin={isAdmin}
    />
  );
}

// =====================
// LISTA DE FACTURAS
// =====================

function InvoiceList({
  invoices,
  collaborators,
  jobs,
  filterStatus,
  onFilterChange,
  onSelectInvoice,
  onNewInvoice,
  isAdmin
}) {
  const statusOptions = ["all", "pending", "invoiced", "paid"];

  const paidAmount = getPaidAmount(invoices);
  const pendingAmount = getPendingAmount(invoices);
  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#2C2C2A" }}>Facturas</h2>
        {isAdmin && (
          <button
            onClick={onNewInvoice}
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
            <Plus size={16} /> Nueva factura
          </button>
        )}
      </div>

      {/* Resumen */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "16px"
      }}>
        <div style={{
          background: "white",
          border: "1px solid #D3D1C7",
          borderRadius: "5px",
          padding: "12px"
        }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total facturado
          </p>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
            {fmtEur(totalAmount)}
          </p>
        </div>
        <div style={{
          background: "white",
          border: "1px solid #D3D1C7",
          borderRadius: "5px",
          padding: "12px"
        }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Pagado
          </p>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#0F6E56" }}>
            {fmtEur(paidAmount)}
          </p>
        </div>
        <div style={{
          background: "white",
          border: "1px solid #D3D1C7",
          borderRadius: "5px",
          padding: "12px"
        }}>
          <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Pendiente
          </p>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#8B5A1F" }}>
            {fmtEur(pendingAmount)}
          </p>
        </div>
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
            {status === "all" ? "Todas" : PAYMENT_META[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "grid", gap: "8px" }}>
        {invoices.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888780", padding: "24px", fontSize: "14px" }}>
            No hay facturas
          </p>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              collaborator={collaborators.find((c) => c.id === invoice.collaboratorId)}
              jobCount={invoice.jobIds?.length || 0}
              onClick={() => onSelectInvoice(invoice.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =====================
// TARJETA DE FACTURA
// =====================

function InvoiceCard({ invoice, collaborator, jobCount, onClick }) {
  const meta = PAYMENT_META[invoice.status] || {};

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            {invoice.number}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#888780" }}>
            {fmtDate(invoice.issueDate)} • {jobCount} trabajo{jobCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span style={{
          background: meta.bg,
          color: meta.color,
          padding: "4px 8px",
          borderRadius: "3px",
          fontSize: "10px",
          fontWeight: "500"
        }}>
          {meta.label}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
        <span style={{ color: "#5F5E5A" }}>
          {collaborator?.name || "Sin asignar"}
        </span>
        <span style={{ color: "#2C2C2A", fontWeight: "500" }}>
          {fmtEur(invoice.amount)}
        </span>
      </div>
    </div>
  );
}

// =====================
// DETALLE DE FACTURA
// =====================

function InvoiceDetail({ invoice, collaborators, jobs, onEdit, onDelete, onBack, isAdmin }) {
  const collaborator = collaborators.find((c) => c.id === invoice.collaboratorId);
  const invoiceJobs = invoice.jobIds?.map((jid) => jobs.find((j) => j.id === jid)).filter(Boolean) || [];
  const meta = PAYMENT_META[invoice.status] || {};

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
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
              {invoice.number}
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#888780" }}>
              {fmtDate(invoice.issueDate)}
            </p>
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
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Colaborador</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
              {collaborator?.name || "Sin asignar"}
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
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Importe</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
              {fmtEur(invoice.amount)}
            </p>
          </div>
          {invoice.paidDate && (
            <div>
              <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pagado el</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>
                {fmtDate(invoice.paidDate)}
              </p>
            </div>
          )}
        </div>

        {invoiceJobs.length > 0 && (
          <div style={{ borderTop: "1px solid #E5E3DC", paddingTop: "16px" }}>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trabajos incluidos</p>
            <div style={{ display: "grid", gap: "6px" }}>
              {invoiceJobs.map((job) => (
                <div key={job.id} style={{
                  background: "#F9F8F6",
                  padding: "8px 10px",
                  borderRadius: "3px",
                  fontSize: "12px"
                }}>
                  <p style={{ margin: 0, color: "#2C2C2A", fontWeight: "500" }}>
                    {job.fileName}
                  </p>
                  <p style={{ margin: "2px 0 0", color: "#888780", fontSize: "11px" }}>
                    {job.sourceLang.toUpperCase()} → {job.targetLang.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {invoice.notes && (
          <div style={{ borderTop: "1px solid #E5E3DC", paddingTop: "16px", marginTop: "16px" }}>
            <p style={{ fontSize: "10px", color: "#888780", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notas</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#5F5E5A", lineHeight: "1.5" }}>
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================
// FORMULARIO DE FACTURA
// =====================

function InvoiceForm({ invoice, jobs, collaborators, onSave, onCancel, currentCollaboratorId, isAdmin }) {
  const [number, setNumber] = useState(invoice?.number || "");
  const [amount, setAmount] = useState(invoice?.amount || "");
  const [status, setStatus] = useState(invoice?.status || "pending");
  const [jobIds, setJobIds] = useState(invoice?.jobIds || []);
  const [collaboratorId, setCollaboratorId] = useState(invoice?.collaboratorId || currentCollaboratorId);
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [paidDate, setPaidDate] = useState(invoice?.paidDate ? new Date(invoice.paidDate).toISOString().split("T")[0] : "");

  const availableJobs = collaboratorId
    ? jobs.filter((j) => j.collaboratorId === collaboratorId && j.status === "delivered")
    : [];

  const handleSave = () => {
    if (!number.trim() || !amount || !collaboratorId) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    onSave({
      ...invoice,
      id: invoice?.id || genInvoiceId(),
      number: number.trim(),
      amount: parseFloat(amount),
      status,
      jobIds,
      collaboratorId,
      notes: notes.trim(),
      paidDate: paidDate ? new Date(paidDate).getTime() : invoice?.paidDate,
      issueDate: invoice?.issueDate || Date.now(),
      createdAt: invoice?.createdAt || Date.now()
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
        {invoice ? "Editar factura" : "Nueva factura"}
      </h2>

      <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "5px", padding: "16px" }}>
        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Número de factura *
        </label>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
          placeholder="F-2026-001"
        />

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Colaborador *
        </label>
        <select value={collaboratorId} onChange={(e) => setCollaboratorId(e.target.value)} style={{
          width: "100%",
          padding: "9px 10px",
          border: "1px solid #D3D1C7",
          borderRadius: "4px",
          fontSize: "13px",
          marginBottom: "16px"
        }}>
          <option value="">Selecciona un colaborador</option>
          {collaborators.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Importe *
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
          placeholder="100.00"
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
          {Object.entries(PAYMENT_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>

        {status === "paid" && (
          <>
            <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fecha de pago
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid #D3D1C7",
                borderRadius: "4px",
                fontSize: "13px",
                marginBottom: "16px",
                boxSizing: "border-box"
              }}
            />
          </>
        )}

        <label style={{ display: "block", fontSize: "11px", color: "#5F5E5A", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #D3D1C7",
            borderRadius: "4px",
            fontSize: "13px",
            minHeight: "80px",
            marginBottom: "16px",
            boxSizing: "border-box",
            fontFamily: "system-ui, sans-serif"
          }}
          placeholder="Detalles de la factura..."
        />

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
            {invoice ? "Actualizar" : "Crear"} factura
          </button>
        </div>
      </div>
    </div>
  );
}
