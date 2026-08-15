// =====================================================================
// POST /api/message — l'atelier écrit au client
//
// Le client n'ayant plus d'espace après l'envoi (règle métier), l'email
// est le seul canal. Sa réponse arrive dans la boîte de l'atelier grâce
// au reply-to : la conversation reste dans un fil normal.
//
// Réservé à un compte authentifié : un visiteur ne peut pas s'en servir
// pour envoyer des emails en votre nom.
// =====================================================================
import { creerClient, envoyerEmail, exigerAtelier, reponse } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return reponse(res, 405, { erreur: 'Méthode non autorisée' });

  const utilisateur = await exigerAtelier(req);
  if (!utilisateur) return reponse(res, 401, { erreur: 'Authentification requise' });

  let corps = req.body;
  if (typeof corps === 'string') {
    try { corps = JSON.parse(corps); } catch { return reponse(res, 400, { erreur: 'JSON invalide' }); }
  }

  const projetId = String(corps?.projet_id || '');
  const texte = String(corps?.texte || '').trim();
  if (!projetId) return reponse(res, 400, { erreur: 'Projet manquant' });
  if (texte.length < 2 || texte.length > 5000) return reponse(res, 400, { erreur: 'Message vide ou trop long' });

  try {
    const sb = creerClient();

    const { data: projet, error: errProjet } = await sb
      .from('projets').select('id, ref, nom, email').eq('id', projetId).single();
    if (errProjet || !projet) return reponse(res, 404, { erreur: 'Projet introuvable' });
    if (!projet.email) return reponse(res, 409, { erreur: 'Ce client n’a pas laissé d’adresse email' });

    const envoi = await envoyerEmail({
      to: projet.email,
      subject: `Votre projet ${projet.ref} — une précision`,
      replyTo: process.env.EMAIL_ATELIER,
      html: gabarit({ ref: projet.ref, nom: projet.nom, texte }),
    });

    await sb.from('messages').insert({
      projet_id: projet.id, expediteur: 'atelier', texte, email_id: envoi?.id || null,
    });
    await sb.from('historique').insert({
      projet_id: projet.id, evenement: 'Message envoyé au client', auteur: 'atelier',
    });

    return reponse(res, 200, { ok: true });
  } catch (e) {
    console.error('Envoi message en échec', e);
    return reponse(res, 500, { erreur: 'Envoi impossible' });
  }
}

const ech = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function gabarit({ ref, nom, texte }) {
  const paragraphes = texte.split(/\n{2,}/).map(p =>
    `<p style="margin:0 0 13px">${ech(p).replace(/\n/g, '<br>')}</p>`).join('');
  return `
<div style="font-family:-apple-system,Segoe UI,sans-serif;color:#171B26;line-height:1.6;max-width:560px;margin:0 auto;padding:28px 24px">
  <div style="font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.18em;color:#2B44D8;margin-bottom:24px">◼ SOCLE</div>
  <p style="margin:0 0 6px;font-size:13px;color:#6A7183">À propos de votre projet ${ech(ref)} — ${ech(nom)}</p>
  <div style="border-left:2px solid #2B44D8;padding-left:16px;margin:18px 0">${paragraphes}</div>
  <p style="margin:20px 0 0;font-size:13.5px;color:#6A7183">Répondez directement à cet email, nous recevrons votre réponse.</p>
  <hr style="border:none;border-top:1px solid #E1E3E0;margin:26px 0 14px">
  <p style="font-size:12px;color:#6A7183;margin:0">Socle — votre site commence ici.</p>
</div>`;
}
