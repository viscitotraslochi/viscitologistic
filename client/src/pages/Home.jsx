import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. LIBRERIE ESTERNE (MUI & LEAFLET) ---
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, Card, CardContent, 
  TextField, Paper, Snackbar, Alert, Checkbox, FormControlLabel, Select, MenuItem,
  IconButton, Chip, useTheme, useMediaQuery, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogContent, DialogTitle, Autocomplete, Divider, FormControl, InputLabel, createFilterOptions
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

const [errors, setErrors] = useState({
  email: false,
  telefono: false,
  nome: false
});

const filter = createFilterOptions();

// --- Pulsanti rapidi a vista ---
const QUICK_ITEMS = [
    "Scatola", "Frigorifero", "Lavatrice", "Divano", "Tavolo", 
    "Sedia", "Letto Matr.", "Letto Sing.", "Armadio", "Comodino", 
    "Comò", "Televisore", "Lavastoviglie", "Poltrona", "Scarpiera"
];

// --- Lista completa per Autocomplete ---
const EXTENDED_ITEMS = [
    ...new Set([
        ...QUICK_ITEMS,
        // --- CUCINA & ELETTRODOMESTICI ---
        "Affettatrice", "Bollitore", "Bilancia da Cucina", "Cantinetta Vini", 
        "Congelatore", "Contenitori Plastica", "Forno", "Frigorifero", 
        "Lavastoviglie", "Macchina del Caffè", "Microonde", "Mixer", 
        "Piano Cottura", "Posate", "Robot da Cucina", "Set Pentole", 
        "Servizio Piatti", "Tostapane",

        // --- SOGGIORNO & ZONA GIORNO ---
        "Camino Elettrico", "Chaise Longue", "Credenza", "Divano 2 Posti", 
        "Divano 3 Posti", "Divano Angolare", "Libreria", "Madia", 
        "Mobile TV", "Orologio da Parete", "Piantana", "Poltrona", 
        "Pouf", "Quadro", "Tappeto", "Tavolino Caffè", "Tavolo", 
        "Televisore", "Tende", "Vaso", "Vetrina",

        // --- CAMERA DA LETTO & NOTTE ---
        "Armadio 2 Ante", "Armadio 4 Ante", "Armadio 6 Ante", "Cassettiera", 
        "Comodino", "Comò", "Cuscini", "Lenzuola", "Letto a Castello", 
        "Letto Matrimoniale", "Letto Singolo", "Materasso Matrimoniale", 
        "Materasso Singolo", "Piumone", "Panca Scendiletto", "Settimino",

        // --- BAGNO, LAVANDERIA & PULIZIA ---
        "Asciugatrice", "Asciugacapelli", "Asse da Stiro", "Aspirapolvere", 
        "Bilancia Pesapersone", "Cesto Biancheria", "Ferro da Stiro", 
        "Lavatrice", "Mobile Bagno", "Robot Aspirapolvere", "Scopa e Mocio", 
        "Specchio Bagno", "Stendibiancheria",

        // --- STUDIO, UFFICIO & INGRESSO ---
        "Appendiabiti", "Consolle Ingresso", "Libreria Pensile", "Monitor PC", 
        "Scarpiera", "Scrivania", "Sedia Ufficio", "Specchio Lungo", "Stampante",

        // --- SPORT, TEMPO LIBERO & VALIGIE ---
        "Attrezzatura Sci", "Bicicletta", "Borsa Sportiva", "Panca Fitness", 
        "Pesi e Manubri", "Tapis Roulant", "Valigia", "Zaino",

        // --- GARAGE, ESTERNO & ATTREZZI ---
        "Barbecue", "Cassetta degli Attrezzi", "Ombrellone", "Pianta da Esterno", 
        "Scala", "Sedia da Giardino", "Tavolo da Esterno", "Tosaerba", "Trapano",

        // --- IMBALLAGGIO & VARIE ---
        "Condizionatore Portatile", "Pianta da Interno", "Scatola Libri", 
        "Scatola Documenti", "Scatola", "Stufa Elettrica", "Ventilatore", 
        "Umidificatore"
    ])
].sort((a, b) => a.localeCompare('it'));

const PIANI = Array.from({ length: 16 }, (_, i) => i); // [0, 1, ... 15]
const ASCENSORE_OPTS = ["SI", "NO"];


function Home() {
	const [suggestions, setSuggestions] = useState({ da: [], a: [] });
	const [loading, setLoading] = useState(false);

	const [errors, setErrors] = useState({}); 

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
		cliente_nome: '',
		telefono: '',
		email: '',
		da_indirizzo: '',
		a_indirizzo: '',
		note: '',
		items: [],
		inventario: '',
		// NUOVI CAMPI
		piano_partenza: '0',
		ascensore_partenza: "", 
		piano_arrivo: '0',
		ascensore_arrivo: "",  
	});

  
  
  
	// --- NUOVA LOGICA INVENTARIO ---
    const [inventoryList, setInventoryList] = useState([]);
	const [inputValue, setInputValue] = useState('');
	
    // 1. Funzione per aggiungere
	const handleAddItem = (itemName) => {
		const name = (typeof itemName === 'string' ? itemName : itemName?.label)?.trim();
		if (!name) return;

		setInventoryList(prev => {
			const existing = prev.find(i => i.name.toLowerCase() === name.toLowerCase());
			if (existing) {
				return prev.map(i => i.name.toLowerCase() === name.toLowerCase() ? { ...i, qty: i.qty + 1 } : i);
			}
			return [...prev, { name: name, qty: 1 }];
		});
		
		setInputValue(''); // Reset del campo di testo
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
	  const { name, value, type } = e.target;
	  
	  setFormData(prev => ({
		...prev,
		[name]: (name.includes("ascensore")) ? value === "true" : value
	  }));
	};

  const handleCheckboxChange = (item) => {
    setQuantities(prev => ({
      ...prev,
      [item]: prev[item] > 0 ? 0 : 1 
    }));
  };

	const handleSubmit = async (e) => {
	  e.preventDefault();
	  setErrors({});
	  setLoading(true);

	  const newErrors = {};
	  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	  const phoneRegex = /^[0-9+ ]{6,15}$/;

	  if (!formData.nome?.trim()) newErrors.nome = "Il nome è obbligatorio";
	  if (!formData.telefono?.trim()) newErrors.telefono = "Il numero è obbligatorio";
	  else if (!phoneRegex.test(formData.telefono)) newErrors.telefono = "Numero non valido";
	  if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Email non valida";

	  if (Object.keys(newErrors).length > 0) {
		setErrors(newErrors);
		setLoading(false);
		return;
	  }

	  try {
		await api.post('/leads', formData);
		setSnackbar({ 
		  open: true, 
		  severity: 'success', 
		  message: 'Richiesta inviata! Ti contatteremo entro 24 ore.' 
		});
		
		// Reset dello stato
		setFormData({
		  nome: '', telefono: '', email: '', da_indirizzo: '', a_indirizzo: '',
		  piano_partenza: '0', ascensore_partenza: false, piano_arrivo: '0',
		  ascensore_arrivo: false, startDate: '', startTime: '', inventario: '', note: ''
		});
		setInventoryList([]);
		
		setTimeout(() => navigate('/thank-you'), 3000);
	  } catch (error) {
		setSnackbar({ open: true, severity: 'error', message: "Errore durante l'invio." });
	  } finally {
		setLoading(false);
	  }
	};

		try {
			setLoading(true);
			await api.post('/leads', dataToSend);
			
			// --- MESSAGGIO DI CONFERMA PERSONALIZZATO ---
			setSnackbar({ 
				open: true, 
				severity: 'success', 
				message: 'Grazie! Richiesta ricevuta. Un nostro consulente ti ricontatterà telefonicamente o tramite email entro 24 ore.' 
			});

			// Reset completo dello stato
			setFormData({
				nome: '', telefono: '', email: '',
				da_indirizzo: '', a_indirizzo: '',
				piano_partenza: '0', ascensore_partenza: false,
				piano_arrivo: '0', ascensore_arrivo: false,
				startDate: '', startTime: '', 
				items: [], inventario: '', note: '' 
			});
			setInventoryList([]);

			// Reindirizzamento dopo 3.5 secondi per dare tempo di leggere lo snackbar
			setTimeout(() => navigate('/thank-you'), 3500);

		} catch (error) {
			console.error("Errore invio:", error);
			setSnackbar({ 
				open: true, 
				severity: 'error', 
				message: "Si è verificato un problema durante l'invio. Riprova o chiamaci direttamente."
			});
		} finally {
			setLoading(false);
		}
	};

		try {
			setLoading(true); // Opzionale: aggiungi uno stato di caricamento
			await api.post('/leads', dataToSend);
			
			// --- MESSAGGIO DI CONFERMA MIGLIORATO ---
			setSnackbar({ 
				open: true, 
				severity: 'success', 
				message: 'Grazie! La tua richiesta è stata inviata. Un nostro consulente ti ricontatterà telefonicamente o via email entro 24 ore.' 
			});

			// Reset Form completo
			setFormData({
				nome: '', telefono: '', email: '',
				da_indirizzo: '', a_indirizzo: '',
				piano_partenza: '0', ascensore_partenza: false,
				piano_arrivo: '0', ascensore_arrivo: false,
				startDate: '', startTime: '', 
				items: [], inventario: '', note: '' 
			});
			setInventoryList([]); // Svuota la lista visuale

			// Reindirizzamento dopo un tempo leggermente più lungo per far leggere il messaggio
			setTimeout(() => navigate('/thank-you'), 3000);

		} catch (error) {
			console.error("Errore invio:", error);
			setSnackbar({ 
				open: true, 
				severity: 'error', 
				message: "Ops! Errore durante l'invio. Riprova o chiamaci direttamente."
			});
		} finally {
			setLoading(false);
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
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField 
									fullWidth required 
									label="Nome e Cognome o Azienda" 
									variant="outlined"
									id="nome" name="nome"
									value={formData.nome || ''} 
									onChange={handleChange}
									error={!!errors.nome} // Diventa rosso se vuoto
									helperText={errors.nome} // Scrive "Il nome è obbligatorio"
									InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><PersonIcon /></Box> }}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField 
									fullWidth 
									required 
									label="Telefono"
									name="telefono"
									value={formData.telefono}
									onChange={handleChange}
									error={!!errors.telefono} // Diventa rosso se c'è un errore
									helperText={errors.telefono} // Mostra il messaggio specifico
									InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'action.active' }}><PhoneIcon /></Box> }}
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
										value={formData.ascensore_partenza} // deve essere booleano
										label="Ascensore"
										onChange={(e) =>
										  setFormData({
											...formData,
											ascensore_partenza: e.target.value === true || e.target.value === 'true'
										  })
										}
									  >
										<MenuItem value={true}>SI</MenuItem>
										<MenuItem value={false}>NO</MenuItem>
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
										onChange={(e) =>
										  setFormData({
											...formData,
											ascensore_arrivo: e.target.value === true || e.target.value === 'true'
										  })
										}
									  >
										<MenuItem value={true}>SI</MenuItem>
										<MenuItem value={false}>NO</MenuItem>
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
					<Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 3 }}>
						<Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
							AGGIUNTA RAPIDA (Clicca per aggiungere)
						</Typography>
						
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
							{QUICK_ITEMS.map((item) => (
								<Chip 
									key={item} 
									label={item} 
									onClick={() => handleAddItem(item)} 
									clickable 
									sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', '&:hover': { bgcolor: '#e3f2fd' } }} 
								/>
							))}
						</Box>

						<Divider sx={{ my: 2 }} />

						{/* SEZIONE INPUT + TASTO AGGIUNGI */}
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
							<Autocomplete
								freeSolo
								disablePortal
								sx={{ flexGrow: 1 }}
								options={EXTENDED_ITEMS}
								// Queste due righe sono fondamentali e causavano l'errore:
								inputValue={inputValue} 
								onInputChange={(event, newInputValue) => {
									setInputValue(newInputValue);
								}}
								onChange={(event, newValue) => {
									if (newValue) handleAddItem(newValue);
								}}
								filterOptions={(options, params) => filter(options, params)}
								renderInput={(params) => (
									<TextField 
										{...params} 
										label="Cerca o scrivi oggetto..." 
										variant="outlined" 
										size="small"
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												e.stopPropagation();
												if (inputValue.trim() !== '') handleAddItem(inputValue);
											}
										}}
									/>
								)}
							/>
							<Button 
								variant="contained" 
								onClick={() => handleAddItem(inputValue)}
								sx={{ minWidth: '48px', height: '40px' }}
							>
								<AddCircleOutlineIcon />
							</Button>
						</Box>

						{/* LISTA OGGETTI AGGIUNTI */}
						{inventoryList.length > 0 && (
							<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
								{inventoryList.map((item) => (
									<Paper key={item.name} elevation={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid #bbdefb', bgcolor: '#e3f2fd' }}>
										<Typography variant="body2" fontWeight="bold" sx={{ pl: 1 }}>{item.name}</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<IconButton size="small" onClick={() => handleRemoveItem(item.name)} color="error"><RemoveCircleOutlineIcon /></IconButton>
											<Typography fontWeight="bold">{item.qty}</Typography>
											<IconButton size="small" onClick={() => handleAddItem(item.name)} color="primary"><AddCircleOutlineIcon /></IconButton>
										</Box>
									</Paper>
								))}
							</Box>
						)}
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