import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import HomeHero from './HomeHero';
const ServicesSection = lazy(() => import('./ServicesSection'));
const QuoteForm = lazy(() => import('./QuoteForm'));

import Footer from '../components/Footer'; // footer SEO (nascosto in Home via CSS)

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // ✅ Nasconde il footer SEO solo in Home (CSS: body.is-home .seo-footer { display:none })
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
        <meta
          name="description"
          content="Viscito Traslochi e Logistica offre traslochi professionali a Salerno e in tutta Italia. Preventivo gratuito, smontaggio mobili e logistica."
        />
        <link rel="canonical" href="https://www.viscitotraslochi.com/" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
        {/* HERO */}
        <HomeHero scrollToForm={scrollToForm} />

        {/* SERVIZI (lazy) */}
        <Suspense fallback={null}>
          <ServicesSection isMobile={isMobile} scrollToForm={scrollToForm} />
        </Suspense>

        {/* FORM PREVENTIVO (lazy) */}
        <Box id="preventivo">
          <Suspense fallback={null}>
            <QuoteForm />
          </Suspense>
        </Box>

        {/* FOOTER SEO (presente ma nascosto in Home via CSS) */}
        <Footer />
      </Box>
    </>
  );
}
