import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TraslochiSalerno() {
  return (
    <>
      <Helmet>
        <title>Traslochi a Salerno | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Traslochi a Salerno e provincia per abitazioni, uffici e aziende. Preventivi gratuiti, personale qualificato e servizio senza stress."
        />
      </Helmet>

      <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
        {/* H1 */}
        <h1>Traslochi a Salerno affidabili e senza stress</h1>

        {/* INTRO */}
        <p>
          Viscito Traslochi e Logistica è una ditta specializzata in{" "}
          <strong>traslochi a Salerno e provincia</strong>, attiva da anni nel
          settore dei traslochi civili, commerciali e aziendali. Operiamo con
          personale qualificato, mezzi attrezzati e un’organizzazione precisa,
          per garantire un servizio rapido, sicuro e senza imprevisti.
        </p>

        <p>
          Che si tratti di un piccolo appartamento, di un ufficio o di
          un’azienda, seguiamo ogni fase del trasloco con attenzione e
          professionalità, offrendo soluzioni su misura in base alle esigenze
          del cliente.
        </p>

        {/* SERVIZI */}
        <h2>Servizi di trasloco a Salerno e provincia</h2>
        <p>Offriamo un servizio completo di traslochi a Salerno, curato in ogni dettaglio:</p>

        <ul>
          <li>Traslochi per appartamenti e abitazioni private</li>
          <li>Traslochi per uffici, studi professionali e aziende</li>
          <li>Smontaggio e rimontaggio mobili</li>
          <li>Imballaggio professionale di mobili e oggetti fragili</li>
          <li>Trasporto con mezzi attrezzati</li>
          <li>Deposito e custodia mobili</li>
        </ul>

        <p>
          Ogni trasloco viene pianificato con precisione, riducendo tempi e costi
          e garantendo la massima sicurezza dei beni trasportati.
        </p>

        {/* PERCHÉ NOI */}
        <h2>Perché scegliere Viscito Traslochi a Salerno</h2>
        <ul>
          <li>Esperienza consolidata nel settore dei traslochi</li>
          <li>Personale qualificato e assicurato</li>
          <li>Mezzi moderni e attrezzature professionali</li>
          <li>Preventivi chiari e senza sorprese</li>
          <li>Assistenza completa prima, durante e dopo il trasloco</li>
        </ul>

        <p>
          Il nostro obiettivo è rendere il trasloco un’esperienza semplice,
          organizzata e senza stress.
        </p>

        {/* ZONE */}
        <h2>Zone servite a Salerno e dintorni</h2>
        <p>
          Operiamo su tutta Salerno città e provincia, inclusi:
        </p>

        <p>
          Salerno centro, Battipaglia, Pontecagnano Faiano, Cava de’ Tirreni e
          provincia di Salerno.
        </p>

        <p>
          Effettuiamo inoltre traslochi regionali e nazionali, collegando
          Salerno con il resto d’Italia.
        </p>

        {/* COME FUNZIONA */}
        <h2>Come funziona il nostro servizio di trasloco</h2>
        <ol>
          <li>Contatto e raccolta delle informazioni</li>
          <li>Sopralluogo gratuito (se necessario)</li>
          <li>Preventivo personalizzato</li>
          <li>Pianificazione del trasloco</li>
          <li>Esecuzione rapida e sicura</li>
        </ol>

        {/* CTA */}
        <h2>Richiedi un preventivo per il tuo trasloco a Salerno</h2>
        <p>
          Se stai cercando una <strong> ditta di traslochi a Salerno affidabile</strong>,
          contattaci oggi stesso. Offriamo preventivi gratuiti e personalizzati,
          senza impegno.
        </p>

        <p>
          Il nostro team è pronto ad aiutarti a organizzare il tuo trasloco in
          modo semplice, veloce e sicuro.
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
