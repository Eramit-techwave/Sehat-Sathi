import { useState, useEffect } from "react";
import { 
  Shield, CheckCircle2, RefreshCw, Zap, Heart, Award, Upload, FileText, 
  Loader2, AlertCircle, Bot, Send, Activity, ArrowUpRight, ArrowDownRight,
  User, Save, Edit2, History, Stethoscope, Calendar, Pill, Droplet,
  Phone, MapPin, Clock, MessageSquare, Video, Users, Search, X, LogOut
} from "lucide-react";

export default function Dashboard({ user: userProps, onLogout }) {
  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - USER DATA
  // ═══════════════════════════════════════════════════════════════
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    try {
      if (userProps) {
        setLoggedInUser(userProps);
        setIsLoadingUser(false);
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setLoggedInUser(JSON.parse(storedUser));
        } else {
          setLoggedInUser({
            fullName: "Amit Dubey",
            email: "amitdubey04102004@gmail.com",
            phone: "+91 98790 43210",
            location: "Gujarat, India",
            age: "21",
            bloodType: "O+"
          });
        }
        setIsLoadingUser(false);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setLoggedInUser({
        fullName: "Guest User",
        email: "guest@example.com",
        phone: "+91 XXXXX XXXXX",
        location: "India",
        age: "25",
        bloodType: "O+"
      });
      setIsLoadingUser(false);
    }
  }, [userProps]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - UI & NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - PROFILE DATA
  // ═══════════════════════════════════════════════════════════════
  const [profileData, setProfileData] = useState({
    fullName: "Guest User",
    email: "user@example.com",
    phone: "+91 XXXXX XXXXX",
    location: "India",
    age: "25",
    bloodType: "O+",
    reportsUploaded: "3",
    healthScore: "82/100"
  });

  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "Loading greeting..." }
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - REPORTS
  // ═══════════════════════════════════════════════════════════════
  const [savedReports, setSavedReports] = useState([
    { name: "Blood Report Summary Ingestion", date: "2026-06-01", type: "Full CBC Ledger" },
    { name: "Thyroid Panel Profiling Matrix", date: "2026-05-25", type: "TSH Variant Analysis" },
    { name: "Lipid Profile Diagnostic Block", date: "2026-05-10", type: "Cholesterol Data" }
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - DOCTORS
  // ═══════════════════════════════════════════════════════════════
  const [doctorsList] = useState([
    { id: 1, name: "Dr. Priya Sharma", specialty: "Cardiologist", hospital: "Apollo Hospital, Delhi", rating: 4.9, fee: "Consult", amount: 800, slots: ["10:30 AM", "03:00 PM", "05:00 PM"], available: "Today 3PM", img: "👩‍⚕️" },
    { id: 2, name: "Dr. Rajesh Mehta", specialty: "Diabetologist", hospital: "Fortis Hospital, Mumbai", rating: 4.8, fee: "Consult", amount: 600, slots: ["11:00 AM", "01:30 PM", "04:00 PM"], available: "Tomorrow 11AM", img: "👨‍⚕️" },
    { id: 3, name: "Dr. Anita Verma", specialty: "Thyroid Specialist", hospital: "AIIMS, Delhi", rating: 4.9, fee: "Consult", amount: 1000, slots: ["09:00 AM", "12:00 PM", "05:00 PM"], available: "Today 5PM", img: "👩‍⚕️" },
    { id: 4, name: "Dr. Suresh Patel", specialty: "General Physician", hospital: "Max Hospital, Pune", rating: 4.7, fee: "Consult", amount: 400, slots: ["02:00 PM", "04:30 PM", "06:00 PM"], available: "Today 6PM", img: "👨‍⚕️" },
    { id: 5, name: "Dr. Vikas Juneja", specialty: "Neurologist", hospital: "Narayana Health, Bangalore", rating: 4.8, fee: "Consult", amount: 1200, slots: ["10:00 AM", "01:00 PM", "03:30 PM"], available: "Tomorrow 1PM", img: "👨‍⚕️" },
  ]);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ 
    patientName: "User", 
    phone: "+91 98790 43210", 
    age: "21", 
    issue: "", 
    date: "", 
    slot: "" 
  });
  const [consultationBookings, setConsultationBookings] = useState([]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - HOSPITALS
  // ═══════════════════════════════════════════════════════════════
  const [hospitalsList] = useState([
    { id: 1, name: "Apollo Hospitals", city: "Delhi", departments: ["Cardiology", "Orthopedics", "Neurology"], doctors: ["Dr. Priya Sharma", "Dr. Amit Malhotra"], beds: "710 Beds", wait: "~15 min", type: "Multi-Specialty", slots: ["09:00 AM", "10:30 AM", "02:00 PM"] },
    { id: 2, name: "Fortis Healthcare", city: "Mumbai", departments: ["Oncology", "Transplant", "Pediatrics"], doctors: ["Dr. Rajesh Mehta", "Dr. Vikas Juneja"], beds: "400 Beds", wait: "~20 min", type: "Super-Specialty", slots: ["11:00 AM", "03:30 PM", "04:00 PM"] },
    { id: 3, name: "AIIMS", city: "Delhi", departments: ["General Medicine", "Surgery", "Pediatrics"], doctors: ["Dr. Anita Verma", "Dr. K. K. Mishra"], beds: "2400 Beds", wait: "~30 min", type: "Government Premier", slots: ["08:30 AM", "11:15 AM", "01:00 PM"] },
    { id: 4, name: "Narayana Health", city: "Bangalore", departments: ["Cardiac", "Kidney", "Cancer"], doctors: ["Dr. S. N. Shetty", "Dr. R. K. Prasad"], beds: "300 Beds", wait: "~10 min", type: "Specialty Chain", slots: ["10:00 AM", "12:30 PM", "03:15 PM"] },
  ]);

  const [hospitalSearch, setHospitalSearch] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ department: "", doctor: "", date: "", timeSlot: "" });
  const [appointments, setAppointments] = useState([
    { id: 1, hospital: "Apollo Hospital", doctor: "Dr. Rajesh Kumar", date: "2026-06-15", time: "10:30 AM", type: "General Checkup" },
    { id: 2, hospital: "Fortis Healthcare", doctor: "Dr. Priya Singh", date: "2026-06-20", time: "02:00 PM", type: "Cardiology" }
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - BLOOD DONORS
  // ═══════════════════════════════════════════════════════════════
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchCity, setSearchCity] = useState("");
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [matchedDonor, setMatchedDonor] = useState(null);

  const [donorForm, setDonorForm] = useState({ fullName: "", phone: "", email: "", bloodGroup: "O+", gender: "Male", age: "", city: "", state: "", lastDonation: "", availability: "Available" });
  const [bloodRequestForm, setBloodRequestForm] = useState({ patientName: "", bloodGroup: "O+", hospital: "", city: "", urgency: "High", phone: "" });

  const [donorRegistrations, setDonorRegistrations] = useState([
    { id: 1, name: "Raj Kumar", bloodGroup: "O+", city: "Ahmedabad", state: "Gujarat", availability: "Available", lastDonation: "2026-04-15", phone: "+91 94280 12345" },
    { id: 2, name: "Priya Sharma", bloodGroup: "A+", city: "Ahmedabad", state: "Gujarat", availability: "Available", lastDonation: "2026-05-20", phone: "+91 98985 67890" },
    { id: 3, name: "Vikas Singh", bloodGroup: "B+", city: "Ahmedabad", state: "Gujarat", availability: "Not Available", lastDonation: "2026-06-01", phone: "+91 76002 11223" },
    { id: 4, name: "Suresh Patel", bloodGroup: "O+", city: "Baroda", state: "Gujarat", availability: "Available", lastDonation: "2026-03-10", phone: "+91 99044 55667" }
  ]);

  const [bloodRequests, setBloodRequests] = useState([
    { id: 1, patientName: "Arjun Patel", bloodGroup: "O+", hospital: "Apollo Hospital", city: "Ahmedabad", urgency: "High", status: "Pending", phone: "+91 81285 45612" },
    { id: 2, patientName: "Neha Gupta", bloodGroup: "A-", hospital: "Fortis Healthcare", city: "Mumbai", urgency: "Medium", status: "Matched", phone: "+91 74052 98765" }
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT - MEDICINES & PHARMACY
  // ═══════════════════════════════════════════════════════════════
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [pharmacySearchQuery, setPharmacySearchQuery] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [medicineMockDb] = useState([
    { name: "Metformin 500mg", type: "Diabetes", availability: "In Stock", pharmacy: "Apollo Pharmacy, Ahmedabad", price: "₹45" },
    { name: "Amlodipine 5mg", type: "Hypertension", availability: "In Stock", pharmacy: "Max Medicals, Baroda", price: "₹32" },
    { name: "Levothyroxine 50mcg", type: "Thyroid", availability: "Low Stock", pharmacy: "Wellness Forever, Ahmedabad", price: "₹120" },
    { name: "Insulin Glargine 100 IU", type: "Diabetes", availability: "In Stock", pharmacy: "Apollo Pharmacy, Ahmedabad", price: "₹680" },
    { name: "Telmisartan 40mg", type: "Hypertension", availability: "Out of Stock", pharmacy: "Care Pharmacy, Surat", price: "₹55" }
  ]);

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // ═══════════════════════════════════════════════════════════════
  // UPDATE PROFILE WHEN USER CHANGES
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loggedInUser) {
      setProfileData(prev => ({
        ...prev,
        fullName: loggedInUser.fullName || prev.fullName,
        email: loggedInUser.email || prev.email,
        phone: loggedInUser.phone || prev.phone,
        location: loggedInUser.location || prev.location,
        age: loggedInUser.age || prev.age,
        bloodType: loggedInUser.bloodType || prev.bloodType,
      }));

      setDoctorForm(prev => ({
        ...prev,
        patientName: loggedInUser.fullName || prev.patientName,
        phone: loggedInUser.phone || prev.phone,
        age: loggedInUser.age || prev.age,
      }));

      setBloodRequestForm(prev => ({
        ...prev,
        patientName: loggedInUser.fullName || prev.patientName,
        phone: loggedInUser.phone || prev.phone,
      }));

      setChatHistory([
        { role: "assistant", text: `Hello ${loggedInUser.fullName}! 🎉\n\nReport upload kijiye, main uski poori deep scanning karke aapko har issue, high/low range aur diet matrix samjha dunga.\n\nAapka health journey mujhe important hai!` }
      ]);
    }
  }, [loggedInUser]);

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS - ALERTS & NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  const triggerAlert = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type: "success", text: "" }), 4000);
  };

  // ═══════════════════════════════════════════════════════════════
  // FILE HANDLING - DRAG AND DROP
  // ═══════════════════════════════════════════════════════════════
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setUploadState("error");
      setStatusMessage("Invalid file format. Please upload PDF, JPEG, or PNG files.");
      triggerAlert("Invalid file format!", "error");
      return;
    }

    setUploadState("loading");
    setStatusMessage(`Processing: ${file.name}...`);

    // Simulate file processing
    setTimeout(() => {
      setUploadState("success");
      setStatusMessage(`✅ Report processed successfully: ${file.name}`);

      const mockPayload = {
        metabolic: "1,910 kcal",
        cardio: "76 bpm",
        confidence: "98.92%",
        raw_parameters: [
          { name: "Hemoglobin Basal Index", value: "15.2 g/dL", status: "Normal" },
          { name: "Fasting Blood Glucose", value: "118 mg/dL", status: "High" },
          { name: "Serum Cholesterol", value: "192 mg/dL", status: "Normal" },
          { name: "Vitamin B12", value: "120 pg/mL", status: "Low" },
          { name: "WBC Count", value: "10,570 /cmm", status: "High" },
          { name: "Urine Glucose", value: "Present (+)", status: "High" }
        ]
      };

      setExtractedData(mockPayload);
      triggerAIBotGreeting(mockPayload);
      triggerAlert("Clinical Report Analyzed Successfully!");

      const today = new Date().toISOString().split('T')[0];
      setSavedReports(prev => [
        { name: `${file.name.split('.')[0]} Analysis`, date: today, type: "Full CBC Ledger" },
        ...prev
      ]);
    }, 2000);
  };

  // ═══════════════════════════════════════════════════════════════
  // CHAT & AI FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const triggerAIBotGreeting = (data) => {
    const highIssues = data.raw_parameters
      .filter(p => p.status.toLowerCase().includes("high"))
      .map(p => p.name);
    const lowIssues = data.raw_parameters
      .filter(p => p.status.toLowerCase().includes("low"))
      .map(p => p.name);

    let summaryText = `📊 **Report Analysis Complete!**\n\nYour health scan results:\n`;
    if (highIssues.length > 0) {
      summaryText += `\n🔺 **High Values:** ${highIssues.join(", ")}`;
    }
    if (lowIssues.length > 0) {
      summaryText += `\n🔻 **Low Values:** ${lowIssues.join(", ")}`;
    }
    summaryText += `\n\nAap kuch bhi pooch sakte ho! Mujhe aapka health advisory dena pasand hai! 💪`;

    setChatHistory([{ role: "assistant", text: summaryText }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const mockResponses = [
        "Bahut achi baat hai! Aap apni health ko seriously le rahe ho! 👏 Iska matlab aap swasth rahenge.",
        "Health ke liye diet aur exercise dono zaruri hain. Regular walk 30 min daily zarur kijiye.",
        "Agar aapke blood sugar high hain to carbs kam kijiye aur proteins badhaiye.",
        "B12 low hai to eggs, milk aur fish khao. Ye sab natural sources se milega! 🥦",
        "Stress management bhi zaroori hai! Meditation ya yoga try karo daily."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setChatHistory(prev => [...prev, { role: "assistant", text: randomResponse }]);
      setChatLoading(false);
    }, 1000);
  };

  // ═══════════════════════════════════════════════════════════════
  // DOCTOR CONSULTATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const handleDoctorBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!doctorForm.patientName || !doctorForm.phone || !doctorForm.date || !doctorForm.slot || !doctorForm.issue) {
      triggerAlert("Please fill all required fields!", "error");
      return;
    }

    if (!selectedDoctor) {
      triggerAlert("Please select a doctor!", "error");
      return;
    }

    const newBooking = {
      id: Date.now(),
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospital: selectedDoctor.hospital,
      ...doctorForm,
      status: "Confirmed"
    };

    setConsultationBookings([newBooking, ...consultationBookings]);
    triggerAlert(`✅ Consultation booked with ${selectedDoctor.name} on ${doctorForm.date} at ${doctorForm.slot}`);
    
    // Reset form
    setDoctorForm({ 
      patientName: loggedInUser?.fullName || "User", 
      phone: loggedInUser?.phone || "+91 98790 43210", 
      age: loggedInUser?.age || "21", 
      issue: "", 
      date: "", 
      slot: "" 
    });
    setSelectedDoctor(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // HOSPITAL APPOINTMENT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const handleHospitalBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!hospitalForm.department || !hospitalForm.doctor || !hospitalForm.date || !hospitalForm.timeSlot) {
      triggerAlert("Please select all required fields!", "error");
      return;
    }

    if (!selectedHospital) {
      triggerAlert("Please select a hospital!", "error");
      return;
    }

    const newApt = {
      id: Date.now(),
      hospital: selectedHospital.name,
      doctor: hospitalForm.doctor,
      date: hospitalForm.date,
      time: hospitalForm.timeSlot,
      type: hospitalForm.department,
      status: "Confirmed"
    };

    setAppointments([newApt, ...appointments]);
    triggerAlert(`✅ OPD appointment confirmed at ${selectedHospital.name}`);
    
    // Reset form
    setHospitalForm({ department: "", doctor: "", date: "", timeSlot: "" });
    setSelectedHospital(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // BLOOD DONOR FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const handleDonorRegistrationSubmit = (e) => {
    e.preventDefault();
    
    if (!donorForm.fullName || !donorForm.phone || !donorForm.city || !donorForm.state || !donorForm.age) {
      triggerAlert("Please fill all required fields!", "error");
      return;
    }

    const newDonor = {
      id: Date.now(),
      name: donorForm.fullName,
      bloodGroup: donorForm.bloodGroup,
      city: donorForm.city,
      state: donorForm.state,
      availability: donorForm.availability,
      lastDonation: donorForm.lastDonation || "Never",
      phone: donorForm.phone
    };

    setDonorRegistrations([newDonor, ...donorRegistrations]);
    triggerAlert(`🩸 Welcome to blood donor network, ${donorForm.fullName}!`);
    
    // Reset form
    setDonorForm({ fullName: "", phone: "", email: "", bloodGroup: "O+", gender: "Male", age: "", city: "", state: "", lastDonation: "", availability: "Available" });
  };

  const handleBloodRequestSubmit = (e) => {
    e.preventDefault();
    
    if (!bloodRequestForm.patientName || !bloodRequestForm.hospital || !bloodRequestForm.city || !bloodRequestForm.phone) {
      triggerAlert("Please fill all required fields!", "error");
      return;
    }

    const newRequest = {
      id: Date.now(),
      patientName: bloodRequestForm.patientName,
      bloodGroup: bloodRequestForm.bloodGroup,
      hospital: bloodRequestForm.hospital,
      city: bloodRequestForm.city,
      urgency: bloodRequestForm.urgency,
      status: "Pending",
      phone: bloodRequestForm.phone
    };

    setBloodRequests([newRequest, ...bloodRequests]);
    triggerAlert(`🚨 Emergency blood request broadcasted for ${bloodRequestForm.bloodGroup}!`, "error");
    
    // Reset form
    setBloodRequestForm({ patientName: loggedInUser?.fullName || "", bloodGroup: "O+", hospital: "", city: "", urgency: "High", phone: loggedInUser?.phone || "" });
  };

  // ═══════════════════════════════════════════════════════════════
  // PHARMACY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const handlePrescriptionUploadSubmit = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPrescriptionFile(file);
    setPrescriptionLoading(true);

    setTimeout(() => {
      setPrescriptionLoading(false);
      triggerAlert(`📋 Prescription "${file.name}" processed! Nearby pharmacies loaded.`);
    }, 2000);
  };

  const handleContactDonorTrigger = (donor) => {
    setMatchedDonor(donor);
    setShowDonorModal(true);
  };

  const handleInitiateCall = () => {
    if (matchedDonor) {
      triggerAlert(`📞 Initiating call to ${matchedDonor.name} at ${matchedDonor.phone}`);
      setShowDonorModal(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // PROFILE FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const handleSaveProfile = () => {
    localStorage.setItem("user", JSON.stringify(profileData));
    setIsEditing(false);
    triggerAlert("✅ Profile saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (onLogout) {
      onLogout();
    }
    triggerAlert("👋 Logout successful!");
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTER & SEARCH FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const highParametersList = extractedData 
    ? extractedData.raw_parameters.filter(p => p.status.toLowerCase().includes("high")).map(p => p.name) 
    : [];
  const lowParametersList = extractedData 
    ? extractedData.raw_parameters.filter(p => p.status.toLowerCase().includes("low")).map(p => p.name) 
    : [];

  const filteredDoctors = doctorsList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
                         d.specialty.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || d.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const filteredHospitals = hospitalsList.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || 
    h.city.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const filteredDonorsList = donorRegistrations.filter(d => {
    const matchesGroup = searchBloodGroup === "All" || d.bloodGroup === searchBloodGroup;
    const matchesCity = !searchCity || d.city.toLowerCase().includes(searchCity.toLowerCase());
    return matchesGroup && matchesCity;
  });

  const filteredMedicines = medicineMockDb.filter(m =>
    m.name.toLowerCase().includes(medSearchQuery.toLowerCase()) || 
    m.type.toLowerCase().includes(medSearchQuery.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD MODULES
  // ═══════════════════════════════════════════════════════════════
  const DASHBOARD_MODULES = [
    { id: "reports", icon: <FileText size={18} />, title: "AI Report Analysis", desc: "Upload & analyze medical reports", color: "#3b82f6", bgColor: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" },
    { id: "doctor", icon: <Stethoscope size={18} />, title: "Doctor Consultation", desc: "Book appointments with doctors", color: "#2563eb", bgColor: "rgba(37,99,235,0.1)", borderColor: "rgba(37,99,235,0.2)" },
    { id: "appointments", icon: <Calendar size={18} />, title: "Hospital Appointments", desc: "Manage hospital visits", color: "#8b5cf6", bgColor: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.2)" },
    { id: "pharmacy", icon: <Pill size={18} />, title: "Medicine Finder", desc: "Find medicines & pharmacies", color: "#f59e0b", bgColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.2)" },
    { id: "blood", icon: <Droplet size={18} />, title: "Blood Donor Network", desc: "Connect with blood donors", color: "#ef4444", bgColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }
  ];

  const inputStyle = { 
    width: "100%", 
    background: "rgba(255,255,255,0.03)", 
    border: "1px solid rgba(255,255,255,0.08)", 
    borderRadius: 12, 
    padding: "12px 14px", 
    color: "#fff", 
    fontSize: 13, 
    outline: "none", 
    boxSizing: "border-box",
    transition: "all 0.3s"
  };

  const selectStyle = { 
    width: "100%", 
    background: "#030712", 
    border: "1px solid rgba(255,255,255,0.08)", 
    borderRadius: 10, 
    padding: "10px 12px", 
    color: "#fff", 
    fontSize: 13, 
    outline: "none",
    transition: "all 0.3s"
  };

  const toggleView = (viewName) => {
    setCurrentView(currentView === viewName ? "dashboard" : viewName);
    setActiveModule(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (isLoadingUser) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", textAlign: "center" }}>
        <Loader2 size={40} className="animate-spin mx-auto text-blue-500" style={{ marginBottom: "20px", color: "#3b82f6" }} />
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>Loading your health dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", position: "relative" }}>

      {/* NOTIFICATION TOAST */}
      {notification.show && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: notification.type === "success" ? "#064e3b" : "#7f1d1d",
          border: `1px solid ${notification.type === "success" ? "#10b981" : "#ef4444"}`,
          borderRadius: "12px", padding: "16px 24px", color: "#fff", fontSize: "14px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          animation: "slideIn 0.3s ease-out"
        }}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 40, textAlign: "left" }}>
        <div>
          <h2 className="serif" style={{ fontSize: "38px", color: "#fff", cursor: "pointer", margin: 0 }} onClick={() => { setCurrentView("dashboard"); setActiveModule(null); }}>🏥 Health Dashboard</h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, marginTop: 4 }}>Welcome back, <strong style={{ color: "#60a5fa" }}>{loggedInUser?.fullName}</strong>!</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => toggleView("history")}
            style={{
              background: currentView === "history" ? "#2563eb" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#fff",
              padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            <History size={14} />
            Reports
          </button>

          <button
            onClick={() => toggleView("profile")}
            style={{
              background: currentView === "profile" ? "#2563eb" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#fff",
              padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            <User size={14} />
            Profile
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid rgba(239, 68, 68, 0.3)", 
              color: "#ef4444",
              padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            <LogOut size={14} />
            Logout
          </button>

          <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={16} style={{ color: "#60a5fa" }} />
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>🔒 Secure</span>
          </div>
        </div>
      </div>

      {/* REPORTS HISTORY VIEW */}
      {currentView === "history" && (
        <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
          <h3 className="serif" style={{ fontSize: "26px", color: "#fff", marginBottom: 6 }}>📋 Reports History</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 24 }}>Your medical reports and analysis records</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {savedReports.map((report, idx) => (
              <div key={idx} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ background: "rgba(37,99,235,0.06)", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}><FileText size={20} /></div>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>{report.name}</h4>
                    <p style={{ color: "#475569", fontSize: "12px", margin: 0, marginTop: 4 }}>{report.type} | {report.date}</p>
                  </div>
                </div>
                <span style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", padding: "6px 14px", borderRadius: 10, fontSize: "12px", fontWeight: 600 }}>✅ Analyzed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE VIEW */}
      {currentView === "profile" && (
        <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: "28px", color: "#fff", margin: 0 }}>👤 My Profile</h3>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              style={{
                background: isEditing ? "#10b981" : "#2563eb", border: "none", color: "#fff",
                padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s"
              }}
            >
              {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 24, padding: "32px", marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {[
                { label: "Full Name", key: "fullName" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "Location", key: "location" },
                { label: "Age", key: "age" },
                { label: "Blood Type", key: "bloodType" }
              ].map((f) => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{f.label}</label>
                  <input
                    type="text" 
                    value={profileData[f.key]} 
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, [f.key]: e.target.value })}
                    style={{ 
                      ...inputStyle, 
                      background: isEditing ? "#030712" : "transparent", 
                      border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)", 
                      cursor: isEditing ? "text" : "default"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { label: "Reports Uploaded", value: savedReports.length.toString(), color: "#3b82f6", icon: "📊" },
              { label: "Health Score", value: profileData.healthScore, color: "#22c55e", icon: "💪" },
              { label: "Active Days", value: "28 Days", color: "#f59e0b", icon: "🔥" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{stat.label}</span>
                <div style={{ fontSize: "32px", fontWeight: 900, color: stat.color, marginTop: 8 }}>{stat.icon} {stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === "dashboard" && !activeModule && (
        <>
          {/* MODULES GRID */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 32, textAlign: "left" }}>
              <h3 className="serif" style={{ fontSize: "28px", color: "#fff", marginBottom: 8 }}>Healthcare Services</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Click on any service to get started</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {DASHBOARD_MODULES.map((module) => (
                <div 
                  key={module.id} 
                  onClick={() => setActiveModule(module.id)} 
                  style={{ 
                    borderRadius: 14, 
                    padding: "20px", 
                    background: module.bgColor, 
                    border: `1px solid ${module.borderColor}`, 
                    cursor: "pointer", 
                    textAlign: "left",
                    transition: "all 0.3s",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.borderColor = module.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = module.borderColor;
                  }}
                >
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
                  <p style={{ color: "#64748b", fontSize: "14px", marginTop: 4 }}>Upload your medical reports to see analysis</p>
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

          {/* REPORT DATA ANALYSIS & BOT INTERACTION HUB */}
          {extractedData && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 40, textAlign: "left" }}>

              {/* LEFT: PARAMETERS INDEX TABLE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{
                  background: highParametersList.length > 0 ? "rgba(239,68,68,0.01)" : "rgba(34,197,94,0.01)",
                  border: `1px solid ${highParametersList.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`,
                  borderRadius: 20, padding: "24px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: highParametersList.length > 0 ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: "13px", marginBottom: 10 }}>
                    <Activity size={15} /> HEALTH ANALYSIS LIVE
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 6 }}>
                    {highParametersList.length > 0 ? "⚠️ Parameters Need Attention" : "✅ All Values Normal"}
                  </h4>
                  <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
                    {highParametersList.length > 0 
                      ? `High: ${highParametersList.join(", ")}` 
                      : "Your health parameters are within normal range. Keep it up!"}
                  </p>
                </div>

                <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                    <span>PARAMETER</span>
                    <span>VALUE</span>
                    <span>STATUS</span>
                  </div>
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {extractedData.raw_parameters.map((param, index) => {
                      const isHigh = param.status.toLowerCase().includes("high");
                      const isLow = param.status.toLowerCase().includes("low");
                      return (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", padding: "16px 20px", borderBottom: index < extractedData.raw_parameters.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none", fontSize: "13px", color: "#94a3b8", alignItems: "center" }}>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{param.name}</span>
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

              {/* RIGHT: REAL-TIME AI HEALTH BUDDY TERMINAL */}
              <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 24, display: "flex", flexDirection: "column", height: "580px", overflow: "hidden" }}>
                <div style={{ padding: "18px 20px", background: "rgba(37,99,235,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                  <Bot size={18} style={{ color: "#3b82f6" }} />
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Sehat-Sathi AI Friend</h4>
                </div>
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                      <div style={{ background: msg.role === "user" ? "#2563eb" : "rgba(255,255,255,0.03)", color: "#fff", padding: "12px 16px", borderRadius: 16, fontSize: "13px", lineHeight: 1.5, textAlign: "left", whiteSpace: "pre-line" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ alignSelf: "flex-start" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", color: "#fff", padding: "12px 16px", borderRadius: 16, fontSize: "13px" }}>
                        <Loader2 size={16} className="animate-spin" style={{ color: "#3b82f6" }} />
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#040814", display: "flex", gap: 10 }}>
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    placeholder="Bhai, sugar high hone pr kya khayein? Ask..." 
                    style={{ flex: 1, ...inputStyle }} 
                  />
                  <button 
                    type="submit" 
                    style={{ background: "#2563eb", border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* BINARY REPOSITORY FILE UPLOAD LAYER */}
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            style={{ background: dragActive ? "rgba(37,99,235,0.04)" : "#091022", border: `2px dashed ${dragActive ? "#3b82f6" : "rgba(37,99,235,0.2)"}`, borderRadius: 20, padding: "60px 40px", textAlign: "center", position: "relative", transition: "all 0.3s" }}
          >
            <input type="file" id="file-upload-input" onChange={handleFileChange} style={{ display: "none" }} accept=".pdf,.png,.jpg,.jpeg" />
            {uploadState === "idle" && (
              <>
                <Upload size={32} style={{ color: "#3b82f6", margin: "0 auto 16px", display: "block" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>📁 Upload Your Medical Report</h4>
                <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "360px", margin: "6px auto 20px" }}>Drag and drop your report or click to browse</p>
                <button style={{ padding: "12px 24px", fontSize: "13px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }} onClick={() => document.getElementById("file-upload-input").click()}>Select File</button>
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

      {/* DOCTOR CONSULTATION MODULE SUBFLOWS */}
      {activeModule === "doctor" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => { setActiveModule(null); setSelectedDoctor(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>
            ← Back to Dashboard
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <h2 className="serif" style={{ fontSize: "32px", color: "#fff", margin: 0 }}>🩺 Doctor Consultation</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Cardiologist", "Diabetologist", "Thyroid Specialist", "General Physician"].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  style={{
                    background: selectedSpecialty === spec ? "#2563eb" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedSpecialty === spec ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
                    color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: "12px", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: 28 }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input type="text" placeholder="Search doctors by specialization indices..." value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selectedDoctor ? "1fr 1.1fr" : "1fr", gap: 24 }}>

            <div style={{ display: "grid", gridTemplateColumns: selectedDoctor ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {filteredDoctors.map((doc) => (
                <div key={doc.id} onClick={() => { setSelectedDoctor(doc); setDoctorForm({ ...doctorForm, slot: doc.slots[0] }); }} style={{ background: "#030712", border: selectedDoctor?.id === doc.id ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px", cursor: "pointer", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 36 }}>{doc.img}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#60a5fa" }}>{doc.specialty}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={12} /> {doc.hospital}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>⭐ {doc.rating}</span>
                    <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>₹{doc.amount}</span>
                  </div>
                  <button style={{ width: "100%", fontSize: 13, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Consult Now</button>
                </div>
              ))}
            </div>

            {selectedDoctor && (
              <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 20, padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 4 }}>📅 Book Consultation</h3>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: 20 }}>with {selectedDoctor.name}</p>

                <form onSubmit={handleDoctorBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <input type="text" placeholder="Your Name" required value={doctorForm.patientName} onChange={e => setDoctorForm({ ...doctorForm, patientName: e.target.value })} style={inputStyle} />
                  <input type="tel" placeholder="Your Phone" required value={doctorForm.phone} onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })} style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="number" placeholder="Age" required value={doctorForm.age} onChange={e => setDoctorForm({ ...doctorForm, age: e.target.value })} style={inputStyle} />
                    <select value={doctorForm.slot} onChange={e => setDoctorForm({ ...doctorForm, slot: e.target.value })} style={selectStyle}>
                      {selectedDoctor.slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input type="date" required value={doctorForm.date} onChange={e => setDoctorForm({ ...doctorForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                  <textarea placeholder="Describe active diagnostic problem metrics..." required value={doctorForm.issue} onChange={e => setDoctorForm({ ...doctorForm, issue: e.target.value })} style={{ ...inputStyle, minHeight: "80px", resize: "none" }} />

                  <button type="submit" style={{ padding: "12px", fontSize: "13px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Confirm Booking</button>
                </form>
              </div>
            )}

          </div>

          {consultationBookings.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 14 }}>📋 Your Bookings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {consultationBookings.map((b) => (
                  <div key={b.id} style={{ background: "rgba(34,197,94,0.02)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{b.patientName} ➔ {b.doctor}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 2 }}>{b.hospital} | {b.date} @ {b.slot}</div>
                    </div>
                    <span style={{ color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "4px 12px", borderRadius: 8, fontSize: "11px", fontWeight: 700 }}>✅ {b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* HOSPITAL APPOINTMENTS CHANNEL SUBFLOWS */}
      {activeModule === "appointments" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => { setActiveModule(null); setSelectedHospital(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>
            ← Back to Dashboard
          </button>

          <h2 className="serif" style={{ fontSize: "32px", color: "#fff", marginBottom: 12 }}> Hospital Appointments</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 24 }}>Book hospital OPD slots directly</p>

          <div style={{ position: "relative", marginBottom: 28 }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input type="text" placeholder="Search facilities..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selectedHospital ? "1fr 1.1fr" : "1fr", gap: 24 }}>

            <div style={{ display: "grid", gridTemplateColumns: selectedHospital ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {filteredHospitals.map((hosp) => (
                <div key={hosp.id} onClick={() => { setSelectedHospital(hosp); setHospitalForm({ ...hospitalForm, department: hosp.departments[0], doctor: hosp.doctors[0], timeSlot: hosp.slots[0] }); }} style={{ background: "#030712", border: selectedHospital?.id === hosp.id ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "22px", cursor: "pointer", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{hosp.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {hosp.city}</div>
                    </div>
                    <span style={{ background: "rgba(37,99,235,0.1)", color: "#60a5fa", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{hosp.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>{hosp.departments.join(" • ")}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px solid rgba(255,255,255,0.02)", paddingTop: 12, marginBottom: 14 }}>
                    <span style={{ color: "#94a3b8" }}>🏥 {hosp.beds}</span>
                    <span style={{ color: "#22c55e" }}>⏱ {hosp.wait}</span>
                  </div>
                  <button style={{ width: "100%", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Book Appointment</button>
                </div>
              ))}
            </div>

            {selectedHospital && (
              <div style={{ background: "#070c19", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "24px" }}>
                <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>📋 Appointment Details</h4>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: 2, marginBottom: 20 }}>at {selectedHospital.name}</p>

                <form onSubmit={handleHospitalBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>DEPARTMENT WING</label>
                    <select value={hospitalForm.department} onChange={e => setHospitalForm({ ...hospitalForm, department: e.target.value })} style={selectStyle}>
                      {selectedHospital.departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>ASSIGNED DOCTOR</label>
                    <select value={hospitalForm.doctor} onChange={e => setHospitalForm({ ...hospitalForm, doctor: e.target.value })} style={selectStyle}>
                      {selectedHospital.doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>DATE</label>
                      <input type="date" required value={hospitalForm.date} onChange={e => setHospitalForm({ ...hospitalForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>TIME SLOT</label>
                      <select value={hospitalForm.timeSlot} onChange={e => setHospitalForm({ ...hospitalForm, timeSlot: e.target.value })} style={selectStyle}>
                        {selectedHospital.slots.map(sl => <option key={sl} value={sl}>{sl}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" style={{ padding: "12px", marginTop: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Confirm Appointment</button>
                </form>
              </div>
            )}

          </div>

          <div style={{ marginTop: 32 }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: 14 }}>📅 Your Appointments</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {appointments.map((apt) => (
                <div key={apt.id} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{apt.hospital}</span>
                    <span style={{ color: "#22c55e", background: "rgba(34,197,94,0.05)", padding: "2px 8px", borderRadius: 4, fontSize: "11px", fontWeight: 700 }}>✅ {apt.status}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", margin: "6px 0" }}>{apt.doctor} • <span style={{ color: "#60a5fa" }}>{apt.type}</span></p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#475569", marginTop: 10 }}>
                    <span>📅 {apt.date}</span>
                    <span>🕐 {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* BLOOD DONOR CORE MANAGEMENT SUBSYSTEM */}
      {activeModule === "blood" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => setActiveModule(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>
            ← Back to Dashboard
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 16 }}>Available Donors</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredDonorsList.map((donor, idx) => (
                  <div key={donor.id || idx} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{donor.name}</span>
                      <span style={{ background: "#ef4444", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: "12px", fontWeight: 600 }}>{donor.bloodGroup}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px" }}>{donor.city} • Last: {donor.lastDonation}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "inline-block", background: donor.availability === "Available" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", color: donor.availability === "Available" ? "#22c55e" : "#9ca3af", padding: "3px 10px", borderRadius: 6, fontSize: "11px", fontWeight: 600 }}>
                        {donor.availability}
                      </span>
                      {donor.availability === "Available" && (
                        <button onClick={() => handleContactDonorTrigger(donor)} style={{ padding: "6px 12px", fontSize: "11px", background: "#2563eb", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Contact</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "rgba(34,197,94,0.01)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 20, padding: "24px" }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 14 }}>🩸 Register as Donor</h4>
                <form onSubmit={handleDonorRegistrationSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                  <input type="date" placeholder="Last Donation" value={donorForm.lastDonation} onChange={e => setDonorForm({ ...donorForm, lastDonation: e.target.value })} style={inputStyle} />
                  <button type="submit" style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Register</button>
                </form>
              </div>

              <div style={{ background: "rgba(239,68,68,0.01)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 20, padding: "24px" }}>
                <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 14 }}>🚨 Request Blood Emergency</h4>
                <form onSubmit={handleBloodRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="text" placeholder="Patient Name" required value={bloodRequestForm.patientName} onChange={e => setBloodRequestForm({ ...bloodRequestForm, patientName: e.target.value })} style={inputStyle} />
                  <select value={bloodRequestForm.bloodGroup} onChange={e => setBloodRequestForm({ ...bloodRequestForm, bloodGroup: e.target.value })} style={selectStyle}>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                  <input type="text" placeholder="Hospital" required value={bloodRequestForm.hospital} onChange={e => setBloodRequestForm({ ...bloodRequestForm, hospital: e.target.value })} style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="text" placeholder="City" required value={bloodRequestForm.city} onChange={e => setBloodRequestForm({ ...bloodRequestForm, city: e.target.value })} style={inputStyle} />
                    <select value={bloodRequestForm.urgency} onChange={e => setBloodRequestForm({ ...bloodRequestForm, urgency: e.target.value })} style={selectStyle}>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟠 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                  <input type="tel" placeholder="Phone" required value={bloodRequestForm.phone} onChange={e => setBloodRequestForm({ ...bloodRequestForm, phone: e.target.value })} style={inputStyle} />
                  <button type="submit" style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Request Now</button>
                </form>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Active Network Broadcast Requests</h4>
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
        </div>
      )}

      {/* MEDICINE PHARMACY FINDER INTERACTIVE HUB */}
      {activeModule === "pharmacy" && (
        <div style={{ textAlign: "left", marginBottom: 40 }}>
          <button onClick={() => setActiveModule(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>
            ← Back to Dashboard
          </button>

          <h2 className="serif" style={{ fontSize: "32px", color: "#fff", marginBottom: 24 }}>💊 Medicine Finder</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>MEDICINE BRAND / FORMULA</label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                <input type="text" placeholder="Search medicine formula..." value={medSearchQuery} onChange={e => setMedSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6 }}>PHARMACY LOG LOCATION</label>
              <div style={{ position: "relative" }}>
                <MapPin size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                <input type="text" placeholder="Search pharmacy location..." value={pharmacySearchQuery} onChange={e => setPharmacySearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "flex-start" }}>

            <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr", padding: "14px 16px", background: "rgba(255,255,255,0.02)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                <span>MEDICINE</span><span>TYPE</span><span>PHARMACY</span><span>PRICE</span>
              </div>
              <div>
                {filteredMedicines.filter(m => m.pharmacy.toLowerCase().includes(pharmacySearchQuery.toLowerCase())).map((med, mIdx) => (
                  <div key={mIdx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 1fr", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: "13px", alignItems: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{med.name}</span>
                    <span style={{ color: "#94a3b8" }}>{med.type}</span>
                    <span style={{ color: "#60a5fa", fontSize: "12px" }}>
                      {med.pharmacy} <br />
                      <span style={{ color: med.availability === "In Stock" ? "#22c55e" : "#fbbf24", fontSize: "10px", fontWeight: 700 }}>● {med.availability}</span>
                    </span>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>{med.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(245,158,11,0.01)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 20, padding: "24px", textAlign: "center" }}>
              <Upload size={28} style={{ color: "#f59e0b", margin: "0 auto 12px", display: "block" }} />
              <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Upload Prescription</h4>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: 4, marginBottom: 16 }}>Upload prescription layout to search stocks</p>

              <input type="file" id="prescription-upload" onChange={handlePrescriptionUploadSubmit} style={{ display: "none" }} accept=".pdf,.png,.jpg" />
              <button disabled={prescriptionLoading} onClick={() => document.getElementById("prescription-upload").click()} style={{ background: "#f59e0b", border: "none", padding: "10px 20px", borderRadius: 10, color: "#000", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {prescriptionLoading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {prescriptionFile ? "Upload Another" : "Select File"}
              </button>

              {prescriptionFile && (
                <div style={{ background: "#030712", padding: "10px 14px", borderRadius: 8, marginTop: 14, fontSize: "12px", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <FileText size={12} /> {prescriptionFile.name}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* DONOR CONTACT MODAL GATEWAY DEVICE */}
      {showDonorModal && matchedDonor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(2,4,8,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowDonorModal(false)}>
          <div style={{
            width: "100%", maxWidth: "400px", background: "#0b1329",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px",
            padding: "32px", position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.6)"
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDonorModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={16} /></button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ background: "rgba(239,68,68,0.1)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#ef4444" }}>
                <Droplet size={28} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>Donor Information</h3>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: 4 }}>Contact this donor</p>
            </div>

            <div style={{ background: "#030712", borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 16 }}>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Name: <strong style={{ color: "#fff" }}>{matchedDonor.name}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Blood Type: <strong style={{ color: "#ef4444" }}>{matchedDonor.bloodGroup}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Phone: <strong style={{ color: "#60a5fa", fontFamily: "monospace" }}>{matchedDonor.phone}</strong></div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>City: <strong style={{ color: "#fff" }}>{matchedDonor.city}</strong></div>
            </div>

            <button onClick={handleInitiateCall} style={{ width: "100%", padding: "12px", fontSize: "13px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>📞 Call Donor</button>
          </div>
        </div>
      )}

    </div>
  );
}