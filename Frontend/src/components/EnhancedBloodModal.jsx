/**
 * EnhancedBloodModal.jsx — Comprehensive Medical Screening & Blood Donor / Request Portal
 * Sehat-Sathi Healthcare Platform
 *
 * Mandatory Medical Questionnaire Requirements:
 * - Donor: Full Name, Phone, Blood Group, Age, Gender, Weight, Address (Street, City, State, Pincode)
 * - Alcohol Screening: Consumes alcohol? (Yes/No), Frequency (Daily, Weekly, Socially, Rarely, Never), Last consumed date/time
 * - Current Health: Current illnesses, active symptoms, taking regular prescription medicines (details)
 * - Past Medical History: Past major illnesses (Tuberculosis, Jaundice, Cancer, Heart Disease, Surgeries) — What illness, When, Duration, Treatment details
 * - Request Blood: Patient Name, Age, Gender, Blood Group, Units, Hospital, Doctor In-charge, Room #, Diagnosis, Medical History
 */
import { useState } from "react";
import {
  X, Heart, ShieldAlert, AlertTriangle, CheckCircle2, User, Phone, MapPin,
  Activity, Stethoscope, Wine, AlertCircle, FileText, Loader2, ArrowRight
} from "lucide-react";
import { API_BASE } from "../api/client";

export default function EnhancedBloodModal({ mode = "register", onClose, onSuccess }) {
  const isDonorMode = mode === "register";

  // Donor Registration Form State
  const [donorForm, setDonorForm] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "A+",
    age: "",
    gender: "Male",
    weight: "",
    city: "",
    state: "",
    address: "",
    pincode: "",
    lastDonation: "Never",
    // Screening
    consumes_alcohol: false,
    alcohol_frequency: "Never",
    last_alcohol_consumed: "",
    has_current_illness: false,
    current_illnesses: "",
    taking_medications: false,
    medication_details: "",
    has_past_major_illness: false,
    past_medical_history: "",
    recent_surgery_or_vaccination: false
  });

  // Blood Request Form State
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "Male",
    bloodGroup: "A+",
    unitsRequired: 1,
    hospital: "",
    city: "",
    urgency: "Immediate (Emergency)",
    requesterName: "",
    requesterPhone: "",
    requesterAddress: "",
    doctorInCharge: "",
    roomNumber: "",
    reasonForBlood: "",
    patientMedicalHistory: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("sehat_sathi_token") || localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    setIsSubmitting(true);

    try {
      if (isDonorMode) {
        if (!donorForm.fullName.trim() || !donorForm.phone.trim() || !donorForm.address.trim()) {
          setErrorMsg("Please fill in Name, Phone, and Full Address.");
          setIsSubmitting(false); return;
        }

        if (donorForm.has_past_major_illness && !donorForm.past_medical_history.trim()) {
          setErrorMsg("Please provide detailed past medical history (what illness, when it occurred, and treatment taken).");
          setIsSubmitting(false); return;
        }

        const res = await fetch(`${API_BASE}/donors/register`, {
          method: "POST",
          headers,
          body: JSON.stringify(donorForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");

        if (onSuccess) onSuccess(data.message || "Registered successfully as blood donor!");
      } else {
        if (!requestForm.patientName.trim() || !requestForm.hospital.trim() || !requestForm.requesterPhone.trim()) {
          setErrorMsg("Please fill in Patient Name, Hospital Name, and Requester Phone.");
          setIsSubmitting(false); return;
        }

        const res = await fetch(`${API_BASE}/donors/request`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Request submission failed");

        if (onSuccess) onSuccess(data.message || "Blood request submitted successfully!");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
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
          maxWidth: 680,
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
          background: isDonorMode 
            ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
            : "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{isDonorMode ? "🩸" : "🆘"}</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#FFF" }}>
                  {isDonorMode ? "Blood Donor Registration & Health Questionnaire" : "Request Emergency Blood Supply"}
                </h3>
                <p style={{ fontSize: 12, opacity: 0.85, margin: "2px 0 0" }}>
                  {isDonorMode ? "Complete health screening to save lives" : "Broadcast request to nearby verified donors"}
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

        {/* Form Body */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <form onSubmit={handleSubmit}>

            {isDonorMode ? (
              /* DONOR REGISTRATION FORM */
              <>
                {/* Personal Info */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", display: "block", marginBottom: 10 }}>
                    1. Donor Identity & Location Details
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={donorForm.fullName}
                        onChange={e => setDonorForm({ ...donorForm, fullName: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={donorForm.phone}
                        onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Blood Group *</label>
                      <select
                        value={donorForm.bloodGroup}
                        onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Age (yrs) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 25"
                        value={donorForm.age}
                        onChange={e => setDonorForm({ ...donorForm, age: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Gender</label>
                      <select
                        value={donorForm.gender}
                        onChange={e => setDonorForm({ ...donorForm, gender: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 68"
                        value={donorForm.weight}
                        onChange={e => setDonorForm({ ...donorForm, weight: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>City *</label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={donorForm.city}
                        onChange={e => setDonorForm({ ...donorForm, city: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>State *</label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={donorForm.state}
                        onChange={e => setDonorForm({ ...donorForm, state: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Full Residential Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House No., Street Name, Area, Pincode"
                      value={donorForm.address}
                      onChange={e => setDonorForm({ ...donorForm, address: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                    />
                  </div>
                </div>

                {/* Alcohol & Lifestyle Screening */}
                <div style={{
                  background: "var(--surface-alt, #F8FAFC)",
                  border: "1px solid var(--border, #E2E8F0)",
                  borderRadius: 14, padding: 16, marginBottom: 20
                }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Wine size={16} style={{ color: "#D97706" }} /> 2. Alcohol & Substance Consumption Screening
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Do you consume alcohol?</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="consumes_alcohol"
                          checked={donorForm.consumes_alcohol === true}
                          onChange={() => setDonorForm({ ...donorForm, consumes_alcohol: true })}
                        /> Yes
                      </label>
                      <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="consumes_alcohol"
                          checked={donorForm.consumes_alcohol === false}
                          onChange={() => setDonorForm({ ...donorForm, consumes_alcohol: false, alcohol_frequency: "Never", last_alcohol_consumed: "" })}
                        /> No / Never
                      </label>
                    </div>
                  </div>

                  {donorForm.consumes_alcohol && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Consumption Frequency</label>
                        <select
                          value={donorForm.alcohol_frequency}
                          onChange={e => setDonorForm({ ...donorForm, alcohol_frequency: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)" }}
                        >
                          <option value="Socially">Socially / Occasionally</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Daily">Daily</option>
                          <option value="Rarely">Rarely</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>When was alcohol last consumed?</label>
                        <input
                          type="text"
                          placeholder="e.g. 5 days ago / Last weekend"
                          value={donorForm.last_alcohol_consumed}
                          onChange={e => setDonorForm({ ...donorForm, last_alcohol_consumed: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Health & Medical History */}
                <div style={{
                  background: "var(--surface-alt, #F8FAFC)",
                  border: "1px solid var(--border, #E2E8F0)",
                  borderRadius: 14, padding: 16, marginBottom: 20
                }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Stethoscope size={16} style={{ color: "#2563EB" }} /> 3. Health Conditions & Past Medical History
                  </label>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                    <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={donorForm.has_current_illness}
                        onChange={e => setDonorForm({ ...donorForm, has_current_illness: e.target.checked })}
                      /> Do you currently have any fever, infection, cold, cough, or active symptoms?
                    </label>

                    {donorForm.has_current_illness && (
                      <input
                        type="text"
                        placeholder="Details of current illness or symptoms"
                        value={donorForm.current_illnesses}
                        onChange={e => setDonorForm({ ...donorForm, current_illnesses: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)" }}
                      />
                    )}

                    <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={donorForm.taking_medications}
                        onChange={e => setDonorForm({ ...donorForm, taking_medications: e.target.checked })}
                      /> Are you currently taking any prescription medications, antibiotics, or steroids?
                    </label>

                    {donorForm.taking_medications && (
                      <input
                        type="text"
                        placeholder="List current prescription medicines"
                        value={donorForm.medication_details}
                        onChange={e => setDonorForm({ ...donorForm, medication_details: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)" }}
                      />
                    )}

                    <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700, color: "#DC2626" }}>
                      <input
                        type="checkbox"
                        checked={donorForm.has_past_major_illness}
                        onChange={e => setDonorForm({ ...donorForm, has_past_major_illness: e.target.checked })}
                      /> Have you EVER had any past major illness? (Jaundice, Tuberculosis, Hepatitis, Heart Disease, Cancer, Asthma, Malaria, Surgery, Hospitalization)
                    </label>

                    {donorForm.has_past_major_illness && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", display: "block", marginBottom: 4 }}>
                          Please specify details: What illness, when it occurred, duration & treatment details *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="e.g. Diagnosed with Jaundice in August 2024, treated for 3 weeks in hospital, fully recovered. Or: Knee Surgery in 2023."
                          value={donorForm.past_medical_history}
                          onChange={e => setDonorForm({ ...donorForm, past_medical_history: e.target.value })}
                          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #FCA5A5", fontSize: 12, background: "#FEF2F2", color: "#991B1B" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* BLOOD REQUEST FORM */
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", display: "block", marginBottom: 10 }}>
                    1. Patient & Emergency Requirement
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Patient Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Patient Name"
                        value={requestForm.patientName}
                        onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Blood Group & Units *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <select
                          value={requestForm.bloodGroup}
                          onChange={e => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                        >
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                        <select
                          value={requestForm.unitsRequired}
                          onChange={e => setRequestForm({ ...requestForm, unitsRequired: Number(e.target.value) })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10].map(u => (
                            <option key={u} value={u}>{u} Unit{u > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Hospital Name & Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. City Care Hospital, MG Road"
                        value={requestForm.hospital}
                        onChange={e => setRequestForm({ ...requestForm, hospital: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>City & Urgency *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={requestForm.city}
                          onChange={e => setRequestForm({ ...requestForm, city: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                        />
                        <select
                          value={requestForm.urgency}
                          onChange={e => setRequestForm({ ...requestForm, urgency: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                        >
                          <option value="Immediate (Emergency)">Immediate (Emergency)</option>
                          <option value="Within 24 Hours">Within 24 Hours</option>
                          <option value="Scheduled Surgery">Scheduled Surgery</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Requester Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={requestForm.requesterName}
                        onChange={e => setRequestForm({ ...requestForm, requesterName: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={requestForm.requesterPhone}
                        onChange={e => setRequestForm({ ...requestForm, requesterPhone: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Requester Full Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street address / Hospital area"
                      value={requestForm.requesterAddress}
                      onChange={e => setRequestForm({ ...requestForm, requesterAddress: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Attending Doctor Name</label>
                      <input
                        type="text"
                        placeholder="Dr. In-Charge Name"
                        value={requestForm.doctorInCharge}
                        onChange={e => setRequestForm({ ...requestForm, doctorInCharge: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Hospital Ward / Room #</label>
                      <input
                        type="text"
                        placeholder="e.g. ICU Bed #4 / Ward 2B"
                        value={requestForm.roomNumber}
                        onChange={e => setRequestForm({ ...requestForm, roomNumber: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 13, background: "var(--surface)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Diagnosis & Patient Medical History</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Emergency Dengue Platelet Transfusion / Road Accident Surgery / Severe Anemia"
                      value={requestForm.patientMedicalHistory}
                      onChange={e => setRequestForm({ ...requestForm, patientMedicalHistory: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)" }}
                    />
                  </div>
                </div>
              </>
            )}

            {errorMsg && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#EF4444", borderRadius: 10, padding: "10px 14px", fontSize: 12,
                marginBottom: 16, display: "flex", alignItems: "center", gap: 8
              }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: isDonorMode 
                  ? "linear-gradient(135deg, #DC2626, #B91C1C)"
                  : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                border: "none", color: "#fff",
                fontSize: 15, fontWeight: 800, cursor: isSubmitting ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: isDonorMode ? "0 4px 18px rgba(220,38,38,0.35)" : "0 4px 18px rgba(124,58,237,0.35)"
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  {isDonorMode ? "Complete Registration & Health Clearance 🩸" : "Broadcast Emergency Blood Request 🆘"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
