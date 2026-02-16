import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground flex items-center justify-center">
                <span className="text-foreground font-serif text-xl font-bold">L</span>
              </div>
              <div>
                <span className="font-serif text-xl font-semibold">Lindes</span>
                <span className="block text-xs text-primary-foreground/70 -mt-1">Fastighetsservice</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-md leading-relaxed mb-6">
              Din pålitliga partner för fastighetsservice i Malmö. Vi erbjuder skräddarsydda lösningar 
              för bostadsrättsföreningar, fastighetsägare och företag.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Snabblänkar</h4>
            <nav className="space-y-3">
              {[
                { label: "Hem", href: "/" },
                { label: "Tjänster", href: "/#tjanster" },
                { label: "Trapphusstädning", href: "/trapphusstadning" },
                { label: "Om oss", href: "/#om-oss" },
                { label: "Kontakt", href: "/#kontakt" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Kontakt</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Malmö, Sverige</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>070-123 45 67</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@lindesfastighet.se</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {currentYear} Lindes Fastighetsservice. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <a href="#" className="hover:text-primary-foreground transition-colors">Integritetspolicy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Villkor</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
