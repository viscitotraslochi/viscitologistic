require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const pgTypes = require('pg').types;

pgTypes.setTypeParser(1082, function(stringValue) {
  return stringValue; // Ritorna "2026-01-25" pulito
});

const pool = require('./db'); 
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTENTICAZIONE & UTENTI
// ==========================================

// LOGIN SICURO
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Utente non trovato" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Password errata" });
    }

    res.json({ 
        message: "Login effettuato!", 
        user: { 
            id: user.rows[0].id, 
            email: user.rows[0].email, 
            role: user.rows[0].role,
            username: user.rows[0].username
        } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore server" });
  }
});

// CAMBIO PASSWORD
app.put('/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Utente non trovato" });

    const user = userResult.rows[0];

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
        return res.status(401).json({ error: "La vecchia password non è corretta" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: "Password aggiornata con successo" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cambio password" });
  }
});

// ==========================================
// 2. GESTIONE JOBS (LAVORI/CALENDARIO)
// ==========================================

// GET: Prendi tutti i lavori
app.get('/jobs', async (req, res) => {
  try {
    const allJobs = await pool.query('SELECT * FROM jobs ORDER BY date ASC, time ASC');
    res.json(allJobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Errore nel recupero dei lavori" });
  }
});

// POST: Crea un nuovo lavoro
app.post('/jobs', async (req, res) => {
  try {
    const { 
      cliente_nome, phone, email, 
      da_indirizzo, a_indirizzo, 
      date, time, 
      // Aggiungiamo questi due campi che prima mancavano
      end_date, end_time, 
      
      price, deposit, 
      piano_partenza, ascensore_partenza,
      piano_arrivo, ascensore_arrivo,
      items, notes
    } = req.body;

    const newJob = await pool.query(
      `INSERT INTO jobs (
          cliente_nome, phone, email, 
          da_indirizzo, a_indirizzo, 
          date, time, 
          end_date, end_time,  -- <--- AGGIUNTO QUI
          price, deposit,
          piano_partenza, ascensore_partenza,
          piano_arrivo, ascensore_arrivo,
          items, notes
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
       RETURNING *`,
      [
        cliente_nome, phone, email, 
        da_indirizzo, a_indirizzo, 
        date, time, 
        end_date || date, // Se manca, usa la data di inizio
        end_time || null, // Se manca, mette NULL
        
        price || 0, deposit || 0,
        piano_partenza || null,
        ascensore_partenza || false,
        piano_arrivo || null,
        ascensore_arrivo || false,
        items || '',
        notes || ''
      ]
    );

    res.json(newJob.rows[0]);
  } catch (err) {
    console.error("Errore creazione Job:", err.message);
    res.status(500).json({ error: "Errore creazione lavoro" });
  }
});

// MODIFICA LAVORO ESISTENTE (PUT)
app.put('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    cliente_nome, phone, email, 
    da_indirizzo, a_indirizzo, 
    date, time, 
    end_date, end_time, 
    price, deposit, 
    piano_partenza, ascensore_partenza,
    piano_arrivo, ascensore_arrivo,
    items, notes
  } = req.body;

  try {
    const updateJob = await pool.query(
      `UPDATE jobs SET 
          cliente_nome = $1, phone = $2, email = $3, 
          da_indirizzo = $4, a_indirizzo = $5, 
          date = $6, time = $7, 
          end_date = $8, end_time = $9, 
          price = $10, deposit = $11,
          piano_partenza = $12, ascensore_partenza = $13,
          piano_arrivo = $14, ascensore_arrivo = $15,
          items = $16, notes = $17
       WHERE id = $18 RETURNING *`,
      [
        cliente_nome, phone, email, 
        da_indirizzo, a_indirizzo, 
        date, time, 
        end_date || date, 
        end_time || null, 
        price || 0, deposit || 0,
        piano_partenza || null,
        ascensore_partenza || false,
        piano_arrivo || null,
        ascensore_arrivo || false,
        items || '',
        notes || '',
        id
      ]
    );

    if (updateJob.rows.length === 0) {
        return res.status(404).json({ error: "Lavoro non trovato" });
    }

    res.json(updateJob.rows[0]);
  } catch (err) {
    console.error("Errore aggiornamento Job:", err.message);
    res.status(500).json({ error: "Errore aggiornamento lavoro" });
  }
});

// ELIMINA LAVORO (DELETE) - Ti mancava anche questa!
app.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteJob = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
    
    if (deleteJob.rows.length === 0) {
        return res.status(404).json({ error: "Lavoro non trovato" });
    }
    
    res.json({ message: "Lavoro eliminato con successo" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Errore cancellazione lavoro" });
  }
});

// ==========================================
// 3. LEADS (RICHIESTE WEB)
// ==========================================
app.get('/leads', async (req, res) => {
  try {
    // Recupera i lead ordinandoli dal più recente al più vecchio
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Errore recupero leads:", err);
    res.status(500).json({ error: "Errore recupero leads" });
  }
});

app.post('/leads', async (req, res) => {
  const { 
    cliente_nome, telefono, email, 
    da_indirizzo, a_indirizzo, 
    piano_partenza, ascensore_partenza, 
    piano_arrivo, ascensore_arrivo,
    items, note, data_trasloco, ora_trasloco
  } = req.body;

  // ==============================
  // HELPER: normalizza booleani
  // ==============================
  const normalizeBool = (val) => {
    if (val === true) return true;
    if (val === false) return false;
    if (val === undefined || val === null) return false;

    const s = String(val).toLowerCase().trim();
    return ['true','1','yes','y','si','sì','on','checked'].includes(s);
  };

  try {
    // ==============================
    // 1. SALVATAGGIO DATABASE
    // ==============================
    const newLead = await pool.query(
      `INSERT INTO leads (
          data_creazione, cliente_nome, telefono, email, 
          da_indirizzo, a_indirizzo, piano_partenza, ascensore_partenza, 
          piano_arrivo, ascensore_arrivo, items, note, data_trasloco, ora_trasloco
       ) VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [cliente_nome, telefono, email, da_indirizzo, a_indirizzo, piano_partenza, ascensore_partenza, piano_arrivo, ascensore_arrivo, items, note, data_trasloco, ora_trasloco]
    );

    const savedLead = newLead.rows[0];

    // ==============================
    // 2. INVIO EMAIL VIA MAILGUN
    // ==============================
    const badgePartenza = normalizeBool(ascensore_partenza) ? "✅ Ascensore" : "❌ No Ascensore";
    const badgeArrivo = normalizeBool(ascensore_arrivo) ? "✅ Ascensore" : "❌ No Ascensore";

    const html = `
      <p>Nuovo preventivo da: ${cliente_nome}</p>
      <p>Email: ${email} | Telefono: ${telefono}</p>
      <p>Partenza: ${da_indirizzo} - Piano: ${piano_partenza} - ${badgePartenza}</p>
      <p>Arrivo: ${a_indirizzo} - Piano: ${piano_arrivo} - ${badgeArrivo}</p>
      <p>Note: ${note || '-'}</p>
      <p>Inventario: ${items || '-'}</p>
      <p>Data trasloco: ${data_trasloco || '-'} | Ora: ${ora_trasloco || '-'}</p>
    `;

    // chiamiamo la funzione centralizzata
    const inviaEmail = require('./email');
    await inviaEmail(process.env.EMAIL_DESTINATARIO, `🚚 Nuovo Preventivo: ${cliente_nome}`, html);

    res.json(savedLead);

  } catch (err) {
    console.error("❌ ERRORE SERVER:", err);
    res.status(500).json({ error: "Errore nel salvataggio o invio email" });
  }
});



app.put('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;
  try {
    await pool.query('UPDATE leads SET stato = $1 WHERE id = $2', [stato, id]);
    res.json({ message: "Stato aggiornato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiornamento lead" });
  }
});

app.delete('/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    res.json({ message: "Richiesta eliminata" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cancellazione richiesta" });
  }
});

// ==========================================
// 4. GESTIONE VEICOLI
// ==========================================

// GET VEICOLI
app.get('/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY targa ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore recupero veicoli" });
  }
});

// AGGIUNGI VEICOLO
app.post('/vehicles', async (req, res) => {
  const { targa, modello, scadenza_assicurazione, scadenza_revisione, km_attuali, note } = req.body;
  try {
    const newVehicle = await pool.query(
      `INSERT INTO vehicles (targa, modello, scadenza_assicurazione, scadenza_revisione, km_attuali, note) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [targa, modello, scadenza_assicurazione, scadenza_revisione, km_attuali || 0, note]
    );
    res.json(newVehicle.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiunta veicolo" });
  }
});

// ELIMINA VEICOLO
app.delete('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.json({ message: "Veicolo eliminato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cancellazione veicolo" });
  }
});

// ==========================================
// 5. Email Sender
// ==========================================

const inviaEmail = require('./email');

app.post('/contatto', async (req, res) => {
  const { nome, email, messaggio } = req.body;

  try {
    await inviaEmail(
      process.env.EMAIL_DESTINATARIO,
      `Nuovo messaggio da ${nome}`,
      `<p>Email: ${email}</p><p>Messaggio: ${messaggio}</p>`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Errore invio email' });
  }
});

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});