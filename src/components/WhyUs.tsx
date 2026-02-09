import { motion } from "framer-motion";
import { Heart, Leaf, Award, MessageCircle } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Personligt",
    description: "Hos oss får du alltid en dedikerad kontaktperson som känner din fastighet och dina behov. Vi tror på långsiktiga relationer byggda på förtroende.",
  },
  {
    icon: Leaf,
    title: "Hållbarhet",
    description: "Vi arbetar aktivt med miljövänliga metoder och material. Från energieffektivisering till gröna transportlösningar – hållbarhet genomsyrar allt vi gör.",
  },
  {
    icon: Award,
    title: "Kvalitet",
    description: "Vi nöjer oss aldrig med mindre än det bästa. Genom kontinuerlig utbildning och moderna metoder säkerställer vi högsta kvalitet i varje uppdrag.",
  },
  {
    icon: MessageCircle,
    title: "Kommunikation",
    description: "Transparent och tydlig kommunikation är grunden i vårt arbete. Du får regelbundna uppdateringar och har alltid full insyn i vårt arbete.",
  },
];

const WhyUs = () => {
  return (
    <section id="om-oss" className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
              Varför välja oss?
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
              Din partner för fastighetsservice i Malmö
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Med mångårig erfarenhet och genuint engagemang för varje fastighet vi tar hand om, 
              har Lindes Fastighetsservice byggt ett rykte som en pålitlig och professionell partner 
              för bostadsrättsföreningar, fastighetsägare och företag i Malmöregionen.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {[
                { number: "10+", label: "Års erfarenhet" },
                { number: "100%", label: "Engagemang" },
                { number: "24/7", label: "Jourtjänst" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-accent/50 border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
