import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Notes from "./components/Notes";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}

export default App;
