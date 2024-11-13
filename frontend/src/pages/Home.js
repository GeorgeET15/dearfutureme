// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to the Time Capsule App</h1>
        <p className="home-description">
          Create and save memories to open in the future! The perfect place to
          store your digital time capsule for those special moments.
        </p>
        <div className="home-subheading">
          <h2>Why Choose Us?</h2>
          <ul className="home-features">
            <li>🕰️ Preserve precious memories for later</li>
            <li>🔐 Secure storage for your files</li>
            <li>📅 Set reminders to open your capsule</li>
            <li>🌟 Simple and easy-to-use interface</li>
          </ul>
        </div>
        <div className="home-links">
          <Link to="/signup" className="home-link home-link-signup">
            Sign Up
          </Link>
          <span className="home-link-separator">|</span>
          <Link to="/login" className="home-link home-link-login">
            Log In
          </Link>
        </div>
      </div>
      <footer className="home-footer">
        <p>&copy; 2024 Time Capsule App. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
