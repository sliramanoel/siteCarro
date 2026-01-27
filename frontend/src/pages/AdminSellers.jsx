import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminSellers() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API}/admin/sellers`);
      setSellers(response.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error('Erro ao carregar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (seller = null) => {
    if (seller) {
      setEditingSeller(seller);
      setFormData({
        name: seller.name,
        phone: seller.phone,
        email: seller.email || "",
        whatsapp: seller.whatsapp,
      });
    } else {
      setEditingSeller(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        whatsapp: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSeller(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSeller) {
        await axios.put(`${API}/admin/sellers/${editingSeller.id}`, formData);
        toast.success('Vendedor atualizado com sucesso!');
      } else {
        await axios.post(`${API}/admin/sellers`, formData);
        toast.success('Vendedor adicionado com sucesso!');
      }
      handleCloseModal();
      fetchSellers();
    } catch (error) {
      console.error("Error saving seller:", error);
      toast.error('Erro ao salvar vendedor');
    }
  };

  const handleDelete = async (sellerId) => {
    if (!window.confirm('Tem certeza que deseja excluir este vendedor?')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/sellers/${sellerId}`);
      toast.success('Vendedor excluído com sucesso!');
      fetchSellers();
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error('Erro ao excluir vendedor');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2" data-testid="sellers-title">
              Gerenciar Vendedores
            </h1>
            <p className="text-slate-600 text-sm md:text-base" data-testid="sellers-subtitle">
              {sellers.length} vendedores cadastrados
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 py-2 md:px-6 md:py-6 text-sm md:text-base"
            data-testid="add-seller-button"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Vendedor
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando vendedores...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <p className="text-slate-600 text-lg">Nenhum vendedor cadastrado.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4" data-testid="sellers-mobile">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-white rounded-xl shadow-lg p-4" data-testid={`seller-card-mobile-${seller.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{seller.name}</h3>
                      <p className="text-sm text-slate-600">{seller.phone}</p>
                      {seller.email && <p className="text-sm text-slate-500">{seller.email}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenModal(seller)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(seller.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden" data-testid="sellers-table">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Nome</th>
                    <th className="px-6 py-4 text-left font-bold">Telefone</th>
                    <th className="px-6 py-4 text-left font-bold">WhatsApp</th>
                    <th className="px-6 py-4 text-left font-bold">Email</th>
                    <th className="px-6 py-4 text-left font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="border-b hover:bg-slate-50" data-testid={`seller-row-${seller.id}`}>
                      <td className="px-6 py-4 font-semibold">{seller.name}</td>
                      <td className="px-6 py-4">{seller.phone}</td>
                      <td className="px-6 py-4">{seller.whatsapp}</td>
                      <td className="px-6 py-4">{seller.email || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(seller)}
                            data-testid={`edit-seller-${seller.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(seller.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`delete-seller-${seller.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md mx-4" data-testid="seller-modal" aria-describedby="seller-modal-description">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black">
              {editingSeller ? 'Editar Vendedor' : 'Adicionar Vendedor'}
            </DialogTitle>
            <p id="seller-modal-description" className="sr-only">
              Formulário para {editingSeller ? 'editar' : 'adicionar'} informações de um vendedor no sistema
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="name-input"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                required
                data-testid="phone-input"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="5511987654321"
                required
                data-testid="whatsapp-input"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendedor@email.com"
                data-testid="email-input"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="btn-primary flex-1" data-testid="submit-seller-button">
                {editingSeller ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary flex-1"
                data-testid="cancel-button"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
