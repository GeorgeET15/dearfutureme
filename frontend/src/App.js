import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateTimeCapsule from "./components/CreateTimeCapsule";

const App = () => {
  const [cookies] = useCookies(["AuthToken"]);
  const authToken = cookies.AuthToken;

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect to Dashboard if logged in, else show Home */}
        <Route
          path="/"
          element={authToken ? <Navigate to="/dashboard" /> : <Home />}
        />

        {/* Protected route for Dashboard */}
        {authToken ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          // Redirect to Login if not authenticated
          <Route path="/dashboard" element={<Navigate to="/login" />} />
        )}

        {/* Public routes for Login and Signup */}
        {!authToken && <Route path="/login" element={<Login />} />}
        {!authToken && <Route path="/signup" element={<Signup />} />}

        {/* Catch-all route redirects */}
        <Route
          path="*"
          element={<Navigate to={authToken ? "/dashboard" : "/login"} />}
        />
        <Route path="/create-time-capsule" element={<CreateTimeCapsule />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
