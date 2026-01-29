import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import HomeHero from './HomeHero';
import ServicesSection from './ServicesSection';
import QuoteForm from './QuoteForm';
import Footer from '../components/Footer'; // footer SEO "non a vista"

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // ✅ Nasconde il footer SEO solo in Home via CSS: body.is-home .seo-footer { display:none }
  useEffect(() => {
    document.body.classList.add('is-home');
    return () => document.body.classList.remove('is-home');
  }, []);

  // 👉 scroll automatico quando arrivi con /#preventivo
  useEffect(() => {
    if (location.hash === '#preventivo') {
      setTimeout(() => {
        const el = document.getElementById('preventivo');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [location.hash]);

  // 👉 usato dal bottone Hero + CTA servizi
  const scrollToForm = () => {
    const el = document.getElementById('preventivo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>Traslochi a Salerno e in tutta Italia | Viscito Traslochi e Logistica</title>

        {/* ❌ rimosso preload qui perché in HomeHero.jsx usiamo già <img fetchpriority="high"> */}

        <meta
          name="description"
          content="Viscito Traslochi e Logistica offre traslochi professionali a Salerno e in tutta Italia. Preventivo gratuito, smontaggio mobili e logistica."
        />
        <link rel="canonical" href="https://www.viscitotraslochi.com/" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
        {/* HERO */}
        <HomeHero scrollToForm={scrollToForm} />

        {/* SERVIZI */}
        <ServicesSection isMobile={isMobile} scrollToForm={scrollToForm} />

        {/* FORM PREVENTIVO */}
        <Box id="preventivo">
          <QuoteForm />
        </Box>

        {/* FOOTER SEO (presente ma nascosto in Home via CSS) */}
        <Footer />
      </Box>
    </>
  );
}
