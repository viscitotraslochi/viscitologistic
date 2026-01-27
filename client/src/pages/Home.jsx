import { Box, useTheme, useMediaQuery } from '@mui/material';
import HomeHero from './HomeHero';
import ServicesSection from './ServicesSection';
import QuoteForm from './QuoteForm';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const scrollToForm = () => {
    const el = document.getElementById('quote-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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
      <HomeHero ScrollToForm={scrollToForm} />

      {/* SERVIZI */}
      <ServicesSection isMobile={isMobile} />

      {/* FORM */}
      <Box id="quote-form">
        <QuoteForm />
      </Box>
    </Box>
  );
}
