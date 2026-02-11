import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Lock, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPassword() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("As senhas não coincidem");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `${API}/admin/change-password`,
        {
          current_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Senha alterada com sucesso!");
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response?.status === 401) {
        toast.error("Senha atual incorreta");
      } else {
        toast.error("Erro ao alterar senha: " + (error.response?.data?.detail || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2" data-testid="password-title">
            Alterar Senha
          </h1>
          <p className="text-slate-600 text-sm md:text-base" data-testid="password-subtitle">
            Atualize sua senha de acesso ao painel
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="password-form">
            <div>
              <Label htmlFor="current_password" className="text-lg font-bold mb-2 block">
                Senha Atual
              </Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  placeholder="Digite sua senha atual"
                  className="h-12 pr-12"
                  required
                  data-testid="current-password-input"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="new_password" className="text-lg font-bold mb-2 block">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Digite a nova senha"
                  className="h-12 pr-12"
                  required
                  minLength={6}
                  data-testid="new-password-input"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="confirm_password" className="text-lg font-bold mb-2 block">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Confirme a nova senha"
                  className="h-12 pr-12"
                  required
                  data-testid="confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full font-bold flex items-center gap-2"
                data-testid="save-password-button"
              >
                <Lock size={20} />
                {saving ? "Salvando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
