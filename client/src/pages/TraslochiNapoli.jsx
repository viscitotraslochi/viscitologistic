import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiNapoli() {
  return (
    <>
      <Helmet>
        <title>Traslochi a Napoli | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi a Napoli e provincia per abitazioni, uffici e aziende. Preventivi gratuiti, personale qualificato e servizio professionale."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Traslochi a Napoli professionali e sicuri</h1>

        <p>
          Viscito Traslochi e Logistica offre servizi di{" "}
          <strong>traslochi a Napoli e provincia</strong>, gestendo con
          professionalità ogni fase del trasloco, dalle abitazioni private agli
          uffici e alle aziende.
        </p>

        <p>
          Operiamo con mezzi attrezzati e personale esperto per garantire un
          trasloco rapido, organizzato e senza stress, anche in contesti urbani
          complessi come Napoli.
        </p>

        <h2>Servizi di trasloco a Napoli</h2>
        <ul>
          <li>Traslochi appartamenti e abitazioni</li>
          <li>Traslochi uffici e attività commerciali</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Imballaggio professionale</li>
          <li>Deposito e custodia mobili</li>
        </ul>

        <h2>Perché scegliere Viscito Traslochi a Napoli</h2>
        <ul>
          <li>Esperienza nel settore dei traslochi</li>
          <li>Personale qualificato e assicurato</li>
          <li>Preventivi chiari e personalizzati</li>
          <li>Rispetto dei tempi concordati</li>
        </ul>

        <h2>Zone servite a Napoli e provincia</h2>
        <p>
          Napoli città, Vomero, Fuorigrotta, Posillipo, Chiaia, Centro Storico e
          tutta la provincia di Napoli.
        </p>

        <h2>Richiedi un preventivo per il tuo trasloco a Napoli</h2>
        <p>
          Contattaci per un preventivo gratuito e senza impegno. Ti guideremo
          passo dopo passo nell’organizzazione del tuo trasloco.
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
