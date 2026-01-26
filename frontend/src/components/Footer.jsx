import { useSettings } from "@/contexts/SettingsContext";
import { MapPin, Phone, Mail, Facebook, Instagram, Car } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-white py-16 px-6" data-testid="site-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_name} 
                  className="h-8 w-auto"
                />
              ) : (
                <Car size={32} />
              )}
              <span className="text-2xl font-black">{settings.site_name}</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Os melhores veículos selecionados para você. Encontre o carro ideal com segurança e comodidade.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-black mb-4">Contato</h3>
            <div className="space-y-3">
              {settings.address && (
                <div className="flex items-start gap-3 text-white/70" data-testid="footer-address">
                  <MapPin size={20} className="mt-1 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3 text-white/70" data-testid="footer-phone">
                  <Phone size={20} className="flex-shrink-0" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3 text-white/70" data-testid="footer-email">
                  <Mail size={20} className="flex-shrink-0" />
                  <span>{settings.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black mb-4">Links Rápidos</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-white/70 hover:text-white transition-colors" data-testid="footer-link-home">
                Início
              </Link>
              <Link to="/equipe" className="block text-white/70 hover:text-white transition-colors" data-testid="footer-link-team">
                Nossa Equipe
              </Link>
            </div>
            
            {/* Social Media */}
            {(settings.facebook_url || settings.instagram_url) && (
              <div className="mt-6">
                <h4 className="text-lg font-bold mb-3">Redes Sociais</h4>
                <div className="flex gap-4">
                  {settings.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                      data-testid="footer-facebook"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {settings.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                      data-testid="footer-instagram"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/60 text-sm" data-testid="footer-copyright">
            © {new Date().getFullYear()} {settings.site_name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
