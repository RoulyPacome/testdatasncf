const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

const navLabels = {
  overview: "Vue d'ensemble",
  datasets: 'Jeux de données',
  rules: 'Règles de qualité',
  monitoring: 'Exécutions',
  assistant: 'Assistant IA',
  alerts: 'Alertes',
  catalog: 'Catalogue Unity',
};

const overviewView = document.querySelector('#overview-view');
const viewContainer = document.querySelector('#view-container');

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    navigateView(item.dataset.view);
  });
});

document.querySelectorAll('[data-view-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.viewTarget;
    document.querySelector(`[data-view="${view}"]`).click();
  });
});

const searchInput = document.querySelector('#dataset-search');
const datasetRows = [...document.querySelectorAll('#dataset-table-body tr')];
const tableCount = document.querySelector('#table-count');
const datasets = [
  ...datasetRows.map((row) => ({
    name: row.dataset.name,
    domain: row.dataset.domain,
    path: row.querySelector('.table-name small').textContent,
    score: Number.parseInt(row.querySelector('.table-score').textContent, 10),
    checks: row.querySelector('.checks').textContent.trim(),
    lastUpdate: row.children[4].textContent,
    status: row.querySelector('.status').textContent.trim(),
    statusKey: row.querySelector('.status-warning') ? 'warning' : row.querySelector('.status-delayed') ? 'delayed' : 'good',
  })),
  { name: 'Horaires des trains', domain: 'Offre', path: 'prod.gold.horaires_trains', score: 97, checks: '19 / 19', lastUpdate: 'Il y a 8 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Données voyageurs TER', domain: 'Exploitation', path: 'prod.gold.voyageurs_ter', score: 91, checks: '17 / 18', lastUpdate: 'Il y a 22 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Réclamations clients', domain: 'Relation client', path: 'prod.silver.reclamations', score: 95, checks: '11 / 11', lastUpdate: 'Il y a 35 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Consommation énergie', domain: 'Environnement', path: 'prod.gold.consommation_energie', score: 89, checks: '15 / 17', lastUpdate: 'Il y a 1 h', status: 'À surveiller', statusKey: 'warning' },
  { name: 'Matériel roulant', domain: 'Maintenance', path: 'prod.silver.materiel_roulant', score: 98, checks: '13 / 13', lastUpdate: 'Il y a 14 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Ventes TER', domain: 'Commercial', path: 'prod.gold.ventes_ter', score: 96, checks: '12 / 12', lastUpdate: 'Il y a 17 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Incidents voyageurs', domain: 'Exploitation', path: 'prod.silver.incidents_voyageurs', score: 93, checks: '10 / 11', lastUpdate: 'Il y a 42 min', status: 'Conforme', statusKey: 'good' },
  { name: 'Empreinte carbone', domain: 'Environnement', path: 'prod.gold.empreinte_carbone', score: 99, checks: '9 / 9', lastUpdate: 'Il y a 1 h', status: 'Conforme', statusKey: 'good' },
  { name: 'Horaires des bus', domain: 'Offre', path: 'prod.silver.horaires_bus', score: 87, checks: '8 / 10', lastUpdate: 'Il y a 2 h', status: 'En retard', statusKey: 'delayed' },
  { name: 'Agents et affectations', domain: 'Ressources humaines', path: 'prod.gold.agents_affectations', score: 97, checks: '16 / 16', lastUpdate: 'Il y a 31 min', status: 'Conforme', statusKey: 'good' },
];
document.querySelector('#rule-dataset').innerHTML = datasets.map((dataset) => `<option>${escapeHTML(dataset.name)}</option>`).join('');

function readSavedList(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

const rules = readSavedList('dataops-rules', [
  { id: 'r1', name: 'Identifiant gare non nul', dataset: 'Référentiel gares', type: 'Valeurs non nulles', active: true, lastRun: '09:42' },
  { id: 'r2', name: 'Unicité du code UIC', dataset: 'Référentiel gares', type: 'Unicité', active: true, lastRun: '09:42' },
  { id: 'r3', name: 'Fraîcheur des données trafic', dataset: 'Trafic voyageurs', type: 'Fraîcheur des données', active: true, lastRun: '09:40' },
  { id: 'r4', name: 'Taux de ponctualité valide', dataset: 'Ponctualité TGV', type: 'Seuil personnalisé', active: true, lastRun: '09:38' },
  { id: 'r5', name: 'Format de la date de vente', dataset: 'Ventes et réservations', type: 'Conformité de format', active: true, lastRun: '09:36' },
  { id: 'r6', name: 'Complétude des incidents', dataset: 'Incidents réseau', type: 'Valeurs non nulles', active: false, lastRun: 'Hier, 18:00' },
]);
const executions = readSavedList('dataops-executions', [
  { id: 'e1', job: 'daily_quality_check', dataset: 'Tous les jeux de données', started: "Aujourd'hui, 09:42", duration: '2 min 18 s', status: 'Terminée' },
  { id: 'e2', job: 'quality_trafic_voyageurs', dataset: 'Trafic voyageurs', started: "Aujourd'hui, 09:40", duration: '38 s', status: 'Terminée' },
  { id: 'e3', job: 'quality_ref_gares', dataset: 'Référentiel gares', started: "Aujourd'hui, 09:38", duration: '12 s', status: 'Terminée' },
  { id: 'e4', job: 'quality_ponctualite_tgv', dataset: 'Ponctualité TGV', started: "Aujourd'hui, 08:00", duration: 'En cours', status: 'En cours' },
]);
const alerts = readSavedList('dataops-alerts', [
  { id: 'a1', title: 'Valeurs manquantes', dataset: 'Trafic voyageurs', detail: '12,4 % des lignes sans identifiant voyageur', severity: 'Critique', status: 'Ouverte', statusKey: 'warning' },
  { id: 'a2', title: 'Clé dupliquée', dataset: 'Référentiel gares', detail: 'Doublons détectés dans le champ code_uic', severity: 'Élevée', status: 'Ouverte', statusKey: 'warning' },
  { id: 'a3', title: 'Données en retard', dataset: 'Ponctualité TGV', detail: 'Dernière mise à jour il y a 4 h', severity: 'Modérée', status: 'Ouverte', statusKey: 'delayed' },
  { id: 'a4', title: 'Score sous le seuil', dataset: 'Consommation énergie', detail: 'Score de qualité à 89 %, seuil attendu à 95 %', severity: 'Élevée', status: 'Ouverte', statusKey: 'warning' },
  { id: 'a5', title: 'Format non conforme', dataset: 'Ventes et réservations', detail: '3 dates de vente au format inattendu', severity: 'Modérée', status: 'Résolue', statusKey: 'good' },
  { id: 'a6', title: 'Volume inhabituel', dataset: 'Incidents réseau', detail: 'Baisse de volume de 18 % par rapport à hier', severity: 'Faible', status: 'Résolue', statusKey: 'good' },
  { id: 'a7', title: 'Valeur hors plage', dataset: 'Ponctualité TGV', detail: 'Durée de retard négative détectée', severity: 'Modérée', status: 'Résolue', statusKey: 'good' },
  { id: 'a8', title: 'Champ incomplet', dataset: 'Trafic voyageurs', detail: 'Champ origine manquant sur certaines lignes', severity: 'Faible', status: 'Résolue', statusKey: 'good' },
]);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function saveList(key, values) {
  localStorage.setItem(key, JSON.stringify(values));
}

function renderPageHeader(title, description, action = '') {
  return `<div class="view-heading"><div><p class="eyebrow">GESTION DE LA QUALITÉ</p><h1>${title}</h1><p class="page-subtitle">${description}</p></div>${action}</div>`;
}

function renderDatasetRows(items) {
  return items.map((dataset) => `<tr data-filterable data-status-key="${dataset.statusKey}" data-category="${escapeHTML(dataset.domain)}"><td><button class="view-dataset-link" type="button" data-action="open-dataset" data-name="${escapeHTML(dataset.name)}"><strong>${escapeHTML(dataset.name)}</strong><small>${escapeHTML(dataset.path)}</small></button></td><td>${escapeHTML(dataset.domain)}</td><td><strong class="view-score ${dataset.score < 90 ? 'is-low' : ''}">${dataset.score} %</strong><span class="table-score-track"><i style="width:${dataset.score}%"></i></span></td><td>${escapeHTML(dataset.checks)}</td><td>${escapeHTML(dataset.lastUpdate)}</td><td><span class="status status-${dataset.statusKey}"><i></i>${escapeHTML(dataset.status)}</span></td><td><button class="row-menu" type="button" data-action="open-dataset" data-name="${escapeHTML(dataset.name)}" aria-label="Détails de ${escapeHTML(dataset.name)}">···</button></td></tr>`).join('');
}

function renderDatasets() {
  return `${renderPageHeader('Jeux de données', `${datasets.length} tables surveillées dans le workspace de production`)}<section class="panel view-panel"><div class="view-toolbar"><label class="search-box"><span>⌕</span><input type="search" data-view-search placeholder="Rechercher une table ou un domaine..." aria-label="Rechercher un jeu de données"></label><select class="view-select" data-status-filter aria-label="Filtrer par statut"><option value="all">Tous les statuts</option><option value="warning">À surveiller</option><option value="delayed">En retard</option><option value="good">Conforme</option></select><span class="view-result-count">${datasets.length} jeux de données</span></div><div class="table-scroll"><table class="view-table"><thead><tr><th>JEU DE DONNÉES</th><th>DOMAINE</th><th>SCORE</th><th>CONTRÔLES</th><th>MISE À JOUR</th><th>STATUT</th><th></th></tr></thead><tbody>${renderDatasetRows(datasets)}</tbody></table></div></section>`;
}

function renderRules() {
  const rows = rules.map((rule) => `<tr data-filterable data-status-key="${rule.active ? 'good' : 'delayed'}"><td><strong>${escapeHTML(rule.name)}</strong><small class="view-secondary">${escapeHTML(rule.type)}</small></td><td>${escapeHTML(rule.dataset)}</td><td><span class="status status-${rule.active ? 'good' : 'delayed'}"><i></i>${rule.active ? 'Active' : 'Désactivée'}</span></td><td>${escapeHTML(rule.lastRun)}</td><td><button class="button button-secondary compact-button" type="button" data-action="toggle-rule" data-id="${escapeHTML(rule.id)}">${rule.active ? 'Désactiver' : 'Activer'}</button><button class="row-menu" type="button" data-action="delete-rule" data-id="${escapeHTML(rule.id)}" aria-label="Supprimer ${escapeHTML(rule.name)}">×</button></td></tr>`).join('');
  const action = '<button class="button button-primary" type="button" data-action="new-rule"><span class="plus-icon">+</span>Créer une règle</button>';
  return `${renderPageHeader('Règles de qualité', `${rules.length} contrôles configurés sur vos jeux de données`, action)}<section class="panel view-panel"><div class="view-toolbar"><label class="search-box"><span>⌕</span><input type="search" data-view-search placeholder="Rechercher une règle..." aria-label="Rechercher une règle"></label><select class="view-select" data-status-filter aria-label="Filtrer les règles"><option value="all">Toutes les règles</option><option value="good">Actives</option><option value="delayed">Désactivées</option></select><span class="view-result-count">${rules.filter((rule) => rule.active).length} actives</span></div><div class="table-scroll"><table class="view-table"><thead><tr><th>RÈGLE</th><th>JEU DE DONNÉES</th><th>STATUT</th><th>DERNIÈRE EXÉCUTION</th><th>ACTIONS</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="empty-state">Aucune règle configurée.</td></tr>'}</tbody></table></div></section>`;
}

function renderExecutions() {
  const rows = executions.map((run) => `<tr data-filterable data-status-key="${run.status === 'En cours' ? 'delayed' : 'good'}"><td><strong class="mono-text">${escapeHTML(run.job)}</strong></td><td>${escapeHTML(run.dataset)}</td><td>${escapeHTML(run.started)}</td><td>${escapeHTML(run.duration)}</td><td><span class="status status-${run.status === 'En cours' ? 'delayed' : 'good'}"><i></i>${escapeHTML(run.status)}</span></td><td><button class="button button-secondary compact-button" type="button" data-action="run-check" data-name="${escapeHTML(run.dataset === 'Tous les jeux de données' ? '' : run.dataset)}">Relancer</button></td></tr>`).join('');
  const action = '<button class="button button-primary" type="button" data-action="run-all">Lancer tous les contrôles</button>';
  return `${renderPageHeader('Exécutions', `${executions.length} exécutions récentes`, action)}<section class="panel view-panel"><div class="view-toolbar"><label class="search-box"><span>⌕</span><input type="search" data-view-search placeholder="Rechercher une exécution..." aria-label="Rechercher une exécution"></label><select class="view-select" data-status-filter aria-label="Filtrer les exécutions"><option value="all">Tous les statuts</option><option value="good">Terminées</option><option value="delayed">En cours</option></select></div><div class="table-scroll"><table class="view-table"><thead><tr><th>JOB</th><th>JEU DE DONNÉES</th><th>DÉMARRÉE</th><th>DURÉE</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function renderAlerts() {
  const rows = alerts.map((alert) => `<tr data-filterable data-status-key="${alert.status === 'Ouverte' ? 'warning' : 'good'}"><td><strong>${escapeHTML(alert.title)}</strong><small class="view-secondary">${escapeHTML(alert.detail)}</small></td><td><button class="view-dataset-link" type="button" data-action="open-dataset" data-name="${escapeHTML(alert.dataset)}"><strong>${escapeHTML(alert.dataset)}</strong></button></td><td>${escapeHTML(alert.severity)}</td><td><span class="status status-${alert.status === 'Ouverte' ? alert.statusKey : 'good'}"><i></i>${escapeHTML(alert.status)}</span></td><td>${alert.status === 'Ouverte' ? `<button class="button button-secondary compact-button" type="button" data-action="resolve-alert" data-id="${escapeHTML(alert.id)}">Marquer résolue</button>` : '<span class="view-secondary">—</span>'}</td></tr>`).join('');
  return `${renderPageHeader('Alertes', `${alerts.filter((alert) => alert.status === 'Ouverte').length} alertes ouvertes sur ${alerts.length}`)}<section class="panel view-panel"><div class="view-toolbar"><label class="search-box"><span>⌕</span><input type="search" data-view-search placeholder="Rechercher une alerte..." aria-label="Rechercher une alerte"></label><select class="view-select" data-status-filter aria-label="Filtrer les alertes"><option value="all">Toutes les alertes</option><option value="warning">Ouvertes</option><option value="good">Résolues</option></select><span class="view-result-count">${alerts.filter((alert) => alert.status === 'Ouverte').length} à traiter</span></div><div class="table-scroll"><table class="view-table"><thead><tr><th>ANOMALIE</th><th>JEU DE DONNÉES</th><th>GRAVITÉ</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function renderCatalog() {
  const rows = renderDatasetRows(datasets);
  const catalogs = [...new Set(datasets.map((dataset) => dataset.path.split('.')[0]))];
  const schemas = [...new Set(datasets.map((dataset) => dataset.path.split('.')[1]))];
  const domains = [...new Set(datasets.map((dataset) => dataset.domain))];
  return `${renderPageHeader('Catalogue Unity', 'Explorez les catalogues, schémas et tables accessibles dans le workspace')}<section class="catalog-summary"><div class="catalog-stat"><span>CATALOGUES</span><strong>${catalogs.length}</strong></div><div class="catalog-stat"><span>SCHÉMAS</span><strong>${schemas.length}</strong></div><div class="catalog-stat"><span>TABLES SUIVIES</span><strong>${datasets.length}</strong></div></section><section class="panel view-panel"><div class="view-toolbar"><label class="search-box"><span>⌕</span><input type="search" data-view-search placeholder="Chercher dans le catalogue..." aria-label="Rechercher dans le catalogue"></label><select class="view-select" data-category-filter aria-label="Filtrer par domaine"><option value="all">Tous les domaines</option>${domains.map((domain) => `<option value="${escapeHTML(domain)}">${escapeHTML(domain)}</option>`).join('')}</select><span class="view-result-count">${catalogs.map(escapeHTML).join(', ')} · ${schemas.length} schémas</span></div><div class="catalog-schema-list">${schemas.map((schema) => catalogs.map((catalog) => `<span class="catalog-schema"><span>▧</span>${escapeHTML(catalog)}.${escapeHTML(schema)}</span>`).join('')).join('')}</div><div class="table-scroll"><table class="view-table"><thead><tr><th>TABLE</th><th>DOMAINE</th><th>SCORE QUALITÉ</th><th>CONTRÔLES</th><th>MISE À JOUR</th><th>STATUT</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

const assistantMessages = [{
  role: 'assistant',
  text: 'Bonjour ! Je peux vous aider à explorer les scores et les alertes, ou lancer les contrôles simulés de cette démo. Que souhaitez-vous savoir ?',
}];

function renderAssistant() {
  const suggestions = [
    'Quelles sont les alertes prioritaires ?',
    'Quel est le score du trafic voyageurs ?',
    'Quels jeux de données sont accessibles ?',
    'Simuler un contrôle sur Trafic voyageurs',
  ];
  const messages = assistantMessages.map((message) => `<article class="assistant-message assistant-message-${message.role}"><span class="assistant-message-avatar">${message.role === 'assistant' ? '✳' : 'RP'}</span><div class="assistant-message-content"><span class="assistant-message-author">${message.role === 'assistant' ? 'Assistant DataOps' : 'Vous'}</span><p>${escapeHTML(message.text)}</p></div></article>`).join('');
  const suggestionButtons = assistantMessages.length === 1
    ? suggestions.map((prompt) => `<button type="button" class="assistant-suggestion" data-assistant-prompt="${escapeHTML(prompt)}">${escapeHTML(prompt)}</button>`).join('')
    : '';
  return `<section class="assistant-page"><header class="assistant-heading"><div><p class="eyebrow">ESPACE DE TRAVAIL · SNCF</p><h1>Assistant IA</h1><p class="page-subtitle">Interrogez vos données en langage naturel et demandez une action.</p></div><span class="assistant-mode"><i></i>Prototype local</span></header><div class="assistant-layout"><section class="assistant-chat" aria-label="Conversation avec l’assistant"><div class="assistant-chat-heading"><div><strong>Assistant DataOps</strong><span>Qualité et gouvernance des données</span></div><span class="assistant-status">Démo</span></div><div class="assistant-thread" id="assistant-thread" aria-live="polite">${messages}</div><div class="assistant-composer-wrap"><div class="assistant-suggestions">${suggestionButtons}</div><form class="assistant-composer" id="assistant-form"><label class="sr-only" for="assistant-input">Votre message</label><textarea id="assistant-input" name="message" rows="1" maxlength="600" placeholder="Posez une question sur vos données..." required></textarea><button class="assistant-send" type="submit" aria-label="Envoyer le message" title="Envoyer">↑</button></form><p class="assistant-disclaimer">Prototype : réponses fondées sur des données d’exemple. Aucune requête n’est envoyée à une IA ou à Databricks.</p></div></section><aside class="assistant-context"><p class="eyebrow">PÉRIMÈTRE DISPONIBLE</p><h2>Sources de la démo</h2><ul><li><span>▤</span>${datasets.length} jeux de données</li><li><span>!</span>${alerts.filter((alert) => alert.status === 'Ouverte').length} alertes ouvertes</li><li><span>⌘</span>${rules.filter((rule) => rule.active).length} règles actives</li></ul><div class="assistant-access-note"><strong>Accès simulé</strong><p>Dans une version connectée, les droits de l’utilisateur devront être vérifiés côté serveur avant chaque lecture ou action.</p></div></aside></div></section>`;
}

function normalizeAssistantText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
}

function answerAssistant(query) {
  const normalizedQuery = normalizeAssistantText(query);
  const datasetMatches = datasets.filter((dataset) => {
    const name = normalizeAssistantText(dataset.name);
    return normalizedQuery.includes(name) || name.split(' ').some((part) => part.length > 4 && normalizedQuery.includes(part));
  });
  const dataset = datasetMatches.length === 1 ? datasetMatches[0] : null;

  if (/\b(lance|lancer|execute|executer|relance|relancer|simule|simuler|simulation)\b/.test(normalizedQuery)) {
    if (!dataset) return 'Pour lancer les contrôles, indiquez le nom exact du jeu de données. Cette action sera simulée dans le prototype.';
    launchChecks(dataset.name);
    return `Simulation lancée pour « ${dataset.name} ». Le contrôle apparaîtra dans la vue Exécutions et son statut passera à « Terminée » après quelques secondes. Aucun traitement réel n’est exécuté.`;
  }

  if (/alerte|anomalie|priorit|urgent/.test(normalizedQuery)) {
    const severityOrder = { Critique: 0, Élevée: 1, Modérée: 2, Faible: 3 };
    const openAlerts = alerts.filter((alert) => alert.status === 'Ouverte')
      .sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity]);
    return openAlerts.length
      ? `Voici les ${openAlerts.length} alertes ouvertes, classées par gravité :\n${openAlerts.map((alert) => `• ${alert.severity} · ${alert.title} — ${alert.dataset} (${alert.detail})`).join('\n')}`
      : 'Aucune alerte ouverte pour le moment.';
  }

  if (dataset && /score|qualite|controle|table|donnee/.test(normalizedQuery)) {
    return `« ${dataset.name} » (${dataset.path}) a un score de qualité de ${dataset.score} %. ${dataset.checks} contrôles sont conformes. Statut : ${dataset.status}. Dernière mise à jour : ${dataset.lastUpdate}.`;
  }

  if (/accessible|catalogue|liste.*(jeu|table)|quels.*(jeu|table)|combien.*(jeu|table)/.test(normalizedQuery)) {
    return `La démo contient ${datasets.length} jeux de données :\n${datasets.map((item) => `• ${item.name} — ${item.domain} (${item.score} %)`).join('\n')}`;
  }

  if (/score|qualite|sante/.test(normalizedQuery)) {
    const average = Math.round(datasets.reduce((total, item) => total + item.score, 0) / datasets.length);
    return `Le score moyen des ${datasets.length} jeux de données de la démo est de ${average} %. ${datasets.filter((item) => item.score < 90).length} jeu(x) ont un score inférieur à 90 %. Pour un détail, indiquez le nom d’un jeu de données.`;
  }

  return 'Je peux consulter les scores, lister les jeux de données, résumer les alertes ou lancer les contrôles simulés. Essayez « Quelles sont les alertes prioritaires ? ».';
}

function submitAssistantMessage(message) {
  const query = message.trim();
  if (!query) return;
  assistantMessages.push({ role: 'user', text: query });
  assistantMessages.push({ role: 'assistant', text: answerAssistant(query) });
  viewContainer.innerHTML = renderAssistant();
  const thread = document.querySelector('#assistant-thread');
  thread.scrollTop = thread.scrollHeight;
  document.querySelector('#assistant-input').focus();
}

function navigateView(view) {
  document.querySelectorAll('.nav-item').forEach((link) => link.classList.toggle('is-active', link.dataset.view === view));
  document.querySelector('#breadcrumb-current').textContent = navLabels[view];
  overviewView.hidden = view !== 'overview';
  viewContainer.hidden = view === 'overview';
  if (view !== 'overview') {
    const pages = { datasets: renderDatasets, rules: renderRules, monitoring: renderExecutions, assistant: renderAssistant, alerts: renderAlerts, catalog: renderCatalog };
    viewContainer.innerHTML = pages[view]();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeDrawer();
}

function applyViewFilters() {
  const query = viewContainer.querySelector('[data-view-search]')?.value.trim().toLocaleLowerCase('fr') ?? '';
  const status = viewContainer.querySelector('[data-status-filter]')?.value ?? 'all';
  const category = viewContainer.querySelector('[data-category-filter]')?.value ?? 'all';
  const rows = [...viewContainer.querySelectorAll('[data-filterable]')];
  let visible = 0;
  rows.forEach((row) => {
    const matchesQuery = row.textContent.toLocaleLowerCase('fr').includes(query);
    const matchesStatus = status === 'all' || row.dataset.statusKey === status;
    const matchesCategory = category === 'all' || row.dataset.category === category;
    row.hidden = !(matchesQuery && matchesStatus && matchesCategory);
    if (!row.hidden) visible += 1;
  });
  const resultCount = viewContainer.querySelector('.view-result-count');
  if (resultCount) resultCount.textContent = `${visible} résultat${visible > 1 ? 's' : ''}`;
}

function launchChecks(datasetName = '') {
  const run = { id: `e${Date.now()}`, job: datasetName ? `quality_${datasetName.toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g, '_')}` : 'daily_quality_check', dataset: datasetName || 'Tous les jeux de données', started: "Aujourd'hui, maintenant", duration: 'En cours', status: 'En cours' };
  executions.unshift(run);
  saveList('dataops-executions', executions);
  showToast(`Contrôles lancés : ${run.dataset}`);
  if (!viewContainer.hidden && document.querySelector('#breadcrumb-current').textContent === navLabels.monitoring) viewContainer.innerHTML = renderExecutions();
  setTimeout(() => {
    const finished = executions.find((item) => item.id === run.id);
    if (finished) {
      finished.duration = '1 min 42 s';
      finished.status = 'Terminée';
      saveList('dataops-executions', executions);
      if (!viewContainer.hidden && document.querySelector('#breadcrumb-current').textContent === navLabels.monitoring) viewContainer.innerHTML = renderExecutions();
      showToast(`Contrôles terminés : ${run.dataset}`);
    }
  }, 1800);
}

viewContainer.addEventListener('input', (event) => {
  if (event.target.matches('[data-view-search]')) applyViewFilters();
});
viewContainer.addEventListener('change', (event) => {
  if (event.target.matches('[data-status-filter], [data-category-filter]')) applyViewFilters();
});
viewContainer.addEventListener('click', (event) => {
  const promptButton = event.target.closest('[data-assistant-prompt]');
  if (promptButton) {
    submitAssistantMessage(promptButton.dataset.assistantPrompt);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, name } = button.dataset;
  if (action === 'open-dataset') openDatasetDetails(name);
  if (action === 'new-rule') ruleDialog.showModal();
  if (action === 'run-all') launchChecks();
  if (action === 'run-check') launchChecks(name);
  if (action === 'resolve-alert') {
    const alert = alerts.find((item) => item.id === id);
    if (alert) alert.status = 'Résolue';
    saveList('dataops-alerts', alerts);
    viewContainer.innerHTML = renderAlerts();
    showToast('Alerte marquée comme résolue');
  }
  if (action === 'toggle-rule') {
    const rule = rules.find((item) => item.id === id);
    if (rule) rule.active = !rule.active;
    saveList('dataops-rules', rules);
    viewContainer.innerHTML = renderRules();
  }
  if (action === 'delete-rule') {
    const index = rules.findIndex((item) => item.id === id);
    if (index !== -1) rules.splice(index, 1);
    saveList('dataops-rules', rules);
    viewContainer.innerHTML = renderRules();
    showToast('Règle supprimée');
  }
});
viewContainer.addEventListener('submit', (event) => {
  if (event.target.matches('#assistant-form')) {
    event.preventDefault();
    submitAssistantMessage(new FormData(event.target).get('message'));
  }
});
viewContainer.addEventListener('keydown', (event) => {
  if (event.target.matches('#assistant-input') && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    event.target.form.requestSubmit();
  }
});

function filterDatasets() {
  const search = searchInput.value.trim().toLocaleLowerCase('fr');
  const filteredOnly = document.querySelector('#filter-button').classList.contains('is-filtered');
  let visible = 0;
  datasetRows.forEach((row) => {
    const matchesSearch = `${row.dataset.name} ${row.dataset.domain}`.toLocaleLowerCase('fr').includes(search);
    const matchesFilter = !document.querySelector('#filter-button').classList.contains('is-filtered') || Boolean(row.querySelector('.status-warning'));
    const matches = matchesSearch && matchesFilter;
    row.hidden = !matches;
    if (matches) visible += 1;
  });
  tableCount.textContent = search
    ? `${visible} jeu${visible > 1 ? 'x' : ''} de données trouvé${visible > 1 ? 's' : ''}`
    : filteredOnly
      ? `${visible} jeu${visible > 1 ? 'x' : ''} de données à surveiller`
      : 'Affichage de 5 jeux de données sur 12';
}

searchInput.addEventListener('input', filterDatasets);

document.querySelector('#filter-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const filtered = button.classList.toggle('is-filtered');
  filterDatasets();
  showToast(filtered ? 'Filtre activé : jeux à surveiller' : 'Tous les jeux de données affichés');
});

const ruleDialog = document.querySelector('#rule-dialog');
document.querySelector('#new-rule-button').addEventListener('click', () => ruleDialog.showModal());
document.querySelector('#rule-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const ruleName = document.querySelector('#rule-name').value.trim();
  const datasetName = document.querySelector('#rule-dataset').value;
  const ruleType = document.querySelector('#rule-type').value;
  rules.unshift({ id: `r${Date.now()}`, name: ruleName, dataset: datasetName, type: ruleType, active: true, lastRun: 'Jamais exécutée' });
  saveList('dataops-rules', rules);
  ruleDialog.close();
  event.currentTarget.reset();
  if (!viewContainer.hidden && document.querySelector('#breadcrumb-current').textContent === navLabels.rules) viewContainer.innerHTML = renderRules();
  showToast(`Règle « ${ruleName} » créée`);
});

document.querySelector('#period-select').addEventListener('change', (event) => {
  showToast(`Période affichée : ${event.target.selectedOptions[0].textContent}`);
});

document.querySelector('#help-button').addEventListener('click', () => showToast('Centre d’aide DataOps · contactez votre équipe plateforme'));
document.querySelector('.notification-button').addEventListener('click', () => showToast('Vous avez 3 anomalies à traiter'));

document.querySelectorAll('.issue-row').forEach((row) => {
  row.addEventListener('click', () => openDatasetDetails(row.dataset.dataset));
});
document.querySelectorAll('.row-menu').forEach((button) => {
  button.addEventListener('click', () => openDatasetDetails(button.closest('tr').dataset.name));
});

const drawer = document.querySelector('#detail-drawer');
const drawerScrim = document.querySelector('#drawer-scrim');
function openDatasetDetails(datasetName) {
  const dataset = datasets.find((item) => item.name === datasetName);
  document.querySelector('#drawer-title').textContent = datasetName;
  document.querySelector('#drawer-table-name').textContent = dataset?.path ?? 'prod.gold.table';
  document.querySelector('#drawer-score-value').textContent = dataset ? `${dataset.score} %` : '96 %';
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  drawerScrim.classList.add('is-open');
}
function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  drawerScrim.classList.remove('is-open');
}
document.querySelector('#drawer-close').addEventListener('click', closeDrawer);
drawerScrim.addEventListener('click', closeDrawer);
document.querySelector('#run-check-button').addEventListener('click', () => {
  launchChecks(document.querySelector('#drawer-title').textContent);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});
