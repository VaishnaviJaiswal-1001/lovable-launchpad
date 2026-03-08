import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ParticipantDashboard from "@/components/dashboard/ParticipantDashboard";

const Dashboard = () => {
  const { role } = useAuth();
  return role === "admin" ? <AdminDashboard /> : <ParticipantDashboard />;
};

export default Dashboard;
