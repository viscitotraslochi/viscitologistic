import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import itLocale from '@fullcalendar/core/locales/it.js';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import api from '../api/axiosConfig';
import { 
    Paper, Typography, Box, Button, useMediaQuery, useTheme, Tooltip, Chip, Divider, Card, CardContent, ToggleButton, ToggleButtonGroup
} from '@mui/material';

// --- ICONE ---
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; 
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; 
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home'; 
import LocationOnIcon from '@mui/icons-material/LocationOn'; 
import PhoneIcon from '@mui/icons-material/Phone';
import InventoryIcon from '@mui/icons-material/Inventory';
import NoteIcon from '@mui/icons-material/Note';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import JobModal from './JobModal';

function CalendarView() {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
    const [typeFilter, setTypeFilter] = useState('all'); // all | sopralluogo | trasloco
    
    const calendarRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentView, setCurrentView] = useState(isMobile ? 'listWeek' : 'dayGridMonth');

    // --- 1. GESTIONE CAMBIO VISTA AUTOMATICO ---
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (isMobile) {
                calendarApi.changeView('listWeek');
            } else {
                calendarApi.changeView('dayGridMonth');
            }
        }
    }, [isMobile]);

    const fetchJobs = async () => {
		try {
			const response = await api.get('/jobs');
			const formattedEvents = response.data.map(job => {
				
				// Funzione interna per formattare senza errori di fuso orario
				const formatToISODate = (dateInput) => {
					if (!dateInput) return null;
					const d = new Date(dateInput);
					// sv-SE restituisce YYYY-MM-DD, evitando i problemi di toISOString()
					return d.toLocaleDateString('sv-SE'); 
				};

				const dateStr = formatToISODate(job.date);
				const endDateStr = job.end_date ? formatToISODate(job.end_date) : null;

				return {
					id: job.id,
					title: job.cliente_nome || 'Lavoro', 
					// FullCalendar vuole: YYYY-MM-DDTHH:mm:ss
					start: `${dateStr}T${job.time}`,
					end: (endDateStr && job.end_time) ? `${endDateStr}T${job.end_time}` : null,
					
					extendedProps: { 
						...job,
						date: dateStr, // Fondamentale per il form del modale
						end_date: endDateStr
					},
					backgroundColor: job.deposit ? '#2e7d32' : (String(job.job_type || job.tipo_lavoro || job.tipo || '').toLowerCase() === 'sopralluogo' ? '#ffa000' : '#1976d2')
				};
			});
			setEvents(formattedEvents);
		} catch (error) {
			console.error("Errore caricamento lavori:", error);
		}
	};

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDateClick = (arg) => {
		setSelectedJob(null);
		setSelectedDate(arg.dateStr); // YYYY-MM-DD
		setIsModalOpen(true);
	};

    const handleEventClick = (info) => {
        setSelectedJob(info.event.extendedProps);
        setIsModalOpen(true);
    };

    // --- RENDER CUSTOM DELL'EVENTO ---
    const renderEventContent = (eventInfo) => {
        const { extendedProps } = eventInfo.event;
        const { view } = eventInfo;
        
        const isCompleted = extendedProps.completato;
        
        // Colori base
        const jobType = String(extendedProps.job_type || extendedProps.tipo_lavoro || extendedProps.tipo || '').toLowerCase();
        const baseColor = jobType === 'sopralluogo' ? '#ef6c00' : '#1565c0';
        const mainColor = isCompleted ? '#2e7d32' : baseColor;
        const bgColor = isCompleted ? '#e8f5e9' : (jobType === 'sopralluogo' ? '#fff3e0' : '#e3f2fd');

        // --- CALCOLO ORA E DURATA ---
        let durationLabel = '24h'; 
        let startTime = '';
        let endTime = '';

        if (!eventInfo.event.allDay) {
            // Formattazione manuale ore per avere controllo totale
            const startObj = eventInfo.event.start;
            const endObj = eventInfo.event.end;

            const formatTime = (date) => {
                if(!date) return '';
                return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            };

            startTime = formatTime(startObj);
            endTime = endObj ? formatTime(endObj) : '';
            
            if (endObj) {
                const diffMs = endObj - startObj;
                const diffHrs = Math.round(diffMs / (1000 * 60 * 60)); 
                durationLabel = diffHrs > 0 ? `${diffHrs}h` : '1h'; 
            } else {
                durationLabel = '1h';
            }
        }

        // --- CASO 1: VISTA GRIGLIA (Mese e Settimana - Rimane compatta) ---
        if (view.type === 'dayGridMonth' || view.type === 'timeGridWeek') {
        
    
    const visibleEvents = (typeFilter === 'all')
        ? events
        : events.filter(e => {
            const t = String(e.extendedProps?.job_type || e.extendedProps?.tipo_lavoro || e.extendedProps?.tipo || '').toLowerCase();
            return t === typeFilter;
        });

    return (
                <div style={{
                    backgroundColor: bgColor,
                    borderLeft: `4px solid ${mainColor}`,
                    padding: '2px 4px',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer',
                    fontSize: '0.80rem',
                    color: '#333',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <strong style={{ color: mainColor }}>{startTime || '24h'}</strong>
                    <span>{eventInfo.event.title}</span>
                </div>
            );
        }

        // --- CASO 2: VISTA LISTA (Desktop & Mobile - Cards Dettagliate) ---
        return (
            <Box sx={{ width: '100%', py: 1, px: isMobile ? 0 : 2 }}>
                <Paper 
                    elevation={0}
                    onClick={() => handleEventClick(eventInfo)}
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        border: '1px solid #e0e0e0',
                        borderLeft: `6px solid ${mainColor}`,
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                    }}
                >
                    {/* SEZIONE 1: ORARIO E DURATA (TIMELINE WIDGET) */}
                    <Box sx={{ 
                        width: isMobile ? '100%' : '130px', // Larghezza fissa su desktop per allineamento perfetto
                        bgcolor: bgColor, // Colore di sfondo soft (blu o verde chiaro)
                        display: 'flex', 
                        flexDirection: isMobile ? 'row' : 'column',
                        alignItems: 'center', 
                        justifyContent: isMobile ? 'space-between' : 'space-evenly', // Distribuisce lo spazio verticalmente
                        p: 2,
                        borderBottom: isMobile ? `1px solid ${mainColor}20` : 'none',
                        borderRight: isMobile ? 'none' : `1px solid ${mainColor}20`,
                        position: 'relative' // Per eventuali decorazioni future
                    }}>
                        
                        {/* A. ORARIO INIZIO */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ display: 'block', color: mainColor, fontWeight: 'bold', opacity: 0.7, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Inizio
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#102a43', lineHeight: 1, fontSize: isMobile ? '1.2rem' : '1.4rem' }}>
                                {startTime}
                            </Typography>
                        </Box>

                        {/* B. INDICATORE CENTRALE (FRECCIA E DURATA) */}
                        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                            {/* Freccia condizionale (Giù desktop, Destra mobile) */}
                            {isMobile ? 
                                <KeyboardArrowRightIcon sx={{ color: mainColor }} /> : 
                                <KeyboardArrowDownIcon sx={{ color: mainColor }} />
                            }
                            
                            {/* Badge Durata */}
                            <Chip 
                                label={durationLabel} 
                                size="small"
                                sx={{ 
                                    height: '24px',
                                    bgcolor: '#fff',
                                    color: mainColor,
                                    fontWeight: '800',
                                    fontSize: '0.75rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    border: `1px solid ${mainColor}30`
                                }} 
                            />

                            {isMobile ? 
                                <KeyboardArrowRightIcon sx={{ color: mainColor }} /> : 
                                <KeyboardArrowDownIcon sx={{ color: mainColor }} />
                            }
                        </Box>

                        {/* C. ORARIO FINE (Se presente) */}
                        {endTime ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#102a43', lineHeight: 1, fontSize: isMobile ? '1.2rem' : '1.4rem' }}>
                                    {endTime}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: mainColor, fontWeight: 'bold', opacity: 0.7, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Fine
                                </Typography>
                            </Box>
                        ) : (
                            // Placeholder se non c'è orario di fine per mantenere l'allineamento
                            <Box sx={{ height: isMobile ? 'auto' : '42px' }} />
                        )}
                    </Box>

                    {/* SEZIONE 2: INFO CLIENTE E LOGISTICA DETTAGLIATA */}
                    <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#102a43', lineHeight: 1.2 }}>
                                {eventInfo.event.title}
                            </Typography>
                            {(() => {
                                const t = String(extendedProps.job_type || extendedProps.tipo_lavoro || extendedProps.tipo || '').toLowerCase();
                                if (!t) return null;
                                const label = t === 'sopralluogo' ? 'Sopralluogo' : 'Trasloco';
                                return (
                                    <Chip
                                        size="small"
                                        label={label}
                                        sx={{ fontWeight: 800, bgcolor: '#fff', border: `1px solid ${mainColor}40`, color: mainColor }}
                                    />
                                );
                            })()}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {extendedProps.items && (
                                    <Tooltip title="Inventario presente">
                                        <InventoryIcon sx={{ fontSize: 20, color: '#78909c' }} />
                                    </Tooltip>
                                )}
                                {extendedProps.notes && (
                                    <Tooltip title="Note presenti">
                                        <NoteIcon sx={{ fontSize: 20, color: '#ffa000' }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {/* PARTENZA CON DETTAGLI PULITI */}
                            {extendedProps.da_indirizzo && (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HomeIcon sx={{ fontSize: 18, color: '#90a4ae' }} />
                                        <Typography variant="body2" sx={{ color: '#546e7a', fontWeight: 600 }}>
                                            {extendedProps.da_indirizzo}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Visualizza solo le colonne DB */}
                                    <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: '500', display: 'block', ml: 3.5, mt: 0.2 }}>
                                        Piano: {extendedProps.piano_partenza ?? '-'} • Ascensore: {
                                            (String(extendedProps.ascensore_partenza).toLowerCase() === 'true' || 
                                             String(extendedProps.ascensore_partenza) === '1' || 
                                             String(extendedProps.ascensore_partenza).toLowerCase() === 'sì') ? 'SÌ' : 'NO'
                                        }
                                    </Typography>
                                </Box>
                            )}

                            {/* ARRIVO CON DETTAGLI PULITI */}
                            {extendedProps.a_indirizzo && (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOnIcon sx={{ fontSize: 18, color: mainColor }} />
                                        <Typography variant="body2" sx={{ color: '#263238', fontWeight: 700 }}>
                                            {extendedProps.a_indirizzo}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Visualizza solo le colonne DB */}
                                    <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: '500', display: 'block', ml: 3.5, mt: 0.2 }}>
                                        Piano: {extendedProps.piano_arrivo ?? '-'} • Ascensore: {
                                            (String(extendedProps.ascensore_arrivo).toLowerCase() === 'true' || 
                                             String(extendedProps.ascensore_arrivo) === '1' || 
                                             String(extendedProps.ascensore_arrivo).toLowerCase() === 'sì') ? 'SÌ' : 'NO'
                                        }
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* --- INIZIO SEZIONE PULSANTI FIXATA --- */}
                    {/* Definiamo prima le variabili per sicurezza */}
                    {(() => {
                        // Cerca "telefono" (dal DB) oppure "phone" (se mappato in inglese)
                        const rawPhone = extendedProps.telefono || extendedProps.phone; 
                        const rawEmail = extendedProps.email;
                        
                        return (
                            <Box sx={{ 
                                p: 2, 
                                display: 'flex', 
                                flexDirection: isMobile ? 'row' : 'column',
                                gap: 1.5,
                                justifyContent: 'center',
                                borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
                                borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
                                bgcolor: '#fff', 
                                minWidth: '150px'
                            }}>
                                
                                {/* 1. Pulsante Chiama */}
                                {rawPhone && (
                                    <Button 
                                        variant="contained"
                                        startIcon={<PhoneIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `tel:${rawPhone}`;
                                        }}
                                        fullWidth
                                        disableElevation
                                        sx={{ 
                                            bgcolor: '#e3f2fd',
                                            color: '#1565c0',
                                            fontWeight: '700', 
                                            textTransform: 'none',  
                                            borderRadius: 2,
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': { bgcolor: '#bbdefb', color: '#0d47a1' }
                                        }}
                                    >
                                        Chiama
                                    </Button>
                                )}

                                {/* 2. Pulsante WhatsApp */}
                                {rawPhone && (
                                    <Button 
                                        variant="contained" 
                                        startIcon={<WhatsAppIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Pulisce il numero per WhatsApp (toglie spazi, +, ecc)
                                            const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
                                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                        }}
                                        fullWidth
                                        disableElevation
                                        sx={{ 
                                            bgcolor: '#e8f5e9',
                                            color: '#2e7d32',
                                            fontWeight: '700', 
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' }
                                        }}
                                    >
                                        WhatsApp
                                    </Button>
                                )}

                                {/* 3. Pulsante Email */}
                                {rawEmail && (
                                    <Button 
                                        variant="contained" 
                                        startIcon={<EmailIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:${rawEmail}`;
                                        }}
                                        fullWidth
                                        disableElevation
                                        sx={{ 
                                            bgcolor: '#eceff1',
                                            color: '#455a64',
                                            fontWeight: '700', 
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': { bgcolor: '#cfd8dc', color: '#263238' }
                                        }}
                                    >
                                        Email
                                    </Button>
                                )}
                            </Box>
                        );
                    })()}
                    {/* --- FINE SEZIONE PULSANTI --- */}
                </Paper>
            </Box>
        );
    };


    const filteredEvents = typeFilter === 'all'
        ? events
        : events.filter(ev => String(ev.extendedProps?.job_type || ev.extendedProps?.tipo_lavoro || ev.extendedProps?.tipo || '').toLowerCase() === typeFilter);
    return (
        <Paper elevation={0} sx={{ p: 0, height: '85vh', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
            
            {/* Header Pagina */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 2,
                    px: 1
                }}
            >
                <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h2"
                    sx={{ fontWeight: 800, color: '#102a43', lineHeight: 1.1 }}
                >
                    Calendario
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedJob(null);
                            setSelectedDate(null);
                            setIsModalOpen(true);
                        }}
                        fullWidth={isMobile}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            textTransform: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Nuovo Lavoro
                    </Button>

                    {/* Filtro visibile solo in vista Lista */}
                    {String(currentView || '').startsWith('list') && (
                        <ToggleButtonGroup
                            value={typeFilter}
                            exclusive
                            onChange={(e, v) => {
                                if (v) setTypeFilter(v);
                            }}
                            size="small"
                            fullWidth={isMobile}
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: 2,
                                flexWrap: 'wrap',
                                '& .MuiToggleButton-root': {
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    px: isMobile ? 1 : 1.5
                                }
                            }}
                        >
                            <ToggleButton value="all">Tutti</ToggleButton>
                            <ToggleButton value="sopralluogo">Sopralluoghi</ToggleButton>
                            <ToggleButton value="trasloco">Traslochi</ToggleButton>
                        </ToggleButtonGroup>
                    )}
                </Box>
            </Box>

            {/* Contenitore Calendario */}
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'hidden', 
                bgcolor: '#fff', 
                p: isMobile ? 0 : 2, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
            }}>
                <FullCalendar 
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ]}
                    locale={itLocale}
                    initialView={isMobile ? 'listWeek' : 'dayGridMonth'} 
                    slotMinTime="06:00:00"
                    slotMaxTime="21:00:00"
                    
                    headerToolbar={{
                        left: isMobile ? 'prev,next' : 'prev,next today',
                        center: 'title',
                        right: isMobile ? '' : 'dayGridMonth,timeGridWeek,listWeek'
                    }}
                    
                    buttonText={{ 
                        today: 'Oggi', 
                        month: 'Mese', 
                        week: 'Settimana', 
                        day: 'Giorno', 
                        list: 'Lista' 
                    }}
                    
                    events={filteredEvents}
                    height="100%"
                    datesSet={(arg) => setCurrentView(arg.view.type)}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent} 
                    dayMaxEvents={3}
                    allDayText="Tutto"
                    navLinks={!isMobile} 
                    listDayFormat={{ weekday: 'long', day: 'numeric', month: 'long' }} 
                    listDaySideFormat={false}
                />
            </Box>

            <JobModal 
				open={isModalOpen} 
				onClose={() => setIsModalOpen(false)} 
				onJobAdded={fetchJobs} 
				jobToEdit={selectedJob}
				selectedDate={selectedDate}
			/>
        </Paper>
    );
}

export default CalendarView;