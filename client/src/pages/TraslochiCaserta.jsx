import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiCaserta() {
  return (
    <>
      <Helmet>
        <title>Traslochi a Caserta | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi a Caserta e provincia: case, uffici e attività commerciali. Smontaggio mobili, imballaggio e preventivi gratuiti."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1>Traslochi a Caserta per privati e aziende</h1>

        <p>
          Viscito Traslochi e Logistica realizza <strong>traslochi a Caserta</strong>{" "}
          con servizi affidabili e personalizzati. Pianifichiamo il lavoro in
          modo dettagliato per garantire un trasferimento ordinato, sicuro e
          puntuale.
        </p>

        <p>
          Che si tratti di un cambio casa o di un trasferimento aziendale,
          mettiamo a disposizione esperienza, attrezzature e mezzi idonei per
          trasportare arredi e materiali in totale sicurezza.
        </p>

        <h2>Servizi disponibili a Caserta</h2>
        <ul>
          <li>Traslochi residenziali (case e appartamenti)</li>
          <li>Traslochi uffici e aziende</li>
          <li>Imballaggio professionale e protezioni</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Deposito mobili e gestione logistica (su richiesta)</li>
        </ul>

        <h2>Vantaggi del nostro servizio</h2>
        <ul>
          <li>Assistenza completa dalla richiesta al completamento</li>
          <li>Preventivo trasparente e tempi concordati</li>
          <li>Soluzioni su misura per ogni budget</li>
          <li>Massima cura di arredi e oggetti fragili</li>
        </ul>

        <h2>Zone servite a Caserta e provincia</h2>
        <p>
          Caserta città e provincia, inclusi comuni limitrofi e aree servite su
          richiesta. Offriamo anche collegamenti regionali e nazionali.
        </p>

        <h2>Preventivo gratuito per traslochi a Caserta</h2>
        <p>
          Contattaci e descrivi le tue esigenze: ti proponiamo la soluzione più
          adatta e un preventivo gratuito, senza impegno.
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
