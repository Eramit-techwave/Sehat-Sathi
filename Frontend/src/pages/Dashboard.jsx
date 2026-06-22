import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import HospitalDashboard from "./HospitalDashboard";
import AdminDashboard from "./AdminDashboard";
import PendingVerification from "./PendingVerification";

export default function Dashboard() {
  const { user, isVerified } = useAuth();
  const role = user?.role || "Patient";

  // ⚠️  VERIFICATION GATE: Doctors and Hospitals must be verified before accessing dashboard
  // This prevents unverified medical professionals from operating on the platform
  if ((role === "Doctor" || role === "Hospital") && !isVerified()) {
    return <PendingVerification />;
  }

  if (role === "Doctor") return <DoctorDashboard />;
  if (role === "Hospital") return <HospitalDashboard />;
  if (role === "Admin") return <AdminDashboard />;
  return <PatientDashboard />;
}