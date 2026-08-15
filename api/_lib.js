// =====================================================================
// Utilitaires partagés par les fonctions serveur.
// Aucune de ces clés ne doit jamais atteindre le navigateur.
// =====================================================================
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

/** Client Supabase avec la clé de service : contourne RLS, réservé au serveur. */
export function creerClient() {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent');
  return createClient(url, cle, { auth: { persistSession: false } });
}

/** Envoi d'un email transactionnel via Resend. */
export async function envoyerEmail({ to, subject, html, replyTo }) {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) throw new Error('RESEND_API_KEY absent');
  if (!to) throw new Error('Destinataire manquant');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_EXPEDITEUR || 'Socle <bonjour@socle.fr>',
      to: [to], subject, html,
      ...(replyTo ? { reply_to: [replyTo] } : {}),
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status} : ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

/**
 * Vérifie le jeton Cloudflare Turnstile.
 * Sans clé configurée, la vérification est ignorée — pratique en développement,
 * à ne jamais laisser tel quel en production.
 */
export async function verifierTurnstile(jeton, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY absent : anti-robot désactivé');
    return true;
  }
  if (!jeton) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: jeton, remoteip: ip }),
    });
    const d = await r.json();
    return d.success === true;
  } catch (e) {
    console.error('Turnstile injoignable', e);
    return false;   // en cas de doute, on refuse
  }
}

/** IP du visiteur, telle que transmise par Vercel. */
export function ipDe(req) {
  const xff = req.headers['x-forwarded-for'];
  return (Array.isArray(xff) ? xff[0] : String(xff || '')).split(',')[0].trim()
    || req.socket?.remoteAddress || '';
}

/** On ne stocke jamais l'IP en clair : seulement une empreinte, pour repérer les abus. */
export function hacherIp(ip) {
  if (!ip) return null;
  const sel = process.env.SEL_IP || 'socle';
  return createHash('sha256').update(sel + ip).digest('hex').slice(0, 32);
}

/** Réponse JSON, sans mise en cache. */
export function reponse(res, code, corps) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(code).send(JSON.stringify(corps));
}

/** Vérifie que l'appelant est authentifié auprès de Supabase (espace atelier). */
export async function exigerAtelier(req) {
  const entete = req.headers.authorization || '';
  const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : null;
  if (!jeton) return null;
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jeton}` } },
  });
  const { data, error } = await sb.auth.getUser(jeton);
  if (error || !data?.user) return null;
  return data.user;
}
