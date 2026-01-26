require('dotenv').config(); // Carica le variabili d'ambiente per il DB
const pool = require('./db'); // Connessione al database
const bcrypt = require('bcrypt');

async function resetAdmin() {
  const email = 'admin';
  const password = 'password123';

  try {
    console.log("⏳ Generazione nuova password sicura...");
    
    // 1. Crea un hash fresco valido per il tuo sistema
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Rimuovi il vecchio utente per evitare duplicati
    await pool.query("DELETE FROM users WHERE email = $1", [email]);

    // 3. Inserisci il nuovo admin
    await pool.query(
      "INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, 'Super Admin', 'admin']
    );

    console.log("✅ SUCCESSO! Utente admin ripristinato.");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

  } catch (err) {
    console.error("❌ ERRORE:", err);
  } finally {
    process.exit();
  }
}

resetAdmin();