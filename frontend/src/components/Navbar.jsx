import { Link } from "react-router-dom";
import { Car } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="navbar py-4 px-6 shadow-md sticky top-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <Car size={32} />
          <span className="text-2xl font-black tracking-tight">AutoLeilão</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-slate-300 transition-colors" data-testid="nav-home">
            Início
          </Link>
          <Link
            to="/admin/login"
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full font-semibold transition-colors"
            data-testid="nav-admin-login"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
