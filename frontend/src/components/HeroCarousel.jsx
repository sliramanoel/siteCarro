import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroCarousel = ({ cars }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (cars.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cars.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [cars.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cars.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (!cars || cars.length === 0) {
    return (
      <div className="relative h-[70vh] bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-black mb-4">Nenhum carro em destaque</h2>
          <p className="text-xl text-white/70">Configure carros em destaque no painel admin</p>
        </div>
      </div>
    );
  }

  const currentCar = cars[currentIndex];

  return (
    <div className="relative h-[70vh] overflow-hidden" data-testid="hero-carousel">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: `url('${currentCar.images[0] || 'https://via.placeholder.com/1920x1080'}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-6">
        <div className="max-w-4xl text-center text-white z-10">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full inline-block mb-4 font-bold" data-testid="featured-badge">
            ⭐ EM DESTAQUE
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4" data-testid="carousel-title">
            {currentCar.brand} {currentCar.model}
          </h1>
          <p className="text-3xl md:text-4xl font-black mb-6" style={{ color: '#DC2626' }} data-testid="carousel-price">
            {formatPrice(currentCar.price)}
          </p>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="carousel-description">
            {currentCar.description.substring(0, 150)}...
          </p>
          <button
            onClick={() => navigate(`/car/${currentCar.id}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
            data-testid="carousel-cta"
          >
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {cars.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-all z-20"
            data-testid="carousel-prev"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-all z-20"
            data-testid="carousel-next"
          >
            <ChevronRight size={32} className="text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {cars.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20" data-testid="carousel-indicators">
          {cars.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              data-testid={`carousel-indicator-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
