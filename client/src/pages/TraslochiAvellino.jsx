import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiAvellino() {
  return (
    <>
      <Helmet>
        <title>Traslochi ad Avellino | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi ad Avellino e provincia per case, uffici e aziende. Imballaggio, smontaggio mobili, trasporto sicuro e preventivo gratuito."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Traslochi ad Avellino organizzati e senza stress</h1>

        <p>
          Se stai pianificando un <strong>trasloco ad Avellino</strong>, Viscito
          Traslochi e Logistica ti supporta con un servizio completo, pensato
          per privati e aziende. Gestiamo ogni fase con attenzione: sopralluogo,
          pianificazione, imballaggio e trasporto.
        </p>

        <p>
          Lavoriamo con personale esperto e mezzi attrezzati per rendere il
          trasloco rapido e sicuro, riducendo al minimo tempi di fermo e
          imprevisti.
        </p>

        <h2>Servizi di trasloco ad Avellino</h2>
        <ul>
          <li>Traslochi per appartamenti e abitazioni</li>
          <li>Traslochi uffici, negozi e studi professionali</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Imballaggio di oggetti fragili e arredi</li>
          <li>Deposito e custodia mobili (su richiesta)</li>
        </ul>

        <h2>Perché scegliere Viscito Traslochi</h2>
        <ul>
          <li>Organizzazione precisa e assistenza dedicata</li>
          <li>Preventivi chiari e personalizzati</li>
          <li>Personale qualificato e assicurato</li>
          <li>Trasporto sicuro con mezzi idonei</li>
        </ul>

        <h2>Zone servite ad Avellino e provincia</h2>
        <p>
          Avellino città e principali comuni della provincia. Effettuiamo anche
          traslochi regionali e nazionali con partenza o arrivo in provincia di
          Avellino.
        </p>

        <h2>Richiedi un preventivo per il tuo trasloco ad Avellino</h2>
        <p>
          Raccontaci cosa devi traslocare e in quali tempi: ti inviamo un
          preventivo gratuito e su misura, senza impegno.
        </p>

        <p>
          <Link to="/#preventivo" style={{ fontWeight: 700 }}>
            Vai al modulo preventivo
          </Link>
        </p>
      </main>
    </>
  );
}
