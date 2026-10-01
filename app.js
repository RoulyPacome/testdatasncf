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
  alerts: 'Alertes',
  catalog: 'Catalogue Unity',
};

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelectorAll('.nav-item').forEach((link) => link.classList.remove('is-active'));
    item.classList.add('is-active');
    const view = item.dataset.view;
    document.querySelector('#breadcrumb-current').textContent = navLabels[view];
    if (view === 'datasets') document.querySelector('#datasets-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (view === 'overview') window.scrollTo({ top: 0, behavior: 'smooth' });
    else showToast(`${navLabels[view]} · vue de démonstration`);
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

function filterDatasets() {
  const search = searchInput.value.trim().toLocaleLowerCase('fr');
  let visible = 0;
  datasetRows.forEach((row) => {
    const matches = `${row.dataset.name} ${row.dataset.domain}`.toLocaleLowerCase('fr').includes(search);
    row.hidden = !matches;
    if (matches) visible += 1;
  });
  tableCount.textContent = search
    ? `${visible} jeu${visible > 1 ? 'x' : ''} de données trouvé${visible > 1 ? 's' : ''}`
    : 'Affichage de 5 jeux de données sur 12';
}

searchInput.addEventListener('input', filterDatasets);

document.querySelector('#filter-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const filtered = button.classList.toggle('is-filtered');
  datasetRows.forEach((row) => {
    if (filtered) row.hidden = !row.querySelector('.status-warning');
  });
  if (filtered && searchInput.value) filterDatasets();
  else if (!filtered) filterDatasets();
  if (filtered && !searchInput.value) tableCount.textContent = '1 jeu de données à surveiller';
  showToast(filtered ? 'Filtre activé : jeux à surveiller' : 'Tous les jeux de données affichés');
});

const ruleDialog = document.querySelector('#rule-dialog');
document.querySelector('#new-rule-button').addEventListener('click', () => ruleDialog.showModal());
document.querySelector('#rule-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const ruleName = document.querySelector('#rule-name').value.trim();
  ruleDialog.close();
  event.currentTarget.reset();
  showToast(`Règle « ${ruleName} » créée · synchronisation Databricks simulée`);
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
  const row = datasetRows.find((item) => item.dataset.name === datasetName);
  document.querySelector('#drawer-title').textContent = datasetName;
  document.querySelector('#drawer-table-name').textContent = row?.querySelector('.table-name small').textContent ?? 'prod.gold.table';
  document.querySelector('#drawer-score-value').textContent = row?.querySelector('.table-score').textContent ?? '96 %';
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
  const button = document.querySelector('#run-check-button');
  button.disabled = true;
  button.textContent = 'Contrôles en cours…';
  showToast('Exécution des contrôles lancée');
  setTimeout(() => {
    button.disabled = false;
    button.textContent = 'Lancer les contrôles';
    showToast('Contrôles terminés · résultat disponible dans Exécutions');
  }, 1600);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});
