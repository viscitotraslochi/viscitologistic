// ⚠️ MapDialog.jsx — VERSIONE DEFINITIVA 1:1 (100%)
// Estratto riga per riga da Home.jsx_OLD
// Nessuna modifica a logica, UX o comportamento

import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

// ⚠️ NOTA: leaflet.css deve essere importato UNA SOLA VOLTA in main.jsx / index.jsx

function LocationMarker({ currentField, setFormData, setMapOpen, setSuggestions }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      try {
        const response = await fetch(
          `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`
        );
        const data = await response.json();
        const address = data?.address?.Match_addr || 'Indirizzo non trovato';

        if (currentField) {
          setFormData(prev => ({ ...prev, [currentField]: address }));
          setMapOpen(false);
          if (setSuggestions) {
            setSuggestions({ da: [], a: [] });
          }
        }
      } catch (err) {
        console.error('Errore reverse geocoding:', err);
      }
    }
  });

  return null;
}

export default function MapDialog({
  mapOpen,
  setMapOpen,
  currentField,
  setFormData,
  setSuggestions
}) {
  return (
    <Dialog
      open={mapOpen}
      onClose={() => setMapOpen(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        Seleziona {currentField === 'da_indirizzo' ? 'Partenza' : 'Arrivo'} sulla mappa
        <IconButton onClick={() => setMapOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: 400 }}>
        <MapContainer
          center={[41.9028, 12.4964]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <LocationMarker
            currentField={currentField}
            setFormData={setFormData}
            setMapOpen={setMapOpen}
            setSuggestions={setSuggestions}
          />
        </MapContainer>
      </DialogContent>
    </Dialog>
  );
}
