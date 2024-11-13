// Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // For navigation
import { useCookies } from "react-cookie";
const Navbar = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["AuthToken"]); // Use cookies to manage auth token
  const navigate = useNavigate(); // Use navigate for redirecting

  // Handle logout functionality
  const handleLogout = () => {
    removeCookie("AuthToken"); // Remove the AuthToken cookie to logout
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MyApp
        </Link>
        <ul className="navbar-links">
          <li>
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="navbar-link">
              About
            </Link>
          </li>
          <li>
            <Link to="/services" className="navbar-link">
              Services
            </Link>
          </li>
          <li>
            <Link to="/contact" className="navbar-link">
              Contact
            </Link>
          </li>
          {cookies.AuthToken && (
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
        <button
          className="navbar-toggle"
          onClick={() =>
            document.querySelector(".navbar-links").classList.toggle("active")
          }
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
