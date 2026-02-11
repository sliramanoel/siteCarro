import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Upload, Download, FileSpreadsheet, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSellers();
  }, [navigate]);

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API}/sellers`);
      setSellers(response.data);
      if (response.data.length > 0) {
        setSelectedSeller(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 6) {
          const row = {
            marca: values[0] || '',
            modelo: values[1] || '',
            ano: parseInt(values[2]) || new Date().getFullYear(),
            km: parseInt(values[3]) || 0,
            preco: parseFloat(values[4]) || 0,
            descricao: values[5] || '',
            status: values[6] || 'available',
            destaque: values[7]?.toLowerCase() === 'true',
            imagens: [values[8], values[9], values[10]].filter(img => img && img.trim())
          };
          data.push(row);
        }
      }
      setPreview(data);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    if (!selectedSeller) {
      toast.error('Selecione um vendedor');
      return;
    }

    if (preview.length === 0) {
      toast.error('Nenhum veículo para importar');
      return;
    }

    setImporting(true);
    setResults(null);

    const importResults = {
      success: 0,
      errors: []
    };

    for (let i = 0; i < preview.length; i++) {
      const car = preview[i];
      try {
        await axios.post(`${API}/admin/cars`, {
          brand: car.marca,
          model: car.modelo,
          year: car.ano,
          km: car.km,
          price: car.preco,
          description: car.descricao,
          status: car.status,
          featured: car.destaque,
          seller_id: selectedSeller,
          images: car.imagens.length > 0 ? car.imagens : ['https://via.placeholder.com/400x240?text=Sem+Imagem']
        });
        importResults.success++;
      } catch (error) {
        importResults.errors.push({
          linha: i + 2,
          veiculo: `${car.marca} ${car.modelo}`,
          erro: error.response?.data?.detail || error.message
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    if (importResults.success > 0) {
      toast.success(`${importResults.success} veículo(s) importado(s) com sucesso!`);
    }
    if (importResults.errors.length > 0) {
      toast.error(`${importResults.errors.length} erro(s) durante a importação`);
    }
  };

  const downloadTemplate = () => {
    window.open('/template_veiculos.csv', '_blank');
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
      <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2" data-testid="import-title">
            Importar Veículos
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            Importe múltiplos veículos de uma vez usando um arquivo CSV
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileSpreadsheet size={24} />
            Passo 1: Baixar Template
          </h2>
          <p className="text-slate-600 mb-4">
            Baixe o template CSV, preencha com os dados dos veículos e salve o arquivo.
          </p>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="download-template"
          >
            <Download size={18} />
            Baixar Template CSV
          </Button>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="font-semibold mb-2">Campos do template:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li><strong>marca</strong> - Marca do veículo (ex: Toyota, Honda)</li>
              <li><strong>modelo</strong> - Modelo do veículo (ex: Corolla, Civic)</li>
              <li><strong>ano</strong> - Ano do veículo (ex: 2022)</li>
              <li><strong>km</strong> - Quilometragem (ex: 35000)</li>
              <li><strong>preco</strong> - Preço em reais (ex: 125000.00)</li>
              <li><strong>descricao</strong> - Descrição do veículo</li>
              <li><strong>status</strong> - available, reserved ou sold</li>
              <li><strong>destaque</strong> - true ou false</li>
              <li><strong>imagem1, imagem2, imagem3</strong> - URLs das imagens</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload size={24} />
            Passo 2: Selecionar Vendedor e Arquivo
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Vendedor Responsável</label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full md:w-64 p-3 border rounded-lg"
              data-testid="seller-select"
            >
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              data-testid="csv-input"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload size={48} className="text-slate-400 mb-4" />
              <p className="text-lg font-semibold text-slate-700">
                {file ? file.name : 'Clique para selecionar o arquivo CSV'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                ou arraste e solte aqui
              </p>
            </label>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              Passo 3: Conferir e Importar ({preview.length} veículos)
            </h2>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Marca/Modelo</th>
                    <th className="p-3 text-left">Ano</th>
                    <th className="p-3 text-left">KM</th>
                    <th className="p-3 text-left">Preço</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Imagens</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((car, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-semibold">{car.marca} {car.modelo}</td>
                      <td className="p-3">{car.ano}</td>
                      <td className="p-3">{car.km.toLocaleString('pt-BR')} km</td>
                      <td className="p-3">{formatPrice(car.preco)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          car.status === 'available' ? 'bg-green-100 text-green-800' :
                          car.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {car.status === 'available' ? 'Disponível' :
                           car.status === 'reserved' ? 'Reservado' : 'Vendido'}
                        </span>
                      </td>
                      <td className="p-3">{car.imagens.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              onClick={handleImport}
              disabled={importing || !selectedSeller}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-full font-bold flex items-center gap-2"
              data-testid="import-button"
            >
              {importing ? (
                <>Importando...</>
              ) : (
                <>
                  <Check size={20} />
                  Importar {preview.length} Veículos
                </>
              )}
            </Button>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resultado da Importação</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check size={24} />
                <span className="text-2xl font-bold">{results.success}</span>
                <span>importados com sucesso</span>
              </div>
              {results.errors.length > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <X size={24} />
                  <span className="text-2xl font-bold">{results.errors.length}</span>
                  <span>erros</span>
                </div>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Erros encontrados:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i}>
                      Linha {err.linha} ({err.veiculo}): {err.erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={() => navigate('/admin/cars')}
                className="btn-primary px-6 py-3 rounded-full font-bold"
              >
                Ver Veículos Cadastrados
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
