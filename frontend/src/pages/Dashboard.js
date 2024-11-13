import React from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const userId = cookies.UserId;

  const handleCreateCapsuleClick = () => {
    // Navigate to the CreateTimeCapsule page
    navigate("/create-time-capsule");
  };

  const handleLogoutClick = () => {
    // Remove user-related cookies
    removeCookie("UserId", { path: "/" });
    removeCookie("AuthToken", { path: "/" });

    // Navigate to the home page after logout
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Your Time Capsules</h1>
        <p className="dashboard-description">
          View, create, and manage your time capsules. Your memories are safe
          with us.
        </p>
        <div className="dashboard-actions">
          <button
            className="dashboard-btn create-btn"
            onClick={handleCreateCapsuleClick}
          >
            Create a New Capsule
          </button>
          <button className="dashboard-btn manage-btn">
            Manage Existing Capsules
          </button>
          {/* Add Logout Button */}
          <button
            className="dashboard-btn logout-btn"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </div>
        <div className="dashboard-footer">
          <p>&copy; 2024 Time Capsule App. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
