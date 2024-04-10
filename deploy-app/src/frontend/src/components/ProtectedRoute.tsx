import { useContext } from "react";
import GlobalContext from "../contexts/GlobalContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const { isLoggedIn } = useContext(GlobalContext);
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;