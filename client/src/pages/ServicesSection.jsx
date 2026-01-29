import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandymanIcon from '@mui/icons-material/Handyman';
import PublicIcon from '@mui/icons-material/Public';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

export default function ServicesSection({ isMobile, scrollToForm }) {
  const services = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
      title: 'Traslochi Nazionali',
      text: 'Organizziamo traslochi da Salerno verso tutta Italia, gestendo ogni fase con precisione.'
    },
    {
      icon: <HandymanIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
      title: 'Montaggio Mobili',
      text: 'Smontaggio e rimontaggio professionale di arredi, cucine e mobili complessi.'
    },
    {
      icon: <PublicIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
      title: 'Logistica e Depositi',
      text: 'Servizi di groupage e depositi temporanei sicuri e videosorvegliati.'
    }
  ];

  return (
    <Box
      id="servizi"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        py: { xs: 6, md: 10 }
      }}
    >
      <Container maxWidth="lg">
        {/* TITOLO */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{ color: '#1976d2', fontWeight: 'bold', letterSpacing: 2 }}
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
          {services.map((srv, i) => (
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
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

        {/* CTA PREMIUM */}
        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              maxWidth: 720,
              justifyContent: 'center'
            }}
          >
            <Button
              variant="contained"
              size="large"
              component="a"
              href="tel:+393663370679"
              startIcon={<PhoneInTalkIcon />}
              sx={{
                flex: 1,
                borderRadius: 999,
                px: 3.5,
                py: 1.6,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(16,42,67,0.18)',
                '&:hover': {
                  boxShadow: '0 14px 30px rgba(16,42,67,0.22)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Chiama ora
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={scrollToForm}
              startIcon={<RequestQuoteIcon />}
              sx={{
                flex: 1,
                borderRadius: 999,
                px: 3.5,
                py: 1.6,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: 'white',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Preventivo gratuito
            </Button>
          </Box>

          {/* MICRO-COPY */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
              opacity: 0.85
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Risposta rapida
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>•</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Preventivo chiaro e senza sorprese
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>•</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Copertura Salerno, Campania e tutta Italia
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
