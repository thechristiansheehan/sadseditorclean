import React, { useState, useRef } from "react";
import "./App.css";

function Resources() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({ textfile: "", image: "" });
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const fileInputRef = useRef(null);

  const isValidFile = (file) =>
    file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        setMessage("");
      } else {
        setMessage("Invalid file. Only .jpg allowed.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!textInput.trim()) {
      setMessage("Please enter a title to upload.");
      return;
    }
    if (!file) {
      setMessage("Please select an image to upload.");
      return;
    }

    // Combine title and link (if provided) with a newline
    const textContent = linkInput.trim() ? `${textInput.trim()}\n${linkInput.trim()}` : textInput.trim();
    const textBlob = new Blob([textContent], { type: "text/plain" });
    const textFile = new File([textBlob], "title.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("textfile", textFile);
    formData.append("file", file);

    try {
      console.log("Uploading files:", { textFile: textFile.name, imageFile: file.name });
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value.name}`);
      }

      const response = await fetch("https://sadseditor-production.up.railway.app/uploads/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        setMessage("Upload successful!");
        setUploadDone(true);
        setUploadedFiles({ textfile: data.textfile, image: data.image });
        setTextInput("");
        setLinkInput("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(`Upload failed: ${data.message || "Server error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    const number = deleteInput.trim();
    if (!number) {
      setDeleteMessage("Please enter a number to delete (e.g., 7).");
      return;
    }

    if (!/^\d+$/.test(number)) {
      setDeleteMessage("Please enter a valid number (e.g., 7).");
      setDeleteInput("");
      return;
    }

    const baseUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://sadseditor-production.up.railway.app";

    try {
      const response = await fetch(
        `${baseUrl}/delete-resource/${encodeURIComponent(number)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log("Delete response:", data);

      if (response.ok) {
        setDeleteMessage(data.message);
        if (
          uploadedFiles.textfile === `${number}.txt` &&
          uploadedFiles.image === `${number}.jpg`
        ) {
          setUploadedFiles({ textfile: "", image: "" });
          setUploadDone(false);
          setMessage("");
        }
      } else {
        setDeleteMessage(data.message || `Delete failed (status ${response.status})`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteMessage(`Delete failed: ${error.message}`);
    }

    setDeleteInput("");
  };

  return (
    <div
      style={{
        backgroundColor: "#252525",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Riona Sans W01 Medium", sans-serif',
        fontSize: "1rem",
      }}
    >
      <title>Edit Resources</title>
      <img
        src="https://sads.club/static/media/sads_logo.88d07e896311a6f9aa80.png"
        alt="SADS Logo"
        style={{ height: "125px", display: "block", margin: "0 auto 15px auto" }}
      />

      <div
        style={{
          backgroundColor: "#404040",
          padding: "15px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <textarea
          placeholder="Write title here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={{
            width: "90%",
            padding: "8px",
            marginBottom: "10px",
            border: "none",
            outline: "none",
            backgroundColor: "#555",
            color: "white",
            textAlign: "left",
            resize: "none",
            fontSize: "15px",
            height: "36px",
          }}
        />
        <textarea
          placeholder="Enter link here..."
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          style={{
            width: "90%",
            padding: "8px",
            marginBottom: "10px",
            border: "none",
            outline: "none",
            backgroundColor: "#555",
            color: "white",
            textAlign: "left",
            resize: "none",
            fontSize: "15px",
            height: "36px",
          }}
        />
        <input
          type="file"
          accept="image/jpeg,.jpg"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{
            width: "90%",
            padding: "8px",
            marginBottom: "10px",
            border: "none",
            outline: "none",
            backgroundColor: "#404040",
            color: "white",
            textAlign: "left",
          }}
        />
        <button
          onClick={handleUpload}
          style={{
            backgroundColor: "#606060",
            color: "white",
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Upload
        </button>
      </div>

      {message && <p style={{ marginTop: "10px", marginBottom: "0px" }}>{message}</p>}

     

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#404040",
          padding: "15px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <form onSubmit={handleDelete}>
          <input
            type="text"
            placeholder="Type number to delete (e.g. 7)"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            style={{
              width: "90%",
              padding: "8px",
              marginBottom: "10px",
              border: "none",
              outline: "none",
              backgroundColor: "#555",
              color: "white",
              textAlign: "center",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#c0392b",
              color: "white",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Delete
          </button>
        </form>
        {deleteMessage && <p style={{ marginTop: "10px", marginBottom: "0px" }}>{deleteMessage}</p>}
      </div>
    </div>
  );
}

export default Resources;