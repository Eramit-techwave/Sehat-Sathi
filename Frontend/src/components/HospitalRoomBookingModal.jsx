/**
 * HospitalRoomBookingModal.jsx — Interactive Hospital Bed & Room Reservation Engine
 * Sehat-Sathi Healthcare Platform
 *
 * Features:
 * - Room Tier Selection: General Ward, Semi-Private, Deluxe AC, ICU, VIP Suite
 * - Transparent Pricing Breakdown: Daily rate × Stay Duration + 18% Healthcare GST
 * - Patient Details Form ("For Whom & When", Admission Date, Emergency Attendant)
 * - Integrated Payment Methods (UPI, Card, NetBanking, Pay at Hospital)
 * - Auto-generates GST Room Booking Invoice & confirmation receipt
 */
import { useState } from "react";
import {
  X, CheckCircle2, ShieldCheck, Bed, Hotel, Activity, Sparkles,
  Calendar, Clock, User, Phone, MapPin, IndianRupee, ArrowRight, Loader2, AlertCircle, Info, CreditCard, QrCode, Building, Banknote
} from "lucide-react";
import { API_BASE } from "../api/client";

export const ROOM_TYPES = [
  {
    id: "general",
    name: "General Ward",
    icon: "🛏️",
    rate: 800,
    badge: "Budget Care",
    color: "#0284C7",
    bg: "rgba(2,132,199,0.08)",
    border: "rgba(2,132,199,0.3)",
    features: ["Shared Patient Ward (4-6 Beds)", "24/7 Duty Doctor & Nursing Care", "Vital Signs Monitoring", "Centralized Oxygen Line"]
  },
  {
    id: "semiprivate",
    name: "Semi-Private Room",
    icon: "🏥",
    rate: 1800,
    badge: "Popular",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.3)",
    features: ["Twin Sharing Room with Curtain Privacy", "Air Conditioned & Attached Washroom", "Attendant Couch & Television", "Personalized Meal Service"]
  },
  {
    id: "deluxe",
    name: "Private Deluxe AC Room",
    icon: "🏨",
    rate: 3500,
    badge: "Recommended",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.3)",
    features: ["100% Single Private Room", "Luxury Recliner Bed & Attached Bath", "Dedicated Nurse Calling System", "Full Attendant Sofa-cum-Bed & Gourmet Meals"]
  },
  {
    id: "icu",
    name: "ICU / Critical Care Unit",
    icon: "🩺",
    rate: 6000,
    badge: "Emergency Care",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.3)",
    features: ["Continuous Cardiac & Multipara Monitoring", "1:1 Dedicated Critical Care Nurse", "Advanced Ventilator & Arterial Line Support", "Senior Intensivist Supervision"]
  },
  {
    id: "suite",
    name: "Super-Specialty Suite",
    icon: "👑",
    rate: 9500,
    badge: "VIP Luxury",
    color: "#D97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.3)",
    features: ["Multi-room Suite (Patient Room + Private Living Room)", "Private Nurse 24/7", "Dedicated Kitchenette, Smart TV & High-speed Wi-Fi", "Priority Consultant Rounds & Express Discharge"]
  }
];

export default function HospitalRoomBookingModal({ hospital, onClose, onBookingSuccess }) {
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[1]); // Default to Semi-Private
  const [durationDays, setDurationDays] = useState(3);
  const [admissionDate, setAdmissionDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  
  // Patient details ("For Whom")
  const [patientForm, setPatientForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "Male",
    contact_phone: "",
    attendant_name: "",
    attendant_relation: "Spouse / Parent",
    reason: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi | card | netbanking | cash
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hospitalName = hospital?.name || hospital?.hospital_name || "Sehat-Sathi Partnered Care Hospital";

  // Calculations
  const dailyRate = selectedRoom.rate;
  const baseTotal = dailyRate * durationDays;
  const gstTax = Math.round(baseTotal * 0.18);
  const finalTotal = baseTotal + gstTax;

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!patientForm.patient_name.trim()) {
      setErrorMsg("Please enter patient's full name."); return;
    }
    if (!patientForm.patient_age || Number(patientForm.patient_age) <= 0) {
      setErrorMsg("Please enter a valid patient age."); return;
    }
    if (!patientForm.contact_phone.trim() || patientForm.contact_phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number."); return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("sehat_sathi_token") || localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const isCash = paymentMethod === "cash";

      if (isCash) {
        const txnId = `ROOM-CASH-${Date.now()}`;
        const payload = {
          hospital_id: hospital?.id || hospital?.user_id || "650000000000000000000010",
          room_type: selectedRoom.name,
          daily_rate: dailyRate,
          duration_days: durationDays,
          admission_date: admissionDate,
          patient_name: patientForm.patient_name,
          patient_age: patientForm.patient_age,
          patient_gender: patientForm.patient_gender,
          contact_phone: patientForm.contact_phone,
          attendant_name: patientForm.attendant_name || "Emergency Contact",
          attendant_relation: patientForm.attendant_relation,
          reason: patientForm.reason || "Hospital Admission",
          payment_method: "CASH",
          payment_status: "Pay at Hospital",
          transaction_id: txnId
        };

        const res = await fetch(`${API_BASE}/hospitals/book-room`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Room booking failed.");

        setIsSubmitting(false);
        onBookingSuccess(data.invoice || {
          invoice_number: `INV-ROOM-${Date.now()}`,
          patient_name: patientForm.patient_name,
          service_name: `Hospital Room Reservation (${selectedRoom.name})`,
          total_amount: finalTotal,
          payment_status: "Pay at Hospital",
          created_at: new Date().toISOString()
        });
        return;
      }

      // REAL RAZORPAY ROOM BOOKING PAYMENT FLOW
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          booking_type: "room",
          notes: {
            hospital_name: hospitalName,
            room_type: selectedRoom.name,
            duration_days: durationDays,
            patient_name: patientForm.patient_name
          }
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.detail || "Could not initialize Razorpay Order");

      const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TLFligzH93mFjS";

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Sehat-Sathi Hospital Services",
        description: `${selectedRoom.name} Room Reservation (${durationDays} Days)`,
        image: "https://sehat-sathi-bay.vercel.app/favicon.svg",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_type: "room",
                booking_payload: {
                  hospital_id: hospital?.id || hospital?.user_id || "650000000000000000000010",
                  hospital_name: hospitalName,
                  room_type: selectedRoom.name,
                  daily_rate: dailyRate,
                  duration_days: durationDays,
                  admission_date: admissionDate,
                  patient_name: patientForm.patient_name,
                  patient_age: patientForm.patient_age,
                  patient_gender: patientForm.patient_gender,
                  contact_phone: patientForm.contact_phone,
                  attendant_name: patientForm.attendant_name || "Emergency Contact",
                  attendant_relation: patientForm.attendant_relation,
                  reason: patientForm.reason || "Hospital Admission",
                  amount: finalTotal
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.detail || "Payment verification failed.");

            setIsSubmitting(false);
            onBookingSuccess(verifyData.invoice || {
              invoice_number: `INV-ROOM-${Date.now()}`,
              patient_name: patientForm.patient_name,
              service_name: `Hospital Room Reservation (${selectedRoom.name})`,
              total_amount: finalTotal,
              payment_status: "Paid",
              reference_number: response.razorpay_payment_id,
              created_at: new Date().toISOString()
            });
          } catch (err) {
            setIsSubmitting(false);
            setErrorMsg(err.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: patientForm.patient_name,
          contact: patientForm.contact_phone
        },
        theme: {
          color: "#2563EB"
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsSubmitting(false);
          setErrorMsg(`Payment Failed: ${resp.error.description || "Transaction declined"}`);
        });
        rzp.open();
      } else {
        throw new Error("Razorpay Checkout SDK script not loaded.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to complete room booking");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface, #FFFFFF)",
          border: "1px solid var(--border, #E2E8F0)",
          borderRadius: 24,
          boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
          maxWidth: 720,
          width: "100%",
          maxHeight: "92vh",
          display: "flex", flexDirection: "column",
          animation: "fadeScale 0.2s cubic-bezier(0.16,1,0.3,1) both",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏥</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#FFF" }}>
                  Hospital Room & Bed Booking
                </h3>
                <p style={{ fontSize: 12, opacity: 0.8, margin: "2px 0 0" }}>
                  {hospitalName} · Transparent Pricing & Direct Admission
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "#fff", width: 32, height: 32, borderRadius: 8,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <form onSubmit={handleConfirmBooking}>
            
            {/* Step 1: Room Category Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: "var(--text, #0F172A)", display: "block", marginBottom: 12 }}>
                1. Select Room / Bed Tier
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ROOM_TYPES.map(room => {
                  const isSelected = selectedRoom.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        padding: 14, borderRadius: 14,
                        border: isSelected ? `2px solid ${room.color}` : "1px solid var(--border, #E2E8F0)",
                        background: isSelected ? room.bg : "var(--surface-alt, #F8FAFC)",
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "flex-start", gap: 14
                      }}
                    >
                      <div style={{
                        fontSize: 24, width: 44, height: 44, borderRadius: 12,
                        background: "var(--surface, #FFF)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${room.border}`, flexShrink: 0
                      }}>
                        {room.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text, #0F172A)" }}>
                            {room.name}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              background: room.color, color: "#FFF",
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100
                            }}>
                              {room.badge}
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 900, color: room.color }}>
                              ₹{room.rate}<span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>/day</span>
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 6 }}>
                          {room.features.map((feat, idx) => (
                            <span key={idx} style={{ fontSize: 11, color: "var(--text-secondary, #475569)", display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={12} style={{ color: room.color }} /> {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Patient & Admission Details ("For Whom & When") */}
            <div style={{
              background: "var(--surface-alt, #F8FAFC)",
              border: "1px solid var(--border, #E2E8F0)",
              borderRadius: 16, padding: 18, marginBottom: 24
            }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: "var(--text, #0F172A)", display: "block", marginBottom: 12 }}>
                2. Patient & Admission Information
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={patientForm.patient_name}
                    onChange={e => setPatientForm({ ...patientForm, patient_name: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Patient Age & Gender *
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input
                      type="number"
                      required
                      placeholder="Age (yrs)"
                      value={patientForm.patient_age}
                      onChange={e => setPatientForm({ ...patientForm, patient_age: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                    />
                    <select
                      value={patientForm.patient_gender}
                      onChange={e => setPatientForm({ ...patientForm, patient_gender: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={patientForm.contact_phone}
                    onChange={e => setPatientForm({ ...patientForm, contact_phone: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Attendant Name & Relation
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Attendant Name"
                      value={patientForm.attendant_name}
                      onChange={e => setPatientForm({ ...patientForm, attendant_name: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. Brother)"
                      value={patientForm.attendant_relation}
                      onChange={e => setPatientForm({ ...patientForm, attendant_relation: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={e => setAdmissionDate(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Expected Duration (Days) *
                  </label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                  >
                    {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
                      <option key={d} value={d}>{d} Day{d > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Reason for Admission / Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Planned Surgery / High Fever / Observation / Post-op Care"
                  value={patientForm.reason}
                  onChange={e => setPatientForm({ ...patientForm, reason: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong, #CBD5E1)", fontSize: 13, background: "var(--surface)" }}
                />
              </div>
            </div>

            {/* Step 3: Transparent Bill Breakdown & Payment Method */}
            <div style={{
              background: "#1E293B", color: "#F8FAFC",
              borderRadius: 16, padding: 18, marginBottom: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8", marginBottom: 12 }}>
                3. Cost Estimate & Bill Breakdown
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{selectedRoom.name} Rate ({durationDays} Days @ ₹{dailyRate}/day)</span>
                <span>₹{baseTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10, color: "#94A3B8" }}>
                <span>Healthcare GST Tax (18%)</span>
                <span>₹{gstTax.toLocaleString('en-IN')}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px dashed #475569", paddingTop: 10, marginTop: 6,
                fontSize: 16, fontWeight: 900
              }}>
                <span>Total Estimated Booking Amount</span>
                <span style={{ color: "#38BDF8", fontSize: 20 }}>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Options */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 10 }}>
                Select Payment Mode
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {[
                  { id: "upi", icon: <QrCode size={16} />, label: "UPI Instant" },
                  { id: "card", icon: <CreditCard size={16} />, label: "Card" },
                  { id: "netbanking", icon: <Building size={16} />, label: "Net Banking" },
                  { id: "cash", icon: <Banknote size={16} />, label: "Pay at Hospital" },
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      padding: "10px 8px", borderRadius: 10,
                      border: paymentMethod === pm.id ? "2px solid #2563EB" : "1px solid var(--border)",
                      background: paymentMethod === pm.id ? "rgba(37,99,235,0.1)" : "var(--surface)",
                      color: paymentMethod === pm.id ? "#2563EB" : "var(--text)",
                      fontWeight: 700, fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    {pm.icon} {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#EF4444", borderRadius: 10, padding: "10px 14px", fontSize: 12,
                marginBottom: 16, display: "flex", alignItems: "center", gap: 8
              }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                border: "none", color: "#fff",
                fontSize: 15, fontWeight: 800, cursor: isSubmitting ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 18px rgba(37,99,235,0.35)", transition: "all 0.15s"
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing Hospital Room Reservation…
                </>
              ) : (
                <>
                  Confirm Room Reservation (₹{finalTotal.toLocaleString('en-IN')}) <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
