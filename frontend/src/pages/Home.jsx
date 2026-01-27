import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import HeroCarousel from "@/components/HeroCarousel";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Home() {
  const [cars, setCars] = useState([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
    fetchFeaturedCars();
  }, []);

  useEffect(() => {
    let filtered = cars;
    
    // Filtrar por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(car => car.status === statusFilter);
    }
    
    // Filtrar por termo de busca
    if (searchTerm !== "") {
      filtered = filtered.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.year.toString().includes(searchTerm)
      );
    }
    
    setFilteredCars(filtered);
  }, [searchTerm, statusFilter, cars]);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${API}/cars`);
      setCars(response.data);
      setFilteredCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCars = async () => {
    try {
      const response = await axios.get(`${API}/cars/featured`);
      setFeaturedCars(response.data);
    } catch (error) {
      console.error("Error fetching featured cars:", error);
    }
  };

  const handleCarClick = (carId) => {
    navigate(`/car/${carId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel cars={featuredCars} />

      {/* Search Bar Section */}
      <div className="bg-slate-100 py-8 px-6">
        <div className="max-w-4xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
          <Input
            type="text"
            placeholder="Buscar por marca, modelo ou ano..."
            className="pl-12 h-14 text-lg rounded-full search-input bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Cars Catalog */}
      <div className="max-w-7xl mx-auto px-6 py-24" id="catalog-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2" data-testid="catalog-title">
              Catálogo de Veículos
            </h2>
            <p className="text-slate-600" data-testid="catalog-subtitle">
              {filteredCars.length} veículo{filteredCars.length !== 1 ? 's' : ''} {statusFilter === 'all' ? 'no catálogo' : statusFilter === 'available' ? 'disponíveis' : statusFilter === 'reserved' ? 'reservados' : 'vendidos'}
            </p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8" data-testid="status-filter">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
            data-testid="filter-all"
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("available")}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              statusFilter === "available"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            data-testid="filter-available"
          >
            Disponíveis
          </button>
          <button
            onClick={() => setStatusFilter("reserved")}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              statusFilter === "reserved"
                ? "bg-yellow-500 text-black"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
            data-testid="filter-reserved"
          >
            Reservados
          </button>
          <button
            onClick={() => setStatusFilter("sold")}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              statusFilter === "sold"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
            data-testid="filter-sold"
          >
            Vendidos
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando veículos...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <p className="text-slate-600 text-lg">Nenhum veículo encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="cars-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} onClick={() => handleCarClick(car.id)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
