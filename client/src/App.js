import React from "react";
import { Routes, Route } from "react-router-dom";
import Resources from "./Resources";
import Images from "./images";
import Home from "./Home";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/images" element={<Images />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </div>
  );
}

export default App;
