import { motion } from "framer-motion";
import { ClipboardCheck, Wrench, LineChart } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Analys & inventering",
    description:
      "Vi kartlägger fastighetens status, behov och prioriteringar för att skapa en tydlig plan.",
  },
  {
    icon: Wrench,
    title: "Utförande & rapportering",
    description:
      "Våra team genomför arbetet med tydliga avstämningar och löpande dokumentation.",
  },
  {
    icon: LineChart,
    title: "Uppföljning & optimering",
    description:
      "Vi följer upp resultat, föreslår förbättringar och säkerställer långsiktigt värde.",
  },
];

const areas = ["Malmö", "Lund", "Burlöv", "Vellinge", "Trelleborg", "Svedala"];

const Process = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
            Så arbetar vi
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            En trygg process från start till mål
          </h2>
          <p className="text-lg text-muted-foreground">
            Tydliga steg, transparent kommunikation och kontinuerlig förbättring – för en fastighet
            som alltid är i toppskick.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-secondary/60 border border-border/60 rounded-2xl px-8 py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Serviceområden</p>
            <h3 className="text-2xl font-serif font-semibold text-foreground">
              Lokalt närvarande i Malmöregionen
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {areas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 rounded-full bg-background text-sm text-foreground border border-border"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
