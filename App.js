// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Home from "./Home";
import MyMemories from "./MyMemories";
import AddMemory from "./AddMemory";
import Timeline from "./Timeline";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/my-memories"
            element={
              <PrivateRoute>
                <MyMemories />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-memory"
            element={
              <PrivateRoute>
                <AddMemory />
              </PrivateRoute>
            }
          />
          <Route path="/:username" element={<Timeline />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
