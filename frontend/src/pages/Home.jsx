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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
    fetchFeaturedCars();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.year.toString().includes(searchTerm)
      );
      setFilteredCars(filtered);
    }
  }, [searchTerm, cars]);

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
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2" data-testid="catalog-title">
              Catálogo de Veículos
            </h2>
            <p className="text-slate-600" data-testid="catalog-subtitle">
              {filteredCars.length} veículos disponíveis
            </p>
          </div>
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
