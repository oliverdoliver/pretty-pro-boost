import { motion } from "framer-motion";
import { Building2, TreeDeciduous, Briefcase, Home, Wrench, Snowflake, Sun, ClipboardCheck } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Fastighetsservice",
    description: "Heltäckande service året runt med rondering, felavhjälpning, tekniskt underhåll och lokalvård.",
    features: ["Tekniskt underhåll", "Lokalvård", "Fastighetsjour 24/7"],
  },
  {
    icon: TreeDeciduous,
    title: "Skötsel av yttre miljö",
    description: "Välskött utemiljö som är attraktiv och säker. Gräsklippning, trädbeskärning och markvård.",
    features: ["Grönområden", "Rengöring hårda ytor", "Cykelrensning"],
  },
  {
    icon: Snowflake,
    title: "Vinterunderhåll",
    description: "Professionell snöröjning och halkbekämpning för säkra gångvägar och entréer.",
    features: ["Snöröjning", "Halkbekämpning", "Ishantering"],
  },
  {
    icon: Briefcase,
    title: "Projektledning",
    description: "Opartisk rådgivning och stöd för underhålls- och renoveringsprojekt med fokus på kvalitet.",
    features: ["Skadesamordning", "Energieffektivisering", "Dokumentation"],
  },
  {
    icon: Home,
    title: "Fastighetsförvaltning",
    description: "Komplett förvaltning för fastighetsägare, BRF:er och företag med underhållsplaner.",
    features: ["Ägarförvaltning", "BRF-förvaltning", "Fastighetsskötare"],
  },
  {
    icon: Sun,
    title: "Hållbarhetslösningar",
    description: "Framtidssäkra din fastighet med solceller, laddstationer och energieffektiva lösningar.",
    features: ["Solceller", "Laddstationer", "Energioptimering"],
  },
];

const Services = () => {
  return (
    <section id="tjanster" className="py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
            Våra Tjänster
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Skräddarsydda lösningar för din fastighet
          </h2>
          <p className="text-lg text-muted-foreground">
            Vi anpassar alltid våra lösningar enligt dina specifika önskemål och fastighetens unika behov.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <service.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground mb-5 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
