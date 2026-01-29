import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Button, Typography, Container, Box, AppBar, Toolbar, 
  Tooltip, IconButton, useMediaQuery, useTheme 
} from '@mui/material';

// ICONE
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import LockResetIcon from '@mui/icons-material/LockReset'; 

// PAGINE E COMPONENTI
import Home from './pages/Home';
import Login from './pages/Login';
import CalendarView from './components/CalendarView';
import LeadsView from './components/LeadsView';
import FleetView from './components/FleetView';
import ChangePasswordModal from './components/ChangePasswordModal'; 
import TraslochiSalerno from './pages/TraslochiSalerno';

// --- COMPONENTE ADMIN PANEL ---
function AdminPanel() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); 
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // <--- STATO MODALE

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Errore lettura utente", e);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  const getNavStyle = (viewName) => ({
    mx: 1,
    textTransform: 'none',
    fontWeight: currentView === viewName ? 'bold' : '500',
    color: currentView === viewName ? '#1976d2' : '#555',
    bgcolor: currentView === viewName ? '#e3f2fd' : 'transparent',
    borderRadius: 2,
    px: 2,
    '&:hover': { bgcolor: currentView === viewName ? '#e3f2fd' : '#f5f5f5' }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      
      {/* --- NAVBAR --- */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          
          {/* LOGO */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box 
              component="img"
              src="/viscitologistic.png"
              alt="Logo"
              sx={{ height: { xs: 35, md: 45 }, cursor: 'pointer', objectFit: 'contain' }}
              onClick={() => setCurrentView('calendar')}
            />
          </Box>

          {/* MENU DESKTOP */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Button startIcon={<CalendarMonthIcon />} onClick={() => setCurrentView('calendar')} sx={getNavStyle('calendar')}>
              Calendario
            </Button>
            <Button startIcon={<ListAltIcon />} onClick={() => setCurrentView('leads')} sx={getNavStyle('leads')}>
              Richieste Web
            </Button>
            <Button startIcon={<LocalShippingIcon />} onClick={() => setCurrentView('fleet')} sx={getNavStyle('fleet')}>
              Parco Mezzi
            </Button>
          </Box>

          {/* UTENTE E AZIONI */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: '#333', fontWeight: 'bold' }}>
                    {user.username || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', lineHeight: 1 }}>
                    Amministratore
                </Typography>
             </Box>
             
             {/* BOTTONE CAMBIO PASSWORD */}
             <Tooltip title="Cambia Password">
                <IconButton 
                    onClick={() => setIsPasswordModalOpen(true)} 
                    sx={{ color: '#1976d2', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}
                >
                    <LockResetIcon fontSize="small" />
                </IconButton>
             </Tooltip>

             {/* BOTTONE LOGOUT */}
             <Tooltip title="Esci">
                <IconButton onClick={handleLogout} sx={{ color: '#d32f2f', bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                    <LogoutIcon fontSize="small" />
                </IconButton>
             </Tooltip>
          </Box>
        </Toolbar>

        {/* MENU MOBILE */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1, bgcolor: 'white', borderTop: '1px solid #f0f0f0' }}>
             <IconButton onClick={() => setCurrentView('calendar')} sx={{ color: currentView === 'calendar' ? '#1976d2' : '#999' }}>
                <CalendarMonthIcon />
             </IconButton>
             <IconButton onClick={() => setCurrentView('leads')} sx={{ color: currentView === 'leads' ? '#1976d2' : '#999' }}>
                <ListAltIcon />
             </IconButton>
             <IconButton onClick={() => setCurrentView('fleet')} sx={{ color: currentView === 'fleet' ? '#1976d2' : '#999' }}>
                <LocalShippingIcon />
             </IconButton>
          </Box>
        )}
      </AppBar>

      {/* --- CONTENUTO --- */}
      <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, overflowY: 'auto' }}>
        <Container maxWidth="xl" disableGutters={isMobile}>
          {currentView === 'calendar' && <Box sx={{ animation: 'fadeIn 0.3s' }}><CalendarView /></Box>}
          {currentView === 'leads' && <Box sx={{ animation: 'fadeIn 0.3s' }}><LeadsView /></Box>}
          {currentView === 'fleet' && <Box sx={{ animation: 'fadeIn 0.3s' }}><FleetView /></Box>}
        </Container>
      </Box>

      {/* MODALE CAMBIO PASSWORD */}
      {user && (
         <ChangePasswordModal 
            open={isPasswordModalOpen} 
            onClose={() => setIsPasswordModalOpen(false)} 
            user={user}
         />
      )}

      {/* Stili CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
		<Route path="/traslochi-salerno" element={<TraslochiSalerno />} />
        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} /> 
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;