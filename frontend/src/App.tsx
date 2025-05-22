import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Signup from "./Pages/Signup";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./Pages/Dashboard";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <div className="w-full">
      <AuthProvider>
        <Toaster />

        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
