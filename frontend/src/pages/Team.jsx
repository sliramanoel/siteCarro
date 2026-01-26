import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Imagens de placeholder para vendedores
const sellerImages = [
  "https://images.unsplash.com/photo-1740485863233-032dff964d0d?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1696992443043-7d63e521b91c?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&q=85"
];

export default function Team() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API}/admin/sellers`);
      setSellers(response.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (whatsapp, name) => {
    const message = `Olá ${name}! Gostaria de mais informações sobre os veículos disponíveis.`;
    const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <div className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6" data-testid="team-title">
            Nossa Equipe
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto" data-testid="team-subtitle">
            Conheça os profissionais dedicados que vão te ajudar a encontrar o veículo perfeito
          </p>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando equipe...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <p className="text-slate-600 text-lg">Nenhum vendedor cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="sellers-grid">
            {sellers.map((seller, index) => (
              <div
                key={seller.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105"
                data-testid={`seller-card-${seller.id}`}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={sellerImages[index % sellerImages.length]}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                    data-testid={`seller-image-${seller.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-black mb-1" data-testid={`seller-name-${seller.id}`}>
                      {seller.name}
                    </h3>
                    <p className="text-white/80 text-sm font-semibold">Consultor de Vendas</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-700" data-testid={`seller-phone-${seller.id}`}>
                      <div className="bg-slate-100 p-2 rounded-full">
                        <Phone size={18} />
                      </div>
                      <span className="font-medium">{seller.phone}</span>
                    </div>
                    {seller.email && (
                      <div className="flex items-center gap-3 text-slate-700" data-testid={`seller-email-${seller.id}`}>
                        <div className="bg-slate-100 p-2 rounded-full">
                          <Mail size={18} />
                        </div>
                        <span className="font-medium text-sm">{seller.email}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleWhatsAppClick(seller.whatsapp, seller.name)}
                    className="whatsapp-btn w-full py-3 rounded-full font-bold flex items-center justify-center gap-2"
                    data-testid={`whatsapp-seller-${seller.id}`}
                  >
                    <MessageCircle size={20} />
                    Conversar no WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-slate-100 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6" data-testid="cta-title">
            Pronto para encontrar seu carro ideal?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Nossa equipe está pronta para te atender e encontrar o veículo perfeito para você
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="btn-primary px-8 py-6 text-lg rounded-full font-bold"
            data-testid="view-catalog-button"
          >
            Ver Catálogo de Veículos
          </Button>
        </div>
      </div>
    </div>
  );
}
