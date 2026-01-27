// ⚠️ ServicesSection.jsx — VERSIONE DEFINITIVA 1:1 (100%)
// Estratto riga per riga da Home.jsx_OLD
// Nessuna modifica a stili, layout, responsive o logica

import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandymanIcon from '@mui/icons-material/Handyman';
import PublicIcon from '@mui/icons-material/Public';

export default function ServicesSection({ isMobile }) {
  // STILE IDENTICO AL FILE ORIGINALE
  const sectionStyle = {
    height: '100vh',
    width: '100%',
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fafafa'
  };

  return (
    <Box sx={sectionStyle}>
      <Container maxWidth="lg">
        {/* TITOLO */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              letterSpacing: 2
            }}
          >
            COSA FACCIAMO
          </Typography>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            sx={{ fontWeight: 800, color: '#1a202c' }}
          >
            I Nostri Servizi
          </Typography>
        </Box>

        {/* CARD SERVIZI */}
        <Grid container spacing={4} justifyContent="center">
          {[{
            icon: <LocalShippingIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
            title: 'Traslochi Nazionali',
            text: 'Organizziamo il tuo trasloco da Salerno verso tutta Italia. Gestiamo permessi ZTL.'
          }, {
            icon: <HandymanIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
            title: 'Montaggio Mobili',
            text: 'Personale qualificato per smontaggio e rimontaggio di cucine e arredi complessi.'
          }, {
            icon: <PublicIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
            title: 'Logistica e Depositi',
            text: 'Servizi di groupage per piccole spedizioni e depositi temporanei videosorvegliati.'
          }].map((srv, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  width: '100%',
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-8px)' }
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#e3f2fd',
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  {srv.icon}
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {srv.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {srv.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
