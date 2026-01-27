import { Box } from '@mui/material';
import HomeHero from './HomeHero';
import ServicesSection from './ServicesSection';
import QuoteForm from './QuoteForm';

export default function Home() {
  const scrollToForm = () => {
    document
      .getElementById('quote-form')
      .scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: 4
        }
      }}
    >
      <HomeHero onScrollToForm={scrollToForm} />
      <ServicesSection />
      <Box id="quote-form">
        <QuoteForm />
      </Box>
    </Box>
  );
}
