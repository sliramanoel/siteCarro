import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, Users, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "sonner";

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
  ];

  return (
    <div className="admin-sidebar w-64 p-6 text-white" data-testid="admin-sidebar">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Car size={32} />
          <span className="text-2xl font-black">AutoLeilão</span>
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
  );
};

export default AdminSidebar;
