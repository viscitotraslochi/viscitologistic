import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import HomeHero from './HomeHero';
import ServicesSection from './ServicesSection';
import QuoteForm from './QuoteForm';
import Footer from '../components/Footer'; // 👈 FOOTER

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // 👉 scroll automatico quando arrivi con /#preventivo
  useEffect(() => {
    if (location.hash === '#preventivo') {
      setTimeout(() => {
        const el = document.getElementById('preventivo');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [location.hash]);

  // 👉 usato dal bottone Hero
  const scrollToForm = () => {
    const el = document.getElementById('preventivo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Traslochi a Salerno e in tutta Italia | Viscito Traslochi e Logistica</title>
        <meta
          name="description"
          content="Viscito Traslochi e Logistica offre traslochi professionali a Salerno e in tutta Italia. Preventivo gratuito, smontaggio mobili e logistica."
        />
        <link rel="canonical" href="https://www.viscitotraslochi.com/" />
      </Helmet>

      <Box
		  sx={{
			minHeight: '100vh',
			scrollBehavior: 'smooth'
		  }}
		>
        {/* HERO */}
        <HomeHero scrollToForm={scrollToForm} />

        {/* SERVIZI */}
        <ServicesSection isMobile={isMobile} />

        {/* FORM PREVENTIVO (ancora SEO) */}
        <Box id="preventivo">
          <QuoteForm />
        </Box>

        {/* FOOTER SEO */}
        <Footer />
      </Box>
    </>
  );
}
