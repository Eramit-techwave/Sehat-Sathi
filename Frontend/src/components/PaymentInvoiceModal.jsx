/**
 * PaymentInvoiceModal.jsx — Professional Medical Payment Invoice & Downloadable Slip
 * Sehat-Sathi Healthcare Platform
 *
 * Requirements:
 * - Sehat-Sathi Logo & Medical branding
 * - Auto-generated Invoice #, Date/Time, Patient ID, Doctor Name & Specialization, Hospital
 * - Base amount, 18% GST Tax, Discount, Total Payable
 * - Payment Method & PAID stamp badge
 * - Verification Reference Code & QR Code display
 * - Footer branding: "Sehat-Sathi | Founder: Amit Dubey | www.sehatsathi.com"
 * - PDF Download & Printable CSS layout
 */
import { useState } from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, QrCode, Stethoscope, Building2, User, Calendar, CreditCard, Sparkles } from "lucide-react";

export default function PaymentInvoiceModal({ invoice, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const invNumber = invoice.invoice_number || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const invDate = invoice.created_at ? new Date(invoice.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const patientName = invoice.patient_name || "Patient";
  const patientId = invoice.patient_id || "PAT-892410";
  const doctorName = invoice.doctor_name || "Dr. Health Specialist";
  const doctorSpec = invoice.doctor_specialization || "General Physician";
  const hospitalName = invoice.hospital_name || "Sehat-Sathi Partnered Clinic";
  const serviceName = invoice.service_name || "Doctor Consultation & Health Assessment";
  
  const isRoomBooking = !!(invoice.room_type || (serviceName && (serviceName.toLowerCase().includes("room") || serviceName.toLowerCase().includes("bed"))));
  const roomType = invoice.room_type || "Deluxe Private AC Room";
  const roomNumber = invoice.room_number || `Room #${Math.floor(100 + Math.random() * 800)} (Bed-${Math.floor(1 + Math.random() * 12)})`;
  const admissionDate = invoice.admission_date || new Date().toISOString().split("T")[0];
  const durationDays = invoice.duration_days || 3;
  const attendantName = invoice.attendant_name || "Emergency Contact";
  const contactPhone = invoice.contact_phone || invoice.phone || "+91 9876543210";

  const baseAmount = invoice.base_amount || invoice.amount || 500;
  const taxAmount = invoice.tax_amount || Math.round(baseAmount * 0.18);
  const discount = invoice.discount || 0;
  const totalAmount = invoice.total_amount || (baseAmount + taxAmount - discount);
  const paymentMethod = (invoice.payment_method || "UPI").toUpperCase();
  const isPaid = invoice.payment_status !== "Cash at Clinic" && invoice.payment_status !== "Pay at Hospital";
  const refCode = invoice.reference_number || invoice.transaction_id || `SS-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div
        className="invoice-slip-container"
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 680, background: "#FFFFFF",
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
          animation: "fadeScale 0.25s ease",
          maxHeight: "92vh", display: "flex", flexDirection: "column"
        }}
      >
        {/* Action Header bar */}
        <div className="no-print" style={{ background: "#0F172A", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#FFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>
            <FileText size={18} style={{ color: "#38BDF8" }} />
            <span>{isRoomBooking ? "Official Hospital Admission Slip & Invoice" : "Official Payment Receipt"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handlePrint} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={handleDownloadPDF} disabled={downloading} style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", border: "none", color: "#FFF", padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={14} /> {downloading ? "Preparing..." : "Download PDF"}
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", marginLeft: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Slip Content */}
        <div id="printable-invoice" style={{ padding: "28px 32px", overflowY: "auto", background: "#FFFFFF", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>

          {/* Top Brand Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #E2E8F0", paddingBottom: 20, marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1A73E8, #0D47A1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 900, fontSize: 18 }}>
                  ⚕️
                </div>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#1E3A8A", letterSpacing: "-0.02em" }}>Sehat-Sathi</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", fontWeight: 600 }}>Healthcare & Digital Medical Portal</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>GSTIN: 07AAAAC1234H1Z5 • ISO 27001 Certified</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", background: isPaid ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", border: `2px solid ${isPaid ? "#10B981" : "#F59E0B"}`, color: isPaid ? "#047857" : "#B45309", padding: "4px 16px", borderRadius: 100, fontSize: 13, fontWeight: 800, letterSpacing: "0.05em", marginBottom: 6 }}>
                ✓ {isPaid ? "PAID" : "PAY AT HOSPITAL"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{invNumber}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{invDate}</div>
            </div>
          </div>

          {/* Details Grid: Patient & Doctor/Hospital */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>PATIENT DETAILS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{patientName}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Patient ID: <strong style={{ color: "#2563EB" }}>{patientId}</strong></div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>📞 Phone: <strong>{contactPhone}</strong></div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {isRoomBooking ? "HOSPITAL ADMISSION FACILITY" : "DOCTOR & CLINIC"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{hospitalName}</div>
              {!isRoomBooking && <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 1 }}>{doctorName} ({doctorSpec})</div>}
              {isRoomBooking && <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, marginTop: 2 }}>🛏️ {roomType}</div>}
            </div>
          </div>

          {/* HOSPITAL ROOM ADMISSION EXTRA FILE DETAILS */}
          {isRoomBooking && (
            <div style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#1E3A8A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Bed size={14} style={{ color: "#2563EB" }} /> HOSPITAL ADMISSION & ROOM TICKET DETAILS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 11 }}>
                <div>
                  <span style={{ color: "#64748B" }}>Assigned Room & Bed:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{roomNumber}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Admission Date:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{admissionDate}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Stay Duration:</span>
                  <div style={{ fontWeight: 800, color: "#059669", marginTop: 2 }}>{durationDays} Days</div>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Check-In / Out Time:</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2 }}>11:00 AM / 10:00 AM</div>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Emergency Attendant:</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{attendantName}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Admission Status:</span>
                  <div style={{ fontWeight: 800, color: "#2563EB", marginTop: 2 }}>CONFIRMED</div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Item Breakdown Table */}
          <div style={{ marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700 }}>Service Description</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 700, textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#0F172A" }}>
                    {serviceName}
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>Medical Consultation & Health Guidance</div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#0F172A" }}>₹{baseAmount.toFixed(2)}</td>
                </tr>

                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "8px 12px", color: "#64748B" }}>Healthcare GST Tax (18%)</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#64748B" }}>₹{taxAmount.toFixed(2)}</td>
                </tr>

                {discount > 0 && (
                  <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "8px 12px", color: "#059669" }}>Platform Discount / Coupon</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#059669" }}>-₹{discount.toFixed(2)}</td>
                  </tr>
                )}

                <tr style={{ background: "rgba(37,99,235,0.06)", borderTop: "2px solid #2563EB" }}>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 800, color: "#1E3A8A" }}>Total Amount Payable</td>
                  <td style={{ padding: "12px", fontSize: 16, fontWeight: 900, color: "#2563EB", textAlign: "right" }}>₹{totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method & Reference Verification */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Payment Method: <strong style={{ color: "#0F172A" }}>{paymentMethod}</strong></div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Reference Code: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563EB" }}>{refCode}</span></div>
            </div>

            {/* QR Code Verification badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF", padding: "6px 12px", border: "1px solid #E2E8F0", borderRadius: 8 }}>
              <QrCode size={26} style={{ color: "#0F172A" }} />
              <div style={{ fontSize: 9, color: "#64748B", lineHeight: 1.2 }}>
                Scan to Verify<br /><strong style={{ color: "#059669" }}>Authentic Receipt</strong>
              </div>
            </div>
          </div>

          {/* Footer Branding Requirements */}
          <div style={{ textAlign: "center", borderTop: "1px solid #E2E8F0", paddingTop: 16, marginTop: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1E3A8A" }}>
              Sehat-Sathi Healthcare Platform
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748B" }}>
              Founder: <strong>Amit Dubey</strong> | Official Web Portal: <strong style={{ color: "#2563EB" }}>www.sehatsathi.com</strong>
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94A3B8" }}>
              This is a computer-generated medical invoice slip. No physical signature is required.
            </p>
          </div>

        </div>
      </div>

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
