import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandymanIcon from '@mui/icons-material/Handyman';
import PublicIcon from '@mui/icons-material/Public';

const SERVICES = [
  {
    icon: <LocalShippingIcon color="primary" />,
    title: 'Traslochi Nazionali',
    text: 'Traslochi da e per tutta Italia con gestione permessi.'
  },
  {
    icon: <HandymanIcon color="primary" />,
    title: 'Montaggio Mobili',
    text: 'Smontaggio e rimontaggio professionale di arredi.'
  },
  {
    icon: <PublicIcon color="primary" />,
    title: 'Logistica e Depositi',
    text: 'Depositi sicuri e spedizioni in groupage.'
  }
];

export default function ServicesSection() {
  return (
	<Box
	  sx={{
		height: '100vh',
		scrollSnapAlign: 'start',
		display: 'flex',
		alignItems: 'center'
	  }}
	>
      <Container>
        <Typography variant="h3" textAlign="center" fontWeight={800} mb={6}>
          I Nostri Servizi
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {SERVICES.map((s, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                {s.icon}
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {s.title}
                  </Typography>
                  <Typography variant="body2">{s.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
