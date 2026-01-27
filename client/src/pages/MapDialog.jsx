import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

function LocationMarker({ onSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const res = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`
      );
      const data = await res.json();
      onSelect(data.address?.Match_addr || 'Indirizzo non trovato');
    }
  });
  return null;
}

export default function MapDialog({ open, onClose, onSelect, title }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {title}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ height: 400, p: 0 }}>
        <MapContainer center={[41.9, 12.49]} zoom={6} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker onSelect={onSelect} />
        </MapContainer>
      </DialogContent>
    </Dialog>
  );
}
