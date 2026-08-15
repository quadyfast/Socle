// Tests des fonctions serveur — sans réseau, sans base, sans clés.
// Lancer avec :  npm test
import { hacherIp, ipDe, reponse, verifierTurnstile, creerClient } from '../api/_lib.js';
import handlerProjet from '../api/projet.js';
import handlerMessage from '../api/message.js';

const res = [];
const dire = (nom, ok, detail = '') => res.push(`${ok ? 'OK   ' : 'ECHEC'} ${nom}${detail ? '  — ' + detail : ''}`);

// --- hachage d'IP : stable, non réversible, tronqué ---------------------
process.env.SEL_IP = 'sel-de-test';
const h1 = hacherIp('88.120.4.7'), h2 = hacherIp('88.120.4.7'), h3 = hacherIp('88.120.4.8');
dire('hacherIp stable', h1 === h2);
dire('hacherIp distingue les IP', h1 !== h3);
dire('hacherIp ne contient pas l’IP', !String(h1).includes('88.120'), h1);
dire('hacherIp gère l’absence d’IP', hacherIp('') === null);
// le sel doit changer le résultat, sinon il ne sert à rien
process.env.SEL_IP = 'autre-sel';
dire('le sel modifie l’empreinte', hacherIp('88.120.4.7') !== h1);

// --- extraction d'IP -----------------------------------------------------
dire('ipDe derrière proxy', ipDe({ headers: { 'x-forwarded-for': '88.120.4.7, 10.0.0.1' }, socket: {} }) === '88.120.4.7');
dire('ipDe en direct', ipDe({ headers: {}, socket: { remoteAddress: '127.0.0.1' } }) === '127.0.0.1');
dire('ipDe sans rien', ipDe({ headers: {}, socket: {} }) === '');

// --- Turnstile -----------------------------------------------------------
delete process.env.TURNSTILE_SECRET_KEY;
dire('Turnstile sans clé laisse passer (dev)', (await verifierTurnstile('x', '')) === true);
process.env.TURNSTILE_SECRET_KEY = '0xfaux';
dire('Turnstile refuse un jeton absent', (await verifierTurnstile('', '')) === false);

// --- garde-fous des variables d'environnement ----------------------------
delete process.env.SUPABASE_URL;
let leve = false;
try { creerClient(); } catch { leve = true; }
dire('creerClient exige ses variables', leve);

// --- faux objets req/res -------------------------------------------------
const faireRes = () => {
  const o = { code: 0, corps: '', entetes: {} };
  o.setHeader = (k, v) => { o.entetes[k] = v; };
  o.status = c => { o.code = c; return o; };
  o.send = b => { o.corps = b; return o; };
  return o;
};
const faireReq = (methode, corps, entetes = {}) => ({ method: methode, body: corps, headers: entetes, socket: {} });

// reponse() pose bien les en-têtes
const r0 = faireRes(); reponse(r0, 200, { ok: true });
dire('reponse pose no-store', r0.entetes['Cache-Control'] === 'no-store');
dire('reponse renvoie du JSON', r0.corps === '{"ok":true}');

// --- /api/projet : rejets attendus ---------------------------------------
process.env.SUPABASE_URL = 'https://exemple.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'faux';
delete process.env.TURNSTILE_SECRET_KEY;   // sinon tout est rejeté en 403 avant la validation

const r1 = faireRes(); await handlerProjet(faireReq('GET'), r1);
dire('projet refuse GET', r1.code === 405);

const r2 = faireRes(); await handlerProjet(faireReq('POST', 'pas du json'), r2);
dire('projet refuse un JSON invalide', r2.code === 400);

const r3 = faireRes(); await handlerProjet(faireReq('POST', { etat: {} }), r3);
dire('projet refuse un état sans site', r3.code === 400);

const r4 = faireRes(); await handlerProjet(faireReq('POST', { etat: { site: {}, name: '' } }), r4);
dire('projet refuse un nom vide', r4.code === 400);

const r5 = faireRes(); await handlerProjet(faireReq('POST', { etat: { site: {}, name: 'X' }, email: 'pas-un-email' }), r5);
dire('projet refuse un email invalide', r5.code === 400);

const r6 = faireRes();
await handlerProjet(faireReq('POST', { etat: { site: {}, name: 'X' }, gros: 'a'.repeat(900 * 1024) }), r6);
dire('projet refuse un envoi trop gros', r6.code === 413);

const r7 = faireRes();
await handlerProjet(faireReq('POST', { piege: 'rempli par un robot', etat: { site: {}, name: 'X' } }), r7);
dire('projet ignore le champ appât en silence', r7.code === 200 && r7.corps.includes('#0000'));

// --- /api/message : authentification obligatoire --------------------------
const r8 = faireRes(); await handlerMessage(faireReq('POST', { projet_id: 'x', texte: 'coucou' }), r8);
dire('message exige une authentification', r8.code === 401);

const r9 = faireRes(); await handlerMessage(faireReq('GET'), r9);
dire('message refuse GET', r9.code === 405);

// --- l'ordre compte : un email invalide doit dire « email invalide »,
//     pas « anti-robot échoué », même quand Turnstile est actif ------------
process.env.TURNSTILE_SECRET_KEY = '0xfaux';
const r10 = faireRes();
await handlerProjet(faireReq('POST', { etat: { site: {}, name: 'X' }, email: 'pas-un-email' }), r10);
dire('validation avant anti-robot', r10.code === 400, 'code reçu ' + r10.code);
const r11 = faireRes();
await handlerProjet(faireReq('POST', { etat: { site: {}, name: 'X' }, email: 'bon@exemple.fr' }), r11);
dire('anti-robot bloque après validation', r11.code === 403, 'code reçu ' + r11.code);
delete process.env.TURNSTILE_SECRET_KEY;

console.log(res.join('\n'));
const echecs = res.filter(l => l.startsWith('ECHEC'));
console.log('\n' + (echecs.length ? echecs.length + ' ECHEC(S)' : res.length + ' vérifications passées'));
process.exit(echecs.length ? 1 : 0);
