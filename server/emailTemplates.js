// server/emailTemplates.js

function preventivoEmailTemplate({
  cliente_nome,
  telefono,
  email,
  da_indirizzo,
  a_indirizzo,
  piano_partenza,
  piano_arrivo,
  ascensore_partenza,
  ascensore_arrivo,
  items,
  note,
  data_trasloco,
  ora_trasloco
}) {

  const ascPartenzaBadge = ascensore_partenza ? "✅ Ascensore" : "❌ No Ascensore";
  const ascArrivoBadge = ascensore_arrivo ? "✅ Ascensore" : "❌ No Ascensore";

  return `
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
  `;
}

module.exports = { preventivoEmailTemplate };
