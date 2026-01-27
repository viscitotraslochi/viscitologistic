import { AppBar, Toolbar, Box, Button, Container, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

export default function HomeHero({ onScrollToForm }) {
  const navigate = useNavigate();

  return (
	<Box
	  sx={{
		height: '100vh',
		scrollSnapAlign: 'start',
		display: 'flex',
		alignItems: 'center'
	  }}
	>
      <AppBar position="absolute" elevation={1} sx={{ bgcolor: '#ffffff' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            component="img"
            src="/viscitologistic.png"
            alt="Viscito Logistic"
            sx={{ height: { xs: 35, md: 55 }, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
          <Button variant="contained" onClick={() => navigate('/login')}>
            Area Riservata
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(16,42,67,0.75)' }} />
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Traslochi e Logistica <br /> Senza Confini
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Trasporti, montaggi e depositi in tutta Italia
          </Typography>
          <Button variant="contained" size="large" onClick={onScrollToForm}>
            Richiedi Preventivo
          </Button>
        </Container>
        <KeyboardArrowDownIcon
          sx={{ position: 'absolute', bottom: 20, fontSize: 40, opacity: 0.8 }}
        />
      </Box>
    </Box>
  );
}
