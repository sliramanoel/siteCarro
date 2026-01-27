import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, Users, LayoutDashboard, LogOut, Settings, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    toast.success('Logout realizado com sucesso!');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', testId: 'sidebar-dashboard' },
    { path: '/admin/cars', icon: Car, label: 'Carros', testId: 'sidebar-cars' },
    { path: '/admin/sellers', icon: Users, label: 'Vendedores', testId: 'sidebar-sellers' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações', testId: 'sidebar-settings' },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden admin-sidebar fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Car size={24} className="text-white" />
          <span className="text-lg font-black text-white">{settings?.site_name || 'Admin'}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2"
          data-testid="mobile-menu-toggle"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar fixed lg:relative z-50 h-full w-64 p-6 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-testid="admin-sidebar"
      >
        <div className="mb-12 mt-12 lg:mt-0">
          <div className="flex items-center gap-3 mb-2">
            <Car size={32} />
            <span className="text-xl font-black">{settings?.site_name || 'Admin'}</span>
          </div>
          <p className="text-sm text-white/70">Painel Admin</p>
        </div>

        <nav className="space-y-2 mb-12">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                data-testid={item.testId}
              >
                <Icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/20 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
            data-testid="logout-button"
          >
            <LogOut size={20} />
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
