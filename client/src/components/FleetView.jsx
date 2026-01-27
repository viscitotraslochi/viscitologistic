import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { 
  Box, Grid, Card, CardContent, Typography, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
  useTheme, useMediaQuery, AppBar, Toolbar, Slide, MenuItem
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Valori predefiniti per reset
const initialFormState = {
  targa: '', modello: '', marca: '', anno: '', 
  alimentazione: '', telaio: '',
  scadenza_assicurazione: '', scadenza_revisione: '', 
  km_attuali: '', note: ''
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  const date = new Date(dateString);
  // Opzioni per forzare il formato a 2 cifre per giorno e mese
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

function FleetView() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creazione, id = modifica
  const [formData, setFormData] = useState(initialFormState);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) { console.error("Errore fetch veicoli", err); }
  };

  const handleOpenDialog = (vehicle = null) => {
	  if (vehicle) {
		setEditingId(vehicle.id);
		setFormData({
		  ...vehicle,
		  scadenza_assicurazione: vehicle.scadenza_assicurazione ? new Date(vehicle.scadenza_assicurazione).toISOString().split('T')[0] : '',
		  scadenza_revisione: vehicle.scadenza_revisione ? new Date(vehicle.scadenza_revisione).toISOString().split('T')[0] : '',
		});
	  } else {
		setEditingId(null);
		setFormData(initialFormState);
	  }
	  setOpen(true);
	};

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      setOpen(false);
      fetchVehicles();
    } catch (err) {
      alert("Errore durante il salvataggio.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Eliminare definitivamente questo mezzo?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) { alert("Errore cancellazione"); }
  };

  const getStatusColor = (dateString) => {
    if (!dateString) return 'default';
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'error';
    if (diffDays < 30) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon color="primary" /> Parco Mezzi ({vehicles.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddCircleIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nuovo Mezzo
        </Button>
      </Box>

      <Grid container spacing={2}>
        {vehicles.map((v) => (
          <Grid item xs={12} sm={6} md={4} key={v.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: 'primary.main' }} />
              <CardContent sx={{ pl: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="900">{v.targa.toUpperCase()}</Typography>
                    <Typography variant="body2" color="text.secondary">{v.marca} {v.modello} ({v.anno || 'N/D'})</Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(v)} color="primary" size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(v.id)} color="error" size="small"><DeleteIcon /></IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold">Assicurazione</Typography>
                    <Chip 
                      label={v.scadenza_assicurazione ? formatDate(v.scadenza_assicurazione) : 'MANCA'} 
					  color={getStatusColor(v.scadenza_assicurazione)} 
					  size="small" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold">Revisione</Typography>
                    <Chip 
                      label={v.scadenza_revisione ? formatDate(v.scadenza_revisione) : 'MANCA'} 
					  color={getStatusColor(v.scadenza_revisione)} 
					  size="small"
                    />
                  </Box>
                  <Typography variant="body2"><strong>KM:</strong> {Number(v.km_attuali).toLocaleString()}</Typography>
                  {v.alimentazione && <Typography variant="caption"><strong>Carburante:</strong> {v.alimentazione}</Typography>}
                  {v.note && (
                    <Typography variant="caption" sx={{ bgcolor: '#fffde7', p: 1, borderRadius: 1, border: '1px dashed #ccc' }}>
                      {v.note}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog fullScreen={isMobile} open={open} onClose={() => setOpen(false)} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative', display: isMobile ? 'block' : 'none' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)}><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">{editingId ? 'Modifica' : 'Nuovo'} Veicolo</Typography>
            <Button color="inherit" onClick={handleSubmit}>Salva</Button>
          </Toolbar>
        </AppBar>
        
        {!isMobile && <DialogTitle>{editingId ? 'Modifica Veicolo' : 'Aggiungi Veicolo'}</DialogTitle>}
        
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField label="Targa" fullWidth value={formData.targa} onChange={(e) => setFormData({...formData, targa: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField label="Marca" fullWidth value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField label="Modello" fullWidth value={formData.modello} onChange={(e) => setFormData({...formData, modello: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField label="Anno" type="number" fullWidth value={formData.anno} onChange={(e) => setFormData({...formData, anno: e.target.value})} /></Grid>
            <Grid item xs={6}>
              <TextField select label="Alimentazione" fullWidth value={formData.alimentazione} onChange={(e) => setFormData({...formData, alimentazione: e.target.value})}>
                {['Diesel', 'Benzina', 'Metano', 'GPL', 'Elettrico'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField label="N° Telaio" fullWidth value={formData.telaio} onChange={(e) => setFormData({...formData, telaio: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField label="Km Attuali" type="number" fullWidth value={formData.km_attuali} onChange={(e) => setFormData({...formData, km_attuali: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField label="Scad. Assicurazione" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.scadenza_assicurazione} onChange={(e) => setFormData({...formData, scadenza_assicurazione: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField label="Scad. Revisione" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.scadenza_revisione} onChange={(e) => setFormData({...formData, scadenza_revisione: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField label="Note" multiline rows={3} fullWidth value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>

        {!isMobile && (
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annulla</Button>
            <Button onClick={handleSubmit} variant="contained">Salva Modifiche</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}

export default FleetView;