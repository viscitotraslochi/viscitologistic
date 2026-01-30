import { Container, Box, Typography, Divider, Link as MuiLink } from "@mui/material";

import { Link } from "react-router-dom";

export default function Privacy() {
  const emailContatto = "info@viscitotraslochi.com"; // <-- cambia se diversa

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: 2,
            p: { xs: 3, md: 4 }
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: "#102a43" }}>
            Privacy & Cookie Policy
          </Typography>
          <Typography variant="body2" sx={{ color: "#627d98", mb: 3 }}>
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            1) Titolare del trattamento
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "#243b53" }}>
            Titolare del trattamento: <strong>Viscito Traslochi e Logistica</strong>.
            <br />
            Contatti:{" "}
            <MuiLink href={`mailto:${emailContatto}`} underline="hover">
              {emailContatto}
            </MuiLink>
            .
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            2) Dati trattati e finalità
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "#243b53" }}>
            Tramite questo sito possono essere trattati:
            <ul>
              <li>
                <strong>Dati di contatto</strong> (nome, telefono, email, indirizzi) inviati tramite form di richiesta
                preventivo o contatto, per rispondere alla richiesta e fornire il servizio.
              </li>
              <li>
                <strong>Dati tecnici</strong> (es. indirizzo IP, tipo dispositivo/browser, pagine visitate) per sicurezza,
                manutenzione e statistiche aggregate.
              </li>
            </ul>
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            3) Base giuridica
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#243b53" }}>
            Il trattamento avviene sulla base di:
            <ul>
              <li>
                <strong>Esecuzione di misure precontrattuali/contrattuali</strong> (rispondere alle richieste e gestire il
                servizio).
              </li>
              <li>
                <strong>Consenso</strong> per i cookie di analisi (Google Analytics) e, se attivati, strumenti di marketing.
              </li>
              <li>
                <strong>Legittimo interesse</strong> per sicurezza del sito e prevenzione abusi/frodi.
              </li>
            </ul>
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            4) Cookie e strumenti di tracciamento
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "#243b53" }}>
            Il sito utilizza:
            <ul>
              <li>
                <strong>Cookie tecnici</strong> necessari al funzionamento del sito.
              </li>
              <li>
                <strong>Cookie di analisi</strong> (Google Analytics 4){" "}
                <strong>solo previo consenso</strong>. Prima del consenso, il tracciamento è disabilitato tramite
                Google Consent Mode v2.
              </li>
            </ul>
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: "#243b53" }}>
            Puoi gestire o modificare la tua scelta in qualsiasi momento tramite il pulsante{" "}
            <strong>“🍪 Cookie”</strong> presente sul sito.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            5) Google Analytics (GA4)
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#243b53" }}>
            Google Analytics è un servizio fornito da Google Ireland Limited (per utenti SEE). I dati possono essere
            trasferiti e trattati secondo le condizioni di Google e le relative misure di conformità.
            <br />
            Maggiori informazioni:{" "}
            <MuiLink
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              underline="hover"
            >
              Privacy Policy Google
            </MuiLink>
            .
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            6) Conservazione dei dati
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#243b53" }}>
            I dati inviati tramite form vengono conservati per il tempo necessario a gestire la richiesta e gli eventuali
            obblighi di legge. I dati di analisi (GA4) seguono le impostazioni di conservazione del relativo account.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            7) Diritti dell’interessato
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#243b53" }}>
            Hai diritto di ottenere accesso ai dati, rettifica, cancellazione, limitazione, opposizione, portabilità, e di
            revocare il consenso in qualsiasi momento (senza pregiudicare la liceità del trattamento basata sul consenso
            prima della revoca). Per esercitare i diritti puoi scrivere a{" "}
            <MuiLink href={`mailto:${emailContatto}`} underline="hover">
              {emailContatto}
            </MuiLink>
            .
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ color: "#627d98" }}>
            Torna alla{" "}
            <MuiLink component={Link} to="/" underline="hover">
              Home
            </MuiLink>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
