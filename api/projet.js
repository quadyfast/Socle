// =====================================================================
// POST /api/projet — réception d'un projet client
//
// Le navigateur n'écrit jamais directement dans Supabase : tout passe ici.
// Cette fonction valide, filtre les robots, enregistre, puis prévient
// le client et l'atelier par email.
// =====================================================================
import { creerClient, envoyerEmail, verifierTurnstile, hacherIp, ipDe, reponse } from './_lib.js';

const MAX_OCTETS = 800 * 1024;   // un état de maquette dépasse rarement 60 Ko
const STATUT_INITIAL = 'nouveau';

export default async function handler(req, res) {
  if (req.method !== 'POST') return reponse(res, 405, { erreur: 'Méthode non autorisée' });

  let corps = req.body;
  if (typeof corps === 'string') {
    try { corps = JSON.parse(corps); } catch { return reponse(res, 400, { erreur: 'JSON invalide' }); }
  }
  if (!corps || typeof corps !== 'object') return reponse(res, 400, { erreur: 'Corps manquant' });

  // --- garde-fous de taille -------------------------------------------------
  const taille = Buffer.byteLength(JSON.stringify(corps));
  if (taille > MAX_OCTETS) return reponse(res, 413, { erreur: 'Projet trop volumineux' });

  // Champ appât : gratuit, on l'évalue en premier. Un robot qui le remplit
  // reçoit un succès factice — il ne saura pas qu'il a été filtré.
  if (corps.piege) return reponse(res, 200, { ok: true, ref: '#0000' });

  // --- validation -----------------------------------------------------------
  // Volontairement AVANT Turnstile : inutile d'appeler Cloudflare pour des
  // données qui ne tiennent pas debout, et un visiteur légitime dont l'email
  // est mal saisi doit lire « email invalide », pas « anti-robot échoué ».
  const etat = corps.etat;
  if (!etat || typeof etat !== 'object' || !etat.site) {
    return reponse(res, 400, { erreur: 'État de maquette manquant' });
  }
  const nom = String(etat.name || '').trim().slice(0, 120);
  if (!nom) return reponse(res, 400, { erreur: 'Nom du projet manquant' });

  const email = String(corps.email || '').trim().slice(0, 200);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return reponse(res, 400, { erreur: 'Adresse email invalide' });
  }

  const pct = Math.max(0, Math.min(100, parseInt(corps.pct, 10) || 0));

  // --- anti-robot, une fois les données jugées plausibles --------------------
  const turnstileOk = await verifierTurnstile(corps.turnstile, ipDe(req));
  if (!turnstileOk) return reponse(res, 403, { erreur: 'Vérification anti-robot échouée' });

  try {
    const sb = creerClient();

    // référence lisible (#1042, #1043…)
    const { data: refData, error: refErr } = await sb.rpc('prochaine_ref');
    if (refErr) throw refErr;
    const ref = refData;

    const { data: projet, error } = await sb.from('projets').insert({
      ref,
      statut: STATUT_INITIAL,
      pct,
      nom,
      email: email || null,
      telephone: String(etat.site?.contact?.phone || '').slice(0, 40) || null,
      metier: String(etat.metierLabel || '').slice(0, 120) || null,
      specialite: String(etat.specialization || '').slice(0, 120) || null,
      budget: String(corps.budget || '').slice(0, 80) || null,
      echeance: String(corps.echeance || '').slice(0, 80) || null,
      etat,
      ip_hash: hacherIp(ipDe(req)),
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
    }).select('id, ref').single();
    if (error) throw error;

    await sb.from('historique').insert({ projet_id: projet.id, evenement: 'Projet reçu', auteur: 'client' });

    // --- emails : l'échec d'un envoi ne doit pas perdre le projet ------------
    const resultats = await Promise.allSettled([
      email && envoyerEmail({
        to: email,
        subject: `Votre projet ${ref} est bien arrivé`,
        html: emailClient({ ref, nom }),
      }),
      envoyerEmail({
        to: process.env.EMAIL_ATELIER,
        subject: `Nouveau projet ${ref} — ${nom}`,
        html: emailAtelier({ ref, nom, etat, pct, email, budget: corps.budget, echeance: corps.echeance }),
      }),
    ].filter(Boolean));

    const emailsKo = resultats.filter(r => r.status === 'rejected');
    if (emailsKo.length) console.error('Envoi email en échec', emailsKo.map(r => r.reason?.message));

    return reponse(res, 200, { ok: true, ref });
  } catch (e) {
    console.error('Réception projet en échec', e);
    return reponse(res, 500, { erreur: 'Enregistrement impossible' });
  }
}

// ---------------------------------------------------------------------
// Gabarits d'emails
// ---------------------------------------------------------------------
const ech = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const enveloppe = (contenu) => `
<div style="font-family:-apple-system,Segoe UI,sans-serif;color:#171B26;line-height:1.6;max-width:560px;margin:0 auto;padding:28px 24px">
  <div style="font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.18em;color:#2B44D8;margin-bottom:26px">◼ SOCLE</div>
  ${contenu}
  <hr style="border:none;border-top:1px solid #E1E3E0;margin:28px 0 14px">
  <p style="font-size:12px;color:#6A7183;margin:0">Socle — votre site commence ici.</p>
</div>`;

function emailClient({ ref, nom }) {
  return enveloppe(`
    <h1 style="font-size:21px;font-weight:400;margin:0 0 14px">Votre projet est entre nos mains.</h1>
    <p style="margin:0 0 14px">Bonjour, et merci pour <strong>${ech(nom)}</strong>.</p>
    <p style="margin:0 0 20px">Votre maquette et vos réponses nous sont bien parvenues sous la référence
      <strong>${ech(ref)}</strong>. Voici la suite :</p>
    <table style="width:100%;border-collapse:collapse;font-size:14.5px">
      <tr><td style="padding:9px 0;border-bottom:1px solid #E1E3E0;width:70px;color:#2B44D8;font-family:ui-monospace,monospace;font-size:12px">24 h</td>
          <td style="padding:9px 0;border-bottom:1px solid #E1E3E0">Nous étudions votre projet et revenons vers vous avec une proposition claire.</td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #E1E3E0;color:#2B44D8;font-family:ui-monospace,monospace;font-size:12px">J+3</td>
          <td style="padding:9px 0;border-bottom:1px solid #E1E3E0">Un échange pour préciser les derniers détails, puis nous lançons la création.</td></tr>
      <tr><td style="padding:9px 0;color:#2B44D8;font-family:ui-monospace,monospace;font-size:12px">Ensuite</td>
          <td style="padding:9px 0">Votre maquette est entièrement retravaillée : design finalisé, textes réécrits,
            images professionnelles, développement et mise en ligne.</td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:13.5px;color:#6A7183">Une précision à apporter ? Répondez simplement à cet email.</p>`);
}

function emailAtelier({ ref, nom, etat, pct, email, budget, echeance }) {
  const s = etat.site || {};
  const pages = (s.pages || []).filter(p => p.on).map(p => p.label).join(' · ');
  const photos = (s.logo ? 1 : 0) + (s.heroImg ? 1 : 0) + (s.gallery || []).filter(Boolean).length;
  return enveloppe(`
    <h1 style="font-size:21px;font-weight:400;margin:0 0 6px">Nouveau projet ${ech(ref)}</h1>
    <p style="margin:0 0 20px;color:#6A7183">${ech(nom)} — ${ech(etat.metierLabel || '')} — maquette à ${pct} %</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${[
        ['Contact', email || 'non renseigné'],
        ['Téléphone', s.contact?.phone || '—'],
        ['Échéance', echeance || '—'],
        ['Budget', budget || '—'],
        ['Sa phrase', etat.diff || 'non remplie'],
        ['Pages', pages || '—'],
        ['Visuels fournis', `${photos} sur 7${s.logo ? ' (logo inclus)' : ' — logo à demander'}`],
      ].map(([k, v]) => `<tr>
        <td style="padding:7px 0;border-bottom:1px solid #E1E3E0;color:#6A7183;width:120px;vertical-align:top">${ech(k)}</td>
        <td style="padding:7px 0;border-bottom:1px solid #E1E3E0">${ech(v)}</td></tr>`).join('')}
    </table>
    <p style="margin:22px 0 0">
      <a href="${ech(process.env.URL_SITE || '')}/#atelier" style="background:#2B44D8;color:#fff;text-decoration:none;
        padding:11px 20px;border-radius:6px;font-weight:600;display:inline-block;font-size:14px">Ouvrir la fiche</a>
    </p>`);
}
