import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  TextField,
  Divider,
  Button,
  Autocomplete,
  createFilterOptions
} from '@mui/material';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HandymanIcon from '@mui/icons-material/Handyman';

const filter = createFilterOptions();

// --- Pulsanti rapidi a vista (identici al JobModal) ---
const QUICK_ITEMS=["Entrata","Parete att.","Camera","Cucina","Cameretta","Ripostiglio",
"Garage","Sottotetto","Bagno","Lavatrice","Asciugatrice","Scarpiera","Specchio",
"Pianoforte","Frigorifero","Tapis roulant","Piante","Scaffale","Divano 2p","Divano 3p",
"Divano chslg","Poltrona","Armadio","Madia","Lettino","Letto","Scrivania","Libreria",
"Piantana","Tavolo","Sedie","TV"
];


// --- Lista completa per Autocomplete (identica al JobModal) ---
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

export default function InventorySelector({ inventoryList, setInventoryList, formData, setFormData }) {
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const handleAddItem = (itemName) => {
	  const name = (typeof itemName === 'string' ? itemName : itemName)?.trim();
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

	  // ✅ RESET COMPLETO
	  setInputValue('');
	  setSelectedValue(null);
	};

  const handleRemoveItem = (itemName) => {
    setInventoryList(prev => {
      const existing = prev.find(i => i.name === itemName);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(i => i.name !== itemName);
      return prev.map(i => (i.name === itemName ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  // Sync inventoryList -> formData.items (come nel JobModal)
  useEffect(() => {
    const textString = (inventoryList || [])
      .map(item => `${item.name} x${item.qty}`)
      .join(', ');
    setFormData(prev => ({ ...prev, items: textString }));
  }, [inventoryList, setFormData]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HandymanIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#102a43' }}>
          Cosa Trasportiamo?
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Seleziona gli oggetti principali o descrivi il carico:
      </Typography>

      {/* QUICK CHIPS */}
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

      {/* AUTOCOMPLETE + BUTTON ADD */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%', mt: 1 }}>
        <Autocomplete
		  freeSolo
		  disablePortal
		  sx={{ flexGrow: 1 }}
		  options={EXTENDED_ITEMS}
		  value={selectedValue}          // ✅ CONTROLLED
		  inputValue={inputValue}
		  onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
		  onChange={(e, newValue) => {
			if (newValue) handleAddItem(newValue);
		  }}
		  renderInput={(params) => (
			<TextField
			  {...params}
			  label="Cerca o scrivi oggetto..."
			  size="small"
			  fullWidth
			  onKeyDown={(e) => {
				if (e.key === 'Enter') {
				  e.preventDefault();
				  handleAddItem(inputValue);
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

      {/* CURRENT INVENTORY */}
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
        INVENTARIO CORRENTE:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {(inventoryList || []).map((item) => (
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
                <IconButton
                  size="small"
                  color="primary"
                  aria-label={`Aggiungi ${item.name}`}
                  title={`Aggiungi ${item.name}`}
                  onClick={() => handleAddItem(item.name)}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* SUMMARY (read-only) */}
      <TextField
        label="Riepilogo (Auto-generato)"
        fullWidth
        multiline
        minRows={2}
        value={formData.items || ''}
        sx={{ mt: 2, bgcolor: '#f5f5f5' }}
        slotProps={{ input: { readOnly: true } }}
      />

      {/* EXTRA FREE TEXT (items_extra) */}
      <TextField
        id="items_extra"
        name="items_extra"
        label="Descrizione extra / Misure"
        fullWidth
        multiline
        rows={3}
        value={formData.items_extra || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, items_extra: e.target.value }))}
        helperText="Questa parte verrà aggiunta all'inventario."
        sx={{ mt: 2 }}
      />
    </Paper>
  );
}
