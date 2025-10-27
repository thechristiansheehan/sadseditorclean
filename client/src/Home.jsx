import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

function Home() {
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
        minHeight: "100vh",
      }}
    >
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
          maxWidth: "250px",
          textAlign: "center",
        }}
      >
        <Link
          to="/resources"
          style={{
            display: "block",
            backgroundColor: "#606060",
            color: "white",
            padding: "8px 16px",
            marginBottom: "10px",
            border: "none",
            textDecoration: "none",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Resources
        </Link>
        <Link
          to="/images"
          style={{
            display: "block",
            backgroundColor: "#606060",
            color: "white",
            padding: "8px 16px",
            border: "none",
            textDecoration: "none",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Images
        </Link>
      </div>
    </div>
  );
}

export default Home;