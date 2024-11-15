import React, { useState, useEffect } from "react";
import ReactConfetti from "react-confetti"; // Import confetti

const Card = ({ data }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClickable, setIsClickable] = useState(false); // State to manage clickability
  const [isConfettiActive, setIsConfettiActive] = useState(false); // To control confetti animation

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const openingTime = new Date(data.openingTime); // Get the opening time of the capsule

      // Calculate the difference in time between now and the opening time
      const timeDifference = openingTime - now;

      if (timeDifference <= 0) {
        setIsOpen(true); // Capsule is open
        setTimeRemaining("Time Capsule is now OPEN!"); // Display a message when time is up
        setIsClickable(true); // Allow image clicks when the time is reached
        clearInterval(countdownInterval); // Stop the countdown once the time is reached
        setIsConfettiActive(true);
        setTimeout(() => setIsConfettiActive(false), 5000); // Stop confetti after 5 seconds
      } else {
        // Calculate remaining time in days, hours, minutes, and seconds
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(countdownInterval);
  }, [data.openingTime]);

  // Handle the image click
  const handleImageClick = (file) => {
    if (isClickable) {
      window.open(file, "_blank"); // Open the image/video in a new tab
    }
  };

  return (
    <div className="card">
      {isConfettiActive && <ReactConfetti />}
      <div className="card-header">
        <h3 className="card-title">{data.title}</h3>
      </div>
      <div className="card-body">
        {/* Display live countdown */}
        <p className="countdown">{timeRemaining}</p>

        {/* Hidden message */}
        <p className={`card-message ${isOpen ? "revealed" : ""}`}>
          {data.message}
        </p>

        <div className="card-dates">
          <span className="timestamp">
            <strong>Opening Time:</strong>{" "}
            {new Date(data.openingTime).toLocaleString()}
          </span>
          <span className="timestamp">
            <strong>Created At:</strong>{" "}
            {new Date(data.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Hidden images */}
        {data.files && data.files.length > 0 && (
          <div className="card-files">
            {data.files.map((file, index) => (
              <img
                key={index}
                src={file}
                alt={`File ${index}`}
                className={`file-preview ${isOpen ? "revealed" : ""}`}
                onClick={() => handleImageClick(file)} // Open in new tab when clicked
                style={{ cursor: isClickable ? "pointer" : "not-allowed" }} // Disable click if not open yet
              />
            ))}
          </div>
        )}
      </div>
      <div className="card-footer">
        {/* No need for view details button anymore */}
      </div>
    </div>
  );
};

export default Card;
