import { useNavigate, Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("Token");

  if (!token) {
    alert("Unable to access login again")
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
