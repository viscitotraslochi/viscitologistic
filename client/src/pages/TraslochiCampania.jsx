import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiCampania() {
  return (
    <>
      <Helmet>
        <title>Traslochi in Campania | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi in Campania per privati e aziende. Operiamo a Salerno, Napoli e in tutta la regione con servizi completi e affidabili."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Traslochi in Campania per privati e aziende</h1>

        <p>
          Viscito Traslochi e Logistica opera in tutta la{" "}
          <strong>Campania</strong> offrendo servizi professionali di trasloco
          per abitazioni, uffici e aziende.
        </p>

        <p>
          Grazie a un’organizzazione efficiente e a personale qualificato,
          garantiamo traslochi rapidi e sicuri su tutto il territorio regionale.
        </p>

        <h2>I nostri servizi di trasloco in Campania</h2>
        <ul>
          <li>Traslochi civili e residenziali</li>
          <li>Traslochi uffici e aziende</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Deposito e custodia mobili</li>
          <li>Traslochi regionali e nazionali</li>
        </ul>

        <h2>Aree servite in Campania</h2>
        <p>
          Salerno, Napoli, Avellino, Benevento, Caserta e relative province.
        </p>

        <h2>Un unico referente per il tuo trasloco</h2>
        <p>
          Seguiamo ogni fase del trasloco con attenzione, dalla pianificazione
          iniziale alla consegna finale, offrendo un servizio affidabile e
          personalizzato.
        </p>

        <h2>Richiedi un preventivo gratuito</h2>
        <p>
          Contattaci oggi stesso per ricevere un preventivo personalizzato per
          il tuo trasloco in Campania.
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
