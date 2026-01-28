require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const bcrypt = require('bcrypt');
const { preventivoEmailTemplate } = require('./emailTemplates');
const inviaEmail = require('./email');

const pool = require('./db'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Utils
const normalizeBool = val => ['true','1','yes','y','si','sì','on','checked'].includes(String(val).toLowerCase().trim());
// Normalizza tipo lavoro: trasloco | sopralluogo
const normalizeJobType = (val) => {
  const v = String(val || '').toLowerCase().trim();
  if (v === 'sopralluogo' || v === 'sopralluoghi') return 'sopralluogo';
  if (v === 'trasloco' || v === 'traslochi') return 'trasloco';
  return null;
};

// ==========================================
// 1. AUTENTICAZIONE & UTENTI
// ==========================================

// LOGIN SICURO
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: "Email e password obbligatorie" });

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) return res.status(401).json({ error: "Utente non trovato" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(401).json({ error: "Password errata" });

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
  if(!userId || !oldPassword || !newPassword) return res.status(400).json({ error: "Tutti i campi sono obbligatori" });

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Utente non trovato" });

    const user = userResult.rows[0];
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return res.status(401).json({ error: "La vecchia password non è corretta" });

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
// 2. GESTIONE JOBS
// ==========================================

// GET: Tutti i lavori (con filtro opzionale per tipo)
app.get('/jobs', async (req, res) => {
  // accetta: ?type=trasloco|sopralluogo oppure ?job_type=...
  const typeParam = req.query.type ?? req.query.job_type;
  const jobType = normalizeJobType(typeParam);

  try {
    if (jobType) {
      const filtered = await pool.query(
        'SELECT * FROM jobs WHERE job_type = $1 ORDER BY date ASC, time ASC',
        [jobType]
      );
      return res.json(filtered.rows);
    }

    const allJobs = await pool.query('SELECT * FROM jobs ORDER BY date ASC, time ASC');
    res.json(allJobs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei lavori" });
  }
});
// POST: Crea nuovo lavoro
app.post('/jobs', async (req, res) => {
  const {
    cliente_nome, phone, email,
    da_indirizzo, a_indirizzo,
    date, time,
    end_date, end_time,
    price, deposit,
    piano_partenza, ascensore_partenza,
    piano_arrivo, ascensore_arrivo,
    items, notes,
    job_type
  } = req.body;

  if(!cliente_nome || !da_indirizzo || !a_indirizzo || !date) return res.status(400).json({ error: "Campi obbligatori mancanti" });

  try {
    const newJob = await pool.query(
      `INSERT INTO jobs (
        cliente_nome, phone, email,
        da_indirizzo, a_indirizzo,
        date, time, end_date, end_time,
        price, deposit,
        piano_partenza, ascensore_partenza,
        piano_arrivo, ascensore_arrivo,
        items, notes,
        job_type
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [
        cliente_nome, phone, email,
        da_indirizzo, a_indirizzo,
        date, time,
        end_date || date,
        end_time || null,
        price || 0, deposit || 0,
        piano_partenza || null,
        normalizeBool(ascensore_partenza),
        piano_arrivo || null,
        normalizeBool(ascensore_arrivo),
        items || '',
        notes || '',
        normalizeJobType(job_type) || 'trasloco'
      ]
    );

    res.json(newJob.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore creazione lavoro" });
  }
});

// PUT: Modifica lavoro
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
    items, notes,
    job_type
  } = req.body;

  try {
    await pool.query(
      `UPDATE jobs SET 
        cliente_nome=$1, phone=$2, email=$3, da_indirizzo=$4, a_indirizzo=$5, 
        date=$6, time=$7, end_date=$8, end_time=$9, price=$10, deposit=$11, 
        piano_partenza=$12, ascensore_partenza=$13, piano_arrivo=$14, 
        ascensore_arrivo=$15, items=$16, notes=$17, job_type=$18 
      WHERE id=$19`,
      [
        cliente_nome, phone, email, da_indirizzo, a_indirizzo, 
        date, time, end_date, end_time, price, deposit, 
        piano_partenza, 
        normalizeBool(ascensore_partenza), // <--- AGGIUNTO normalizeBool
        piano_arrivo, 
        normalizeBool(ascensore_arrivo),   // <--- AGGIUNTO normalizeBool
        items, notes,
    normalizeJobType(job_type) || 'trasloco', id
      ]
    );
    res.json({ message: "Lavoro aggiornato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore database" });
  }
});

// DELETE: Elimina lavoro
app.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const del = await pool.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [id]);
    if(del.rows.length === 0) return res.status(404).json({ error: "Lavoro non trovato" });
    res.json({ message: "Lavoro eliminato con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cancellazione lavoro" });
  }
});

// ==========================================
// 3. LEADS (RICHIESTE WEB)
// ==========================================

// GET: Tutti i lead
app.get('/leads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        *,
        telefono AS phone,
        note AS notes,
        TO_CHAR(data_trasloco, 'YYYY-MM-DD') AS date,
        TO_CHAR(ora_trasloco, 'HH24:MI') AS time
      FROM leads
      ORDER BY data_creazione DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore recupero leads" });
  }
});


// POST: Crea nuovo lead + invia email
app.post('/leads', async (req, res) => {
  const {
    cliente_nome, phone, email,
    da_indirizzo, a_indirizzo,
    piano_partenza, ascensore_partenza,
    piano_arrivo, ascensore_arrivo,
    items, notes,
    date, time
  } = req.body;

  if (!cliente_nome || !phone || !da_indirizzo || !a_indirizzo)
    return res.status(400).json({ error: "Campi obbligatori mancanti" });

  try {
    const newLead = await pool.query(
      `INSERT INTO leads (
        data_creazione, cliente_nome, telefono, email,
        da_indirizzo, a_indirizzo, piano_partenza, ascensore_partenza,
        piano_arrivo, ascensore_arrivo, items, note, data_trasloco, ora_trasloco
      ) VALUES (NOW(), $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        cliente_nome,
        phone,                 // <-- mapping phone -> telefono
        email || null,
        da_indirizzo,
        a_indirizzo,
        piano_partenza || null,
        normalizeBool(ascensore_partenza),
        piano_arrivo || null,
        normalizeBool(ascensore_arrivo),
        items || '',
        notes || '',           // <-- mapping notes -> note
        date || null,          // <-- mapping date -> data_trasloco
        time || null           // <-- mapping time -> ora_trasloco
      ]
    );

    const savedLead = newLead.rows[0];

    const html = preventivoEmailTemplate({
      cliente_nome,
      telefono: phone, // template attuale usa telefono
      email,
      da_indirizzo,
      a_indirizzo,
      piano_partenza,
      piano_arrivo,
      ascensore_partenza: normalizeBool(ascensore_partenza),
      ascensore_arrivo: normalizeBool(ascensore_arrivo),
      items,
      note: notes,     // template attuale usa note
      data_trasloco: date,
      ora_trasloco: time
    });

    await inviaEmail(process.env.EMAIL_DESTINATARIO, `🚚 Nuovo Preventivo: ${cliente_nome}`, html);

    res.json(savedLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel salvataggio o invio email" });
  }
});


// PUT lead: aggiornamento stato
app.put('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;
  try {
    const result = await pool.query('UPDATE leads SET stato=$1 WHERE id=$2 RETURNING *', [stato, id]);
    if(result.rows.length === 0) return res.status(404).json({ error: "Lead non trovato" });
    res.json({ message: "Stato aggiornato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiornamento lead" });
  }
});

// DELETE lead
app.delete('/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const del = await pool.query('DELETE FROM leads WHERE id=$1 RETURNING *', [id]);
    if(del.rows.length === 0) return res.status(404).json({ error: "Lead non trovato" });
    res.json({ message: "Lead eliminato con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cancellazione lead" });
  }
});

// ==========================================
// 4. GESTIONE VEICOLI (AGGIORNATA)
// ==========================================

// GET veicoli: recupera tutti i campi inclusi i nuovi dettagli
app.get('/vehicles', async (req, res) => {
  try {
    // Ordiniamo per targa per mantenere la lista organizzata
    const result = await pool.query('SELECT * FROM vehicles ORDER BY targa ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore recupero veicoli" });
  }
});

// POST aggiungi veicolo
app.post('/vehicles', async (req, res) => {
  const { 
    targa, modello, marca, anno, alimentazione, telaio,
    scadenza_assicurazione, scadenza_revisione, km_attuali, note 
  } = req.body;

  if(!targa || !modello) return res.status(400).json({ error: "Targa e modello obbligatori" });

  try {
    const newVehicle = await pool.query(
      `INSERT INTO vehicles (
        targa, modello, marca, anno, alimentazione, telaio,
        scadenza_assicurazione, scadenza_revisione, km_attuali, note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        targa, modello, marca || null, anno || null, alimentazione || null, telaio || null,
        scadenza_assicurazione || null, 
        scadenza_revisione || null, 
        km_attuali || 0, 
        note || ''
      ]
    );
    res.json(newVehicle.rows[0]);
  } catch (err) {
    console.error("Errore inserimento veicolo:", err);
    res.status(500).json({ error: "Errore aggiunta veicolo" });
  }
});

// PUT aggiornamento veicolo 
app.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    targa, modello, marca, anno, alimentazione, telaio,
    scadenza_assicurazione, scadenza_revisione, km_attuali, note 
  } = req.body;

  try {
    const update = await pool.query(
      `UPDATE vehicles SET 
        targa=$1, modello=$2, marca=$3, anno=$4, alimentazione=$5, telaio=$6,
        scadenza_assicurazione=$7, scadenza_revisione=$8, km_attuali=$9, note=$10
      WHERE id=$11 RETURNING *`,
      [
        targa, modello, marca, anno, alimentazione, telaio,
        scadenza_assicurazione, scadenza_revisione, km_attuali, note, id
      ]
    );
    
    if(update.rows.length === 0) return res.status(404).json({ error: "Veicolo non trovato" });
    res.json(update.rows[0]);
  } catch (err) {
    console.error("Errore aggiornamento veicolo:", err);
    res.status(500).json({ error: "Errore aggiornamento veicolo" });
  }
});

// DELETE veicolo 
app.delete('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const del = await pool.query('DELETE FROM vehicles WHERE id=$1 RETURNING *', [id]);
    if(del.rows.length === 0) return res.status(404).json({ error: "Veicolo non trovato" });
    res.json({ message: "Veicolo eliminato con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore cancellazione veicolo" });
  }
});

// ==========================================
// 5. CONTATTO SEMPLICE
// ==========================================
app.post('/contatto', async (req, res) => {
  const { nome, email, messaggio } = req.body;
  if(!nome || !email || !messaggio) return res.status(400).json({ error: "Tutti i campi obbligatori" });

  try {
    await inviaEmail(process.env.EMAIL_DESTINATARIO, `Nuovo messaggio da ${nome}`, `<p>Email: ${email}</p><p>Messaggio: ${messaggio}</p>`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Errore invio email" });
  }
});

app.listen(port, () => console.log(`Server avviato sulla porta ${port}`));