import { motion } from "framer-motion";
import { ShieldCheck, Clock, Leaf, HeartHandshake } from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Certifierade processer",
    description: "Trygg leverans med dokumentation, kvalitetssäkring och tydliga avtal.",
  },
  {
    icon: Clock,
    title: "Snabb responstid",
    description: "Jour och felavhjälpning med korta ledtider och tydliga SLA:er.",
  },
  {
    icon: Leaf,
    title: "Hållbar drift",
    description: "Smart energioptimering som minskar kostnader och klimatavtryck.",
  },
  {
    icon: HeartHandshake,
    title: "Långsiktiga relationer",
    description: "Personlig förvaltning med löpande uppföljning och rådgivning.",
  },
];

const Highlights = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
