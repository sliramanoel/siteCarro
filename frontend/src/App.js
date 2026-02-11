import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Home from "@/pages/Home";
import CarDetails from "@/pages/CarDetails";
import Team from "@/pages/Team";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCars from "@/pages/AdminCars";
import AdminSellers from "@/pages/AdminSellers";
import AdminSettings from "@/pages/AdminSettings";
import AdminPassword from "@/pages/AdminPassword";
import AdminImport from "@/pages/AdminImport";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/contexts/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/equipe" element={<Team />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/password" element={<AdminPassword />} />
            <Route path="/admin/import" element={<AdminImport />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </SettingsProvider>
  );
}

export default App;
