import { useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ImageUploader = ({ images, onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande. Máximo 5MB`);
          return null;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${API}/admin/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Se retornou URL do Imgur, usar diretamente
        // Se retornou URL local (/uploads/...), montar URL completa
        const imageUrl = response.data.url;
        if (imageUrl.startsWith('http')) {
          // URL completa (Imgur)
          return imageUrl;
        } else {
          // URL relativa (local)
          return `${BACKEND_URL}${imageUrl}`;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      if (validUrls.length > 0) {
        onImagesChange([...images, ...validUrls]);
        toast.success(`${validUrls.length} imagem(ns) adicionada(s) com sucesso!`);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      toast.error("Digite uma URL válida");
      return;
    }

    onImagesChange([...images, urlInput.trim()]);
    setUrlInput("");
    setShowUrlInput(false);
    toast.success("URL adicionada com sucesso!");
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-4 text-center transition-colors">
              <Upload className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="text-sm font-semibold text-slate-600">
                {uploading ? "Enviando..." : "Clique para fazer upload"}
              </p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG ou WEBP (máx. 5MB)</p>
            </div>
          </Label>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            data-testid="file-upload-input"
          />
        </div>

        <div className="flex-1">
          <Button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="w-full h-full border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-600"
            variant="outline"
            data-testid="add-url-button"
          >
            <LinkIcon className="mr-2" size={20} />
            Adicionar URL
          </Button>
        </div>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
            data-testid="url-input"
          />
          <Button onClick={handleAddUrl} data-testid="confirm-url-button">
            Adicionar
          </Button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group" data-testid={`image-preview-${idx}`}>
              <img
                src={img}
                alt={`Preview ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`remove-image-${idx}`}
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          Nenhuma imagem adicionada ainda
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
