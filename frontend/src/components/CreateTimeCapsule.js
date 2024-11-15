import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const CreateTimeCapsule = () => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("12:00");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("AuthToken");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userId || !authToken) {
      alert("User is not authenticated");
      setIsLoading(false);
      return;
    }

    const uploadedFileUrls = [];
    for (const file of files) {
      const filePath = `time_capsules/${userId}/${file.name}`;
      try {
        const { data, error } = await supabase.storage
          .from("DFM")
          .upload(filePath, file);
        if (error) throw error;

        const { data: url } = supabase.storage
          .from("DFM")
          .getPublicUrl(filePath);
        uploadedFileUrls.push(url.publicUrl);
      } catch (error) {
        console.error("File upload error: ", error);
      }
    }

    // Combine date and time without converting to UTC
    const [hours, minutes] = time.split(":");
    const localDateTime = new Date(date);
    localDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const payload = {
      message,
      userId,
      files: uploadedFileUrls,
      openingTime: localDateTime.toISOString(),
    };

    try {
      await axios.post("http://localhost:8000/create-time-capsule", payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      alert("Time capsule created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating time capsule: ", error);
      alert("Error creating time capsule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="time-capsule-container">
      <h2>Create a New Time Capsule</h2>
      <form onSubmit={handleSubmit} className="time-capsule-form">
        <label>Message:</label>
        <textarea
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-textarea"
          required
        />

        <label>Date:</label>
        <DatePicker
          selected={date}
          onChange={(selectedDate) => setDate(selectedDate)}
          className="input-datepicker"
          minDate={new Date()}
          dateFormat="MMMM d, yyyy"
          required
        />

        <label>Time:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-timepicker"
          required
        />

        <label>Attach Files:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="input-file"
        />

        {photoPreviews.length > 0 && (
          <div className="image-previews">
            {photoPreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index}`}
                className="image-preview"
              />
            ))}
          </div>
        )}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Create Capsule"}
        </button>
      </form>
    </div>
  );
};

export default CreateTimeCapsule;
