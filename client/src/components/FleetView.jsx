import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { 
  Box, Grid, Card, CardContent, Typography, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
  useTheme, useMediaQuery, AppBar, Toolbar, Slide
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BuildIcon from '@mui/icons-material/Build';

// Effetto transizione fluido per il Dialog mobile
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FleetView() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Stato del form
  const [formData, setFormData] = useState({
    targa: '', 
    modello: '', 
    scadenza_assicurazione: '', 
    scadenza_revisione: '', 
    km_attuali: '', 
    note: ''
  });

  // Hook per rilevare se siamo su mobile (schermo piccolo)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error("Errore fetch veicoli", err);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/vehicles', formData);
      setOpen(false);
      // Reset del form
      setFormData({ targa: '', modello: '', scadenza_assicurazione: '', scadenza_revisione: '', km_attuali: '', note: '' });
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Errore creazione veicolo. Controlla di aver inserito i dati corretti.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Sei sicuro di voler eliminare questo mezzo dalla flotta?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert("Errore cancellazione");
    }
  };

  // Calcola il colore in base alla scadenza
  const getStatusColor = (dateString) => {
    if (!dateString) return 'default';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Differenza in giorni

    if (diffDays < 0) return 'error';     // Scaduta (Rosso)
    if (diffDays < 30) return 'warning';  // Scade entro 30gg (Arancione)
    return 'success';                     // Ok (Verde)
  };

  return (
    <Box sx={{ pb: 8 }}> {/* Padding extra in basso per scroll comodo su mobile */}
      
      {/* HEADER DELLA PAGINA */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon color="primary" /> Parco Mezzi
        </Typography>
        <Button 
          variant="contained" 
          fullWidth={isMobile} 
          size="large"
          startIcon={<AddCircleIcon />} 
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Aggiungi Mezzo
        </Button>
      </Box>

      {/* GRIGLIA VEICOLI */}
      <Grid container spacing={2}>
        {vehicles.map((v) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v.id}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 3, 
              position: 'relative',
              overflow: 'visible' 
            }}>
              {/* Barra colorata laterale estetica */}
              <Box sx={{ 
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, 
                bgcolor: '#1976d2',
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12
              }} />

              <CardContent sx={{ pl: 3 }}>
                {/* Intestazione Card */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: 1 }}>
                      {v.targa.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {v.modello}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => handleDelete(v.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  
                  {/* Assicurazione */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUserIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold">Assic.</Typography>
                    </Box>
                    <Chip 
                      label={v.scadenza_assicurazione ? new Date(v.scadenza_assicurazione).toLocaleDateString() : 'MANCA'} 
                      color={getStatusColor(v.scadenza_assicurazione)} 
                      size="small" 
                      variant={getStatusColor(v.scadenza_assicurazione) === 'default' ? 'outlined' : 'filled'}
                      icon={getStatusColor(v.scadenza_assicurazione) === 'error' ? <EventBusyIcon /> : <CheckCircleIcon />}
                    />
                  </Box>

                  {/* Revisione */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold">Revis.</Typography>
                    </Box>
                    <Chip 
                      label={v.scadenza_revisione ? new Date(v.scadenza_revisione).toLocaleDateString() : 'MANCA'} 
                      color={getStatusColor(v.scadenza_revisione)} 
                      size="small" 
                      variant={getStatusColor(v.scadenza_revisione) === 'default' ? 'outlined' : 'filled'}
                    />
                  </Box>

                  {/* Km e Note */}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Km:</strong> {v.km_attuali ? Number(v.km_attuali).toLocaleString() : 0}
                  </Typography>

                  {v.note && (
                    <Typography variant="caption" sx={{ display: 'block', bgcolor: '#fffde7', p: 1, borderRadius: 1, fontStyle: 'italic', border: '1px dashed #ccc' }}>
                      {v.note}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DIALOG DI INSERIMENTO OTTIMIZZATO MOBILE */}
      <Dialog 
        fullScreen={isMobile} // SU MOBILE A TUTTO SCHERMO
        open={open} 
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
      >
        {/* Header Dialog Mobile */}
        {isMobile && (
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Nuovo Veicolo
              </Typography>
              <Button autoFocus color="inherit" onClick={handleCreate}>
                Salva
              </Button>
            </Toolbar>
          </AppBar>
        )}

        {/* Header Dialog Desktop */}
        {!isMobile && <DialogTitle>Aggiungi Veicolo</DialogTitle>}

        <DialogContent sx={{ pt: isMobile ? 3 : 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <TextField label="Targa" variant="outlined" fullWidth required
              value={formData.targa} onChange={(e) => setFormData({...formData, targa: e.target.value})} />
            
            <TextField label="Modello" variant="outlined" fullWidth required
              value={formData.modello} onChange={(e) => setFormData({...formData, modello: e.target.value})} />
            
            <TextField label="Km Attuali" type="number" variant="outlined" fullWidth 
              value={formData.km_attuali} onChange={(e) => setFormData({...formData, km_attuali: e.target.value})} />
            
            {/* DATE FIX: InputLabelProps={{ shrink: true }} impedisce sovrapposizioni */}
            <TextField 
              label="Scadenza Assicurazione" 
              type="date" 
              fullWidth 
              variant="outlined"
              value={formData.scadenza_assicurazione} 
              onChange={(e) => setFormData({...formData, scadenza_assicurazione: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField 
              label="Scadenza Revisione" 
              type="date" 
              fullWidth 
              variant="outlined"
              value={formData.scadenza_revisione} 
              onChange={(e) => setFormData({...formData, scadenza_revisione: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField label="Note / Manutenzione" multiline rows={3} variant="outlined" fullWidth 
              value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
          </Box>
        </DialogContent>

        {/* Footer Dialog Desktop */}
        {!isMobile && (
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annulla</Button>
            <Button onClick={handleCreate} variant="contained">Salva</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}

export default FleetView;