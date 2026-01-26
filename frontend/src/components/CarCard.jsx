import { Calendar, Gauge } from "lucide-react";

export const CarCard = ({ car, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatKm = (km) => {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
  };

  const handleImageError = (e) => {
    console.error('Erro ao carregar imagem:', car.images[0]);
    e.target.src = 'https://via.placeholder.com/400x240?text=Erro+ao+Carregar';
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'sold':
        return { label: 'Vendido', bg: 'bg-red-600', text: 'text-white' };
      case 'reserved':
        return { label: 'Reservado', bg: 'bg-yellow-500', text: 'text-black' };
      case 'available':
      default:
        return { label: 'Disponível', bg: 'bg-green-600', text: 'text-white' };
    }
  };

  const statusConfig = getStatusConfig(car.status);

  return (
    <div
      className="car-card bg-white rounded-xl overflow-hidden shadow-md"
      onClick={onClick}
      data-testid={`car-card-${car.id}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={car.images[0] || 'https://via.placeholder.com/400x240?text=No+Image'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-60 object-cover"
          onError={handleImageError}
          data-testid={`car-image-${car.id}`}
        />
        <div 
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}
          data-testid={`car-status-${car.id}`}
        >
          {statusConfig.label}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-black text-slate-900 mb-2" data-testid={`car-title-${car.id}`}>
          {car.brand} {car.model}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1" data-testid={`car-year-${car.id}`}>
            <Calendar size={16} />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1" data-testid={`car-km-${car.id}`}>
            <Gauge size={16} />
            <span>{formatKm(car.km)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="price-tag text-3xl" data-testid={`car-price-${car.id}`}>
            {formatPrice(car.price)}
          </div>
          <button
            className="btn-primary px-6 py-2 rounded-full font-semibold"
            data-testid={`car-view-details-${car.id}`}
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
