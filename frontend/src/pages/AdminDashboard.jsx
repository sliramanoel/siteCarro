import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Car, Users, ShoppingCart, TrendingUp } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_cars: 0,
    available_cars: 0,
    sold_cars: 0,
    total_sellers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2" data-testid="dashboard-title">
            Dashboard
          </h1>
          <p className="text-slate-600" data-testid="dashboard-subtitle">
            Visão geral do sistema
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
            <div className="stat-card p-6 rounded-xl shadow-lg" data-testid="total-cars-stat">
              <div className="flex items-center justify-between mb-4">
                <Car size={32} />
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <p className="text-sm text-white/70 mb-1">Total de Carros</p>
              <p className="text-4xl font-black">{stats.total_cars}</p>
            </div>

            <div className="stat-card p-6 rounded-xl shadow-lg" data-testid="available-cars-stat">
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart size={32} />
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <p className="text-sm text-white/70 mb-1">Disponíveis</p>
              <p className="text-4xl font-black">{stats.available_cars}</p>
            </div>

            <div className="stat-card p-6 rounded-xl shadow-lg" data-testid="sold-cars-stat">
              <div className="flex items-center justify-between mb-4">
                <Car size={32} />
                <TrendingUp size={20} className="text-red-400" />
              </div>
              <p className="text-sm text-white/70 mb-1">Vendidos</p>
              <p className="text-4xl font-black">{stats.sold_cars}</p>
            </div>

            <div className="stat-card p-6 rounded-xl shadow-lg" data-testid="total-sellers-stat">
              <div className="flex items-center justify-between mb-4">
                <Users size={32} />
                <TrendingUp size={20} className="text-blue-400" />
              </div>
              <p className="text-sm text-white/70 mb-1">Vendedores</p>
              <p className="text-4xl font-black">{stats.total_sellers}</p>
            </div>
          </div>
        )}

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-4" data-testid="welcome-title">
            Bem-vindo ao Painel Administrativo
          </h2>
          <p className="text-slate-600 mb-6">
            Utilize o menu lateral para gerenciar carros e vendedores do sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/cars')}
              className="btn-primary px-6 py-4 rounded-lg font-semibold text-left"
              data-testid="manage-cars-button"
            >
              <Car size={24} className="mb-2" />
              <p className="font-bold text-lg">Gerenciar Carros</p>
              <p className="text-sm text-white/70">Adicionar, editar ou remover veículos</p>
            </button>
            <button
              onClick={() => navigate('/admin/sellers')}
              className="btn-primary px-6 py-4 rounded-lg font-semibold text-left"
              data-testid="manage-sellers-button"
            >
              <Users size={24} className="mb-2" />
              <p className="font-bold text-lg">Gerenciar Vendedores</p>
              <p className="text-sm text-white/70">Adicionar, editar ou remover vendedores</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
