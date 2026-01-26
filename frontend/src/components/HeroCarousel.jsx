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
    }, 5000);

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
        {/* Gradient overlay mais forte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-20 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            {/* Badge em destaque */}
            <div className="inline-block mb-4">
              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2" data-testid="featured-badge">
                <span className="text-xl">⭐</span>
                <span>EM DESTAQUE</span>
              </div>
            </div>

            {/* Título do carro */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl" data-testid="carousel-title">
              {currentCar.brand} {currentCar.model}
            </h1>

            {/* Preço */}
            <p className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg" data-testid="carousel-price">
              {formatPrice(currentCar.price)}
            </p>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-white mb-8 max-w-2xl drop-shadow-lg" data-testid="carousel-description">
              {currentCar.description.substring(0, 150)}...
            </p>

            {/* Botão CTA */}
            <button
              onClick={() => navigate(`/car/${currentCar.id}`)}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl inline-flex items-center gap-3"
              data-testid="carousel-cta"
            >
              <span>Ver Detalhes Completos</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {cars.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full transition-all z-20 shadow-xl"
            data-testid="carousel-prev"
          >
            <ChevronLeft size={32} className="text-slate-900" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full transition-all z-20 shadow-xl"
            data-testid="carousel-next"
          >
            <ChevronRight size={32} className="text-slate-900" />
          </button>
        </>
      )}

      {/* Indicators */}
      {cars.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20" data-testid="carousel-indicators">
          {cars.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-12'
                  : 'bg-white/50 hover:bg-white/70 w-3'
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
