import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    km: 0,
    price: 0,
    description: "",
    seller_id: "",
    status: "available",
    featured: false,
    images: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCars();
    fetchSellers();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${API}/admin/cars`);
      setCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error('Erro ao carregar carros');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API}/admin/sellers`);
      setSellers(response.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        km: car.km,
        price: car.price,
        description: car.description,
        seller_id: car.seller_id,
        status: car.status,
        featured: car.featured || false,
        images: car.images || [],
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        km: 0,
        price: 0,
        description: "",
        seller_id: "",
        status: "available",
        featured: false,
        images: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Digite a URL da imagem:");
    if (url) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const handleImageRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.seller_id) {
      toast.error('Selecione um vendedor');
      return;
    }

    try {
      if (editingCar) {
        await axios.put(`${API}/admin/cars/${editingCar.id}`, formData);
        toast.success('Carro atualizado com sucesso!');
      } else {
        await axios.post(`${API}/admin/cars`, formData);
        toast.success('Carro adicionado com sucesso!');
      }
      handleCloseModal();
      fetchCars();
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error('Erro ao salvar carro');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Tem certeza que deseja excluir este carro?')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/cars/${carId}`);
      toast.success('Carro excluído com sucesso!');
      fetchCars();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error('Erro ao excluir carro');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2" data-testid="cars-title">
              Gerenciar Carros
            </h1>
            <p className="text-slate-600" data-testid="cars-subtitle">
              {cars.length} veículos cadastrados
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-6 py-6"
            data-testid="add-car-button"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Carro
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando carros...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <p className="text-slate-600 text-lg">Nenhum carro cadastrado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="cars-table">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Imagem</th>
                  <th className="px-6 py-4 text-left font-bold">Veículo</th>
                  <th className="px-6 py-4 text-left font-bold">Ano</th>
                  <th className="px-6 py-4 text-left font-bold">KM</th>
                  <th className="px-6 py-4 text-left font-bold">Preço</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Destaque</th>
                  <th className="px-6 py-4 text-left font-bold">Vendedor</th>
                  <th className="px-6 py-4 text-left font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b hover:bg-slate-50" data-testid={`car-row-${car.id}`}>
                    <td className="px-6 py-4">
                      <img
                        src={car.images[0] || 'https://via.placeholder.com/100x60?text=No+Image'}
                        alt={`${car.brand} ${car.model}`}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">{car.brand} {car.model}</td>
                    <td className="px-6 py-4">{car.year}</td>
                    <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR').format(car.km)} km</td>
                    <td className="px-6 py-4 font-bold text-red-600">{formatPrice(car.price)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          car.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : car.status === 'sold'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {car.status === 'available' ? 'Disponível' : car.status === 'sold' ? 'Vendido' : 'Reservado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {car.featured ? (
                        <span className="text-2xl" title="Em destaque">⭐</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{car.seller?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(car)}
                          data-testid={`edit-car-${car.id}`}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-car-${car.id}`}
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
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="car-modal" aria-describedby="car-modal-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {editingCar ? 'Editar Carro' : 'Adicionar Carro'}
            </DialogTitle>
            <p id="car-modal-description" className="sr-only">
              Formulário para {editingCar ? 'editar' : 'adicionar'} informações de um carro no sistema
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  data-testid="brand-input"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  data-testid="model-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  data-testid="year-input"
                />
              </div>
              <div>
                <Label htmlFor="km">Quilometragem</Label>
                <Input
                  id="km"
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) })}
                  required
                  data-testid="km-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  data-testid="status-select"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300"
                  data-testid="featured-checkbox"
                />
                <Label htmlFor="featured" className="font-bold cursor-pointer">
                  ⭐ Destaque no Banner Principal
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="seller">Vendedor</Label>
              <Select
                value={formData.seller_id}
                onValueChange={(value) => setFormData({ ...formData, seller_id: value })}
                data-testid="seller-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                data-testid="description-input"
              />
            </div>

            <div>
              <Label>Imagens</Label>
              <Button
                type="button"
                onClick={handleImageUrlAdd}
                className="btn-secondary w-full mb-2"
                data-testid="add-image-button"
              >
                <Plus size={16} className="mr-2" />
                Adicionar URL de Imagem
              </Button>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative" data-testid={`image-preview-${idx}`}>
                      <img src={img} alt={`Preview ${idx + 1}`} className="image-upload-preview" />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        data-testid={`remove-image-${idx}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="btn-primary flex-1" data-testid="submit-car-button">
                {editingCar ? 'Atualizar' : 'Adicionar'}
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
