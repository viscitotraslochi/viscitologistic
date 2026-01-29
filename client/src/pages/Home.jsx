import { Box, useTheme, useMediaQuery } from '@mui/material';
import HomeHero from './HomeHero';
import ServicesSection from './ServicesSection';
import QuoteForm from './QuoteForm';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const scrollToForm = () => {
    const el = document.getElementById('quote-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>Traslochi a Salerno e in tutta Italia | Viscito Logistic</title>
        <meta
          name="description"
          content="Viscito Logistic offre traslochi professionali a Salerno e in tutta Italia. Preventivo gratuito, montaggio mobili e logistica."
        />
        <link rel="canonical" href="https://www.viscitologistic.it/" />
      </Helmet>

      <Box
        sx={{
          height: '100vh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: 4
          }
        }}
      >
        {/* HERO */}
        <HomeHero scrollToForm={scrollToForm} />

        {/* SERVIZI */}
        <ServicesSection isMobile={isMobile} />

        {/* FORM */}
        <Box id="quote-form">
          <QuoteForm />
        </Box>
      </Box>
    </>
  );
}
