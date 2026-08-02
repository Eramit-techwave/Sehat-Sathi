import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";

const PatientDashboard = lazy(() => import("./PatientDashboard"));
const DoctorDashboard = lazy(() => import("./DoctorDashboard"));
const HospitalDashboard = lazy(() => import("./HospitalDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const PendingVerification = lazy(() => import("./PendingVerification"));

function DashboardLoading() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 14 }}>
      Loading your workspace…
    </div>
  );
}

export default function Dashboard() {
  const { user, isVerified } = useAuth();
  const role = user?.role || "Patient";

  // ⚠️  VERIFICATION GATE: Doctors and Hospitals must be verified before accessing dashboard
  // This prevents unverified medical professionals from operating on the platform
  let content;
  if ((role === "Doctor" || role === "Hospital") && !isVerified()) content = <PendingVerification />;
  else if (role === "Doctor") content = <DoctorDashboard />;
  else if (role === "Hospital") content = <HospitalDashboard />;
  else if (role === "Admin") content = <AdminDashboard />;
  else content = <PatientDashboard />;

  return <Suspense fallback={<DashboardLoading />}>{content}</Suspense>;
}
