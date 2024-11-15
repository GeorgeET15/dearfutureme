import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import { useCookies } from "react-cookie";

const Dashboard = () => {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]); // State to store capsules
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const userId = localStorage.getItem("userId"); // Get userId from localStorage
  const authToken = localStorage.getItem("AuthToken"); // Get AuthToken from localStorage

  useEffect(() => {
    // Fetch user's capsules when the component mounts
    const fetchCapsules = async () => {
      if (!authToken) return; // Ensure authToken exists before making request

      try {
        const response = await axios.get(
          "http://localhost:8000/time-capsules",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Pass the token in the Authorization header
            },
          }
        );
        setCapsules(response.data.capsules); // Set the fetched capsules
      } catch (error) {
        console.error("Error fetching time capsules:", error);
      }
    };

    if (userId && authToken) {
      fetchCapsules(); // Fetch the capsules if userId and authToken exist
    }
  }, [userId, authToken]); // Trigger the effect when userId or authToken changes

  const handleCreateCapsuleClick = () => {
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
          <button
            className="dashboard-btn logout-btn"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </div>

        <div className="time-capsules-list">
          {capsules.length === 0 ? (
            <p>No time capsules found. Create one to get started!</p>
          ) : (
            <div className="card-list">
              {capsules.map((capsule) => (
                <Card key={capsule._id} data={capsule} />
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-footer">
          <p>&copy; 2024 Time Capsule App. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
