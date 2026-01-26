import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Car, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_username', response.data.username);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Credenciais inválidas!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-4 rounded-full">
              <Car size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2" data-testid="login-title">
            Painel Administrativo
          </h1>
          <p className="text-slate-400" data-testid="login-subtitle">
            Faça login para gerenciar o sistema
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleLogin} data-testid="login-form">
            <div className="mb-6">
              <Label htmlFor="username" className="text-slate-900 font-semibold mb-2 block">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="h-12"
                required
                data-testid="username-input"
              />
            </div>
            <div className="mb-8">
              <Label htmlFor="password" className="text-slate-900 font-semibold mb-2 block">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="h-12"
                required
                data-testid="password-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
              disabled={loading}
              data-testid="login-button"
            >
              <LogIn size={20} className="mr-2" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Credenciais padrão: <span className="font-semibold">admin / admin123</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-slate-300"
            data-testid="back-to-home-button"
          >
            Voltar ao Site
          </Button>
        </div>
      </div>
    </div>
  );
}
