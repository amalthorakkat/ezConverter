import React from "react";
import Home from "./components/home/Home";
import UserLayout from "./components/layout/UserLayout";
import { Routes, Route } from "react-router-dom";
import ImageConvert from "./components/pages/image-conversion/ImageConvert";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="/convert/image" element={<ImageConvert />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
