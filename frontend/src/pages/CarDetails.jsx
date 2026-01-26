import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Gauge, ChevronLeft, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarDetails();
    fetchStoreInfo();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await axios.get(`${API}/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.error("Error fetching car details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await axios.get(`${API}/store-info`);
      setStoreInfo(response.data);
    } catch (error) {
      console.error("Error fetching store info:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatKm = (km) => {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
  };

  const handleWhatsAppClick = () => {
    if (car && storeInfo) {
      const message = `Olá! Tenho interesse no ${car.brand} ${car.model} ${car.year}.`;
      const whatsappUrl = `https://wa.me/${storeInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const nextImage = () => {
    if (car && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20" data-testid="loading-state">
          <p className="text-slate-600 text-lg">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20" data-testid="not-found-state">
          <p className="text-slate-600 text-lg">Veículo não encontrado.</p>
          <Button onClick={() => navigate('/')} className="mt-4" data-testid="back-home-button">
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
          data-testid="back-button"
        >
          <ChevronLeft size={20} />
          Voltar ao Catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div data-testid="image-gallery">
            <div className="relative rounded-xl overflow-hidden shadow-2xl mb-4">
              <img
                src={car.images[currentImageIndex] || 'https://via.placeholder.com/800x600?text=No+Image'}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-96 object-cover"
                data-testid="main-car-image"
              />
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    data-testid="prev-image-button"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    data-testid="next-image-button"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            {car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto" data-testid="image-thumbnails">
                {car.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`w-24 h-24 object-cover rounded-lg cursor-pointer transition-all ${
                      idx === currentImageIndex ? 'ring-4 ring-red-600' : 'opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    data-testid={`thumbnail-${idx}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div data-testid="car-details">
            <h1 className="text-5xl font-black text-slate-900 mb-6" data-testid="car-title">
              {car.brand} {car.model}
            </h1>
            <div className="price-tag text-5xl mb-8" data-testid="car-price">
              {formatPrice(car.price)}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-100 p-6 rounded-xl" data-testid="car-year-card">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar size={20} />
                  <span className="text-sm font-semibold">Ano</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{car.year}</p>
              </div>
              <div className="bg-slate-100 p-6 rounded-xl" data-testid="car-km-card">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Gauge size={20} />
                  <span className="text-sm font-semibold">Quilometragem</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{formatKm(car.km)}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4" data-testid="description-title">
                Descrição
              </h3>
              <p className="text-slate-700 leading-relaxed" data-testid="car-description">
                {car.description}
              </p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl mb-6" data-testid="contact-info">
              <h3 className="text-xl font-black mb-4">Entre em Contato</h3>
              <p className="text-white/80 mb-4">
                Fale com nossa equipe de vendas pelo WhatsApp e agende uma visita!
              </p>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>{storeInfo?.whatsapp || '(11) 99999-9999'}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="whatsapp-btn w-full py-4 rounded-full font-bold text-lg text-white flex items-center justify-center gap-3 shadow-lg"
              data-testid="whatsapp-button"
            >
              <MessageCircle size={24} />
              Entrar em Contato via WhatsApp
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
