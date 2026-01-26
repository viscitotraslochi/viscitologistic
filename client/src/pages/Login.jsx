import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { 
    Container, Paper, TextField, Button, Typography, Box, Alert, 
    InputAdornment, IconButton 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Stato per visibilità password
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // 1. Esegui l'azione di successo (aggiorna lo stato)
            onLoginSuccess(response.data.user);
            navigate('/admin'); 

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(err.response.data.error);
            } else {
                setError("Errore di connessione al server");
            }
        }
    };

    // Funzione per alternare la visibilità
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
        }}>
            {/* Overlay Scuro/Blu */}
            <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(13, 71, 161, 0.85) 0%, rgba(25, 118, 210, 0.8) 100%)',
                zIndex: 1
            }} />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
                <Paper elevation={12} sx={{ 
                    p: { xs: 4, md: 5 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255, 255, 255, 0.95)' 
                }}>
                    <Box 
                        component="img"
                        src="/viscitologistic.png"
                        alt="Viscito Logistic"
                        sx={{ 
                            height: 60, 
                            mb: 2, 
                            objectFit: 'contain' 
                        }}
                    />

                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: '800', color: '#102a43' }}>
                        Area Riservata
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Accedi per gestire le richieste
                    </Typography>

                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Username / Email"
                            name="email"
                            autoComplete="username"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            // Qui cambia il tipo in base allo stato
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            // Aggiunta dell'icona Occhio
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowPassword}
                                      edge="end"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ 
                                py: 1.5, 
                                fontWeight: 'bold', 
                                fontSize: '1rem',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                textTransform: 'none'
                            }}
                        >
                            Accedi al Sistema
                        </Button>
                        
                        <Button 
                            fullWidth 
                            variant="text" 
                            size="small" 
                            onClick={() => navigate('/')}
                            sx={{ mt: 2, color: '#666' }}
                        >
                            Torna al sito
                        </Button>
                    </Box>
                </Paper>
                
                <Typography variant="caption" align="center" sx={{ display: 'block', mt: 3, color: 'rgba(255,255,255,0.7)' }}>
                    © 2026 Viscito Logistic Internal System
                </Typography>
            </Container>
        </Box>
    );
}

export default Login;