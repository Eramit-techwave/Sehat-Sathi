import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import HospitalDashboard from "./HospitalDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || "Patient";

  if (role === "Doctor") return <DoctorDashboard />;
  if (role === "Hospital") return <HospitalDashboard />;
  if (role === "Admin") return <AdminDashboard />;
  return <PatientDashboard />;
}