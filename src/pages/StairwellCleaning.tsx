import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const StairwellCleaning = () => {
  useEffect(() => {
    const pageTitle = "Trapphusstädning för BRF | Lindes Fastighet";
    const pageDescription =
      "Trapphusstädning för bostadsrättsföreningar med tydlig leverans, personlig kontakt och fast pris. Kontakta oss för offert.";

    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute("content");
    const previousOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const previousOgDescription = document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content");

    document.title = pageTitle;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute("content", pageDescription);

    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (!ogTitleTag) {
      ogTitleTag = document.createElement("meta");
      ogTitleTag.setAttribute("property", "og:title");
      document.head.appendChild(ogTitleTag);
    }
    ogTitleTag.setAttribute("content", pageTitle);

    let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionTag) {
      ogDescriptionTag = document.createElement("meta");
      ogDescriptionTag.setAttribute("property", "og:description");
      document.head.appendChild(ogDescriptionTag);
    }
    ogDescriptionTag.setAttribute("content", pageDescription);

    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        descriptionTag?.setAttribute("content", previousDescription);
      }
      if (previousOgTitle) {
        ogTitleTag?.setAttribute("content", previousOgTitle);
      }
      if (previousOgDescription) {
        ogDescriptionTag?.setAttribute("content", previousOgDescription);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-20 lg:py-24 border-b border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
              Trapphusstädning för BRF – trygg, enkel och personlig
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vi hjälper BRF-styrelser med regelbunden trapphusstädning som håller hög och jämn nivå.
              Leveransen är tydlig från start och ni vet alltid vad som ingår.
              Ni får en personlig kontaktperson som följer upp och återkopplar snabbt.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Vad ingår</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Sopning och våttorkning av trappor och avsatser</li>
                <li>• Städning av entré och entrégolv</li>
                <li>• Torkning av trappräcken och ledstänger</li>
                <li>• Dammtorkning av fönsterbrädor och postboxar</li>
                <li>• Torkning av portar och dörrhandtag</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground italic">
                Fönsterputs ingår ej men kan erbjudas som tillägg enligt separat överenskommelse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Hur ofta?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Standardupplägg är städning 1 gång per vecka. Vi kan enkelt anpassa frekvensen utifrån
                fastighetens storlek, slitage och era önskemål.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Uppföljning & kvalitet</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ni har samma kontaktperson över tid, med regelbunden avstämning och snabb återkoppling
                vid frågor eller justeringar. Det ger en stabil leverans och trygghet i vardagen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Fast pris – inga överraskningar</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vi erbjuder fast månadspris med tydligt definierat innehåll. Pris lämnas efter en enkel
                genomgång av fastigheten så att ni får rätt nivå från början.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Så kommer vi igång</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
                <li>Kort genomgång av fastigheten och era behov.</li>
                <li>Ni får en tydlig offert med upplägg och fast pris.</li>
                <li>Vi sätter startdatum och börjar enligt överenskommen plan.</li>
              </ol>
            </section>

            <section className="pt-4">
              <Button size="lg" asChild>
                <a href="/#kontakt">Kontakta oss</a>
              </Button>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StairwellCleaning;
