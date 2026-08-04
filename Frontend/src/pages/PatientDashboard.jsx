import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Shield, CheckCircle2, RefreshCw, Zap, Heart, Award, Upload, FileText,
  Loader2, AlertCircle, Bot, Send, Activity, ArrowUpRight, ArrowDownRight,
  User, Save, Edit2, History, Stethoscope, Calendar, Droplet,
  Phone, MapPin, Search, X, LogOut, TrendingUp, Clock,
  Sparkles, ShoppingBag, FlaskConical, Building2, AlertTriangle, LayoutDashboard,
  ChevronLeft, ChevronRight
} from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
// V2 Module Imports
import WorkflowTimeline from "./v2/WorkflowTimeline";
import FollowUpTracker from "./v2/FollowUpTracker";
import FloatingNotification from "../components/FloatingNotification";
import DashboardLayout from "../components/DashboardLayout";
import { inputStyle, selectStyle } from "../ui/theme";
import T from "../ui/tokens";
// Patient module pages
import SymptomChecker from "./patient/SymptomChecker";
import DoctorDirectory from "./patient/DoctorDirectory";
import HospitalDirectory from "./patient/HospitalDirectory";
import EmergencyServices from "./patient/EmergencyServices";
import DoctorProfileModal from "./patient/DoctorProfileModal";
import AppointmentsModule from "./patient/AppointmentsModule";
import AppointmentPaymentModal from "../components/AppointmentPaymentModal";
import PaymentInvoiceModal from "../components/PaymentInvoiceModal";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import EnhancedBloodModal from "../components/EnhancedBloodModal";
import HospitalRoomBookingModal from "../components/HospitalRoomBookingModal";

import { API_BASE } from "../api/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ── 8 Primary Dashboard Modules (no duplicates) ─────────────────────────────
const DASHBOARD_MODULES = [
  { id: "doctordir", title: "Find Doctors", desc: "Browse & book verified specialists", icon: <Stethoscope size={22} />, color: T.primary, bg: T.primaryLight, border: T.primaryBorder },
  { id: "hospitaldir", title: "Hospitals", desc: "Explore hospitals, departments & doctors", icon: <Building2 size={22} />, color: T.cyan, bg: T.cyanLight, border: T.cyanBorder },
  { id: "appointments", title: "Appointments", desc: "Track and manage your care bookings", icon: <Calendar size={22} />, color: T.green, bg: T.greenLight, border: T.greenBorder },
  { id: "emergency", title: "Emergency", desc: "SOS, ambulance, hospitals & blood support", icon: <AlertTriangle size={22} />, color: T.red, bg: T.redLight, border: T.redBorder, isSOS: true },
  { id: "reports", title: "Medical Reports", desc: "Upload, review and understand your reports", icon: <FileText size={22} />, color: T.primary, bg: T.primaryLight, border: T.primaryBorder },
  { id: "symptom", title: "AI Health Assistant", desc: "Ask health questions and check symptoms", icon: <FlaskConical size={22} />, color: T.purple, bg: T.purpleLight, border: T.purpleBorder },
  { id: "timeline", title: "Health Records", desc: "Your connected care timeline and history", icon: <Clock size={22} />, color: T.cyan, bg: T.cyanLight, border: T.cyanBorder },
  { id: "profile", title: "Profile", desc: "Manage your personal health information", icon: <User size={22} />, color: T.green, bg: T.greenLight, border: T.greenBorder },
  { id: "settings", title: "Settings", desc: "Theme, privacy and account preferences", icon: <Activity size={22} />, color: T.textSecondary, bg: T.surfaceAlt, border: T.border },
];

// ── Sidebar navigation (organised groups) ─────────────────────────────────────
const SIDEBAR_NAV = [
  { id: "home",         label: "Dashboard",        icon: <LayoutDashboard size={16} /> },
  { id: "doctordir",    label: "Find Doctors",      icon: <Stethoscope size={16} />,    group: "Care" },
  { id: "hospitaldir",  label: "Hospitals",         icon: <Building2 size={16} />,      group: "Care" },
  { id: "appointments", label: "Appointments",      icon: <Calendar size={16} />,       group: "Care" },
  { id: "emergency",    label: "Emergency",         icon: <AlertTriangle size={16} />,  group: "Care" },
  { id: "reports",      label: "Medical Reports",   icon: <FileText size={16} />,       group: "Health" },
  { id: "symptom",      label: "AI Health Assistant", icon: <FlaskConical size={16} />,  group: "Health" },
  { id: "timeline",     label: "Health Records",    icon: <Clock size={16} />,           group: "Health" },
  { id: "blood",        label: "Blood Network",     icon: <Droplet size={16} />,         group: "Emergency" },
  { id: "followups",    label: "Follow-ups",        icon: <Shield size={16} />,         group: "More" },
  { id: "prescriptions",label: "Prescriptions",     icon: <Activity size={16} />,       group: "More" },
  { id: "profile",      label: "Profile",           icon: <User size={16} />,            group: "Account" },
  { id: "settings",     label: "Settings",          icon: <Activity size={16} />,        group: "Account" },
];

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const token = localStorage.getItem("sehat_sathi_token") || localStorage.getItem("token");
  const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

  // ── Translated nav (computed inside component so t() is reactive) ────────
  const SIDEBAR_NAV = [
    { id: "home",          label: t("pat_nav_home"),          icon: <LayoutDashboard size={16} /> },
    { id: "doctordir",     label: t("pat_nav_find_doctors"),  icon: <Stethoscope size={16} />,    group: t("pat_group_care") },
    { id: "hospitaldir",   label: t("pat_nav_hospitals"),     icon: <Building2 size={16} />,      group: t("pat_group_care") },
    { id: "appointments",  label: t("pat_nav_appointments"),  icon: <Calendar size={16} />,       group: t("pat_group_care") },
    { id: "emergency",     label: t("pat_nav_emergency"),     icon: <AlertTriangle size={16} />,  group: t("pat_group_care") },
    { id: "reports",       label: t("pat_nav_reports"),       icon: <FileText size={16} />,       group: t("pat_group_health") },
    { id: "symptom",       label: t("pat_nav_ai_assistant"),  icon: <FlaskConical size={16} />,   group: t("pat_group_health") },
    { id: "timeline",      label: t("pat_nav_health_records"),icon: <Clock size={16} />,           group: t("pat_group_health") },
    { id: "blood",         label: t("pat_nav_blood_network"), icon: <Droplet size={16} />,         group: t("pat_group_emergency") },
    { id: "followups",     label: t("pat_nav_followups"),     icon: <Shield size={16} />,          group: t("pat_group_more") },
    { id: "prescriptions", label: t("pat_nav_prescriptions"), icon: <Activity size={16} />,       group: t("pat_group_more") },
    { id: "profile",       label: t("pat_nav_profile"),       icon: <User size={16} />,            group: t("pat_group_account") },
    { id: "settings",      label: t("pat_nav_settings"),      icon: <Activity size={16} />,        group: t("pat_group_account") },
  ];

  // ── VIEW STATE ──────────────────────────────────────────────────────────
  const [activeModule, setActiveModule] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // ── PROFILE ─────────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", location: "", age: "", bloodType: "O+"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── REPORTS ─────────────────────────────────────────────────────────────
  const [savedReports, setSavedReports] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // ── AI CHAT ─────────────────────────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your Sehat-Sathi AI health companion. Upload a medical report to get started, or ask me any health question!` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ── APPOINTMENTS ────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ new_date: "", new_time_slot: "" });

  // ── BOOKING MODAL ────────────────────────────────────────────────────────
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: "", time_slot: "", reason: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSlots, setBookingSlots] = useState([]);
  const [bookingSlotsLoading, setBookingSlotsLoading] = useState(false);

  // ── BLOOD DONORS ────────────────────────────────────────────────────────
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchCity, setSearchCity] = useState("");
  const [donorForm, setDonorForm] = useState({ fullName: "", phone: "", bloodGroup: "O+", age: "", city: "", state: "", lastDonation: "" });
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [matchedDonor, setMatchedDonor] = useState(null);
  const [bloodRequestForm, setBloodRequestForm] = useState({ patientName: "", bloodGroup: "O+", hospital: "", city: "", urgency: "High", phone: "" });
  const [bloodRequests, setBloodRequests] = useState([]);

  // ── EFFECTS ─────────────────────────────────────────────────────────────



  // ── NOTIFICATION HELPER ─────────────────────────────────────────────────

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  // ── API CALLS ───────────────────────────────────────────────────────────

  const loadReports = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/reports/my`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSavedReports(data);
        if (data.length > 0 && data[0].analysis_data) {
          const latest = data[0].analysis_data;
          if (latest.parameters_table?.length > 0) setExtractedData(transformAnalysis(latest));
        }
      } else if (res.status === 401) {
        logout();
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

  const loadAppointments = async () => {
    if (!token) return;
    setAptsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/my`, { headers: authHeaders });
      if (res.ok) {
        setAppointments(await res.json());
      } else if (res.status === 401) {
        logout();
      }
    } catch (e) { console.error("Load apts error", e); }
    finally { setAptsLoading(false); }
  };

  const DEFAULT_SLOTS = [
    "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
    "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
    "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
    "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM",
    "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM",
    "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM",
    "05:00 PM", "05:15 PM", "05:30 PM"
  ];

  const fetchAvailableSlots = async (doc, date) => {
    const docId = typeof doc === "object" ? (doc?.id || doc?._id || doc?.user_id) : doc;
    const targetDate = date || new Date().toISOString().split("T")[0];
    setBookingSlotsLoading(true);
    try {
      if (docId && docId !== "undefined") {
        const res = await fetch(`${API_BASE}/appointments/doctor/${docId}/slots?date=${targetDate}`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          const slots = data.available_slots || [];
          setBookingSlots(slots.length > 0 ? slots : DEFAULT_SLOTS);
          setBookingSlotsLoading(false);
          return;
        }
      }
      setBookingSlots(DEFAULT_SLOTS);
    } catch (e) {
      console.error("Slots fetch error", e);
      setBookingSlots(DEFAULT_SLOTS);
    } finally {
      setBookingSlotsLoading(false);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [bloodModalMode, setBloodModalMode] = useState(null); // 'register' | 'request' | null

  const handleOpenBooking = (doctor) => {
    const today = new Date().toISOString().split("T")[0];
    setBookingDoctor(doctor);
    setBookingForm({ date: today, time_slot: "", reason: "" });
    fetchAvailableSlots(doctor, today);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.time_slot) {
      showNotif("Please select a date and time slot.", "error"); return;
    }
    setShowPaymentModal(true);
  };

  const handleFinalBookingConfirm = async (paymentData) => {
    setBookingLoading(true);
    try {
      const docName = bookingDoctor?.name?.startsWith("Dr.") ? bookingDoctor.name : `Dr. ${bookingDoctor?.name || 'Specialist'}`;
      const docSpec = bookingDoctor?.specialty || bookingDoctor?.specialization || "General Physician";
      const hospName = bookingDoctor?.hospital_name || bookingDoctor?.hospital || "Sehat-Sathi Partnered Clinic";

      // If Razorpay verification already booked the appointment server-side:
      if (paymentData?.invoice) {
        showNotif(`Appointment booked successfully.`, "success");
        showNotif(`Payment completed successfully via Razorpay.`, "success");
        setShowPaymentModal(false);
        const inv = paymentData.invoice;
        setSuccessBookingData({
          doctor_name: docName,
          doctor_specialty: docSpec,
          hospital_name: hospName,
          date: bookingForm.date,
          time_slot: bookingForm.time_slot,
          appointment_id: inv.appointment_id || inv.id,
          transaction_id: paymentData.transaction_id,
          amount: paymentData.amount || 500,
          payment_method: paymentData.payment_method,
          invoice: inv
        });
        setBookingDoctor(null);
        loadAppointments();
        setBookingLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/appointments/book`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: bookingDoctor.id || bookingDoctor._id || "650000000000000000000001",
          doctor_name: docName,
          doctor_specialty: docSpec,
          hospital_id: bookingDoctor.hospital_id || null,
          hospital_name: hospName,
          patient_name: user?.name || "Patient",
          date: bookingForm.date,
          time_slot: bookingForm.time_slot,
          reason: bookingForm.reason || "General consultation",
          payment_method: paymentData.payment_method,
          payment_status: paymentData.payment_status,
          amount: paymentData.amount,
          transaction_id: paymentData.transaction_id,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Booking failed");

      // Generate Invoice record for Cash booking
      const invObj = {
        invoice_number: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        patient_name: user?.name || "Patient",
        patient_id: `PAT-${(user?.id || "892410").slice(-6).toUpperCase()}`,
        doctor_name: docName,
        doctor_specialization: docSpec,
        hospital_name: hospName,
        service_name: "Doctor Consultation & Health Guidance",
        base_amount: paymentData.amount || 500,
        tax_amount: Math.round((paymentData.amount || 500) * 0.18),
        discount: 0,
        total_amount: Math.round((paymentData.amount || 500) * 1.18),
        payment_method: (paymentData.payment_method || "CASH").toUpperCase(),
        payment_status: paymentData.payment_status || "Cash at Clinic",
        reference_number: paymentData.transaction_id || `SS-PAY-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      try {
        await fetch(`${API_BASE}/invoices/generate`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(invObj)
        });
      } catch (err) {
        console.warn("Invoice creation ping warning:", err);
      }

      showNotif(`Appointment booked successfully.`, "success");
      showNotif(`Payment completed successfully.`, "success");
      setShowPaymentModal(false);
      setSuccessBookingData({
        doctor_name: docName,
        doctor_specialty: docSpec,
        hospital_name: hospName,
        date: bookingForm.date,
        time_slot: bookingForm.time_slot,
        appointment_id: data.appointment_id || `SS-APT-${Date.now()}`,
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount || 500,
        payment_method: paymentData.payment_method || "CASH",
        invoice: invObj
      });
      setBookingDoctor(null);
      loadAppointments();
    } catch (e) { showNotif(e.message, "error"); }
    setBookingLoading(false);
  };

  const handleDeleteAppointment = async (aptId) => {
    if (!aptId) return;
    try {
      setAppointments(prev => prev.filter(a => (a.id || a._id || a.appointment_id) !== aptId));
      const res = await fetch(`${API_BASE}/appointments/${aptId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Delete failed");
      }
      showNotif("Cancelled appointment deleted successfully.", "success");
      loadAppointments();
    } catch (err) {
      showNotif(err.message || "Failed to delete appointment", "error");
      loadAppointments();
    }
  };

  const loadDonors = async () => {
    setDonorsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donors`, { headers: authHeaders });
      if (res.ok) setDonors(await res.json());
    } catch (e) { console.error("Load donors error", e); }
    finally { setDonorsLoading(false); }
  };

  useEffect(() => { loadReports(); loadAppointments(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);
  useEffect(() => {
    if (activeModule === "appointments") loadAppointments();
    if (activeModule === "blood" && donors.length === 0) loadDonors();
    if (activeModule === "timeline" && appointments.length === 0) loadAppointments();
  }, [activeModule]);

  // ── FILE UPLOAD ─────────────────────────────────────────────────────────

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
        method: "POST", headers: authHeaders, body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Extraction failed");
      const transformed = transformAnalysis(data);
      setExtractedData(transformed);
      setSavedReports(prev => [{
        id: data.report_id, file_name: file.name,
        uploaded_at: new Date().toISOString(), analysis_data: data
      }, ...prev]);
      setChatHistory([{ role: "assistant", text: `✅ Report analyzed! I found ${data.parameters_table?.length || 0} parameters. ${data.ai_consultant_summary?.status_headline || ""} Ask me anything about your results!` }]);
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

  // ── AI CHAT ─────────────────────────────────────────────────────────────

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

  // ── APPOINTMENT ACTIONS ─────────────────────────────────────────────────

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

  // ── PROFILE SAVE ────────────────────────────────────────────────────────

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

  // ── BLOOD DONOR ─────────────────────────────────────────────────────────

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
      showNotif("Request noted. Our team will reach out.");
      setBloodRequests(prev => [...prev, { ...bloodRequestForm, id: Date.now() }]);
    }
  };

  // ── DERIVED STATE ───────────────────────────────────────────────────────

  const filteredDonors = donors.filter(d => {
    const matchBG = searchBloodGroup === "All" || d.bloodGroup === searchBloodGroup;
    const matchCity = !searchCity || d.city?.toLowerCase().includes(searchCity.toLowerCase());
    return matchBG && matchCity;
  });

  const highParams = extractedData?.raw_parameters?.filter(p =>
    p.status.toLowerCase().includes("high") || p.status.toLowerCase().includes("low")) || [];

  const healthScore = extractedData?.raw_parameters?.length > 0
    ? Math.round((extractedData.raw_parameters.filter(p => p.status.toLowerCase() === "normal").length / extractedData.raw_parameters.length) * 100)
    : null;

  const pendingApts = appointments.filter(a => a.status !== "Cancelled" && a.status !== "Completed");
  const upcomingApts = pendingApts.slice(0, 2);

  const navItemsWithBadges = SIDEBAR_NAV.map(item => ({
    ...item,
    badge: item.id === "appointments" ? pendingApts.length : 0,
  }));

  // ── NAV HANDLER ─────────────────────────────────────────────────────────

  const handleTabChange = (id) => {
    if (!id || id === "home") setActiveModule(null);
    else setActiveModule(id);
  };

  const getActiveTabId = () => {
    if (!activeModule) return "home";
    return activeModule;
  };

  const getBreadcrumb = () => {
    if (!activeModule) return [];
    const mod = DASHBOARD_MODULES.find(m => m.id === activeModule);
    if (mod) return [mod.title];
    const nav = SIDEBAR_NAV.find(n => n.id === activeModule);
    return nav ? [nav.label] : [activeModule];
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return (
    <DashboardLayout
      navItems={navItemsWithBadges}
      activeTab={getActiveTabId()}
      onTabChange={handleTabChange}
      role="Patient"
      breadcrumb={getBreadcrumb()}
    >
      <div className="dash-page">
        <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

        {/* ── DASHBOARD HOME ──────────────────────────────────────── */}
        {!activeModule && (
          <div className="fade-up">

            {/* Welcome Banner */}
            <div className="dash-welcome-banner">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0] || "there"} 👋
                </h2>
                <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>
                  {pendingApts.length > 0
                    ? `You have ${pendingApts.length} upcoming appointment${pendingApts.length > 1 ? "s" : ""}.`
                    : "Your health dashboard is ready. How can we help today?"}
                </p>

                {/* Health score chip */}
                {healthScore !== null && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                    <Activity size={12} /> Health Score: {healthScore}%
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments Widget (if any) */}
            {upcomingApts.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Upcoming Appointments</span>
                  <button onClick={() => setActiveModule("appointments")} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View All →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {upcomingApts.map(apt => (
                    <div key={apt.id} className="apt-mini-card">
                      <div className="apt-mini-dot" style={{ background: apt.status === "Confirmed" ? "var(--green)" : "var(--amber)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          Dr. {apt.doctor_name || "Doctor"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{apt.date} · {apt.time_slot}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, background: apt.status === "Confirmed" ? "var(--green-light)" : "var(--amber-light)", color: apt.status === "Confirmed" ? "var(--green)" : "var(--amber)", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 8 Primary Module Cards */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>Healthcare Services</h3>
              </div>
              <div className="dash-modules-grid">
                {DASHBOARD_MODULES.map(module => (
                  <div
                    key={module.id}
                    className="dash-module-card"
                    style={{ background: module.bg, borderColor: module.border }}
                    onClick={() => setActiveModule(module.id)}
                  >
                    {module.isNew && <span className="card-badge" style={{ background: module.color }}>NEW</span>}
                    {module.isSOS && <span className="card-badge" style={{ background: "#EF4444" }}>SOS</span>}
                    <div className="card-icon" style={{ background: `${module.color}18` }}>
                      <span style={{ color: module.color }}>{module.icon}</span>
                    </div>
                    <div>
                      <h4>{module.title}</h4>
                      <p>{module.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Latest Report Vitals (only if data loaded) */}
            {extractedData && (
              <section style={{ marginBottom: 32 }}>
                <div className="v2-section" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>Latest Report Analysis</h3>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                        {highParams.length > 0 ? `⚠️ ${highParams.length} parameter(s) need attention` : "✅ All values within normal range"}
                      </p>
                    </div>
                    <button onClick={() => setActiveModule("reports")} style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "7px 14px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      View Full Report
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                    {[
                      { title: "Metabolic Rate", value: extractedData.metabolic, icon: <Zap size={15} />, color: "var(--primary)" },
                      { title: "Heart Rate",     value: extractedData.cardio,    icon: <Heart size={15} />, color: "var(--red)" },
                      { title: "AI Score",       value: extractedData.confidence,icon: <Award size={15} />, color: "var(--green)" },
                    ].map((card, i) => (
                      <div key={i} style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.title}</span>
                          <span style={{ color: card.color }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{card.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── REPORTS MODULE ──────────────────────────────────────── */}
        {activeModule === "reports" && (
          <div className="fade-up">
            <button onClick={() => setActiveModule(null)} className="back-btn"><ChevronLeft size={14} /> Dashboard</button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className="serif" style={{ fontSize: 26, color: "var(--text)", margin: 0 }}>My Reports</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 0" }}>{savedReports.length} report{savedReports.length !== 1 ? "s" : ""} uploaded</p>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)", margin: "16px 0 24px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>

              {/* Upload Zone */}
              <div>
                <div
                  className={`upload-zone${dragActive ? " active" : ""}`}
                  onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  onClick={() => uploadState === "idle" && document.getElementById("file-upload-input").click()}
                >
                  <input type="file" id="file-upload-input" onChange={handleFileChange} style={{ display: "none" }} accept=".pdf,.png,.jpg,.jpeg" />
                  {uploadState === "idle" && (
                    <>
                      <Upload size={30} style={{ color: "var(--primary)", margin: "0 auto 12px", display: "block" }} />
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Upload Medical Report</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}>Drag & drop or click to browse. PDF, PNG, JPG supported.</p>
                      <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }} onClick={e => { e.stopPropagation(); document.getElementById("file-upload-input").click(); }}>
                        <Upload size={13} /> Select File
                      </button>
                    </>
                  )}
                  {uploadState === "loading" && (
                    <div style={{ textAlign: "center" }}>
                      <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)", margin: "0 auto 12px", display: "block" }} />
                      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{statusMessage}</p>
                    </div>
                  )}
                  {uploadState === "success" && (
                    <div style={{ textAlign: "center" }}>
                      <CheckCircle2 size={32} style={{ color: "var(--green)", margin: "0 auto 12px", display: "block" }} />
                      <p style={{ color: "var(--green)", fontWeight: 700, fontSize: 14, margin: "0 0 8px" }}>Report Processed!</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 14px" }}>{statusMessage}</p>
                      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setUploadState("idle")}>Upload Another</button>
                    </div>
                  )}
                  {uploadState === "error" && (
                    <div style={{ textAlign: "center" }}>
                      <AlertCircle size={32} style={{ color: "var(--red)", margin: "0 auto 12px", display: "block" }} />
                      <p style={{ color: "var(--red)", fontWeight: 700, fontSize: 14, margin: "0 0 8px" }}>Error</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 14px" }}>{statusMessage}</p>
                      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setUploadState("idle")}>Try Again</button>
                    </div>
                  )}
                </div>

                {/* Reports List */}
                {savedReports.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {savedReports.map((report, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                        style={{
                          background: selectedReport?.id === report.id ? "var(--primary-light)" : "var(--surface)",
                          border: `1px solid ${selectedReport?.id === report.id ? "var(--primary-border)" : "var(--border)"}`,
                          borderRadius: "var(--radius-md)", padding: "14px 16px",
                          cursor: "pointer", transition: "all 0.15s",
                          display: "flex", alignItems: "center", gap: 12
                        }}
                      >
                        <div style={{ background: "var(--primary-light)", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={18} style={{ color: "var(--primary)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{report.file_name || "Medical Report"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            {report.analysis_data?.parameters_table?.length > 0 && ` · ${report.analysis_data.parameters_table.length} parameters`}
                          </div>
                        </div>
                        {report.analysis_data?.parameters_table?.filter(p => p.status?.toLowerCase().includes("high") || p.status?.toLowerCase().includes("low")).length > 0 && (
                          <span style={{ background: "var(--red-light)", color: "var(--red)", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>⚠️ Flags</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {savedReports.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--text-muted)", marginTop: 16 }}>
                    <FileText size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
                    <p style={{ fontSize: 13 }}>No reports uploaded yet.</p>
                  </div>
                )}
              </div>

              {/* Right: Analysis Panel + AI Chat */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Report Detail / Parameters */}
                {extractedData && (
                  <div className="v2-section" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: highParams.length > 0 ? "var(--red)" : "var(--green)", marginBottom: 2 }}>
                          {highParams.length > 0 ? `⚠️ ${highParams.length} value(s) out of range` : "✅ All values normal"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{extractedData.ai_summary?.status_headline || "AI Analysis Complete"}</div>
                      </div>
                    </div>
                    <div className="param-table-header">
                      <span>PARAMETER</span><span>VALUE</span><span>STATUS</span>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                      {extractedData.raw_parameters.map((param, index) => {
                        const isHigh = param.status.toLowerCase().includes("high");
                        const isLow = param.status.toLowerCase().includes("low");
                        return (
                          <div key={index} className="param-table-row">
                            <div>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>{param.name}</span>
                              {param.normal_range && <p style={{ color: "var(--text-muted)", fontSize: 11, margin: "2px 0 0" }}>Ref: {param.normal_range}</p>}
                            </div>
                            <span style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 600 }}>{param.value}</span>
                            <span style={{ color: isHigh ? "var(--red)" : isLow ? "var(--primary)" : "var(--green)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              {isHigh ? <ArrowUpRight size={13} /> : isLow ? <ArrowDownRight size={13} /> : "●"} {param.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {extractedData.disclaimer && (
                      <div style={{ padding: "10px 20px", background: "var(--amber-light)", borderTop: "1px solid var(--amber-border)", fontSize: 11, color: "var(--amber)", lineHeight: 1.5 }}>
                        ⚕️ {extractedData.disclaimer}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Chat */}
                <div className="ai-chat-container">
                  <div className="ai-chat-header">
                    <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={16} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>AI Health Companion</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ask about your report or any health question</div>
                    </div>
                  </div>
                  <div className="ai-chat-messages">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={msg.role === "user" ? "ai-chat-bubble-user" : "ai-chat-bubble-bot"}>
                        {msg.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="ai-chat-bubble-bot" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Loader2 size={14} className="animate-spin" style={{ color: "var(--primary)" }} />
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Thinking...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="ai-chat-input-area">
                    <input
                      type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                      placeholder={extractedData ? "Ask about your results..." : "Ask any health question..."}
                      className="input-field" style={{ flex: 1, fontSize: 13 }}
                    />
                    <button type="submit" style={{ background: "var(--primary)", border: "none", borderRadius: "var(--radius-md)", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS MODULE ─────────────────────────────────── */}
        {activeModule === "appointments" && (
          <AppointmentsModule
            appointments={appointments}
            loading={aptsLoading}
            rescheduleTarget={rescheduleTarget}
            rescheduleForm={rescheduleForm}
            setRescheduleTarget={setRescheduleTarget}
            setRescheduleForm={setRescheduleForm}
            onBack={() => { setActiveModule(null); setRescheduleTarget(null); }}
            onReschedule={handleReschedule}
            onCancel={handleCancelAppointment}
            onDelete={handleDeleteAppointment}
          />
        )}

        {/* ── BLOOD DONOR MODULE ──────────────────────────────────── */}
        {activeModule === "blood" && (
          <div className="fade-up">
            <button onClick={() => setActiveModule(null)} className="back-btn"><ChevronLeft size={14} /> Dashboard</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className="serif" style={{ fontSize: 26, color: "var(--text)", margin: "0 0 4px" }}>🩸 Blood Donor & Emergency Portal</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Register as a verified donor with complete medical clearance or request emergency blood</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setBloodModalMode("register")}
                  style={{
                    background: "linear-gradient(135deg, #DC2626, #B91C1C)", color: "#FFF",
                    border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(220,38,38,0.3)"
                  }}
                >
                  🩸 Register as Donor (Health Form)
                </button>
                <button
                  onClick={() => setBloodModalMode("request")}
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#FFF",
                    border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(124,58,237,0.3)"
                  }}
                >
                  🆘 Request Blood
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="profile-field-label">Blood Group</label>
                <select value={searchBloodGroup} onChange={e => setSearchBloodGroup(e.target.value)} className="input-field" style={{ height: 40, padding: "8px 12px", fontSize: 13 }}>
                  <option value="All">All Groups</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="profile-field-label">City</label>
                <input type="text" placeholder="Filter by city..." value={searchCity} onChange={e => setSearchCity(e.target.value)} className="input-field" style={{ height: 40, padding: "8px 12px", fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {/* Donors list */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Available Donors</h4>
                {donorsLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={24} className="animate-spin" style={{ color: "var(--red)", margin: "auto" }} /></div>
                ) : filteredDonors.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, background: "var(--surface-alt)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                    <Droplet size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.3, color: "var(--red)" }} />
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No donors found. Be the first to register!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredDonors.map((donor, idx) => (
                      <div key={donor.id || idx} className="v2-section" style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{donor.name}</span>
                          <span style={{ background: "var(--red-light)", color: "var(--red)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{donor.bloodGroup}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{donor.city}, {donor.state}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="badge badge-green">Available</span>
                          <button onClick={() => { setMatchedDonor(donor); setShowDonorModal(true); }} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }}>Contact</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Forms */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="v2-section">
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🩸 Register as Donor</h4>
                  <form onSubmit={handleDonorRegistration} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="text" placeholder="Full Name" required value={donorForm.fullName} onChange={e => setDonorForm({ ...donorForm, fullName: e.target.value })} className="input-field" />
                    <input type="tel" placeholder="Phone" required value={donorForm.phone} onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })} className="input-field" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <select value={donorForm.bloodGroup} onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })} className="input-field">
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                      <input type="number" placeholder="Age" required value={donorForm.age} onChange={e => setDonorForm({ ...donorForm, age: e.target.value })} className="input-field" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input type="text" placeholder="City" required value={donorForm.city} onChange={e => setDonorForm({ ...donorForm, city: e.target.value })} className="input-field" />
                      <input type="text" placeholder="State" required value={donorForm.state} onChange={e => setDonorForm({ ...donorForm, state: e.target.value })} className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Register as Donor</button>
                  </form>
                </div>

                <div className="v2-section">
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🚨 Request Blood</h4>
                  <form onSubmit={handleBloodRequest} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="text" placeholder="Patient Name" required value={bloodRequestForm.patientName} onChange={e => setBloodRequestForm({ ...bloodRequestForm, patientName: e.target.value })} className="input-field" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <select value={bloodRequestForm.bloodGroup} onChange={e => setBloodRequestForm({ ...bloodRequestForm, bloodGroup: e.target.value })} className="input-field">
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                      <select value={bloodRequestForm.urgency} onChange={e => setBloodRequestForm({ ...bloodRequestForm, urgency: e.target.value })} className="input-field">
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟠 Medium</option>
                        <option value="Low">🟢 Low</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Hospital Name" required value={bloodRequestForm.hospital} onChange={e => setBloodRequestForm({ ...bloodRequestForm, hospital: e.target.value })} className="input-field" />
                    <input type="text" placeholder="City" required value={bloodRequestForm.city} onChange={e => setBloodRequestForm({ ...bloodRequestForm, city: e.target.value })} className="input-field" />
                    <input type="tel" placeholder="Contact Phone" required value={bloodRequestForm.phone} onChange={e => setBloodRequestForm({ ...bloodRequestForm, phone: e.target.value })} className="input-field" />
                    <button type="submit" className="btn-danger" style={{ width: "100%", justifyContent: "center" }}>Submit Request</button>
                  </form>
                </div>
              </div>
            </div>

            {bloodRequests.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Active Blood Requests</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bloodRequests.map((r, i) => (
                    <div key={r.id || i} style={{ background: "var(--surface-alt)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{r.patientName}</span>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{r.hospital} · {r.city}</div>
                        <span style={{ display: "inline-block", background: r.urgency === "High" ? "var(--red-light)" : "var(--amber-light)", color: r.urgency === "High" ? "var(--red)" : "var(--amber)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginTop: 4 }}>
                          {r.urgency} Urgency
                        </span>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 900, color: "var(--red)" }}>{r.bloodGroup}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HEALTH TIMELINE ─────────────────────────────────────── */}
        {activeModule === "timeline" && (
          <div className="fade-up">
            <button className="back-btn" onClick={() => setActiveModule(null)}><ChevronLeft size={14} /> Dashboard</button>
            <WorkflowTimeline user={user} />
          </div>
        )}

        {/* ── PRESCRIPTIONS ───────────────────────────────────────── */}
        {activeModule === "prescriptions" && (
          <div className="fade-up">
            <button className="back-btn" onClick={() => setActiveModule(null)}><ChevronLeft size={14} /> Dashboard</button>
            <PatientPrescriptionView user={user} token={token} />
          </div>
        )}

        {/* ── FOLLOW-UPS ──────────────────────────────────────────── */}
        {activeModule === "followups" && (
          <div className="fade-up">
            <button className="back-btn" onClick={() => setActiveModule(null)}><ChevronLeft size={14} /> Dashboard</button>
            <FollowUpTracker user={user} />
          </div>
        )}

        {/* ── AI SYMPTOM CHECKER ──────────────────────────────────── */}
        {activeModule === "symptom" && (
          <SymptomChecker onBack={() => setActiveModule(null)} />
        )}

        {/* ── DOCTOR DIRECTORY ────────────────────────────────────── */}
        {activeModule === "doctordir" && (
          <DoctorDirectory
            onBack={() => setActiveModule(null)}
            onBook={(doc) => { handleOpenBooking(doc); }}
          />
        )}

        {/* ── HOSPITAL DIRECTORY ──────────────────────────────────── */}
        {activeModule === "hospitaldir" && (
          <HospitalDirectory
            onBack={() => setActiveModule(null)}
            onBookDoctor={() => setActiveModule("doctordir")}
          />
        )}

        {/* ── EMERGENCY SERVICES ──────────────────────────────────── */}
        {activeModule === "emergency" && (
          <EmergencyServices
            onBack={() => setActiveModule(null)}
          />
        )}

        {/* ── MY PROFILE ──────────────────────────────────────────── */}
        {activeModule === "profile" && (
          <div className="fade-up">
            <button onClick={() => setActiveModule(null)} className="back-btn"><ChevronLeft size={14} /> Dashboard</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 2px" }}>My Profile</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Manage your personal health information</p>
              </div>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={savingProfile}
                className={isEditing ? "btn-primary" : "btn-ghost"}
                style={{ padding: "9px 18px", fontSize: 13 }}
              >
                {savingProfile ? <Loader2 size={13} className="animate-spin" /> : isEditing ? <Save size={13} /> : <Edit2 size={13} />}
                {savingProfile ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="v2-section" style={{ marginBottom: 20, padding: "24px 28px" }}>
              <div className="profile-field-grid">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Location", key: "location" },
                  { label: "Age", key: "age" },
                  { label: "Blood Type", key: "bloodType" }
                ].map(f => (
                  <div key={f.key}>
                    <label className="profile-field-label">{f.label}</label>
                    {f.key === "bloodType" && isEditing ? (
                      <select value={profileData[f.key]} onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })} className="input-field">
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text" value={profileData[f.key] || ""}
                        disabled={!isEditing || f.key === "email"}
                        onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })}
                        placeholder={isEditing ? `Enter ${f.label}` : "Not set"}
                        className="input-field"
                        style={{
                          background: isEditing && f.key !== "email" ? "var(--surface)" : "var(--surface-alt)",
                          border: isEditing && f.key !== "email" ? "1px solid var(--primary-border)" : "1px solid var(--border)",
                          cursor: isEditing && f.key !== "email" ? "text" : "default",
                          color: "var(--text)",
                          opacity: f.key === "email" ? 0.7 : 1,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {[
                { label: "Reports Uploaded", value: savedReports.length, color: "var(--primary)", icon: "📊" },
                { label: "Active Appointments", value: pendingApts.length, color: "var(--green)", icon: "📅" },
                { label: "Wellness Score", value: healthScore !== null ? `${healthScore}%` : "—", color: "var(--purple)", icon: "💪" }
              ].map((stat, i) => (
                <div key={i} className="profile-stat-card">
                  <span className="profile-stat-label">{stat.label}</span>
                  <div className="profile-stat-value" style={{ color: stat.color }}>
                    {stat.icon} {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModule === "settings" && (
          <div className="fade-up">
            <button onClick={() => setActiveModule(null)} className="back-btn"><ChevronLeft size={14} /> Dashboard</button>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 2px" }}>Settings</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Control your Sehat-Sathi experience</p>
            </div>
            <div className="v2-section" style={{ padding: "22px 24px", maxWidth: 720 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>Appearance</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Choose how Sehat-Sathi looks on this device.</p>
                </div>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="input-field" style={{ width: 150 }}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 20 }}>
                <h3 style={{ fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>Account security</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Your account and health data are protected by the signed-in session.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKING MODAL ────────────────────────────────────────── */}
        {bookingDoctor && (
          <div className="modal-overlay" onClick={() => setBookingDoctor(null)} style={{ zIndex: 99999 }}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 500, background: "var(--surface)",
                border: "1px solid var(--primary-border)", borderRadius: 20,
                boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden",
                animation: "fadeScale 0.22s cubic-bezier(0.16,1,0.3,1) both",
                maxHeight: "90vh", display: "flex", flexDirection: "column",
              }}
            >
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
                padding: "20px 24px", flexShrink: 0, position: "relative",
              }}>
                <button onClick={() => setBookingDoctor(null)}
                  style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
                >✕</button>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    {bookingDoctor.profile_photo ? <img src={bookingDoctor.profile_photo} alt="dr" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} /> : "👨‍⚕️"}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Book Appointment</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Dr. {bookingDoctor.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{bookingDoctor.specialization} · {bookingDoctor.hospital}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                <form onSubmit={handleSubmitBooking} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Consultation Fee Note */}
                  {bookingDoctor.consultation_fee && (
                    <div style={{ background: "var(--green-light)", border: "1px solid var(--green-border)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
                      💰 Consultation Fee: ₹{bookingDoctor.consultation_fee}
                    </div>
                  )}

                  {/* Date Picker */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Date</label>
                    <input
                      type="date" required
                      value={bookingForm.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => {
                        const newDate = e.target.value;
                        setBookingForm(prev => ({ ...prev, date: newDate, time_slot: "" }));
                        fetchAvailableSlots(bookingDoctor, newDate);
                      }}
                      style={{ width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "11px 14px", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Time Slots */}
                  {bookingForm.date && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Time Slots</label>
                      {bookingSlotsLoading ? (
                        <div style={{ textAlign: "center", padding: 16 }}>
                          <Loader2 size={20} className="animate-spin" style={{ color: "var(--primary)", margin: "auto", display: "block" }} />
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Loading slots...</p>
                        </div>
                      ) : bookingSlots.length === 0 ? (
                        <div style={{ background: "var(--red-light)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--red)", textAlign: "center" }}>
                          ⚠️ No slots available for this date. Please choose another date.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {bookingSlots.map(slot => (
                            <button
                              key={slot} type="button"
                              onClick={() => setBookingForm(prev => ({ ...prev, time_slot: slot }))}
                              style={{
                                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                border: bookingForm.time_slot === slot ? "2px solid var(--primary)" : "1px solid var(--border)",
                                background: bookingForm.time_slot === slot ? "var(--primary)" : "var(--surface-alt)",
                                color: bookingForm.time_slot === slot ? "#fff" : "var(--text)",
                                transition: "all 0.15s", fontFamily: "inherit",
                              }}
                            >{slot}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason for Visit</label>
                    <textarea
                      placeholder="Describe your symptoms or reason for visit (optional)..."
                      value={bookingForm.reason}
                      onChange={e => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "11px 14px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={bookingLoading || !bookingForm.date || !bookingForm.time_slot}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "13px", opacity: (bookingLoading || !bookingForm.date || !bookingForm.time_slot) ? 0.6 : 1 }}
                  >
                    {bookingLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <><Calendar size={14} /> Proceed to Payment Checkout</>}
                  </button>

                  <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>⚕️ Secure checkout supporting UPI, Cards, Net Banking & Pay at Clinic.</p>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENT PAYMENT CHECKOUT MODAL ────────────────── */}
        {showPaymentModal && bookingDoctor && (
          <AppointmentPaymentModal
            doctor={bookingDoctor}
            appointmentData={bookingForm}
            onClose={() => setShowPaymentModal(false)}
            onConfirmBooking={handleFinalBookingConfirm}
          />
        )}

        {/* ── PAYMENT SUCCESS CONFIRMATION MODAL ───────────────── */}
        {successBookingData && (
          <PaymentSuccessModal
            bookingData={successBookingData}
            onClose={() => setSuccessBookingData(null)}
            onViewReceipt={() => {
              const inv = successBookingData.invoice;
              setSuccessBookingData(null);
              setActiveInvoice(inv);
            }}
            onViewAppointments={() => {
              setSuccessBookingData(null);
              setActiveModule("appointments");
            }}
          />
        )}

        {/* ── PAYMENT INVOICE RECEIPT MODAL ────────────────────── */}
        {activeInvoice && (
          <PaymentInvoiceModal
            invoice={activeInvoice}
            onClose={() => setActiveInvoice(null)}
          />
        )}

        {/* ── ENHANCED BLOOD DONOR & REQUEST MODAL ────────────────── */}
        {bloodModalMode && (
          <EnhancedBloodModal
            mode={bloodModalMode}
            onClose={() => setBloodModalMode(null)}
            onSuccess={(msg) => {
              setBloodModalMode(null);
              showNotif(`✅ ${msg}`);
              loadDonors();
            }}
          />
        )}

        {/* ── DONOR CONTACT MODAL ─────────────────────────────────── */}
        {showDonorModal && matchedDonor && (
          <div className="modal-overlay" onClick={() => setShowDonorModal(false)} style={{ zIndex: 99999 }}>
            <div className="v2-section" style={{ width: "100%", maxWidth: 380, padding: 28, position: "relative", animation: "fadeScale 0.2s ease" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowDonorModal(false)} style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ background: "var(--red-light)", width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "var(--red)" }}>
                  <Droplet size={24} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>Donor Contact</h3>
              </div>
              <div style={{ background: "var(--surface-alt)", borderRadius: "var(--radius-md)", padding: 14, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  ["Name", matchedDonor.name],
                  ["Blood Type", matchedDonor.bloodGroup],
                  ["Phone", matchedDonor.phone],
                  ["City", matchedDonor.city],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <strong style={{ color: "var(--text)" }}>{v}</strong>
                  </div>
                ))}
              </div>
              <a href={`tel:${matchedDonor.phone}`} className="btn-primary" style={{ display: "flex", width: "100%", justifyContent: "center", textDecoration: "none" }}>
                <Phone size={13} /> Call Donor
              </a>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

// ── Inline Prescription View for patients ────────────────────────────────────
function PatientPrescriptionView({ token }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/prescriptions/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPrescriptions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--primary)", margin: "auto", display: "block" }} />
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12 }}>Loading prescriptions...</p>
    </div>
  );

  if (prescriptions.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
      <p style={{ color: "var(--text)", fontWeight: 600, margin: "0 0 4px" }}>No prescriptions yet</p>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Your doctors will send prescriptions here after consultations</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>My Prescriptions</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Digital prescriptions from your doctors</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {prescriptions.map(rx => (
          <div key={rx.id} className="v2-section" style={{ padding: "18px 20px", borderLeft: `4px solid ${rx.status === "finalized" ? "var(--green)" : "var(--amber)"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{rx.diagnosis}</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: rx.status === "finalized" ? "var(--green-light)" : "var(--amber-light)", color: rx.status === "finalized" ? "var(--green)" : "var(--amber)", borderRadius: 5, padding: "2px 7px" }}>
                {rx.status?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>From: <strong style={{ color: "var(--text)" }}>Dr. {rx.doctor_name}</strong></div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              {rx.created_at?.slice(0, 10)}{rx.follow_up_date ? ` · Follow-up: ${rx.follow_up_date}` : ""}
            </div>
            {rx.medicines?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rx.medicines.map((m, i) => (
                  <div key={i} style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{m.name} {m.dosage}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.frequency} · {m.duration}</div>
                    {m.instructions && <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{m.instructions}</div>}
                  </div>
                ))}
              </div>
            )}
            {rx.notes && <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)", background: "var(--surface-alt)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>📝 {rx.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
