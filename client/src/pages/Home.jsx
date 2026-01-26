import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. LIBRERIE ESTERNE (MUI & LEAFLET) ---
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, Card, CardContent, 
  TextField, Paper, Snackbar, Alert, Checkbox, FormControlLabel, Select, MenuItem,
  IconButton, Chip, useTheme, useMediaQuery, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogContent, DialogTitle, Autocomplete, Divider, FormControl, InputLabel
} from '@mui/material';

import Grid from '@mui/material/Grid';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- 2. ICONE MUI (Tutte quelle necessarie) ---
import SendIcon from '@mui/icons-material/Send';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandymanIcon from '@mui/icons-material/Handyman';
import PublicIcon from '@mui/icons-material/Public';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

// --- 3. IMPORT INTERNI ---
import api from '../api/axiosConfig';

// --- 4. FIX ICONE LEAFLET (Evita marker invisibili) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Lista oggetti standard

const QUICK_ITEMS = [
    "Scatole P", "Scatole M", "Scatole G", "Baule",
    "Divano 2p", "Divano 3p", "Poltrona", 
    "Letto Sing.", "Letto Matr.", "Materasso",
    "Armadio 2a", "Armadio 6a", "Comò", "Comodino",
    "Tavolo", "Sedie", "Scrivania", "Libreria",
    "Lavatrice", "Frigo", "TV", "Specchio"
];

const PIANI = Array.from({ length: 16 }, (_, i) => i); // [0, 1, ... 15]
const ASCENSORE_OPTS = ["SI", "NO"];


function Home() {
	const [suggestions, setSuggestions] = useState({ da: [], a: [] });
	const [loading, setLoading] = useState(false);

	const fetchSuggestions = async (query, field) => {
		if (query.length < 3) {
		  setSuggestions(prev => ({ ...prev, [field === 'da_indirizzo' ? 'da' : 'a']: [] }));
		  return;
		}
		try {
		  // Usiamo ArcGIS World Geocoding Service (molto preciso e senza blocchi CORS)
		  const response = await fetch(
			`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(query)}&maxLocations=5`
		  );
		  const data = await response.json();
		  // ArcGIS restituisce i risultati dentro "candidates"
		  setSuggestions(prev => ({ ...prev, [field === 'da_indirizzo' ? 'da' : 'a']: data.candidates || [] }));
		} catch (error) {
		  console.error("Errore autocompletamento:", error);
		}
	  };
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


	// 1. Aggiorna lo stato iniziale
	const [formData, setFormData] = useState({
		nome: '',
		telefono: '',
		email: '',
		da_indirizzo: '',
		a_indirizzo: '',
		note: '',
		items: [],
		inventario: '',
		// NUOVI CAMPI
		piano_partenza: '0',
		ascensore_partenza: 'NO',
		piano_arrivo: '0',
		ascensore_arrivo: 'NO'
	});
  
  
  
  // --- NUOVA LOGICA INVENTARIO ---
    const [inventoryList, setInventoryList] = useState([]);

    // 1. Funzione per aggiungere
    const handleAddItem = (itemName) => {
        setInventoryList(prev => {
            const existing = prev.find(i => i.name === itemName);
            if (existing) {
                return prev.map(i => i.name === itemName ? { ...i, qty: i.qty + 1 } : i);
            } else {
                return [...prev, { name: itemName, qty: 1 }];
            }
        });
    };

    // 2. Funzione per rimuovere
    const handleRemoveItem = (itemName) => {
        setInventoryList(prev => {
            const existing = prev.find(i => i.name === itemName);
            if (existing?.qty > 1) {
                return prev.map(i => i.name === itemName ? { ...i, qty: i.qty - 1 } : i);
            } else {
                return prev.filter(i => i.name !== itemName);
            }
        });
    };

    // 3. EFFETTO DI SINCRONIZZAZIONE (QUESTO È QUELLO CHE MANCAVA)
    // Ogni volta che inventoryList cambia, aggiorna formData.inventario
    useEffect(() => {
        if (inventoryList.length > 0) {
            // Trasforma la lista in testo (es: "Divano x1, Scatole x5")
            const textString = inventoryList
                .map(item => `${item.name} x${item.qty}`)
                .join(', ');
            
            setFormData(prev => ({ ...prev, inventario: textString }));
        }
    }, [inventoryList]);
    // --- FINE LOGICA INVENTARIO ---


    // Sincronizza i bottoni col campo di testo
    useEffect(() => {
        const textString = inventoryList
            .map(item => `${item.name} x${item.qty}`)
            .join(', ');
        // Mantiene eventuali note manuali se la lista è vuota, altrimenti sovrascrive
        if (inventoryList.length > 0) {
             setFormData(prev => ({ ...prev, inventario: textString }));
        }
    }, [inventoryList]);
    // -------------------------------
  
  const [quantities, setQuantities] = useState(
    QUICK_ITEMS.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})
  );
  const [isOtherChecked, setIsOtherChecked] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customItems, setCustomItems] = useState([]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- HANDLERS ---
  const handleChange = (e) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (item) => {
    setQuantities(prev => ({
      ...prev,
      [item]: prev[item] > 0 ? 0 : 1 
    }));
  };

  const handleQuantityChange = (item, value) => {
    setQuantities(prev => ({ ...prev, [item]: value }));
  };

  const handleAddCustomItem = () => {
    if (customInput.trim()) {
      setCustomItems([...customItems, customInput.trim()]);
      setCustomInput('');
    }
  };

  const handleDeleteCustomItem = (itemToDelete) => {
    setCustomItems(customItems.filter(item => item !== itemToDelete));
  };

	// --- STATO PER LA MAPPA ---
    const [mapOpen, setMapOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null); // 'da_indirizzo' o 'a_indirizzo'

    function LocationMarker() {
		useMapEvents({
			click: async (e) => {
				const { lat, lng } = e.latlng;
				try {
					// ArcGIS richiede longitudine,latitudine
					const response = await fetch(
						`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`
					);
					const data = await response.json();
					
					// L'indirizzo completo si trova in data.address.Match_addr
					const address = data.address?.Match_addr || "Indirizzo non trovato";

					if (currentField) {
						setFormData(prev => ({ ...prev, [currentField]: address }));
						setMapOpen(false);
						setSuggestions({ da: [], a: [] }); // Pulisce i suggerimenti
					}
				} catch (error) {
					console.error("Errore mappa:", error);
				}
			},
		});
		return null;
	  }

    const openMap = (field) => {
        setCurrentField(field);
        setMapOpen(true);
    };

	const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Prepara la lista visuale (Icone selezionate)
    let visualListString = '';
    if (Array.isArray(formData.items) && formData.items.length > 0) {
        visualListString = formData.items
            .map(item => `${item.name} x${item.qty}`)
            .join(', ');
    }

    // 2. UNIONE INVENTARIO: Mettiamo insieme la lista visuale E il testo scritto nel campo "Inventario"
    // Questo andrà nella colonna 'items' del database
    let finalInventory = visualListString;
    if (formData.inventario) {
        if (finalInventory) finalInventory += " | "; // Separatore se c'è già roba
        finalInventory += `Extra: ${formData.inventario}`;
    }

    // 3. NOTE PULITE: Qui ci va SOLO il messaggio del cliente
    // Questo andrà nella colonna 'note' del database
    const finalNotes = formData.note || ''; 

    // 4. Oggetto dati SEPARATO
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
        
        // --- QUI AVVIENE LA MAGIA ---
        items: finalInventory, // Va nella colonna 'items'
        note: finalNotes,      // Va nella colonna 'note'
        // ----------------------------

        data_trasloco: formData.startDate,
        ora_trasloco: formData.startTime
    };

    try {
        // Invio al server
        await api.post('/leads', dataToSend);
        
        setSnackbar({ 
            open: true, 
            severity: 'success', 
            message: 'Richiesta inviata con successo!' 
        });

        // Reset Form
        setFormData({
            nome: '', telefono: '', email: '',
            da_indirizzo: '', a_indirizzo: '',
            piano_partenza: 0, ascensore_partenza: 'NO',
            piano_arrivo: 0, ascensore_arrivo: 'NO',
            startDate: '', startTime: '', 
            items: [], inventario: '', note: '' 
        });
        
        // Se usi setInventoryList per pulire le icone visive
        if (typeof setInventoryList === 'function') setInventoryList([]); 

        setTimeout(() => navigate('/thank-you'), 1500);

    } catch (error) {
        console.error("Errore invio:", error);
        setSnackbar({ 
            open: true, 
            severity: 'error', 
            message: "Errore: " + (error.response?.data?.error || "Impossibile inviare")
        });
    }
};

  const scrollToForm = () => {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  // --- STILE PER LO SCROLL SNAP ---
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
    <Box sx={{ 
        height: '100vh', 
        overflowY: 'scroll', 
        scrollSnapType: 'y mandatory', 
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
    }}>

      <Snackbar 
        open={snackbar.open} autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      {/* ================= STEP 1: HERO ================= */}
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
					height: { xs: 35, md: 55 }, // Leggermente più piccolo su mobile per far spazio
					maxWidth: { xs: '180px', md: '250px' }, 
					objectFit: 'contain', 
					cursor: 'pointer' 
				  }}
				  onClick={() => navigate('/')} 
				/>
			  </Box>

			  {/* PULSANTE AREA RISERVATA - Ora sempre visibile */}
			  <Button 
				variant="contained" // Cambiato in contained per risaltare di più su mobile
				color="primary" 
				onClick={() => navigate('/login')} 
				sx={{ 
				  textTransform: 'none', 
				  fontWeight: 600, 
				  borderRadius: 2,
				  // Adattamento dimensioni per mobile
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

		  <Box sx={{ 
			  flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
			  bgcolor: '#102a43', color: 'white',
			  backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80")',
			  backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', mt: '64px'
		  }}>
			  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(13, 71, 161, 0.75) 100%)', zIndex: 1 }} />
			  <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
				  <Typography component="h1" sx={{ fontWeight: 800, typography: { xs: 'h3', md: 'h1' }, mb: 2 }}>
					  Traslochi e Logistica <br/> <Box component="span" sx={{ color: '#90caf9' }}>Senza Confini</Box>
				  </Typography>
				  <Typography variant="h5" sx={{ mb: 5, opacity: 0.9, fontSize: { xs: '1.1rem', md: '1.35rem' }, fontWeight: 400 }}>
					  Soluzioni di trasporto nazionali, montaggio arredi e depositi. Affidati all'esperienza Viscito.
				  </Typography>
				  <Button variant="contained" size="large" onClick={scrollToForm}
					  sx={{ bgcolor: 'white', color: '#0d47a1', fontSize: '1.1rem', px: 5, py: 1.5, fontWeight: 'bold', borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' } }}>
					  RICHIEDI PREVENTIVO
				  </Button>
			  </Container>
			  <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2, animation: 'bounce 2s infinite' }}>
				  <KeyboardArrowDownIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
			  </Box>
		  </Box>
		</Box>

      {/* ================= STEP 2: SERVIZI ================= */}
      <Box sx={{ ...sectionStyle, bgcolor: '#fafafa', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
                <Typography variant="overline" sx={{ color: '#1976d2', fontWeight: 'bold', letterSpacing: 2 }}>COSA FACCIAMO</Typography>
                <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 800, color: '#1a202c' }}>I Nostri Servizi</Typography>
            </Box>
            
            {/* GRID V6 FIX: Usiamo 'container' e 'size' */}
            <Grid container spacing={4} justifyContent="center">
                {[
                  { icon: <LocalShippingIcon sx={{ fontSize: 30, color: '#1565c0' }} />, title: "Traslochi Nazionali", text: "Organizziamo il tuo trasloco da Salerno verso tutta Italia. Gestiamo permessi ZTL." },
                  { icon: <HandymanIcon sx={{ fontSize: 30, color: '#1565c0' }} />, title: "Montaggio Mobili", text: "Personale qualificato per smontaggio e rimontaggio di cucine e arredi complessi." },
                  { icon: <PublicIcon sx={{ fontSize: 30, color: '#1565c0' }} />, title: "Logistica e Depositi", text: "Servizi di groupage per piccole spedizioni e depositi temporanei videosorvegliati." }
                ].map((srv, i) => (
                  <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }} key={i}>
                      <Card sx={{ width: '100%', p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                          <Box sx={{ bgcolor: '#e3f2fd', width: 60, height: 60, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>{srv.icon}</Box>
                          <CardContent sx={{ p: 0 }}>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>{srv.title}</Typography>
                              <Typography variant="body2" color="text.secondary">{srv.text}</Typography>
                          </CardContent>
                      </Card>
                  </Grid>
                ))}
            </Grid>
        </Container>
      </Box>

      {/* ================= STEP 3: PRONTO A PARTIRE ================= */}
      <Box sx={{ ...sectionStyle, bgcolor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={1}>PERCHÉ SCEGLIERE NOI</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#102a43', mb: 3, mt: 1 }}>
                Pronto a partire? <br/>
                <span style={{ color: '#1976d2' }}>Noi siamo pronti.</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
                Affidarsi a Viscito Logistic significa scegliere sicurezza, velocità e zero stress. 
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                {[
                    "Preventivo Gratuito in 24 ore",
                    "Sopralluogo tecnico senza impegno",
                    "Assicurazione All-Risk sul carico",
                    "Personale qualificato e discreto"
                ].map((text, idx) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'center' }, bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                            <CheckCircleOutlineIcon color="success" sx={{ mr: 1.5 }} />
                            <Typography variant="body1" fontWeight={500}>{text}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" size="large" onClick={scrollToForm} endIcon={<ArrowForwardIcon />}
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}>
                    Compila il modulo
                </Button>
                <Button variant="outlined" size="large" startIcon={<PhoneIcon />} href="tel:+393397882956"
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}>
                    Chiama Ora
                </Button>
            </Box>
        </Container>
        <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', animation: 'bounce 2s infinite' }}>
            <KeyboardArrowDownIcon sx={{ color: '#ccc', fontSize: 40 }} />
        </Box>
      </Box>

      {/* ================= STEP 4: FORM + FOOTER (LAYOUT OTTIMIZZATO) ================= */}
		<Box id="form-section" sx={{ ...sectionStyle, height: 'auto', minHeight: '100vh', background: 'linear-gradient(180deg, #e3f2fd 0%, #f4f6f8 100%)', pt: { xs: 4, md: 8 }, pb: 0 }}>
			<Container maxWidth="md" sx={{ mb: 8 }}>
				
				<form onSubmit={handleSubmit}>

					{/* --- 1. DATI PERSONALI --- */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
							<PublicIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
							<Typography variant="h5" sx={{ fontWeight: '800', color: '#102a43' }}>
								I tuoi Dati
							</Typography>
						</Box>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12 }}>
								<TextField 
									fullWidth required label="Nome e Cognome o Azienda" variant="outlined"
									id="nome" name="nome" autoComplete="name"
									value={formData.nome || ''} onChange={handleChange} 
									InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><PersonIcon /></Box> }}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField 
									fullWidth label="Telefono" variant="outlined"
									id="telefono" name="telefono" autoComplete="tel"
									value={formData.telefono} onChange={handleChange} 
									InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><PhoneIcon /></Box> }}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField 
									fullWidth label="Email" variant="outlined"
									id="email" name="email" autoComplete="email"
									value={formData.email} onChange={handleChange} 
									InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><EmailIcon /></Box> }}
								/>
							</Grid>
						</Grid>
					</Paper>

					{/* --- 2. DOVE E QUANDO --- */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
							<LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
							<Typography variant="h5" sx={{ fontWeight: '800', color: '#102a43' }}>
								Dove e Quando
							</Typography>
						</Box>

						<Grid container spacing={4}>
							{/* COLONNA PARTENZA */}
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
									📍 RITIRO (Partenza)
								</Typography>
								
								<TextField 
									fullWidth required label="Indirizzo Partenza" variant="outlined"
									id="da_indirizzo" name="da_indirizzo" autoComplete="shipping street-address"
									value={formData.da_indirizzo || ''} onChange={handleChange}
									InputProps={{
										startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><HomeIcon /></Box>,
										endAdornment: <IconButton onClick={() => openMap('da_indirizzo')} edge="end" color="primary"><MapIcon /></IconButton>
									}}
								/>
								
								<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
								  <FormControl fullWidth size="small">
									<InputLabel id="piano-partenza-label">Piano</InputLabel>
									<Select
									  labelId="piano-partenza-label"
									  id="piano_partenza"
									  name="piano_partenza"
									  value={formData.piano_partenza}
									  label="Piano"
									  onChange={handleChange}
									>
									  {PIANI.map((p) => (
										<MenuItem key={p} value={p}>
										  {p === 0 ? 'Terra' : p}
										</MenuItem>
									  ))}
									</Select>
								  </FormControl>

								  <FormControl fullWidth size="small">
									  <InputLabel id="ascensore-partenza-label">Ascensore</InputLabel>
									  <Select
										labelId="ascensore-partenza-label"
										id="ascensore_partenza"
										name="ascensore_partenza"
										value={formData.ascensore_partenza}
										label="Ascensore"
										onChange={handleChange}
									  >
										{ASCENSORE_OPTS.map((opt) => (
										  <MenuItem key={opt.label} value={opt.value}>
											{opt.label}
										  </MenuItem>
										))}
									  </Select>
									</FormControl>

								</Box>

							</Grid>

							{/* COLONNA ARRIVO */}
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
									🏁 CONSEGNA (Arrivo)
								</Typography>

								<TextField 
									fullWidth label="Indirizzo Arrivo" variant="outlined"
									id="a_indirizzo" name="a_indirizzo" autoComplete="shipping street-address"
									value={formData.a_indirizzo || ''} onChange={handleChange}
									InputProps={{
										startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><LocationOnIcon /></Box>,
										endAdornment: <IconButton onClick={() => openMap('a_indirizzo')} edge="end" color="primary"><MapIcon /></IconButton>
									}}
								/>

								<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
								  <FormControl fullWidth size="small">
									<InputLabel id="piano-arrivo-label">Piano</InputLabel>
									<Select
									  labelId="piano-arrivo-label"
									  id="piano_arrivo"
									  name="piano_arrivo"
									  value={formData.piano_arrivo}
									  label="Piano"
									  onChange={handleChange}
									>
									  {PIANI.map((p) => (
										<MenuItem key={p} value={p}>
										  {p === 0 ? 'Terra' : p}
										</MenuItem>
									  ))}
									</Select>
								  </FormControl>

								  <FormControl fullWidth size="small">
									  <InputLabel id="ascensore-arrivo-label">Ascensore</InputLabel>
									  <Select
										labelId="ascensore-arrivo-label"
										id="ascensore_arrivo"
										name="ascensore_arrivo"
										value={formData.ascensore_arrivo}
										label="Ascensore"
										onChange={handleChange}
									  >
										{ASCENSORE_OPTS.map((opt) => (
										  <MenuItem key={opt.label} value={opt.value}>
											{opt.label}
										  </MenuItem>
										))}
									  </Select>
									</FormControl>

								</Box>

							</Grid>

							{/* DATA E ORA */}
							<Grid size={{ xs: 12 }}>
								<Divider sx={{ my: 3 }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>📅 Data preferita per il trasloco</Typography>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField 
											fullWidth type="date" label="Data" name="startDate" 
											InputLabelProps={{ shrink: true }} 
											value={formData.startDate || ''} onChange={handleChange} 
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField 
											fullWidth type="time" label="Orario Indicativo" name="startTime" 
											InputLabelProps={{ shrink: true }} 
											value={formData.startTime || ''} onChange={handleChange} 
										/>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Paper>

					{/* --- 3. INVENTARIO E NOTE --- */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
							<HandymanIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
							<Typography variant="h5" sx={{ fontWeight: '800', color: '#102a43' }}>
								Cosa Trasportiamo?
							</Typography>
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Seleziona gli oggetti principali o descrivi il carico:
						</Typography>

						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
							{QUICK_ITEMS.map((item) => (
								<Chip
									key={item} label={item} onClick={() => handleAddItem(item)}
									icon={<AddCircleOutlineIcon />} clickable
									sx={{ bgcolor: 'white', border: '1px solid #ddd', '&:hover': { bgcolor: '#e3f2fd', borderColor: '#2196f3' } }}
								/>
							))}
						</Box>

						{/* LISTA OGGETTI AGGIUNTI */}
						{inventoryList.length > 0 && (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 300, overflowY: 'auto' }}>
								{inventoryList.map((item) => (
									<Paper key={item.name} elevation={0} sx={{ p: 1.5, border: '1px solid #bbdefb', borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography fontWeight="bold">{item.name}</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center' }}>
											<IconButton size="small" onClick={() => handleRemoveItem(item.name)} color="error"><RemoveCircleOutlineIcon /></IconButton>
											<Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.qty}</Typography>
											<IconButton size="small" onClick={() => handleAddItem(item.name)} color="primary"><AddCircleOutlineIcon /></IconButton>
										</Box>
									</Paper>
								))}
							</Box>
						)}

						<TextField
							id="inventario" name="inventario"
							label="Descrizione extra / Misure / Lista completa"
							fullWidth multiline rows={3}
							value={formData.inventario || ''} onChange={handleChange}
							helperText="La lista selezionata sopra verrà inclusa automaticamente."
							sx={{ mb: 3 }}
						/>

						<TextField
							id="note" name="note"
							label="Note aggiuntive (es. ZTL, cortile interno, scale strette...)"
							fullWidth multiline rows={2}
							value={formData.note || ''} onChange={handleChange}
						/>
					</Paper>

					{/* BOTTONE INVIO */}
					<Box sx={{ textAlign: 'center', mt: 4 }}>
						<Button 
							type="submit" variant="contained" size="large"
							endIcon={<SendIcon />}
							sx={{ 
								px: 6, py: 2, fontSize: '1.2rem', borderRadius: 50, fontWeight: 'bold',
								background: 'linear-gradient(45deg, #102a43 30%, #1976d2 90%)',
								boxShadow: '0 8px 20px rgba(16, 42, 67, 0.4)'
							}}
						>
							RICHIEDI PREVENTIVO GRATUITO
						</Button>
					</Box>

				</form>
			</Container>

			{/* FOOTER */}
			<Box sx={{ bgcolor: '#102a43', color: 'white', py: 4, mt: 'auto' }}>
				<Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="body2" sx={{ opacity: 0.7, mb: { xs: 2, md: 0 } }}>
						© 2026 Viscito Logistic - Salerno
					</Typography>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><FacebookIcon /></IconButton>
						<IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><InstagramIcon /></IconButton>
						<IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><LinkedInIcon /></IconButton>
					</Box>
				</Container>
			</Box>
		</Box>

		{/* --- MODALE MAPPA --- */}
        <Dialog open={mapOpen} onClose={() => setMapOpen(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Seleziona {currentField === 'da_indirizzo' ? 'Partenza' : 'Arrivo'} sulla mappa
                <IconButton onClick={() => setMapOpen(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, height: '400px' }}>
                <MapContainer center={[41.9028, 12.4964]} zoom={6} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker />
                </MapContainer>
            </DialogContent>
        </Dialog>		
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
      `}</style>
    </Box>
  );
}

export default Home;