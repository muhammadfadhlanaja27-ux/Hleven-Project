// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  return Boolean(
    token &&
    token !== "null" &&
    token !== "undefined" &&
    token.trim() !== ""
  );
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isUserLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;