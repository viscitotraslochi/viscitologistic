import { Box, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 4,
        px: 2,
        bgcolor: "#f5f5f5",
        borderTop: "1px solid #e0e0e0"
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* TESTO AZIENDA */}
        <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
          <strong>Viscito Traslochi e Logistica</strong> – Servizi professionali
          di trasloco per privati e aziende in Campania e in tutta Italia.
        </Typography>

        {/* LINK SEO */}
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
          Traslochi per zona
        </Typography>

        <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.8 }}>
          <MuiLink component={Link} to="/traslochi-salerno">Traslochi a Salerno</MuiLink> ·{" "}
          <MuiLink component={Link} to="/traslochi-napoli">Traslochi a Napoli</MuiLink> ·{" "}
          <MuiLink component={Link} to="/traslochi-campania">Traslochi in Campania</MuiLink> ·{" "}
          <MuiLink component={Link} to="/traslochi-avellino">Traslochi ad Avellino</MuiLink> ·{" "}
          <MuiLink component={Link} to="/traslochi-caserta">Traslochi a Caserta</MuiLink> ·{" "}
          <MuiLink component={Link} to="/traslochi-benevento">Traslochi a Benevento</MuiLink>
        </Typography>

        {/* CREDITI */}
        <Typography variant="caption" sx={{ display: "block", mt: 3, color: "#888" }}>
          © {new Date().getFullYear()} Viscito Traslochi e Logistica
        </Typography>
      </Box>
    </Box>
  );
}
