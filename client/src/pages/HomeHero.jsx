import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

export default function HomeHero({ scrollToForm }) {
  const navigate = useNavigate();

  // scroll alla sezione servizi
  const scrollToServices = () => {
    const el = document.getElementById('servizi');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* APP BAR */}
      <AppBar position="absolute" elevation={1} sx={{ bgcolor: '#ffffff', top: 0 }}>
        <Toolbar
          sx={{
            py: 1,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          {/* LOGO */}
          <Box
			  component="img"
			  src="/viscitologistic-181x55.webp"
			  srcSet="/viscitologistic-181x55.webp 1x, /viscitologistic-362x110.webp 2x"
			  alt="Viscito Traslochi e Logistica"
			  width="181"
			  height="55"
			  decoding="async"
			  loading="eager"
			  fetchpriority="high"
			  style={{ cursor: 'pointer' }}
			  onClick={() => navigate('/')}
			/>
          </Box>

          {/* AREA RISERVATA */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.5, sm: 1 }
            }}
          >
            Area Riservata
          </Button>
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          mt: '64px'
        }}
      >
        {/* HERO IMAGE — LCP REALE */}
        <Box
          component="img"
          src="/HomeHero.webp"
          alt="Traslochi professionali a Salerno in tutta Italia"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0
          }}
        />

        {/* OVERLAY */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: {
              xs: 'linear-gradient(135deg, rgba(12,35,55,0.94) 0%, rgba(13,71,161,0.78) 100%)',
              md: 'linear-gradient(135deg, rgba(12,35,55,0.90) 0%, rgba(13,71,161,0.70) 100%)'
            },
            zIndex: 1
          }}
        />

        {/* CONTENUTO */}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              typography: { xs: 'h3', md: 'h1' },
              mb: 2
            }}
          >
            Traslochi professionali a Salerno <br />
            <span style={{ color: '#90caf9' }}>
              in tutta Italia
            </span>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.35rem' },
              fontWeight: 400
            }}
          >
            Soluzioni di trasporto nazionali, montaggio arredi e depositi.
            Affidati all&apos;esperienza Viscito.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            sx={{
              bgcolor: 'white',
              color: '#0d47a1',
              fontSize: '1.1rem',
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'translateY(-2px)'
              }
            }}
          >
            RICHIEDI PREVENTIVO
          </Button>
        </Container>

        {/* FRECCIA → SERVIZI */}
        <Box
          role="button"
          aria-label="Scorri ai servizi"
          tabIndex={0}
          onClick={scrollToServices}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') scrollToServices();
          }}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 2,
            animation: 'bounce 2s infinite',
            cursor: 'pointer',
            outline: 'none',
            '&:focus-visible': {
              outline: '3px solid rgba(144,202,249,0.9)',
              outlineOffset: 6,
              borderRadius: 8
            }
          }}
        >
          <KeyboardArrowDownIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
        </Box>
      </Box>
    </Box>
  );
}
