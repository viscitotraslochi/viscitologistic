import { Box, Paper, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import InventorySelector from './InventorySelector';

export default function QuoteForm() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ nome: '', telefono: '', inventario: '' });

  useEffect(() => {
    const text = inventory.map((i) => `${i.name} x${i.qty}`).join(', ');
    setForm((f) => ({ ...f, inventario: text }));
  }, [inventory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
	<Box
	  sx={{
		minHeight: '100vh',
		scrollSnapAlign: 'start',
		py: 8
	  }}
	>
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Nome" name="nome" value={form.nome} onChange={handleChange} />
          <TextField fullWidth label="Telefono" name="telefono" value={form.telefono} onChange={handleChange} sx={{ mt: 2 }} />

          <InventorySelector inventory={inventory} setInventory={setInventory} />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Inventario"
            name="inventario"
            value={form.inventario}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Invia Richiesta
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
