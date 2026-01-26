import React, { useState, useEffect } from 'react';
import { 
    Paper, Typography, Box, Button, useMediaQuery, useTheme, Card, CardContent, Divider, Chip 
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import api from '../api/axiosConfig';
import JobModal from './JobModal';

function LeadsView() {
    const [leads, setLeads] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [processingLeadId, setProcessingLeadId] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            console.error("Errore caricamento leads:", error);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAccept = (lead) => {
		setProcessingLeadId(lead.id);

		// PREPARAZIONE DATA/ORA
		const dataTrasloco = lead.data_trasloco || new Date().toISOString().split('T')[0];
		let oraInizio = lead.ora_trasloco || '09:00';
		if (oraInizio.length === 4) oraInizio = '0' + oraInizio; 
		
		const startISO = `${dataTrasloco}T${oraInizio}`;

		// CREAZIONE OGGETTO PER IL MODALE
        // Passiamo ESATTAMENTE le colonne del DB.
		const jobDraft = {
			title: lead.cliente_nome || 'Nuovo Lavoro',
			start: startISO,
			extendedProps: {
				cliente_nome: lead.cliente_nome,
				phone: lead.telefono,
				email: lead.email,
				da_indirizzo: lead.da_indirizzo,
				a_indirizzo: lead.a_indirizzo,
				
                // Niente più split delle note! Usiamo le colonne.
				items: lead.items || lead.inventario, 
				notes: lead.note, 
				
				// LOGISTICA DA COLONNE DEDICATE
				piano_partenza: lead.piano_partenza,
				ascensore_partenza: lead.ascensore_partenza,
				piano_arrivo: lead.piano_arrivo,
				ascensore_arrivo: lead.ascensore_arrivo,

				price: lead.prezzo || lead.price || '', 
				deposit: lead.acconto || lead.deposit || ''
			}
		};

		setSelectedLead(jobDraft);
		setIsModalOpen(true);
	};

    const handleReject = async (id) => {
        if(!window.confirm("Sei sicuro di voler eliminare questa richiesta?")) return;
        try {
            await api.delete(`/leads/${id}`);
            fetchLeads();
        } catch (error) {
            console.error("Errore cancellazione:", error);
        }
    };

    const handleJobAdded = async () => {
		if (processingLeadId) {
			try {
				// 1. IMPORTANTE: Controlla se il backend accetta "status" o "stato"
				// Se nel DB la colonna è 'stato', usa: { stato: 'Pianificato' }
				await api.put(`/leads/${processingLeadId}`, { stato: 'Pianificato' });
				
				// 2. Ricarica i dati per confermare visivamente il cambio
				await fetchLeads(); 
			} catch (error) {
				console.error("Errore aggiornamento stato lead:", error);
			}
		}
		setIsModalOpen(false);
		setSelectedLead(null);
		setProcessingLeadId(null);
	};

    const renderLeadCard = (lead) => {
        
        // --- HELPER 1: Formattazione Ascensore ---
        const formatAscensore = (val) => {
            if (val === null || val === undefined || val === '') return 'NO';
            const s = String(val).toLowerCase();
            return (s === '1' || s === 'true' || s === 'sì' || s === 'si' || s === 'yes') ? 'SÌ' : 'NO';
        };

        // --- HELPER 2: Formattazione Data (DD/MM/YYYY) ---
        // (Questa è la parte che mancava nel tuo snippet per avere la data italiana)
        const formatDataIT = (dateStr) => {
            if (!dateStr) return 'Non specificata';
            // Se la data arriva come YYYY-MM-DD
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                // Invertiamo: Giorno/Mese/Anno
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }
            return dateStr; 
        };

        // --- DATI DIRETTI ---
        const pPart = lead.piano_partenza;
        const aPart = lead.ascensore_partenza;
        const pArr  = lead.piano_arrivo;
        const aArr  = lead.ascensore_arrivo;

        return (
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', borderRadius: 3,
              borderTop: lead.stato === 'Nuovo' ? 'none' : '1px solid #eee',
              opacity: lead.stato === 'Pianificato' ? 0.6 : 1
            }}
          >
            {lead.stato === 'Nuovo' && (
                <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 6, background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)' }} />
            )}

            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              {/* HEADER */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight="800" color="#102a43" sx={{ lineHeight: 1.2 }}>
                        {lead.cliente_nome}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {/* Aggiunto 'it-IT' per sicurezza */}
                        Ricevuto il: {new Date(lead.created_at || lead.data_creazione).toLocaleDateString('it-IT')}
                    </Box>
                </Box>
                {lead.stato === 'Nuovo' ? (
                    <Chip label="NUOVO" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                ) : lead.stato === 'Pianificato' ? (
                    <Chip label="PIANIFICATO" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} />
                ) : null}
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#f0f0f0' }} />

              {/* --- NUOVO BLOCCO: DATA E ORA RICHIESTE --- */}
              <Box sx={{ mb: 3, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ color: '#f57c00', mr: 1.5 }} />
                    <Box>
                        <Typography variant="caption" display="block" fontWeight="bold" color="#e65100" sx={{ lineHeight: 1 }}>
                            DATA RICHIESTA
                        </Typography>
                        {/* QUI APPLICHIAMO LA FORMATTAZIONE ITALIANA */}
                        <Typography variant="body1" fontWeight="700" color="#333">
                            {formatDataIT(lead.data_trasloco)}
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ width: '1px', height: '30px', bgcolor: '#ffcc80', mx: 1 }}></Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" display="block" fontWeight="bold" color="#e65100" sx={{ lineHeight: 1 }}>
                            ORA
                        </Typography>
                        <Typography variant="body1" fontWeight="700" color="#333">
                            {lead.ora_trasloco || '--:--'}
                        </Typography>
                    </Box>
                </Box>
              </Box>

               {/* CONTATTI */}
			  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
				
				<Box 
					component="a" 
					href={`tel:${lead.telefono}`} 
					sx={{ 
						display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', 
						p: 1, borderRadius: 2, transition: '0.2s',
						'&:hover': { bgcolor: '#e3f2fd' }
					}}
				>
					<Box sx={{ bgcolor: '#e3f2fd', p: 0.8, borderRadius: '50%', mr: 2, display: 'flex' }}>
						<PhoneIcon sx={{ fontSize: 20, color: '#1565c0' }} />
					</Box>
					<Typography variant="body2" fontWeight="600">{lead.telefono}</Typography>
				</Box>

				<Box 
					component="a" 
					href={`https://wa.me/${lead.telefono ? lead.telefono.replace(/[^0-9]/g, '') : ''}`} 
					target="_blank"
					rel="noopener noreferrer"
					sx={{ 
						display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', 
						p: 1, borderRadius: 2, transition: '0.2s',
						'&:hover': { bgcolor: '#e8f5e9' }
					}}
				>
					<Box sx={{ bgcolor: '#e8f5e9', p: 0.8, borderRadius: '50%', mr: 2, display: 'flex' }}>
						<WhatsAppIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
					</Box>
					<Typography variant="body2" fontWeight="600">Chat WhatsApp</Typography>
				</Box>

				<Box 
					component="a" 
					href={`mailto:${lead.email}`} 
					sx={{ 
						display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', 
						p: 1, borderRadius: 2, transition: '0.2s',
						'&:hover': { bgcolor: '#e8eaf6' }
					}}
				>
					<Box sx={{ bgcolor: '#e8eaf6', p: 0.8, borderRadius: '50%', mr: 2, display: 'flex' }}>
						<EmailIcon sx={{ fontSize: 20, color: '#283593' }} />
					</Box>
					<Typography variant="body2" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
						{lead.email || 'Nessuna email'}
					</Typography>
				</Box>

			  </Box>

              {/* INDIRIZZI E LOGISTICA */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                 {/* PARTENZA */}
                 <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <HomeIcon fontSize="small" sx={{ color: '#555', mr: 1, mt: 0.3 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">PARTENZA</Typography>
                        <Typography variant="body2" fontWeight="500" sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {lead.da_indirizzo || <span style={{color:'red'}}>Non specificato</span>}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: '500', display: 'block', mt: 0.3 }}>
                            Piano: {pPart ?? '-'} • Ascensore: {formatAscensore(aPart)}
                        </Typography>
                    </Box>
                 </Box>
                 
                 <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                 
                 {/* ARRIVO */}
                 <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOnIcon fontSize="small" color="error" sx={{ mr: 1, mt: 0.3 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">ARRIVO</Typography>
                        <Typography variant="body2" fontWeight="500" sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {lead.a_indirizzo || <span style={{color:'red'}}>Non specificato</span>}
                        </Typography>

                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: '500', display: 'block', mt: 0.3 }}>
                            Piano: {pArr ?? '-'} • Ascensore: {formatAscensore(aArr)}
                        </Typography>
                    </Box>
                 </Box>
              </Box>        

              {/* INVENTARIO */}
              {(lead.items || lead.inventario) && (
                <Box sx={{ mb: 2, p: 1.5, bgcolor: '#eef2f6', borderRadius: 2, borderLeft: '4px solid #1976d2' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <InventoryIcon sx={{ fontSize: 16, color: '#1976d2', mr: 1 }} />
                        <Typography variant="caption" fontWeight="bold" color="#1976d2">INVENTARIO:</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#333', fontSize: '0.85rem' }}>
                        {lead.items || lead.inventario}
                    </Typography>
                </Box>
              )}
			  
              {lead.note && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #ffc107' }}>
                      <Typography variant="caption" fontWeight="bold" color="#f57c00">NOTE:</Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#444', mt: 0.5 }}>
                        "{lead.note}"
                      </Typography>
                  </Box>
              )}

              {/* FOOTER BOTTONI */}
              <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: 1 }}>
                <Button 
                  variant="contained" fullWidth startIcon={<CalendarMonthIcon />} 
                  onClick={() => handleAccept(lead)}
                  disabled={lead.stato === 'Pianificato'} 
                  sx={{ 
                    py: 1.2, fontWeight: 'bold', borderRadius: 2, textTransform: 'none',
                    background: lead.stato === 'Pianificato' ? '#ccc' : 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)'
                  }}
                >
                  {lead.stato === 'Pianificato' ? 'Già Pianificato' : 'Accetta e Pianifica'}
                </Button>
                
                <Button variant="outlined" color="error" onClick={() => handleReject(lead.id)} sx={{ minWidth: '50px', borderRadius: 2 }}>
                  <DeleteIcon />
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
    }
	
	
    return (
        <Paper elevation={0} sx={{ p: isMobile ? 1 : 3, mt: 3, bgcolor: 'transparent' }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', pb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: '800', color: '#102a43', letterSpacing: '-0.5px' }}>
                    Richieste Web
                </Typography>
                <Chip label={leads.length} color="primary" sx={{ ml: 2, fontWeight: 'bold' }} />
            </Box>

            <Grid container spacing={3} alignItems="stretch">
              {leads.map((lead) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={lead.id} sx={{ height: '100%' }}>
                    {renderLeadCard(lead)}
                </Grid>
              ))}
            </Grid>

            <JobModal 
				open={isModalOpen} 
				onClose={() => {
					setIsModalOpen(false);
					setSelectedLead(null);
					setProcessingLeadId(null);
				}} 
				onJobAdded={handleJobAdded} 
				jobToEdit={selectedLead} 
			/>
        </Paper>
    );
}

export default LeadsView;