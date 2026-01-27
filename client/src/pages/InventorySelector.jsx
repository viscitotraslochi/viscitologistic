// ⚠️ COMPONENTE 1:1 estratto da Home.jsx_OLD
// Gestisce SOLO la sezione "Cosa Trasportiamo?" senza alcuna modifica

import {
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  TextField
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HandymanIcon from '@mui/icons-material/Handyman';

// ⚠️ QUICK_ITEMS identici all'originale
const QUICK_ITEMS = [
  "Scatola", "Frigorifero", "Lavatrice", "Divano", "Tavolo",
  "Sedia", "Letto Matr.", "Letto Sing.", "Armadio", "Comodino",
  "Comò", "Televisore", "Lavastoviglie", "Poltrona", "Scarpiera"
];

export default function InventorySelector({ inventoryList, setInventoryList, formData, setFormData }) {

  const handleAddItem = (itemName) => {
    const name = itemName?.trim();
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
  };

  const handleRemoveItem = (itemName) => {
    setInventoryList(prev => {
      const existing = prev.find(i => i.name === itemName);
      if (!existing) return prev;
      if (existing.qty > 1) {
        return prev.map(i =>
          i.name === itemName ? { ...i, qty: i.qty - 1 } : i
        );
      }
      return prev.filter(i => i.name !== itemName);
    });
  };

  return (
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

      {/* CHIP RAPIDI */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {QUICK_ITEMS.map((item) => (
          <Chip
            key={item}
            label={item}
            onClick={() => handleAddItem(item)}
            icon={<AddCircleOutlineIcon />}
            clickable
            sx={{
              bgcolor: 'white',
              border: '1px solid #ddd',
              '&:hover': { bgcolor: '#e3f2fd', borderColor: '#2196f3' }
            }}
          />
        ))}
      </Box>

      {/* LISTA OGGETTI */}
      {inventoryList.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 300, overflowY: 'auto' }}>
          {inventoryList.map((item) => (
            <Paper
              key={item.name}
              elevation={0}
              sx={{
                p: 1.5,
                border: '1px solid #bbdefb',
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography fontWeight="bold">{item.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => handleRemoveItem(item.name)} color="error">
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.qty}</Typography>
                <IconButton size="small" onClick={() => handleAddItem(item.name)} color="primary">
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* TESTO LIBERO */}
      <TextField
        id="inventario"
        name="inventario"
        label="Descrizione extra / Misure / Lista completa"
        fullWidth
        multiline
        rows={3}
        value={formData.inventario || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, inventario: e.target.value }))}
        helperText="La lista selezionata sopra verrà inclusa automaticamente."
        sx={{ mb: 3 }}
      />
    </Paper>
  );
}
