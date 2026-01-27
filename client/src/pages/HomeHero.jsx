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

  // --- STILE PER LO SCROLL SNAP (IDENTICO) ---
  const sectionStyle = {
    height: '100vh',
    width: '100%',
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <Box sx={{ ...sectionStyle }}>
      <AppBar position="absolute" elevation={1} sx={{ bgcolor: '#ffffff', top: 0 }}>
        <Toolbar sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
          {/* LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/viscitologistic.png"
              alt="Viscito Logistic"
              sx={{
                height: { xs: 35, md: 55 },
                maxWidth: { xs: '180px', md: '250px' },
                objectFit: 'contain',
                cursor: 'pointer'
              }}
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
              py: { xs: 0.5, sm: 1 },
              minWidth: 'fit-content'
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
          bgcolor: '#102a43',
          color: 'white',
          backgroundImage:
            'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          mt: '64px'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(13, 71, 161, 0.75) 100%)',
            zIndex: 1
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              typography: { xs: 'h3', md: 'h1' },
              mb: 2
            }}
          >
            Traslochi e Logistica <br />{' '}
            <Box component="span" sx={{ color: '#90caf9' }}>
              Senza Confini
            </Box>
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
            Affidati all'esperienza Viscito.
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

        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 2,
            animation: 'bounce 2s infinite'
          }}
        >
          <KeyboardArrowDownIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
        </Box>
      </Box>
    </Box>
  );
}
