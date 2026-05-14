import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import Spinner from "./Spinner.jsx";

function ProtectedRoute({ children }) {
  const { user, getMe } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      await getMe();
      setChecking(false);
    };
    check();
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f1923",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;