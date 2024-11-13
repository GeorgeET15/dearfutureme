import React, { useState } from "react";
import { storage } from "../Firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";

const CreateTimeCapsule = ({ userId }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const uploadedFileUrls = [];

    // Upload files to Firebase Storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `time_capsules/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        uploadedFileUrls.push(downloadURL);
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }

    // Create the payload
    const payload = {
      message,
      userId,
      files: uploadedFileUrls,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/create-time-capsule", // Your backend endpoint
        payload
      );
      console.log(response.data);
      alert("Time capsule created successfully!");
    } catch (error) {
      console.error("Error creating time capsule: ", error);
      alert("Error creating time capsule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a New Time Capsule</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your message"
          value={message}
          onChange={handleMessageChange}
          required
        />
        <input type="file" multiple onChange={handleFileChange} required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Create Capsule"}
        </button>
      </form>
    </div>
  );
};

export default CreateTimeCapsule;
