import React, { useState, useEffect, useRef } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box, 
    Typography, Paper, Divider, Chip, Modal, Autocomplete
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

// --- Pulsanti rapidi a vista ---
const QUICK_ITEMS = [
    "Lavastoviglie", "Asciugatrice", "Forno", "Microonde", "Piano Cottura", 
	"Divano Angolare", "Chaise Longue", "Pouf", "Tappeto", "Specchio Bagno", 
	"Mobile Bagno", "Scarpiera", "Appendiabiti", "Bicicletta", "Tapis Roulant", 
	"Pesi", "Valigia", "Quadro", "Vaso", "Lampadario", "Pianta", "Scatola Libri"
];

// --- Lista completa per Autocomplete ---
const EXTENDED_ITEMS = [
    ...QUICK_ITEMS,
    "Specchio Bagno", "Mobile Bagno", "Scarpiera", "Appendiabiti",
    "Bicicletta", "Tapis Roulant", "Pesi", "Valigia",
    "Quadro", "Vaso", "Lampadario", "Pianta", "Scatola Libri"
];

function JobModal({ open, onClose, onJobAdded, jobToEdit, selectedDate }) {
    const lastFocusedRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        cliente_nome: '',
        phone: '',
        email: '',
        da_indirizzo: '',
        a_indirizzo: '',
        items: '',
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
		// Gestisce sia stringhe dirette che oggetti dall'autocomplete
		const name = (typeof itemName === 'string' ? itemName : itemName?.label)?.trim();
		
		if (!name) return;

		setInventoryList(prev => {
			const existing = prev.find(i => i.name.toLowerCase() === name.toLowerCase());
			if (existing) {
				return prev.map(i => i.name.toLowerCase() === name.toLowerCase() ? { ...i, qty: i.qty + 1 } : i);
			} else {
				return [...prev, { name: name, qty: 1 }];
			}
		});

		// Reset immediato
		setInputValue('');
	};

    const handleRemoveItem = (itemName) => {
        setInventoryList(prev => {
            const existing = prev.find(i => i.name === itemName);
            if (!existing) return prev;
            if (existing.qty === 1) {
                return prev.filter(i => i.name !== itemName);
            } else {
                return prev.map(i => i.name === itemName ? { ...i, qty: i.qty - 1 } : i);
            }
        });
    };

    // Sincronizza inventoryList -> formData.items
    useEffect(() => {
		const textString = inventoryList.map(item => `${item.name} x${item.qty}`).join(', ');
		setFormData(prev => ({ ...prev, items: textString }));
	}, [inventoryList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                        setMapOpen(false);
                    }
                } catch (error) { console.error("Errore mappa:", error); }
            },
        });
        return null;
    }

    useEffect(() => {
        if (jobToEdit) {
            let startObj;
            if (jobToEdit.start) {
                startObj = new Date(jobToEdit.start);
            } else if (jobToEdit.date) {
                const time = jobToEdit.time || '09:00';
                startObj = new Date(`${jobToEdit.date}T${time}`);
            } else {
                startObj = new Date();
            }

            let endObj;
            if (jobToEdit.end) {
                endObj = new Date(jobToEdit.end);
            } else if (jobToEdit.end_date) {
                const timeStr = jobToEdit.end_time || '10:00';
                endObj = new Date(`${jobToEdit.end_date}T${timeStr}`);
            } else {
                endObj = new Date(startObj.getTime() + 60 * 60 * 1000);
            }

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

            const itemsString = getVal(['items', 'inventario']) || '';
            // Tenta di ricostruire la lista inventario dalla stringa per l'editing
            if (itemsString) {
                const reconstructed = itemsString.split(', ').map(s => {
                    const parts = s.split(' x');
                    return { name: parts[0], qty: parseInt(parts[1]) || 1 };
                }).filter(i => i.name);
                setInventoryList(reconstructed);
            } else {
                setInventoryList([]);
            }

            setFormData({
                title: jobToEdit.title || '',
                cliente_nome: getVal(['cliente_nome', 'title']),
                phone: getVal(['phone', 'telefono']),
                email: getVal(['email', 'mail']),
                da_indirizzo: getVal(['da_indirizzo', 'partenza']),
                a_indirizzo: getVal(['a_indirizzo', 'destinazione']),
                items: itemsString,
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
                title: '', cliente_nome: '', phone: '', email: '', da_indirizzo: '', a_indirizzo: '',
                items: '', notes: '', price: '', deposit: '', piano_partenza: '0',
                ascensore_partenza: 'NO', piano_arrivo: '0', ascensore_arrivo: 'NO',
                startDate: baseDate, startTime: '09:00', endDate: baseDate, endTime: '10:00'
            });
        }
    }, [jobToEdit, open, selectedDate]);

    const handleSubmit = async () => {
        const payload = {
            cliente_nome: formData.cliente_nome || formData.title || '',
            phone: formData.phone || '',
            email: formData.email || '',
            da_indirizzo: formData.da_indirizzo || '',
            a_indirizzo: formData.a_indirizzo || '',
            date: formData.startDate,
            time: formData.startTime,
            end_date: formData.endDate,
            end_time: formData.endTime,
            price: formData.price || 0,
            deposit: formData.deposit || 0,
            piano_partenza: formData.piano_partenza || 0,
            piano_arrivo: formData.piano_arrivo || 0,
            ascensore_partenza: formData.ascensore_partenza === 'SI',
            ascensore_arrivo: formData.ascensore_arrivo === 'SI',
            items: formData.items || '',
            notes: formData.notes || ''
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
                onJobAdded(); onClose();
            } catch (error) { alert("Errore eliminazione."); }
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
                        <TextField id="da_indirizzo" label="Partenza" name="da_indirizzo" fullWidth value={formData.da_indirizzo} onChange={handleChange}
                            InputProps={{
                                endAdornment: (<IconButton onClick={(e) => {
                                    lastFocusedRef.current = e.currentTarget;
                                    e.currentTarget.blur();
                                    setCurrentMapField('da_indirizzo'); setMapOpen(true);
                                }}><MapIcon color="primary" /></IconButton>)
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField select label="Piano" name="piano_partenza" value={formData.piano_partenza} onChange={handleChange} fullWidth size="small" SelectProps={{ native: true }}>
                                {Array.from({ length: 16 }, (_, i) => <option key={i} value={i}>{i === 0 ? 'Piano Terra' : `Piano ${i}`}</option>)}
                            </TextField>
                            <TextField select label="Ascensore" name="ascensore_partenza" value={formData.ascensore_partenza} onChange={handleChange} fullWidth size="small" SelectProps={{ native: true }}>
                                <option value="SI">Ascensore: SI</option>
                                <option value="NO">Ascensore: NO</option>
                            </TextField>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField id="a_indirizzo" label="Destinazione" name="a_indirizzo" fullWidth value={formData.a_indirizzo} onChange={handleChange}
                            InputProps={{
                                endAdornment: (<IconButton onClick={(e) => {
                                    lastFocusedRef.current = e.currentTarget;
                                    e.currentTarget.blur();
                                    setCurrentMapField('a_indirizzo'); setMapOpen(true);
                                }}><MapIcon color="primary" /></IconButton>)
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField select label="Piano" name="piano_arrivo" value={formData.piano_arrivo} onChange={handleChange} fullWidth size="small" SelectProps={{ native: true }}>
                                {Array.from({ length: 16 }, (_, i) => <option key={i} value={i}>{i === 0 ? 'Piano Terra' : `Piano ${i}`}</option>)}
                            </TextField>
                            <TextField select label="Ascensore" name="ascensore_arrivo" value={formData.ascensore_arrivo} onChange={handleChange} fullWidth size="small" SelectProps={{ native: true }}>
                                <option value="SI">Ascensore: SI</option>
                                <option value="NO">Ascensore: NO</option>
                            </TextField>
                        </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Pianificazione</Typography>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ mb: 1 }}><Typography variant="caption" fontWeight="bold" color="primary">INIZIO</Typography></Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField type="date" name="startDate" value={formData.startDate} onChange={handleChange} fullWidth size="small" />
                                        <TextField type="time" name="startTime" value={formData.startTime} onChange={handleChange} fullWidth size="small" />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ mb: 1 }}><Typography variant="caption" fontWeight="bold" color="error">FINE</Typography></Box>
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
									<Chip key={item} label={item} onClick={() => handleAddItem(item)} clickable sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }} />
								))}
							</Box>

							<Divider sx={{ my: 2 }} />

							{/* INPUT AUTOCOMPLETE + BOTTONE AGGIUNGI */}
							<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
								<Autocomplete
									freeSolo
									disablePortal // <--- FONDAMENTALE: evita che la lista finisca sotto il Dialog
									openOnFocus   // <--- Fa apparire la lista appena clicchi
									options={EXTENDED_ITEMS}
									
									// Gestione del testo scritto
									inputValue={inputValue}
									onInputChange={(event, newInputValue) => {
										setInputValue(newInputValue);
									}}

									// Gestione della selezione dalla lista
									onChange={(event, newValue) => {
										if (newValue) {
											handleAddItem(newValue);
											// Forza il reset del testo dopo la selezione
											setTimeout(() => setInputValue(''), 0);
										}
									}}
									
									// Migliora l'usabilità mobile
									blurOnSelect={true} 

									renderInput={(params) => (
										<TextField
											{...params}
											label="Cerca o scrivi oggetto..."
											size="small"
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
									sx={{ minWidth: '48px', p: 0 }}
								>
									<AddCircleOutlineIcon />
								</Button>
							</Box>

							<Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
								INVENTARIO CORRENTE:
							</Typography>

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

							<TextField 
								label="Riepilogo (Auto-generato)" 
								fullWidth 
								multiline 
								minRows={2} 
								value={formData.items} 
								sx={{ mt: 2, bgcolor: '#f5f5f5' }} 
								slotProps={{ input: { readOnly: true } }} 
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
                {jobToEdit && jobToEdit.id ? <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<DeleteIcon />}>Elimina</Button> : <Box />}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={handleSafeClose} color="inherit">Annulla</Button>
                    <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />}>Salva</Button>
                </Box>
            </DialogActions>

            <Modal open={mapOpen} onClose={() => { setMapOpen(false); requestAnimationFrame(() => lastFocusedRef.current?.blur()); }} disableAutoFocus disableEnforceFocus disableRestoreFocus>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: 900, height: '50vh', bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, outline: 'none' }}>
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