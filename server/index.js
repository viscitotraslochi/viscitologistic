require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const pgTypes = require('pg').types;

pgTypes.setTypeParser(1082, function(stringValue) {
  return stringValue; // Ritorna "2026-01-25" pulito
});

const pool = require('./db'); 
const nodemailer = require('nodemailer'); 
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- CONFIGURA IL TRASPORTATORE EMAIL ---
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // oppure 587 per STARTTLS
    secure: true, // true = TLS/SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // password per app
    },
});

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

  // ==============================
  // 1. SALVATAGGIO DATABASE
  // ==============================
  try {
    const newLead = await pool.query(
      `INSERT INTO leads (
          data_creazione, cliente_nome, telefono, email, 
          da_indirizzo, a_indirizzo, piano_partenza, ascensore_partenza, 
          piano_arrivo, ascensore_arrivo, items, note, data_trasloco, ora_trasloco
       ) VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [cliente_nome, telefono, email, da_indirizzo, a_indirizzo, piano_partenza, ascensore_partenza, piano_arrivo, ascensore_arrivo, items, note, data_trasloco, ora_trasloco]
    );

    // CORREZIONE 1: Assegniamo il risultato alla variabile per la risposta finale
    const savedLead = newLead.rows[0]; 

    // ==============================
    // 2. PREPARAZIONE EMAIL
    // ==============================
    const badgeStyle = "padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;";
    
    const ascPartenzaBadge = normalizeBool(ascensore_partenza) // Usa la tua funzione helper qui
      ? `<span style="background:#dcfce7;color:#166534;${badgeStyle}">✅ Ascensore</span>`
      : `<span style="background:#fee2e2;color:#991b1b;${badgeStyle}">❌ No Ascensore</span>`;

    const ascArrivoBadge = normalizeBool(ascensore_arrivo) // Usa la tua funzione helper qui
      ? `<span style="background:#dcfce7;color:#166534;${badgeStyle}">✅ Ascensore</span>`
      : `<span style="background:#fee2e2;color:#991b1b;${badgeStyle}">❌ No Ascensore</span>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // O la tua mail personale
      subject: `🚚 Nuovo Preventivo: ${cliente_nome}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
        <tr><td align="center">

        <table width="560" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 24px rgba(0,0,0,.12);" cellpadding="0" cellspacing="0">

        <tr>
        <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px;text-align:center;color:#fff;">
        <div style="font-size:24px;font-weight:800;">Nuovo Preventivo</div>
        <div style="font-size:13px;opacity:.9;margin-top:6px;">Richiesta dal sito web</div>
        </td>
        </tr>

        <tr>
        <td style="padding:26px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:#0f172a;">${cliente_nome}</div>
        <div style="margin-top:10px;">
        <a href="tel:${telefono}" style="color:#2563eb;font-weight:600;text-decoration:none;">📞 ${telefono}</a>
        <span style="margin:0 8px;color:#cbd5f5;">|</span>
        <a href="mailto:${email}" style="color:#2563eb;font-weight:600;text-decoration:none;">✉️ Email</a>
        </div>
        </td>
        </tr>

        <tr><td style="padding:0 26px;"><hr style="border:none;border-top:1px dashed #e5e7eb;"></td></tr>
        <tr>
        <td style="padding:15px 26px;">
            <table width="100%">
                <tr>
                    <td width="50%" align="center" style="border-right:1px solid #f1f5f9;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#64748b;text-transform:uppercase;">Data Richiesta</div>
                        <div style="font-size:16px;font-weight:800;color:#1e293b;margin-top:4px;">
                            📅 ${data_trasloco || 'Non specificata'}
                        </div>
                    </td>
                    <td width="50%" align="center">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#64748b;text-transform:uppercase;">Orario Indicativo</div>
                        <div style="font-size:16px;font-weight:800;color:#1e293b;margin-top:4px;">
                            ⏰ ${ora_trasloco || '--'}
                        </div>
                    </td>
                </tr>
            </table>
        </td>
        </tr>
        <tr><td style="padding:0 26px;"><hr style="border:none;border-top:1px dashed #e5e7eb;"></td></tr>

        <tr>
        <td style="padding:22px 26px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#64748b;">📍 PARTENZA</div>
        <div style="font-size:16px;font-weight:700;margin-top:4px;color:#334155;">${da_indirizzo}</div>
        <div style="margin-top:8px;font-size:14px;color:#475569;">
        Piano: <b>${piano_partenza === 0 ? 'Terra' : piano_partenza}</b> &nbsp; ${ascPartenzaBadge}
        </div>
        </td>
        </tr>

        <tr>
        <td style="padding:22px 26px;background:#f8fafc;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#64748b;">🏁 ARRIVO</div>
        <div style="font-size:16px;font-weight:700;margin-top:4px;color:#334155;">${a_indirizzo}</div>
        <div style="margin-top:8px;font-size:14px;color:#475569;">
        Piano: <b>${piano_arrivo === 0 ? 'Terra' : piano_arrivo}</b> &nbsp; ${ascArrivoBadge}
        </div>
        </td>
        </tr>

        ${items ? `
        <tr>
        <td style="padding:22px 26px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;">📦 Inventario</div>
        <div style="background:#f1f5f9;border-radius:10px;padding:14px;font-family:monospace;font-size:13px;white-space:pre-wrap;color:#334155;">${items}</div>
        </td>
        </tr>` : ''}

        ${note ? `
        <tr>
        <td style="padding:0 26px 22px 26px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#d97706;">📝 Note / Messaggio</div>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;padding:14px;color:#92400e;font-size:14px;">${note}</div>
        </td>
        </tr>` : ''}

        <tr>
        <td style="background:#f8fafc;text-align:center;padding:14px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
        Viscito Logistics • Sistema Gestionale
        </td>
        </tr>

        </table>

        </td></tr>
        </table>
        </body>
        </html>
      `
    };

    // CORREZIONE 2: QUESTA E' LA RIGA CHE MANCAVA! 
    await transporter.sendMail(mailOptions);
    
    console.log("✅ Email inviata correttamente");
    
    // CORREZIONE 3: Restituiamo i dati salvati
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

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});