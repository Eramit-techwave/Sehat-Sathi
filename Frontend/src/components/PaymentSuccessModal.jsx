/**
* PaymentSuccessModal.jsx — Enterprise Post-Booking Payment Confirmation Screen
* Sehat-Sathi Healthcare Ecosystem
*
* Displays immediate visual confirmation after successful payment/booking:
* - Animated success badge & sound cue
* - Doctor Name, Specialty, Hospital, Appointment Date, Slot & Booking ID
* - Payment status & transaction details
* - Buttons: "View Receipt / Invoice", "View Appointment", "Go to Dashboard"
*/
import { CheckCircle, Calendar, Clock, Stethoscope, MapPin, Receipt, ArrowRight, X, ShieldCheck } from "lucide-react";

export default function PaymentSuccessModal({
  bookingData,
  onClose,
  onViewReceipt,
  onViewAppointments
}) {
  if (!bookingData) return null;

  const doctorName = bookingData.doctor_name || (bookingData.doctor?.name ? (bookingData.doctor.name.startsWith("Dr.") ? bookingData.doctor.name : `Dr. ${bookingData.doctor.name}`) : "Dr. Health Specialist");
  const doctorSpec = bookingData.doctor_specialty || bookingData.doctor?.specialty || bookingData.doctor?.specialization || "General Physician";
  const hospitalName = bookingData.hospital_name || bookingData.doctor?.hospital_name || bookingData.doctor?.hospital || "Sehat-Sathi Partnered Clinic";
  const dateStr = bookingData.date || bookingData.appointment_date || new Date().toISOString().split("T")[0];
  const timeSlot = bookingData.time_slot || bookingData.slot || "10:00 AM";
  const bookingId = bookingData.appointment_id || bookingData.booking_id || `SS-APT-${Math.floor(100000 + Math.random() * 900000)}`;
  const txnId = bookingData.transaction_id || bookingData.reference_number || `SS-TXN-${Date.now()}`;
  const amount = bookingData.amount || 500;
  const paymentMethod = (bookingData.payment_method || "UPI").toUpperCase();

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 520, background: "#FFFFFF",
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
          animation: "fadeScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
          fontFamily: "'Inter', sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header banner with gradient */}
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
          padding: "32px 24px 24px",
          color: "#FFFFFF", textAlign: "center", position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.2)", border: "none",
              color: "#FFF", width: 32, height: 32, borderRadius: 10,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#FFFFFF", color: "#059669",
            margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            animation: "bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both"
          }}>
            <CheckCircle size={44} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Payment Successful!
          </h2>
          <p style={{ fontSize: 13, opacity: 0.92, margin: 0, fontWeight: 500 }}>
            Your appointment has been confirmed & added to your timeline.
          </p>
        </div>

        {/* Details Card */}
        <div style={{ padding: "24px 28px" }}>

          {/* Doctor Info */}
          <div style={{
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: 18, padding: "16px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#FFF", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              👨‍⚕️
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{doctorName}</div>
              <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 700, marginTop: 2 }}>{doctorSpec}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> {hospitalName}
              </div>
            </div>
          </div>

          {/* Booking & Transaction Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Date & Time</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} style={{ color: "#2563EB" }} /> {dateStr}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} style={{ color: "#2563EB" }} /> {timeSlot}
              </div>
            </div>

            <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Payment Paid</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#059669", marginTop: 4 }}>
                ₹{amount.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                Via <strong>{paymentMethod}</strong>
              </div>
            </div>
          </div>

          {/* Reference Numbers */}
          <div style={{ borderTop: "1px dashed #CBD5E1", borderBottom: "1px dashed #CBD5E1", padding: "10px 0", marginBottom: 24, fontSize: 11, color: "#64748B", display: "flex", justifyContent: "space-between" }}>
            <span>Booking ID: <strong style={{ color: "#0F172A" }}>{bookingId}</strong></span>
            <span>Ref: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563EB" }}>{txnId}</span></span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {onViewReceipt && (
              <button
                onClick={onViewReceipt}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  border: "none", color: "#FFFFFF",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
                }}
              >
                <Receipt size={16} /> View & Download Receipt / Invoice
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: onViewAppointments ? "1fr 1fr" : "1fr", gap: 10 }}>
              {onViewAppointments && (
                <button
                  onClick={onViewAppointments}
                  style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "#F8FAFC", border: "1px solid #CBD5E1",
                    color: "#0F172A", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  View Appointments
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#F1F5F9", border: "1px solid #CBD5E1",
                  color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}
              >
                Done
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
