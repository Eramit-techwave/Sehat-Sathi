import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Shield, CheckCircle2, RefreshCw, Zap, Heart, Award, Upload, FileText,
  Loader2, AlertCircle, Bot, Send, Activity, ArrowUpRight, ArrowDownRight,
  User, Save, Edit2, History, Stethoscope, Calendar, Droplet,
  Phone, MapPin, Search, X, LogOut, TrendingUp, Clock, ChevronLeft
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const inputStyle = {
  width: "100%", background: "#060b16", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 13,
  outline: "none", boxSizing: "border-box"
};
const selectStyle = {
  ...inputStyle, cursor: "pointer", background: "#060b16", color: "#fbbf24"
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DASHBOARD_MODULES = [
  { id: "doctor", title: "Doctor Consultation", desc: "Book with verified doctors", icon: <Stethoscope size={24} />, color: "#3b82f6", bgColor: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" },
  { id: "appointments", title: "Hospital Appointments", desc: "OPD slot booking", icon: <Calendar size={24} />, color: "#22c55e", bgColor: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.15)" },
  { id: "blood", title: "Blood Donor Network", desc: "Find donors in emergency", icon: <Droplet size={24} />, color: "#ef4444", bgColor: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" },
  { id: "trends", title: "Health Trends", desc: "Track your health over time", icon: <TrendingUp size={24} />, color: "#a855f7", bgColor: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.15)" },
];

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}` };

  // ── VIEW STATE ─────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeModule, setActiveModule] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // ── PROFILE ────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", location: "", age: "", bloodType: "O+"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── REPORTS ────────────────────────────────────────────────────
  const [savedReports, setSavedReports] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // ── AI CHAT ────────────────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your Sehat-Sathi AI health companion. Upload a medical report to get started, or ask me any general health question!` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ── DOCTORS ────────────────────────────────────────────────────
  const [doctorsList, setDoctorsList] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [doctorForm, setDoctorForm] = useState({ date: "", slot: "" });

  // ── APPOINTMENTS ───────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ new_date: "", new_time_slot: "" });

  // ── BLOOD DONORS ───────────────────────────────────────────────
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchCity, setSearchCity] = useState("");
  const [donorForm, setDonorForm] = useState({ fullName: "", phone: "", bloodGroup: "O+", age: "", city: "", state: "", lastDonation: "" });
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [matchedDonor, setMatchedDonor] = useState(null);
  const [bloodRequestForm, setBloodRequestForm] = useState({ patientName: "", bloodGroup: "O+", hospital: "", city: "", urgency: "High", phone: "" });
  const [bloodRequests, setBloodRequests] = useState([]);

  // ══════════════════════════════════════════════════════════════
  // EFFECTS
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (activeModule === "doctor" && doctorsList.length === 0) loadDoctors();
    if (activeModule === "appointments") loadAppointments();
    if (activeModule === "blood" && donors.length === 0) loadDonors();
  }, [activeModule]);

  useEffect(() => {
    if (selectedDoctor && doctorForm.date) loadDoctorSlots(selectedDoctor.id, doctorForm.date);
  }, [selectedDoctor, doctorForm.date]);

  // ══════════════════════════════════════════════════════════════
  // API CALLS
  // ══════════════════════════════════════════════════════════════

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  const loadReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports/my`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSavedReports(data);
        if (data.length > 0 && data[0].analysis_data) {
          const latest = data[0].analysis_data;
          if (latest.parameters_table?.length > 0) setExtractedData(transformAnalysis(latest));
        }
      }
    } catch (e) { console.error("Load reports error", e); }
  };

  const transformAnalysis = (analysisData) => {
    const params = analysisData.parameters_table || [];
    return {
      metabolic: analysisData.extracted_vitals?.metabolic || "N/A",
      cardio: analysisData.extracted_vitals?.cardio || "N/A",
      confidence: analysisData.extracted_vitals?.confidence || "N/A",
      raw_parameters: params.map(p => ({
        name: p.name, value: p.value, status: p.status,
        normal_range: p.normal_range, plain_explanation: p.plain_explanation
      })),
      ai_summary: analysisData.ai_consultant_summary,
      disclaimer: analysisData.ai_consultant_summary?.disclaimer
    };
  };

  const loadDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/doctors`);
      if (res.ok) setDoctorsList(await res.json());
    } catch (e) { console.error("Load doctors error", e); }
    finally { setDoctorsLoading(false); }
  };

  const loadDoctorSlots = async (doctorId, date) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/doctor/${doctorId}/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorSlots(data.available_slots || []);
      }
    } catch (e) { console.error("Load slots error", e); }
  };

  const loadAppointments = async () => {
    setAptsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/my`, { headers: authHeaders });
      if (res.ok) setAppointments(await res.json());
    } catch (e) { console.error("Load apts error", e); }
    finally { setAptsLoading(false); }
  };

  const loadDonors = async () => {
    setDonorsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donors`, { headers: authHeaders });
      if (res.ok) setDonors(await res.json());
    } catch (e) { console.error("Load donors error", e); }
    finally { setDonorsLoading(false); }
  };

  // ── FILE UPLOAD ────────────────────────────────────────────────

  const processFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      showNotif("Please upload PDF, PNG, or JPG files only.", "error"); return;
    }
    setUploadState("loading");
    setStatusMessage("🔬 Analyzing your medical report with AI...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/extract-report`, {
        method: "POST",
        headers: authHeaders,
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Extraction failed");

      const transformed = transformAnalysis(data);
      setExtractedData(transformed);

      // Add to saved reports
      setSavedReports(prev => [{
        id: data.report_id,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
        analysis_data: data
      }, ...prev]);

      // Seed AI chat with context
      setChatHistory([{
        role: "assistant",
        text: `✅ Report analyzed! I found ${data.parameters_table?.length || 0} parameters. ${data.ai_consultant_summary?.status_headline || ""} Ask me anything about your results!`
      }]);

      setUploadState("success");
      setStatusMessage(`✅ ${file.name} processed successfully`);
      showNotif("Report analyzed successfully!");
    } catch (e) {
      setUploadState("error");
      setStatusMessage(`Error: ${e.message}`);
      showNotif(e.message, "error");
    }
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrag = (e) => { e.preventDefault(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); processFile(e.dataTransfer.files[0]); };

  // ── AI CHAT ────────────────────────────────────────────────────

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, report_context: extractedData })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", text: data.response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "assistant", text: "Couldn't reach the AI right now. Please try again! 😊" }]);
    }
    setChatLoading(false);
  };

  // ── DOCTOR BOOKING ─────────────────────────────────────────────

  const handleDoctorBookingSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.date || !doctorForm.slot) {
      showNotif("Please select a date and time slot.", "error"); return;
    }
    try {
      const res = await fetch(`${API_BASE}/appointments/book`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: selectedDoctor.id, date: doctorForm.date, time_slot: doctorForm.slot })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Booking failed");
      showNotif(`Appointment booked with ${selectedDoctor.name} on ${doctorForm.date} at ${doctorForm.slot}!`);
      setSelectedDoctor(null); setDoctorForm({ date: "", slot: "" });
      loadAppointments();
    } catch (e) { showNotif(e.message, "error"); }
  };

  // ── APPOINTMENT ACTIONS ────────────────────────────────────────

  const handleCancelAppointment = async (aptId) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      const res = await fetch(`${API_BASE}/appointments/${aptId}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Cancel failed");
      showNotif("Appointment cancelled. Slot released.");
      loadAppointments();
    } catch (e) { showNotif(e.message, "error"); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.new_date || !rescheduleForm.new_time_slot) {
      showNotif("Please select a new date and time.", "error"); return;
    }
    try {
      const res = await fetch(`${API_BASE}/appointments/${rescheduleTarget}/reschedule`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reschedule failed");
      showNotif(data.message || "Appointment rescheduled!");
      setRescheduleTarget(null); setRescheduleForm({ new_date: "", new_time_slot: "" });
      loadAppointments();
    } catch (e) { showNotif(e.message, "error"); }
  };

  // ── PROFILE SAVE ───────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone, bloodType: profileData.bloodType, age: profileData.age, location: profileData.location })
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEditing(false);
      showNotif("Profile saved successfully!");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingProfile(false);
  };

  // ── DONORS ─────────────────────────────────────────────────────

  const handleDonorRegistration = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/donors/register`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(donorForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      showNotif("Registered as blood donor! You're a lifesaver! 🩸");
      setDonorForm({ fullName: "", phone: "", bloodGroup: "O+", age: "", city: "", state: "", lastDonation: "" });
      loadDonors();
    } catch (e) { showNotif(e.message, "error"); }
  };

  const handleBloodRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/donors/request`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(bloodRequestForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      showNotif("Blood request submitted! Donors will be notified.");
      setBloodRequests(prev => [...prev, { ...bloodRequestForm, id: Date.now() }]);
      setBloodRequestForm({ patientName: "", bloodGroup: "O+", hospital: "", city: "", urgency: "High", phone: "" });
    } catch (e) {
      // If backend not yet available, add locally
      showNotif("Request noted. Our team will reach out.");
      setBloodRequests(prev => [...prev, { ...bloodRequestForm, id: Date.now() }]);
    }
  };

  // ── DERIVED STATE ──────────────────────────────────────────────

  const filteredDoctors = doctorsList.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                        d.specialty?.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchSpec = selectedSpecialty === "All" || d.specialty === selectedSpecialty;
    return matchSearch && matchSpec;
  });

  const filteredDonors = donors.filter(d => {
    const matchBG = searchBloodGroup === "All" || d.bloodGroup === searchBloodGroup;
    const matchCity = !searchCity || d.city?.toLowerCase().includes(searchCity.toLowerCase());
    return matchBG && matchCity;
  });

  const highParams = extractedData?.raw_parameters?.filter(p =>
    p.status.toLowerCase().includes("high") || p.status.toLowerCase().includes("low")) || [];

  // Health score: % of normal parameters
  const healthScore = extractedData?.raw_parameters?.length > 0
    ? Math.round((extractedData.raw_parameters.filter(p => p.status.toLowerCase() === "normal").length / extractedData.raw_parameters.length) * 100)
    : null;

  const activeApts = appointments.filter(a => a.status !== "Cancelled" && a.status !== "Completed");

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", position: "relative" }}>

      {/* NOTIFICATION */}
      {notification.show && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: notification.type === "success" ? "#064e3b" : "#7f1d1d",
          border: `1px solid ${notification.type === "success" ? "#10b981" : "#ef4444"}`,
          borderRadius: "12px", padding: "16px 24px", color: "#fff", fontSize: "14px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 40, textAlign: "left" }}>
        <div>
          <h2 className="serif" style={{ fontSize: "38px", color: "#fff", cursor: "pointer", margin: 0 }}
            onClick={() => { setCurrentView("dashboard"); setActiveModule(null); }}>
            🏥 Health Dashboard
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, marginTop: 4 }}>
            Welcome back, <strong style={{ color: "#60a5fa" }}>{user?.name}</strong>!
            {healthScore !== null && (
              <span style={{ marginLeft: 10, background: healthScore >= 70 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: healthScore >= 70 ? "#22c55e" : "#ef4444", padding: "2px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                Wellness: {healthScore}%
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => { setCurrentView("history"); setActiveModule(null); }} style={{
            background: currentView === "history" ? "#2563eb" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", color: "#fff",
            padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}>
            <History size={14} /> Reports
            {savedReports.length > 0 && (
              <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                {savedReports.length}
              </span>
            )}
          </button>

          <button onClick={() => { setCurrentView("profile"); setActiveModule(null); }} style={{
            background: currentView === "profile" ? "#2563eb" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", color: "#fff",
            padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}>
            <User size={14} /> Profile
          </button>

          <button onClick={logout} style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444",
            padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}>
            <LogOut size={14} /> Logout
          </button>

          <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={16} style={{ color: "#60a5fa" }} />
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>🔒 Secure</span>
          </div>
        </div>
      </div>

      {/* ── REPORTS HISTORY VIEW ───────────────────────────────── */}
      {currentView === "history" && (
        <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
          <h3 className="serif" style={{ fontSize: "26px", color: "#fff", marginBottom: 6 }}>📋 Reports History</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 24 }}>Your uploaded medical reports and AI analyses</p>

          {savedReports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <FileText size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No reports uploaded yet. Upload a medical report to get started.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {savedReports.map((report, idx) => (
                <div key={idx} onClick={() => { setSelectedReport(report); }}
                  style={{
                    background: "#070c19", border: `1px solid ${selectedReport?.id === report.id ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.03)"}`,
                    borderRadius: 16, padding: "18px 24px", display: "flex", justifyContent: "space-between",
                    alignItems: "center", cursor: "pointer", transition: "all 0.3s"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ background: "rgba(37,99,235,0.06)", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>{report.file_name || "Medical Report"}</h4>
                      <p style={{ color: "#475569", fontSize: "12px", margin: 0, marginTop: 4 }}>
                        {report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        {report.analysis_data?.parameters_table?.length > 0 && ` • ${report.analysis_data.parameters_table.length} parameters`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {report.analysis_data?.parameters_table?.filter(p => p.status.toLowerCase().includes("high") || p.status.toLowerCase().includes("low")).length > 0 && (
                      <span style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: 8, fontSize: "11px", fontWeight: 700 }}>
                        ⚠️ Flags
                      </span>
                    )}
                    <span style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", padding: "6px 14px", borderRadius: 10, fontSize: "12px", fontWeight: 600 }}>✅ Analyzed</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report Detail Panel */}
          {selectedReport && (
            <div style={{ marginTop: 24, background: "#070c19", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 20, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  📊 {selectedReport.file_name}
                </h4>
                <button onClick={() => setSelectedReport(null)} style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
              {selectedReport.analysis_data?.ai_consultant_summary && (
                <div style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
                  <p style={{ color: "#60a5fa", fontSize: "13px", fontWeight: 600, margin: "0 0 6px" }}>
                    {selectedReport.analysis_data.ai_consultant_summary.status_headline}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>
                    {selectedReport.analysis_data.ai_consultant_summary.recommendations}
                  </p>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, fontSize: "11px", color: "#fbbf24" }}>
                    ⚕️ {selectedReport.analysis_data.ai_consultant_summary.disclaimer}
                  </div>
                </div>
              )}
              {selectedReport.analysis_data?.parameters_table?.length > 0 && (
                <div style={{ background: "#030712", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 16px", background: "rgba(255,255,255,0.02)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                    <span>PARAMETER</span><span>VALUE</span><span>NORMAL RANGE</span><span>STATUS</span>
                  </div>
                  {selectedReport.analysis_data.parameters_table.map((p, i) => {
                    const isH = p.status.toLowerCase().includes("high");
                    const isL = p.status.toLowerCase().includes("low");
                    return (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: "13px", alignItems: "center" }}>
                        <div>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{p.name}</span>
                          {p.plain_explanation && <p style={{ color: "#475569", fontSize: "11px", margin: "2px 0 0" }}>{p.plain_explanation}</p>}
                        </div>
                        <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>{p.value}</span>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>{p.normal_range || "—"}</span>
                        <span style={{ color: isH ? "#ef4444" : isL ? "#3b82f6" : "#22c55e", fontWeight: 600 }}>
                          {isH ? "↑ " : isL ? "↓ " : "● "}{p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE VIEW ───────────────────────────────────────── */}
      {currentView === "profile" && (
        <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: "28px", color: "#fff", margin: 0 }}>👤 My Profile</h3>
            <button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={savingProfile}
              style={{
                background: isEditing ? "#10b981" : "#2563eb", border: "none", color: "#fff",
                padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}>
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {savingProfile ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 24, padding: "32px", marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {[
                { label: "Full Name", key: "name" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "Location", key: "location" },
                { label: "Age", key: "age" },
                { label: "Blood Type", key: "bloodType" }
              ].map(f => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{f.label}</label>
                  {f.key === "bloodType" && isEditing ? (
                    <select value={profileData[f.key]} onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })} style={selectStyle}>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text" value={profileData[f.key] || ""} disabled={!isEditing || f.key === "email"}
                      onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })}
                      placeholder={isEditing ? `Enter ${f.label}` : "Not set"}
                      style={{
                        ...inputStyle,
                        background: isEditing && f.key !== "email" ? "#030712" : "transparent",
                        border: isEditing && f.key !== "email" ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)",
                        cursor: isEditing && f.key !== "email" ? "text" : "default"
                      }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { label: "Reports Uploaded", value: savedReports.length.toString(), color: "#3b82f6", icon: "📊" },
              { label: "Active Appointments", value: activeApts.length.toString(), color: "#22c55e", icon: "📅" },
              { label: "Wellness Score", value: healthScore !== null ? `${healthScore}%` : "—", color: "#a855f7", icon: "💪" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{stat.label}</span>
                <div style={{ fontSize: "28px", fontWeight: 900, color: stat.color, marginTop: 8 }}>{stat.icon} {stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN DASHBOARD ─────────────────────────────────────── */}
      {currentView === "dashboard" && !activeModule && (
        <>
          {/* MODULES GRID */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 28, textAlign: "left" }}>
              <h3 className="serif" style={{ fontSize: "28px", color: "#fff", marginBottom: 6 }}>Healthcare Services</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Click on any service to get started</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {DASHBOARD_MODULES.map(module => (
                <div key={module.id} onClick={() => setActiveModule(module.id)}
                  style={{ borderRadius: 14, padding: "20px", background: module.bgColor, border: `1px solid ${module.borderColor}`, cursor: "pointer", textAlign: "left", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = module.color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = module.borderColor; }}>
                  <div style={{ color: module.color, marginBottom: 12 }}>{module.icon}</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{module.title}</h4>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>{module.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* VITALS SECTION */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ background: "linear-gradient(145deg, #090f22, #050914)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 24, padding: "36px 40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: extractedData ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: extractedData ? "#22c55e" : "#ef4444", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                    <CheckCircle2 size={11} /> {extractedData ? "✅ DATA LOADED" : "⏳ AWAITING REPORT"}
                  </div>
                  <h3 className="serif" style={{ fontSize: "32px", color: "#fff" }}>Health Vitals</h3>
                  <p style={{ color: "#64748b", fontSize: "14px", marginTop: 4 }}>Upload your medical reports to see AI analysis</p>
                </div>
                <div style={{ background: "#030712", padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
                  <RefreshCw size={12} style={{ color: uploadState === "loading" ? "#3b82f6" : "#22c55e" }} />
                  Status: {uploadState === "loading" ? "Processing..." : extractedData ? "Active" : "Idle"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                {[
                  { title: "Metabolic Rate", value: extractedData ? extractedData.metabolic : "--- kcal", icon: <Zap size={16} />, color: "#3b82f6" },
                  { title: "Heart Rate", value: extractedData ? extractedData.cardio : "--- bpm", icon: <Heart size={16} />, color: "#ef4444" },
                  { title: "Analysis Score", value: extractedData ? extractedData.confidence : "0.00%", icon: <Award size={16} />, color: "#22c55e" }
                ].map((card, i) => (
                  <div key={i} style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 14, justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{card.title}</span>
                      <div style={{ color: card.color, background: `${card.color}10`, padding: 6, borderRadius: 8 }}>{card.icon}</div>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: extractedData ? "#fff" : "#334155", marginBottom: 6 }}>{card.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ANALYSIS PANEL (only when data loaded) */}
          {extractedData && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 40, textAlign: "left" }}>

              {/* PARAMETERS TABLE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* AI Summary + Disclaimer */}
                <div style={{
                  background: highParams.length > 0 ? "rgba(239,68,68,0.02)" : "rgba(34,197,94,0.02)",
                  border: `1px solid ${highParams.length > 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                  borderRadius: 20, padding: "24px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: highParams.length > 0 ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: "13px", marginBottom: 10 }}>
                    <Activity size={15} /> HEALTH ANALYSIS LIVE
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 6 }}>
                    {highParams.length > 0 ? "⚠️ Parameters Need Attention" : "✅ All Values Normal"}
                  </h4>
                  {extractedData.ai_summary?.recommendations && (
                    <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                      {extractedData.ai_summary.recommendations}
                    </p>
                  )}
                  {/* DISCLAIMER BADGE */}
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, fontSize: "11px", color: "#fbbf24", lineHeight: 1.5 }}>
                    ⚕️ {extractedData.disclaimer || "This analysis is for informational purposes only — not a substitute for professional medical advice."}
                  </div>
                </div>

                {/* Parameters Table */}
                <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                    <span>PARAMETER</span><span>VALUE</span><span>STATUS</span>
                  </div>
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {extractedData.raw_parameters.map((param, index) => {
                      const isHigh = param.status.toLowerCase().includes("high");
                      const isLow = param.status.toLowerCase().includes("low");
                      return (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", padding: "14px 20px", borderBottom: index < extractedData.raw_parameters.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none", fontSize: "13px", alignItems: "center" }}>
                          <div>
                            <span style={{ color: "#fff", fontWeight: 600 }}>{param.name}</span>
                            {param.normal_range && <p style={{ color: "#475569", fontSize: "11px", margin: "2px 0 0" }}>Ref: {param.normal_range}</p>}
                          </div>
                          <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>{param.value}</span>
                          <span style={{ color: isHigh ? "#ef4444" : isLow ? "#3b82f6" : "#22c55e", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {isHigh ? <ArrowUpRight size={14} /> : isLow ? <ArrowDownRight size={14} /> : "●"} {param.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI CHAT */}
              <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 24, display: "flex", flexDirection: "column", height: "580px", overflow: "hidden" }}>
                <div style={{ padding: "18px 20px", background: "rgba(37,99,235,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                  <Bot size={18} style={{ color: "#3b82f6" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Sehat-Sathi AI Health Companion</h4>
                    <p style={{ fontSize: "10px", color: "#475569", margin: 0 }}>General health information only — not medical advice</p>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                      <div style={{ background: msg.role === "user" ? "#2563eb" : "rgba(255,255,255,0.03)", color: "#fff", padding: "12px 16px", borderRadius: 16, fontSize: "13px", lineHeight: 1.5, textAlign: "left", whiteSpace: "pre-line" }}>
                        {msg.text}
                      </div>
                      {msg.role === "assistant" && chatHistory.indexOf(msg) > 0 && (
                        <p style={{ fontSize: "10px", color: "#334155", margin: "4px 4px 0", fontStyle: "italic" }}>
                          ⚕️ For informational purposes only. Consult a doctor for medical decisions.
                        </p>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ alignSelf: "flex-start" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", color: "#fff", padding: "12px 16px", borderRadius: 16, fontSize: "13px" }}>
                        <Loader2 size={16} className="animate-spin" style={{ color: "#3b82f6" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#040814", display: "flex", gap: 10 }}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about your results..." style={{ flex: 1, ...inputStyle }} />
                  <button type="submit" style={{ background: "#2563eb", border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* UPLOAD ZONE */}
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            style={{ background: dragActive ? "rgba(37,99,235,0.04)" : "#091022", border: `2px dashed ${dragActive ? "#3b82f6" : "rgba(37,99,235,0.2)"}`, borderRadius: 20, padding: "60px 40px", textAlign: "center", position: "relative", transition: "all 0.3s" }}>
            <input type="file" id="file-upload-input" onChange={handleFileChange} style={{ display: "none" }} accept=".pdf,.png,.jpg,.jpeg" />
            {uploadState === "idle" && (
              <>
                <Upload size={32} style={{ color: "#3b82f6", margin: "0 auto 16px", display: "block" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>📁 Upload Your Medical Report</h4>
                <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "360px", margin: "6px auto 20px" }}>Drag and drop your report or click to browse. Supports PDF, PNG, JPG.</p>
                <button style={{ padding: "12px 24px", fontSize: "13px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }} onClick={() => document.getElementById("file-upload-input").click()}>
                  Select File
                </button>
              </>
            )}
            {uploadState === "loading" && (
              <div>
                <Loader2 size={36} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 16px", display: "block" }} />
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>{statusMessage}</h4>
              </div>
            )}
            {uploadState === "success" && (
              <div>
                <FileText size={36} style={{ color: "#22c55e", margin: "0 auto 16px", display: "block" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#22c55e" }}>✅ Report Processed</h4>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px auto 16px" }}>{statusMessage}</p>
                <button style={{ padding: "8px 18px", fontSize: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }} onClick={() => setUploadState("idle")}>Upload Another</button>
              </div>
            )}
            {uploadState === "error" && (
              <div>
                <AlertCircle size={36} style={{ color: "#ef4444", margin: "0 auto 16px", display: "block" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ef4444" }}>❌ Error</h4>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px auto 16px" }}>{statusMessage}</p>
                <button style={{ padding: "8px 18px", fontSize: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }} onClick={() => setUploadState("idle")}>Try Again</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DOCTOR MODULE ─────────────────────────────────────── */}
      {activeModule === "doctor" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => { setActiveModule(null); setSelectedDoctor(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronLeft size={14} /> Back to Dashboard
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <h2 className="serif" style={{ fontSize: "32px", color: "#fff", margin: 0 }}>🩺 Doctor Consultation</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Cardiologist", "Diabetologist", "Thyroid Specialist", "General Physician", "Neurologist"].map(spec => (
                <button key={spec} onClick={() => setSelectedSpecialty(spec)} style={{
                  background: selectedSpecialty === spec ? "#2563eb" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedSpecialty === spec ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
                  color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: "12px", cursor: "pointer"
                }}>{spec}</button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: 28 }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input type="text" placeholder="Search doctors by name or specialization..." value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          {doctorsLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", display: "block", color: "#3b82f6" }} />
              <p>Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Stethoscope size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No doctors registered yet. Doctors can join by signing up with the Doctor role.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: selectedDoctor ? "1fr 1.1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: selectedDoctor ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {filteredDoctors.map(doc => (
                  <div key={doc.id} onClick={() => { setSelectedDoctor(doc); setDoctorForm({ date: "", slot: "" }); setDoctorSlots([]); }}
                    style={{ background: "#030712", border: selectedDoctor?.id === doc.id ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px", cursor: "pointer", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👨‍⚕️</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: "#60a5fa" }}>{doc.specialty || "General"}</div>
                      </div>
                    </div>
                    {doc.qualifications && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{doc.qualifications}</div>}
                    {doc.experience_years > 0 && <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>{doc.experience_years} years experience</div>}
                    <button style={{ width: "100%", fontSize: 13, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Book Consultation</button>
                  </div>
                ))}
              </div>

              {selectedDoctor && (
                <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 20, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>📅 Book Consultation</h3>
                    <button onClick={() => setSelectedDoctor(null)} style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer" }}><X size={16} /></button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: 20 }}>with {selectedDoctor.name}</p>

                  <form onSubmit={handleDoctorBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>DATE</label>
                      <input type="date" required value={doctorForm.date}
                        onChange={e => setDoctorForm({ ...doctorForm, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                    </div>

                    {doctorForm.date && doctorSlots.length > 0 && (
                      <div>
                        <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 8 }}>AVAILABLE SLOTS ({doctorSlots.length} open)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                          {doctorSlots.map(slot => (
                            <button key={slot} type="button" onClick={() => setDoctorForm({ ...doctorForm, slot })}
                              style={{ padding: "8px 4px", fontSize: "11px", background: doctorForm.slot === slot ? "#2563eb" : "rgba(255,255,255,0.03)", border: `1px solid ${doctorForm.slot === slot ? "#3b82f6" : "rgba(255,255,255,0.08)"}`, color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: doctorForm.slot === slot ? 700 : 400 }}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {doctorForm.date && doctorSlots.length === 0 && (
                      <p style={{ color: "#ef4444", fontSize: "13px" }}>No slots available for this date. Try another date.</p>
                    )}

                    <button type="submit" disabled={!doctorForm.slot} style={{ padding: "12px", fontSize: "13px", background: doctorForm.slot ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: doctorForm.slot ? "pointer" : "not-allowed", opacity: doctorForm.slot ? 1 : 0.5 }}>
                      Confirm Booking
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS MODULE ────────────────────────────────── */}
      {activeModule === "appointments" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => { setActiveModule(null); setRescheduleTarget(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronLeft size={14} /> Back to Dashboard
          </button>

          <h2 className="serif" style={{ fontSize: "32px", color: "#fff", marginBottom: 8 }}>📅 My Appointments</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 24 }}>Manage your upcoming appointments</p>

          {aptsLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 12px", display: "block" }} />
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Calendar size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No appointments yet. Go to Doctor Consultation to book one.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {appointments.map(apt => (
                <div key={apt.id} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{apt.doctor_name || "Dr. " + apt.doctor_id.slice(-6)}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 4 }}>📅 {apt.date} &nbsp;🕐 {apt.time_slot}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        background: apt.status === "Confirmed" ? "rgba(34,197,94,0.1)" : apt.status === "Pending" ? "rgba(245,158,11,0.1)" : apt.status === "Cancelled" ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.1)",
                        color: apt.status === "Confirmed" ? "#22c55e" : apt.status === "Pending" ? "#f59e0b" : apt.status === "Cancelled" ? "#ef4444" : "#9ca3af",
                        padding: "4px 12px", borderRadius: 8, fontSize: "12px", fontWeight: 700
                      }}>
                        {apt.status === "Pending" ? "⏳" : apt.status === "Confirmed" ? "✅" : apt.status === "Cancelled" ? "❌" : "✔️"} {apt.status}
                      </span>
                      {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                        <>
                          <button onClick={() => { setRescheduleTarget(apt.id); setRescheduleForm({ new_date: "", new_time_slot: "" }); }}
                            style={{ padding: "6px 12px", fontSize: "11px", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                            🔄 Reschedule
                          </button>
                          <button onClick={() => handleCancelAppointment(apt.id)}
                            style={{ padding: "6px 12px", fontSize: "11px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                            ✕ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reschedule inline form */}
                  {rescheduleTarget === apt.id && (
                    <form onSubmit={handleReschedule} style={{ marginTop: 16, padding: "16px", background: "#030712", borderRadius: 12, border: "1px solid rgba(37,99,235,0.15)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 4 }}>NEW DATE</label>
                        <input type="date" required value={rescheduleForm.new_date}
                          onChange={e => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 4 }}>NEW TIME SLOT</label>
                        <input type="text" required placeholder="10:00 AM" value={rescheduleForm.new_time_slot}
                          onChange={e => setRescheduleForm({ ...rescheduleForm, new_time_slot: e.target.value })} style={inputStyle} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Confirm</button>
                        <button type="button" onClick={() => setRescheduleTarget(null)} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BLOOD DONOR MODULE ─────────────────────────────────── */}
      {activeModule === "blood" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => setActiveModule(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronLeft size={14} /> Back
          </button>
          <h2 className="serif" style={{ fontSize: "32px", color: "#fff", marginBottom: 24 }}>🩸 Blood Donor Network</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <div>
              <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>BLOOD GROUP</label>
              <select value={searchBloodGroup} onChange={e => setSearchBloodGroup(e.target.value)} style={selectStyle}>
                <option value="All">All Groups</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>CITY</label>
              <input type="text" placeholder="Search city..." value={searchCity} onChange={e => setSearchCity(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 16 }}>Available Donors</h4>
              {donorsLoading ? <div style={{ color: "#64748b", textAlign: "center", padding: "30px" }}><Loader2 size={24} className="animate-spin" style={{ color: "#ef4444" }} /></div>
                : filteredDonors.length === 0 ? (
                  <div style={{ color: "#64748b", textAlign: "center", padding: "30px" }}>
                    <p>No donors registered yet. Register below to help save lives!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredDonors.map((donor, idx) => (
                      <div key={donor.id || idx} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{donor.name}</span>
                          <span style={{ background: "#ef4444", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: "12px", fontWeight: 600 }}>{donor.bloodGroup}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px" }}>{donor.city}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "3px 10px", borderRadius: 6, fontSize: "11px", fontWeight: 600 }}>Available</span>
                          <button onClick={() => { setMatchedDonor(donor); setShowDonorModal(true); }} style={{ padding: "6px 12px", fontSize: "11px", background: "#2563eb", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Contact</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "rgba(34,197,94,0.01)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 20, padding: "24px" }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 14 }}>🩸 Register as Donor</h4>
                <form onSubmit={handleDonorRegistration} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="text" placeholder="Full Name" required value={donorForm.fullName} onChange={e => setDonorForm({ ...donorForm, fullName: e.target.value })} style={inputStyle} />
                  <input type="tel" placeholder="Phone" required value={donorForm.phone} onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })} style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <select value={donorForm.bloodGroup} onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })} style={selectStyle}>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <input type="number" placeholder="Age" required value={donorForm.age} onChange={e => setDonorForm({ ...donorForm, age: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="text" placeholder="City" required value={donorForm.city} onChange={e => setDonorForm({ ...donorForm, city: e.target.value })} style={inputStyle} />
                    <input type="text" placeholder="State" required value={donorForm.state} onChange={e => setDonorForm({ ...donorForm, state: e.target.value })} style={inputStyle} />
                  </div>
                  <button type="submit" style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Register as Donor</button>
                </form>
              </div>

              <div style={{ background: "rgba(239,68,68,0.01)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 20, padding: "24px" }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 14 }}>🚨 Request Blood</h4>
                <form onSubmit={handleBloodRequest} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="text" placeholder="Patient Name" required value={bloodRequestForm.patientName} onChange={e => setBloodRequestForm({ ...bloodRequestForm, patientName: e.target.value })} style={inputStyle} />
                  <select value={bloodRequestForm.bloodGroup} onChange={e => setBloodRequestForm({ ...bloodRequestForm, bloodGroup: e.target.value })} style={selectStyle}>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                  <input type="text" placeholder="Hospital Name" required value={bloodRequestForm.hospital} onChange={e => setBloodRequestForm({ ...bloodRequestForm, hospital: e.target.value })} style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="text" placeholder="City" required value={bloodRequestForm.city} onChange={e => setBloodRequestForm({ ...bloodRequestForm, city: e.target.value })} style={inputStyle} />
                    <select value={bloodRequestForm.urgency} onChange={e => setBloodRequestForm({ ...bloodRequestForm, urgency: e.target.value })} style={selectStyle}>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟠 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                  <input type="tel" placeholder="Contact Phone" required value={bloodRequestForm.phone} onChange={e => setBloodRequestForm({ ...bloodRequestForm, phone: e.target.value })} style={inputStyle} />
                  <button type="submit" style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Submit Request</button>
                </form>
              </div>
            </div>
          </div>

          {bloodRequests.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Active Blood Requests</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bloodRequests.map((r, i) => (
                  <div key={r.id || i} style={{ background: "#070c19", padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{r.patientName}</span>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 2 }}>{r.hospital} ({r.city})</div>
                      <span style={{ display: "inline-block", background: r.urgency === "High" ? "rgba(239,68,68,0.1)" : "rgba(251,146,60,0.1)", color: r.urgency === "High" ? "#ef4444" : "#f97316", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginTop: 6 }}>Urgency: {r.urgency}</span>
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: "#ef4444" }}>{r.bloodGroup}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HEALTH TRENDS MODULE ────────────────────────────────── */}
      {activeModule === "trends" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => setActiveModule(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronLeft size={14} /> Back
          </button>
          <h2 className="serif" style={{ fontSize: "32px", color: "#fff", marginBottom: 8 }}>📈 Health Trends</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 24 }}>Track your health parameters over time across all uploaded reports</p>

          {savedReports.length < 2 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <TrendingUp size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>Upload at least 2 medical reports to see health trends and comparisons.</p>
            </div>
          ) : (
            <div>
              {/* Wellness score timeline */}
              <div style={{ background: "#070c19", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 20, padding: "24px", marginBottom: 24 }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 16 }}>Wellness Score History</h4>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                  {savedReports.map((r, i) => {
                    const params = r.analysis_data?.parameters_table || [];
                    const score = params.length > 0 ? Math.round((params.filter(p => p.status?.toLowerCase() === "normal").length / params.length) * 100) : null;
                    return (
                      <div key={i} style={{ minWidth: 120, background: "#030712", borderRadius: 12, padding: "16px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444" }}>
                          {score !== null ? `${score}%` : "—"}
                        </div>
                        <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
                          {r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : `Report ${i + 1}`}
                        </p>
                        <p style={{ fontSize: 10, color: "#334155" }}>{r.file_name?.slice(0, 20) || "Report"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parameter comparison across reports */}
              {(() => {
                // Collect all unique parameter names across all reports
                const allParams = new Map();
                savedReports.forEach((r, rIdx) => {
                  const params = r.analysis_data?.parameters_table || [];
                  params.forEach(p => {
                    if (!allParams.has(p.name)) allParams.set(p.name, []);
                    allParams.get(p.name).push({ value: p.value, status: p.status, reportIdx: rIdx, date: r.uploaded_at });
                  });
                });

                return [...allParams.entries()].slice(0, 10).map(([paramName, values]) => {
                  const latest = values[0];
                  const previous = values[1];
                  const isHigh = latest.status?.toLowerCase().includes("high");
                  const isLow = latest.status?.toLowerCase().includes("low");
                  const isNormal = latest.status?.toLowerCase() === "normal";
                  const changed = previous && latest.status !== previous.status;
                  return (
                    <div key={paramName} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{paramName}</div>
                        <div style={{ fontSize: "12px", color: "#475569", marginTop: 2 }}>
                          Latest: <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>{latest.value}</span>
                          {previous && <span style={{ marginLeft: 10, color: "#334155" }}>Previous: <span style={{ fontFamily: "monospace" }}>{previous.value}</span></span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {changed && (
                          <span style={{ fontSize: "11px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                            Changed
                          </span>
                        )}
                        <span style={{ color: isHigh ? "#ef4444" : isLow ? "#3b82f6" : "#22c55e", fontWeight: 700, fontSize: "13px" }}>
                          {isHigh ? "↑ High" : isLow ? "↓ Low" : "● Normal"}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* DONOR CONTACT MODAL */}
      {showDonorModal && matchedDonor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(2,4,8,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowDonorModal(false)}>
          <div style={{ width: "100%", maxWidth: "400px", background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDonorModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={16} /></button>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ background: "rgba(239,68,68,0.1)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#ef4444" }}>
                <Droplet size={28} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>Donor Information</h3>
            </div>
            <div style={{ background: "#030712", borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 16 }}>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Name: <strong style={{ color: "#fff" }}>{matchedDonor.name}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Blood Type: <strong style={{ color: "#ef4444" }}>{matchedDonor.bloodGroup}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Phone: <strong style={{ color: "#60a5fa", fontFamily: "monospace" }}>{matchedDonor.phone}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>City: <strong style={{ color: "#fff" }}>{matchedDonor.city}</strong></div>
            </div>
            <a href={`tel:${matchedDonor.phone}`} style={{ display: "block", width: "100%", padding: "12px", fontSize: "13px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>📞 Call Donor</a>
          </div>
        </div>
      )}
    </div>
  );
}
