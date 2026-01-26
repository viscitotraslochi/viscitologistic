import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Alert, InputAdornment, IconButton, Box 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../api/axiosConfig';

function ChangePasswordModal({ open, onClose, user }) {
    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (prop) => (event) => {
        setPasswords({ ...passwords, [prop]: event.target.value });
    };

    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });

        // Validazioni base
        if (!passwords.old || !passwords.new) {
             setMessage({ type: 'error', text: 'Compila tutti i campi' });
             return;
        }
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Le nuove password non coincidono' });
            return;
        }
        if (passwords.new.length < 6) {
            setMessage({ type: 'error', text: 'La password deve essere almeno di 6 caratteri' });
            return;
        }

        try {
            // Chiamata al server
            await api.put('/change-password', {
                userId: user.id, 
                oldPassword: passwords.old,
                newPassword: passwords.new
            });
            
            setMessage({ type: 'success', text: 'Password aggiornata! Chiudo...' });
            
            // Pulisce e chiude dopo 1.5 secondi
            setTimeout(() => {
                onClose();
                setPasswords({ old: '', new: '', confirm: '' });
                setMessage({ type: '', text: '' });
            }, 1500);

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Errore durante l\'aggiornamento' });
        }
    };

    // Helper per mostrare i campi password
    const renderInput = (label, prop) => (
        <TextField
            margin="dense"
            label={label}
            type={showPass ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwords[prop]}
            onChange={handleChange(prop)}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                            {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{ mb: 2 }}
        />
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                Cambia Password
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ mt: 1 }}>
                    {message.text && (
                        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
                    )}
                    {renderInput("Vecchia Password", "old")}
                    {renderInput("Nuova Password", "new")}
                    {renderInput("Conferma Nuova Password", "confirm")}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                <Button onClick={onClose} color="inherit">Annulla</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disableElevation>
                    Aggiorna Password
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChangePasswordModal;