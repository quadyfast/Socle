// =====================================================================
// GET /api/diagnostic — contrôle de configuration
//
// Répond à une seule question : le serveur est-il branché sur le BON
// Supabase, avec des clés qui fonctionnent ?
//
// N'expose aucune clé : uniquement des booléens et l'identifiant de projet
// Supabase, qui est déjà public côté navigateur.
//
// À supprimer une fois la mise en production validée.
// =====================================================================
import { creerClient, reponse } from './_lib.js';

// Le projet Supabase attendu pour Socle.
const PROJET_ATTENDU = 'nxulgsfttbkzyzqbmthg';

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL || '';
  const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1] || null;

  const rapport = {
    variables: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      EMAIL_ATELIER: !!process.env.EMAIL_ATELIER,
      EMAIL_EXPEDITEUR: !!process.env.EMAIL_EXPEDITEUR,
      TURNSTILE_SECRET_KEY: !!process.env.TURNSTILE_SECRET_KEY,
      SEL_IP: !!process.env.SEL_IP,
    },
    projetSupabase: ref,
    bonProjet: ref === PROJET_ATTENDU,
    base: 'non testée',
    tables: null,
  };

  // Le service_role contourne RLS : s'il lit la table, la chaîne complète fonctionne.
  if (rapport.variables.SUPABASE_URL && rapport.variables.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = creerClient();
      const { count, error } = await sb.from('projets').select('*', { count: 'exact', head: true });
      if (error) throw error;
      rapport.base = 'accessible';
      rapport.tables = { projets: count };
    } catch (e) {
      rapport.base = 'erreur : ' + String(e.message || e).slice(0, 160);
    }
  }

  rapport.verdict = !rapport.bonProjet ? 'MAUVAIS PROJET SUPABASE'
    : rapport.base !== 'accessible' ? 'BASE INACCESSIBLE'
    : !rapport.variables.SEL_IP ? 'SEL_IP MANQUANT'
    : 'CONFIGURATION CORRECTE';

  return reponse(res, 200, rapport);
}
