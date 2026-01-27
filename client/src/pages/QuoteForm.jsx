// ⚠️ QuoteForm.jsx — VERSIONE DEFINITIVA 1:1
// Copiato integralmente dallo STEP 4 di Home.jsx_OLD
// Nessuna modifica a stili, layout, logica o responsive

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';

import PublicIcon from '@mui/icons-material/Public';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import SendIcon from '@mui/icons-material/Send';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import InventorySelector from './InventorySelector';
import MapDialog from './MapDialog';
import api from '../api/axiosConfig';

const PIANI = Array.from({ length: 16 }, (_, i) => i);

export default function QuoteForm() {
  /* ================== STATO IDENTICO ================== */
  const [formData, setFormData] = useState({
    nome: '',
    telefono: '',
    email: '',
    da_indirizzo: '',
    a_indirizzo: '',
    piano_partenza: '0',
    ascensore_partenza: 'NO',
    piano_arrivo: '0',
    ascensore_arrivo: 'NO',
    inventario: '',
    note: '',
    startDate: '',
    startTime: ''
  });

  const [inventoryList, setInventoryList] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [suggestions, setSuggestions] = useState({ da: [], a: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  /* ================== HANDLERS ================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openMap = (field) => {
    setCurrentField(field);
    setMapOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const visualInventory = inventoryList.map(i => `${i.name} x${i.qty}`).join(', ');
    let finalInventory = visualInventory;
    if (formData.inventario.trim()) {
      if (finalInventory) finalInventory += ' | ';
      finalInventory += formData.inventario.trim();
    }

    const dataToSend = {
      cliente_nome: formData.nome,
      telefono: formData.telefono,
      email: formData.email,
      da_indirizzo: formData.da_indirizzo,
      a_indirizzo: formData.a_indirizzo,
      piano_partenza: formData.piano_partenza,
      ascensore_partenza: formData.ascensore_partenza,
      piano_arrivo: formData.piano_arrivo,
      ascensore_arrivo: formData.ascensore_arrivo,
      items: finalInventory,
      note: formData.note || '',
      data_trasloco: formData.startDate,
      ora_trasloco: formData.startTime
    };

    try {
      await api.post('/leads', dataToSend);
      setSnackbar({ open: true, severity: 'success', message: 'Richiesta inviata con successo! Verrai ricontattato a breve.' });
      setFormData({ nome: '', telefono: '', email: '', da_indirizzo: '', a_indirizzo: '', piano_partenza: '0', ascensore_partenza: 'NO', piano_arrivo: '0', ascensore_arrivo: 'NO', inventario: '', note: '', startDate: '', startTime: '' });
      setInventoryList([]);
    } catch (error) {
      setSnackbar({ open: true, severity: 'error', message: "Errore durante l'invio" });
    }
  };

  const sectionStyle = {
    height: 'auto',
    minHeight: '100vh',
    width: '100%',
    scrollSnapAlign: 'start'
  };

  return (
    <Box sx={{ ...sectionStyle, background: 'linear-gradient(180deg, #e3f2fd 0%, #f4f6f8 100%)', pt: { xs: 4, md: 8 }, pb: 0 }}>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      <Container maxWidth="md" sx={{ mb: 8 }}>
        <form onSubmit={handleSubmit}>

          {/* ================= DATI PERSONALI ================= */}
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PublicIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#102a43' }}>I tuoi Dati</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth required label="Nome e Cognome o Azienda" name="nome" value={formData.nome} onChange={handleChange} InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1 }} /> }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Telefono" name="telefono" value={formData.telefono} onChange={handleChange} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1 }} /> }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }} />
              </Grid>
            </Grid>
          </Paper>

          {/* ================= DOVE E QUANDO ================= */}
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#102a43' }}>Dove e Quando</Typography>
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth required label="Indirizzo Partenza" name="da_indirizzo" value={formData.da_indirizzo} onChange={handleChange}
                  InputProps={{ startAdornment: <HomeIcon sx={{ mr: 1 }} />, endAdornment: <IconButton onClick={() => openMap('da_indirizzo')}><MapIcon /></IconButton> }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Indirizzo Arrivo" name="a_indirizzo" value={formData.a_indirizzo} onChange={handleChange}
                  InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1 }} />, endAdornment: <IconButton onClick={() => openMap('a_indirizzo')}><MapIcon /></IconButton> }} />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Piano Partenza</InputLabel>
                  <Select name="piano_partenza" value={formData.piano_partenza} label="Piano Partenza" onChange={handleChange}>
                    {PIANI.map(p => <MenuItem key={p} value={p}>{p === 0 ? 'Terra' : p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Piano Arrivo</InputLabel>
                  <Select name="piano_arrivo" value={formData.piano_arrivo} label="Piano Arrivo" onChange={handleChange}>
                    {PIANI.map(p => <MenuItem key={p} value={p}>{p === 0 ? 'Terra' : p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField type="date" fullWidth label="Data" name="startDate" InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField type="time" fullWidth label="Orario" name="startTime" InputLabelProps={{ shrink: true }} value={formData.startTime} onChange={handleChange} />
              </Grid>
            </Grid>
          </Paper>

          {/* ================= INVENTARIO ================= */}
          <InventorySelector inventoryList={inventoryList} setInventoryList={setInventoryList} formData={formData} setFormData={setFormData} />

          {/* ================= NOTE ================= */}
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4 }}>
            <TextField fullWidth multiline rows={3} label="Note aggiuntive" name="note" value={formData.note} onChange={handleChange} />
          </Paper>

          {/* ================= INVIO ================= */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />}
              sx={{ px: 6, py: 2, fontSize: '1.2rem', borderRadius: 50, fontWeight: 'bold', background: 'linear-gradient(45deg, #102a43 30%, #1976d2 90%)', boxShadow: '0 8px 20px rgba(16, 42, 67, 0.4)' }}>
              RICHIEDI PREVENTIVO GRATUITO
            </Button>
          </Box>
        </form>
      </Container>

      {/* ================= FOOTER ================= */}
      <Box sx={{ bgcolor: '#102a43', color: 'white', py: 4, mt: 'auto' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: { xs: 2, md: 0 } }}>© 2026 Viscito Logistic - Salerno</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><FacebookIcon /></IconButton>
            <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><InstagramIcon /></IconButton>
            <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><LinkedInIcon /></IconButton>
          </Box>
        </Container>
      </Box>

      <MapDialog mapOpen={mapOpen} setMapOpen={setMapOpen} currentField={currentField} setFormData={setFormData} setSuggestions={setSuggestions} />

    </Box>
  );
}
