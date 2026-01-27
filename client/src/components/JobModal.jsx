import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Modal,
  Autocomplete,
  createFilterOptions
} from '@mui/material';
import Grid from '@mui/material/Grid';

// --- ICONE ---
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- LEAFLET & MAPPA ---
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import api from '../api/axiosConfig';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

function JobModal({ open, onClose, onJobAdded, jobToEdit, selectedDate }) {
  const lastFocusedRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  
  const [suggestions, setSuggestions] = useState({ da: [], a: [] });

  const [formData, setFormData] = useState({
    cliente_nome: '',
    phone: '',
    email: '',
    da_indirizzo: '',
    a_indirizzo: '',
    items: '',        // auto-generato da inventoryList
    items_extra: '',  // testo libero extra (come Home)
    notes: '',
    price: '',
    deposit: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '10:00',
    piano_partenza: '0',
    ascensore_partenza: 'NO',
    piano_arrivo: '0',
    ascensore_arrivo: 'NO'
  });

  const [inventoryList, setInventoryList] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [currentMapField, setCurrentMapField] = useState(null);

  // --- GESTIONE INVENTARIO ---
  const handleAddItem = (itemName) => {
    const name = (typeof itemName === 'string' ? itemName : itemName?.label)?.trim();
    if (!name) return;

    setInventoryList(prev => {
      const existing = prev.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev.map(i =>
          i.name.toLowerCase() === name.toLowerCase()
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { name, qty: 1 }];
    });

    setInputValue('');
  };

  const handleRemoveItem = (itemName) => {
    setInventoryList(prev => {
      const existing = prev.find(i => i.name === itemName);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(i => i.name !== itemName);
      return prev.map(i => i.name === itemName ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  // Sync inventoryList -> formData.items (solo riepilogo)
  useEffect(() => {
    const textString = inventoryList.map(item => `${item.name} x${item.qty}`).join(', ');
    setFormData(prev => ({ ...prev, items: textString }));
  }, [inventoryList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- Debounce semplice ---
const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const debouncedDa = useDebouncedValue(formData.da_indirizzo, 350);
const debouncedA = useDebouncedValue(formData.a_indirizzo, 350);

// --- Nominatim (OSM) - SOLO ITALIA ---
const fetchAddressSuggestions = async (query) => {
  const q = (query ?? '').trim();
  if (q.length < 3) return [];

  const q1 = /italia/i.test(q) ? q : `${q}, Italia`;

  const makeUrl = (bounded) => `
    https://nominatim.openstreetmap.org/search
      ?format=json
      &addressdetails=1
      &limit=8
      &countrycodes=it
      &accept-language=it
      ${bounded ? '&bounded=1&viewbox=6.6,47.1,18.8,36.6' : ''}
      &q=${encodeURIComponent(q1)}
  `.replace(/\s+/g, '');

  const run = async (bounded) => {
    const res = await fetch(makeUrl(bounded), { headers: { Accept: 'application/json' } });
    const data = await res.json();
    return (data || []).map(item => ({
      label: item.display_name,
      value: item.display_name,
      lat: item.lat,
      lon: item.lon
    }));
  };

  // 1) prova con bias Italia
  const first = await run(true);
  if (first.length) return first;

  // 2) fallback: senza bounded
  return await run(false);
};


// Aggiorna suggestions per "da_indirizzo"
useEffect(() => {
  let alive = true;
  (async () => {
    try {
      const list = await fetchAddressSuggestions(debouncedDa);
      if (!alive) return;
      setSuggestions(prev => ({ ...prev, da: list }));
    } catch {
      if (!alive) return;
      setSuggestions(prev => ({ ...prev, da: [] }));
    }
  })();
  return () => { alive = false; };
}, [debouncedDa]);

// Aggiorna suggestions per "a_indirizzo"
useEffect(() => {
  let alive = true;
  (async () => {
    try {
      const list = await fetchAddressSuggestions(debouncedA);
      if (!alive) return;
      setSuggestions(prev => ({ ...prev, a: list }));
    } catch {
      if (!alive) return;
      setSuggestions(prev => ({ ...prev, a: [] }));
    }
  })();
  return () => { alive = false; };
}, [debouncedA]);


  function LocationMarker() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await fetch(
            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`
          );
          const data = await response.json();
          const address = data.address?.Match_addr || "Indirizzo non trovato";
          if (currentMapField) {
            setFormData(prev => ({ ...prev, [currentMapField]: address }));
			setSuggestions({ da: [], a: [] });
            setMapOpen(false);
          }
        } catch (error) {
          console.error("Errore mappa:", error);
        }
      },
    });
    return null;
  }

  // Precompila form in edit / reset in create
  useEffect(() => {
    if (jobToEdit) {
      let startObj;
      if (jobToEdit.start) startObj = new Date(jobToEdit.start);
      else if (jobToEdit.date) startObj = new Date(`${jobToEdit.date}T${jobToEdit.time || '09:00'}`);
      else startObj = new Date();

      let endObj;
      if (jobToEdit.end) endObj = new Date(jobToEdit.end);
      else if (jobToEdit.end_date) endObj = new Date(`${jobToEdit.end_date}T${jobToEdit.end_time || '10:00'}`);
      else endObj = new Date(startObj.getTime() + 60 * 60 * 1000);

      const source = jobToEdit.extendedProps || jobToEdit;

      const getVal = (keys) => {
        for (const key of keys) {
          if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key];
          if (jobToEdit[key] !== undefined && jobToEdit[key] !== null && jobToEdit[key] !== '') return jobToEdit[key];
        }
        return '';
      };

      const formatAscensoreForUI = (val) => {
        if (val === undefined || val === null) return 'NO';
        const s = String(val).toLowerCase();
        return (s === 'true' || s === '1' || s === 'sì' || s === 'si' || s === 'yes') ? 'SI' : 'NO';
      };

      let rawNotes = getVal(['notes', 'note']) || '';
      const cleanNotes = rawNotes.replace(/--- LOGISTICA ---[\s\S]*$/, '').trim();

      const itemsStringRaw = getVal(['items', 'inventario']) || '';

      // Split robusto: separa solo alla prima occorrenza di " | "
      const sep = ' | ';
      const idx = itemsStringRaw.indexOf(sep);
      const itemsListPart = idx >= 0 ? itemsStringRaw.slice(0, idx) : itemsStringRaw;
      const itemsExtraPart = idx >= 0 ? itemsStringRaw.slice(idx + sep.length) : '';

      // Ricostruisci inventoryList SOLO dalla parte lista
      if (itemsListPart && itemsListPart.trim()) {
        const reconstructed = itemsListPart.split(', ').map(s => {
          const parts = s.split(' x');
          return { name: parts[0], qty: parseInt(parts[1], 10) || 1 };
        }).filter(i => i.name);
        setInventoryList(reconstructed);
      } else {
        setInventoryList([]);
      }

      setFormData({
        cliente_nome: getVal(['cliente_nome', 'title']),
        phone: getVal(['phone', 'telefono']),
        email: getVal(['email', 'mail']),
        da_indirizzo: getVal(['da_indirizzo', 'partenza']),
        a_indirizzo: getVal(['a_indirizzo', 'destinazione']),
        items: itemsListPart || '',
        items_extra: itemsExtraPart || '',
        notes: cleanNotes,
        piano_partenza: getVal(['piano_partenza']) || '0',
        ascensore_partenza: formatAscensoreForUI(getVal(['ascensore_partenza'])),
        piano_arrivo: getVal(['piano_arrivo']) || '0',
        ascensore_arrivo: formatAscensoreForUI(getVal(['ascensore_arrivo'])),
        price: getVal(['price', 'prezzo']),
        deposit: getVal(['deposit', 'acconto']),
        startDate: startObj.toLocaleDateString('en-CA'),
        startTime: startObj.toTimeString().slice(0, 5),
        endDate: endObj.toLocaleDateString('en-CA'),
        endTime: endObj.toTimeString().slice(0, 5)
      });
    } else {
      const baseDate = selectedDate || new Date().toLocaleDateString('en-CA');
      setInventoryList([]);
      setFormData({
        cliente_nome: '',
        phone: '',
        email: '',
        da_indirizzo: '',
        a_indirizzo: '',
        items: '',
        items_extra: '',
        notes: '',
        price: '',
        deposit: '',
        piano_partenza: '0',
        ascensore_partenza: 'NO',
        piano_arrivo: '0',
        ascensore_arrivo: 'NO',
        startDate: baseDate,
        startTime: '09:00',
        endDate: baseDate,
        endTime: '10:00'
      });
    }
  }, [jobToEdit, open, selectedDate]);

  const handleSubmit = async () => {
    const clean = (v) => (v ?? '').toString().trim();
    const cleanOrNull = (v) => {
      const s = clean(v);
      return s.length ? s : null;
    };
    const toNumberOrZero = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const toYesNo = (v) => (clean(v).toUpperCase() === 'SI' ? 'SI' : 'NO');

    // items finali (come Home): items auto + items_extra
    let finalItems = clean(formData.items);
    const extra = clean(formData.items_extra);
    if (extra) {
      if (finalItems) finalItems += ' | ';
      finalItems += extra;
    }

    const payload = {
      cliente_nome: clean(formData.cliente_nome),
      phone: clean(formData.phone),
      email: cleanOrNull(formData.email),

      da_indirizzo: clean(formData.da_indirizzo),
      a_indirizzo: clean(formData.a_indirizzo),

      date: cleanOrNull(formData.startDate),
      time: cleanOrNull(formData.startTime),
      end_date: cleanOrNull(formData.endDate) || cleanOrNull(formData.startDate),
      end_time: cleanOrNull(formData.endTime),

      price: toNumberOrZero(formData.price),
      deposit: toNumberOrZero(formData.deposit),

      piano_partenza: clean(formData.piano_partenza) || '0',
      piano_arrivo: clean(formData.piano_arrivo) || '0',

      ascensore_partenza: toYesNo(formData.ascensore_partenza),
      ascensore_arrivo: toYesNo(formData.ascensore_arrivo),

      items: finalItems,
      notes: clean(formData.notes)
    };

    try {
      if (jobToEdit && jobToEdit.id) {
        await api.put(`/jobs/${jobToEdit.id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      onJobAdded();
      onClose();
    } catch (error) {
      console.error("Errore salvataggio:", error);
      alert("Errore durante il salvataggio del lavoro.");
    }
  };

  const handleDelete = async () => {
    if (!jobToEdit || !jobToEdit.id) return;
    if (window.confirm("Eliminare definitivamente questo lavoro?")) {
      try {
        await api.delete(`/jobs/${jobToEdit.id}`);
        onJobAdded();
        onClose();
      } catch (error) {
        alert("Errore eliminazione.");
      }
    }
  };

  const handleSafeClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleSafeClose} fullWidth maxWidth="md" disableRestoreFocus>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
        {jobToEdit ? 'Dettaglio Lavoro' : 'Nuovo Lavoro'}
        <IconButton onClick={handleSafeClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="cliente_nome" label="Nome Cliente" name="cliente_nome" fullWidth required value={formData.cliente_nome} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="phone" label="Telefono" name="phone" fullWidth required value={formData.phone} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="email" label="Email" name="email" fullWidth value={formData.email} onChange={handleChange} />
          </Grid>

          <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
			  freeSolo
			  disablePortal
			  options={suggestions.da || []}
			  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.label || '')}
			  inputValue={formData.da_indirizzo || ''}
			  onInputChange={(event, newInputValue) => {
				setFormData(prev => ({ ...prev, da_indirizzo: newInputValue }));
			  }}
			  onChange={(event, newValue) => {
				const v = typeof newValue === 'string' ? newValue : newValue?.value;
				if (v) setFormData(prev => ({ ...prev, da_indirizzo: v }));
			  }}
			  renderInput={(params) => (
				<TextField
				  {...params}
				  id="da_indirizzo"
				  label="Partenza"
				  name="da_indirizzo"
				  fullWidth
				  value={formData.da_indirizzo}
				  onChange={handleChange}
				  InputProps={{
					...params.InputProps,
					endAdornment: (
					  <>
						{params.InputProps.endAdornment}
						<IconButton onClick={(e) => {
						  lastFocusedRef.current = e.currentTarget;
						  e.currentTarget.blur();
						  setCurrentMapField('da_indirizzo');
						  setMapOpen(true);
						}}>
						  <MapIcon color="primary" />
						</IconButton>
					  </>
					)
				  }}
				/>
			  )}
			/>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                select
                label="Piano"
                name="piano_partenza"
                value={formData.piano_partenza}
                onChange={handleChange}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i} value={i}>{i === 0 ? 'Piano Terra' : `Piano ${i}`}</option>
                ))}
              </TextField>
              <TextField
                select
                label="Ascensore"
                name="ascensore_partenza"
                value={formData.ascensore_partenza}
                onChange={handleChange}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="SI">Ascensore: SI</option>
                <option value="NO">Ascensore: NO</option>
              </TextField>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
			  freeSolo
			  disablePortal
			  options={suggestions.a || []}
			  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.label || '')}
			  inputValue={formData.a_indirizzo || ''}
			  onInputChange={(event, newInputValue) => {
				setFormData(prev => ({ ...prev, a_indirizzo: newInputValue }));
			  }}
			  onChange={(event, newValue) => {
				const v = typeof newValue === 'string' ? newValue : newValue?.value;
				if (v) setFormData(prev => ({ ...prev, a_indirizzo: v }));
			  }}
			  renderInput={(params) => (
				<TextField
				  {...params}
				  id="a_indirizzo"
				  label="Destinazione"
				  name="a_indirizzo"
				  fullWidth
				  value={formData.a_indirizzo}
				  onChange={handleChange}
				  InputProps={{
					...params.InputProps,
					endAdornment: (
					  <>
						{params.InputProps.endAdornment}
						<IconButton onClick={(e) => {
						  lastFocusedRef.current = e.currentTarget;
						  e.currentTarget.blur();
						  setCurrentMapField('a_indirizzo');
						  setMapOpen(true);
						}}>
						  <MapIcon color="primary" />
						</IconButton>
					  </>
					)
				  }}
				/>
			  )}
			/>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                select
                label="Piano"
                name="piano_arrivo"
                value={formData.piano_arrivo}
                onChange={handleChange}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i} value={i}>{i === 0 ? 'Piano Terra' : `Piano ${i}`}</option>
                ))}
              </TextField>
              <TextField
                select
                label="Ascensore"
                name="ascensore_arrivo"
                value={formData.ascensore_arrivo}
                onChange={handleChange}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="SI">Ascensore: SI</option>
                <option value="NO">Ascensore: NO</option>
              </TextField>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Pianificazione
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="primary">INIZIO</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField type="date" name="startDate" value={formData.startDate} onChange={handleChange} fullWidth size="small" />
                    <TextField type="time" name="startTime" value={formData.startTime} onChange={handleChange} fullWidth size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="error">FINE</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField type="date" name="endDate" value={formData.endDate} onChange={handleChange} fullWidth size="small" />
                    <TextField type="time" name="endTime" value={formData.endTime} onChange={handleChange} fullWidth size="small" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* INVENTARIO */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
                AGGIUNTA RAPIDA
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {QUICK_ITEMS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onClick={() => handleAddItem(item)}
                    clickable
                    sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%', mt: 1 }}>
                <Autocomplete
                  freeSolo
                  disablePortal
                  sx={{ flexGrow: 1 }}
                  options={EXTENDED_ITEMS}
                  inputValue={inputValue}
                  filterOptions={(options, params) => filter(options, params)}
                  onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                  onChange={(event, newValue) => {
                    if (newValue) handleAddItem(newValue);
                  }}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cerca o scrivi oggetto..."
                      size="small"
                      fullWidth
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (inputValue.trim() !== '') {
                            handleAddItem(inputValue);
                          }
                        }
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  onClick={() => handleAddItem(inputValue)}
                  sx={{ height: '40px', minWidth: '48px', p: 0 }}
                >
                  <AddCircleOutlineIcon />
                </Button>
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                INVENTARIO CORRENTE:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {inventoryList.map((item) => (
                  <Paper
                    key={item.name}
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      border: '1px solid #bbdefb',
                      bgcolor: '#e3f2fd'
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" sx={{ pl: 1 }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleRemoveItem(item.name)} color="error">
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                      <Typography fontWeight="bold">{item.qty}</Typography>
                      <IconButton size="small" onClick={() => handleAddItem(item.name)} color="primary">
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>

              <TextField
                label="Riepilogo (Auto-generato)"
                fullWidth
                multiline
                minRows={2}
                value={formData.items}
                sx={{ mt: 2, bgcolor: '#f5f5f5' }}
                slotProps={{ input: { readOnly: true } }}
              />

              <TextField
                id="items_extra"
                name="items_extra"
                label="Descrizione extra / Misure / Lista completa"
                fullWidth
                multiline
                minRows={2}
                value={formData.items_extra || ''}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField id="notes" label="Note" name="notes" multiline rows={2} fullWidth value={formData.notes} onChange={handleChange} />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField id="price" label="Prezzo Pattuito (€)" name="price" type="number" fullWidth value={formData.price} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField id="deposit" label="Acconto (€)" name="deposit" type="number" fullWidth value={formData.deposit} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {jobToEdit && jobToEdit.id ? (
          <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<DeleteIcon />}>
            Elimina
          </Button>
        ) : (
          <Box />
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleSafeClose} color="inherit">Annulla</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />}>Salva</Button>
        </Box>
      </DialogActions>

      <Modal
        open={mapOpen}
        onClose={() => {
          setMapOpen(false);
          requestAnimationFrame(() => lastFocusedRef.current?.blur());
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 900,
          height: '50vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          outline: 'none'
        }}>
          <MapContainer center={[41.9028, 12.4964]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </Box>
      </Modal>
    </Dialog>
  );
}

export default JobModal;
