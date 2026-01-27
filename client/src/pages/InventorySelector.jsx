import { Box, Chip, Paper, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const QUICK_ITEMS = ['Scatola', 'Divano', 'Letto', 'Armadio', 'Tavolo'];

export default function InventorySelector({ inventory, setInventory }) {
  const addItem = (name) => {
    setInventory((prev) => {
      const found = prev.find((i) => i.name === name);
      return found
        ? prev.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { name, qty: 1 }];
    });
  };

  const removeItem = (name) => {
    setInventory((prev) => {
      const found = prev.find((i) => i.name === name);
      if (!found) return prev;
      return found.qty > 1
        ? prev.map((i) => (i.name === name ? { ...i, qty: i.qty - 1 } : i))
        : prev.filter((i) => i.name !== name);
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {QUICK_ITEMS.map((item) => (
          <Chip
            key={item}
            label={item}
            icon={<AddCircleOutlineIcon />}
            onClick={() => addItem(item)}
          />
        ))}
      </Box>

      {inventory.map((item) => (
        <Paper key={item.name} sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{item.name}</Typography>
          <Box>
            <IconButton onClick={() => removeItem(item.name)}>
              <RemoveCircleOutlineIcon />
            </IconButton>
            <Typography component="span" mx={1}>
              {item.qty}
            </Typography>
            <IconButton onClick={() => addItem(item.name)}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
