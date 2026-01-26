import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminSettings() {
  const navigate = useNavigate();
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_name: "",
    logo_url: "",
    primary_color: "#DC2626",
    address: "",
    phone: "",
    email: "",
    facebook_url: "",
    instagram_url: "",
    store_whatsapp: "",
    imgur_client_id: "",
    whatsapp_message: "",
    contact_title: "",
    contact_description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setFormData({
        site_name: response.data.site_name,
        logo_url: response.data.logo_url || "",
        primary_color: response.data.primary_color,
        address: response.data.address || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        facebook_url: response.data.facebook_url || "",
        instagram_url: response.data.instagram_url || "",
        store_whatsapp: response.data.store_whatsapp || "",
        imgur_client_id: response.data.imgur_client_id || "",
        whatsapp_message: response.data.whatsapp_message || "Olá! Gostaria de obter mais informações sobre o {brand} {model} de {year}. Está disponível para visita?",
        contact_title: response.data.contact_title || "Entre em Contato",
        contact_description: response.data.contact_description || "Fale com nossa equipe de vendas pelo WhatsApp e agende uma visita!",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(`${API}/admin/settings`, formData);
      console.log('Settings saved:', response.data);
      refreshSettings();
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Erro ao salvar configurações: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="text-center py-20" data-testid="loading-state">
            <p className="text-slate-600 text-lg">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2" data-testid="settings-title">
            Configurações do Site
          </h1>
          <p className="text-slate-600" data-testid="settings-subtitle">
            Personalize o nome, logo e cores do seu site
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="settings-form">
            <div>
              <Label htmlFor="site_name" className="text-lg font-bold mb-2 block">
                Nome do Site
              </Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                placeholder="Ex: AutoLeilão"
                className="h-12 text-lg"
                required
                data-testid="site-name-input"
              />
              <p className="text-sm text-slate-500 mt-2">
                Este nome aparecerá na navbar e em outras partes do site
              </p>
            </div>

            <div>
              <Label htmlFor="logo_url" className="text-lg font-bold mb-2 block">
                URL da Logo
              </Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
                className="h-12"
                data-testid="logo-url-input"
              />
              <p className="text-sm text-slate-500 mt-2">
                Deixe em branco para usar o ícone padrão. Recomendado: imagem quadrada, fundo transparente
              </p>
              {formData.logo_url && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Preview:</p>
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 w-auto rounded shadow"
                    data-testid="logo-preview"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="primary_color" className="text-lg font-bold mb-2 block">
                Cor Primária
              </Label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-16 w-24 rounded cursor-pointer border-2 border-slate-300"
                  data-testid="primary-color-input"
                />
                <div>
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#DC2626"
                    className="h-12 w-32"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    data-testid="primary-color-text-input"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Esta cor será usada em botões, links e destaques do site
              </p>
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: formData.primary_color }}>
                <p className="text-white font-bold">Exemplo de cor primária</p>
              </div>
            </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Informações de Contato</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="address" className="text-lg font-bold mb-2 block">
                  Endereço Físico
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                  className="h-12"
                  data-testid="address-input"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Endereço que aparecerá no rodapé do site
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-lg font-bold mb-2 block">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 1234-5678"
                    className="h-12"
                    data-testid="phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-lg font-bold mb-2 block">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@exemplo.com"
                    className="h-12"
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Redes Sociais</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="facebook_url" className="font-bold mb-2 block">
                      Facebook
                    </Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/suapagina"
                      className="h-12"
                      data-testid="facebook-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram_url" className="font-bold mb-2 block">
                      Instagram
                    </Label>
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/seuperfil"
                      className="h-12"
                      data-testid="instagram-input"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Mensagem WhatsApp</h3>
                
                <div className="mb-6">
                  <Label htmlFor="store_whatsapp" className="font-bold mb-2 block">
                    WhatsApp da Loja
                  </Label>
                  <Input
                    id="store_whatsapp"
                    value={formData.store_whatsapp}
                    onChange={(e) => setFormData({ ...formData, store_whatsapp: e.target.value })}
                    placeholder="5511999999999"
                    className="h-12"
                    data-testid="store-whatsapp-input"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Número com código do país e DDD (sem espaços ou caracteres especiais). Ex: 5511999999999
                  </p>
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-900">
                      ⚠️ <strong>Importante:</strong> Este é o número que receberá todas as mensagens dos clientes interessados nos veículos.
                    </p>
                  </div>
                </div>

                <div className="mb-6 border-t pt-6">
                  <Label htmlFor="imgur_client_id" className="font-bold mb-2 block">
                    Imgur Client ID (Upload de Imagens)
                  </Label>
                  <Input
                    id="imgur_client_id"
                    value={formData.imgur_client_id}
                    onChange={(e) => setFormData({ ...formData, imgur_client_id: e.target.value })}
                    placeholder="abc123xyz456"
                    className="h-12"
                    data-testid="imgur-client-id-input"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Para fazer upload direto para Imgur. Obtenha gratuitamente em: <a href="https://api.imgur.com/oauth2/addclient" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">api.imgur.com</a>
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 mb-2">
                      💡 <strong>Benefícios do Imgur:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                      <li>Imagens hosped adas externamente (sem problemas de servidor)</li>
                      <li>URLs públicas que funcionam perfeitamente</li>
                      <li>Grátis para uso pessoal/comercial</li>
                      <li>Upload automático ao adicionar veículos</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="contact_title" className="font-bold mb-2 block">
                      Título da Seção de Contato
                    </Label>
                    <Input
                      id="contact_title"
                      value={formData.contact_title}
                      onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                      placeholder="Entre em Contato"
                      className="h-12"
                      data-testid="contact-title-input"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Título que aparece na caixa de contato da página de detalhes
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contact_description" className="font-bold mb-2 block">
                      Descrição do Contato
                    </Label>
                    <Textarea
                      id="contact_description"
                      value={formData.contact_description}
                      onChange={(e) => setFormData({ ...formData, contact_description: e.target.value })}
                      placeholder="Fale com nossa equipe de vendas pelo WhatsApp e agende uma visita!"
                      rows={2}
                      className="resize-none"
                      data-testid="contact-description-input"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Texto explicativo que aparece abaixo do título
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="whatsapp_message" className="font-bold mb-2 block">
                    Mensagem de Contato
                  </Label>
                  <Textarea
                    id="whatsapp_message"
                    value={formData.whatsapp_message}
                    onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
                    placeholder="Olá! Gostaria de obter mais informações sobre o {brand} {model} de {year}. Está disponível para visita?"
                    rows={4}
                    className="resize-none"
                    data-testid="whatsapp-message-input"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Use as variáveis: <code className="bg-slate-100 px-2 py-1 rounded">{"{brand}"}</code>,{" "}
                    <code className="bg-slate-100 px-2 py-1 rounded">{"{model}"}</code>,{" "}
                    <code className="bg-slate-100 px-2 py-1 rounded">{"{year}"}</code> para personalizar a mensagem
                  </p>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900 font-semibold mb-2">📱 Exemplo:</p>
                    <p className="text-sm text-green-800">
                      {formData.whatsapp_message
                        .replace("{brand}", "Porsche")
                        .replace("{model}", "911 Carrera")
                        .replace("{year}", "2022")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-8 py-6 text-lg rounded-full font-bold flex items-center gap-2"
                  data-testid="save-contact-button"
                >
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar Informações'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">💡 Dica</h3>
            <p className="text-blue-800 text-sm">
              Após salvar as configurações, recarregue a página para ver as mudanças aplicadas em todo o site!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
