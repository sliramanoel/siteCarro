import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export const Navbar = () => {
  const { settings } = useSettings();

  return (
    <nav className="navbar py-4 px-6 shadow-md sticky top-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          {settings.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.site_name} 
              className="h-8 w-auto"
              data-testid="site-logo"
            />
          ) : (
            <Car size={32} />
          )}
          <span className="text-2xl font-black tracking-tight" data-testid="site-name">
            {settings.site_name}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-slate-300 transition-colors font-semibold" data-testid="nav-home">
            Início
          </Link>
          <Link to="/equipe" className="hover:text-slate-300 transition-colors font-semibold" data-testid="nav-team">
            Equipe
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
