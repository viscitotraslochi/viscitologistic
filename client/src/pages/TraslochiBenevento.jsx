import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiBenevento() {
  return (
    <>
      <Helmet>
        <title>Traslochi a Benevento | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi a Benevento e provincia con servizio completo: imballaggio, smontaggio mobili, trasporto sicuro e preventivi gratuiti."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Traslochi a Benevento rapidi, sicuri e professionali</h1>

        <p>
          Viscito Traslochi e Logistica è il tuo punto di riferimento per{" "}
          <strong>traslochi a Benevento</strong> e in provincia. Gestiamo
          traslochi per abitazioni, uffici e attività, con un servizio completo
          e organizzato.
        </p>

        <p>
          Dalla protezione degli arredi al trasporto con mezzi attrezzati, ogni
          fase viene svolta con cura per ridurre rischi e garantire tempi certi.
        </p>

        <h2>Servizi di trasloco a Benevento</h2>
        <ul>
          <li>Traslochi per privati e famiglie</li>
          <li>Traslochi per uffici e aziende</li>
          <li>Imballaggio e protezione professionale</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Deposito e custodia mobili (su richiesta)</li>
        </ul>

        <h2>Come lavoriamo</h2>
        <ol>
          <li>Raccolta informazioni e valutazione iniziale</li>
          <li>Sopralluogo (se necessario) e pianificazione</li>
          <li>Imballaggio e preparazione</li>
          <li>Trasporto e consegna</li>
          <li>Rimontaggio e sistemazione (se richiesto)</li>
        </ol>

        <h2>Zone servite a Benevento e provincia</h2>
        <p>
          Benevento città e principali aree della provincia. Disponibili anche
          traslochi regionali e nazionali con partenza o arrivo nel Sannio.
        </p>

        <h2>Richiedi un preventivo per il tuo trasloco a Benevento</h2>
        <p>
          Compila il modulo e ricevi un preventivo gratuito e personalizzato.
          Ti ricontattiamo rapidamente per organizzare al meglio il tuo trasloco.
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
