var trips = JSON.parse(localStorage.getItem('ts_trips') || '[]');
var currentTripId = null;
var currentTravelers = [];
var expenseChart = null;

var CAT_ICONS = { food: '🍜', stay: '🏠', transport: '🚆', activities: '🎠', misc: '📌' };
var CAT_COLORS = { food: '#C97B5A', stay: '#8A9A5B', transport: '#5B7C99', activities: '#D4A24C', misc: '#86736c' };
var CARD_ROTS = ['card-r1', 'card-r2', 'card-r3', 'card-r4'];
var WASHI = ['washi-green', 'washi-blue', 'washi-orange'];
var DEST_PHOTOS = {
  alps: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=75',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75',
  florence: 'https://images.unsplash.com/photo-1534351735168-2f8b31a5b0ae?w=400&q=75',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=75',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=75',
  manali: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&q=75',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=75',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=75',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=75',
  santorini: 'https://images.unsplash.com/photo-1507501336603-6760d5b09d47?w=400&q=75',
  default: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=75'
};

function saveTrips() { localStorage.setItem('ts_trips', JSON.stringify(trips)); }
function getTrip() { return trips.find(function(t) { return t.id === currentTripId; }); }

function showPage(page) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(function(n) { n.classList.remove('active'); });
  if (page === 'dashboard') { document.getElementById('nav-dashboard').classList.add('active'); renderDashboard(); }
  if (page === 'trip') { document.getElementById('nav-trip').classList.add('active'); renderTripPage(); }
  window.scrollTo(0, 0);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.trip-tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
  if (tab === 'expenses') renderExpenses();
  if (tab === 'itinerary') renderItinerary();
  if (tab === 'packing') renderPackingList();
  if (tab === 'debts') renderDebts();
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'modal-add-expense') populateExpenseModal();
  if (id === 'modal-new-trip') resetTripForm();
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(m) {
  m.addEventListener('click', function(e) { if (e.target === m) m.classList.remove('open'); });
});

function toggleMobileMenu() {
  var m = document.getElementById('mobile-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}

function resetTripForm() {
  currentTravelers = [];
  ['trip-name-input','trip-dest-input','trip-start-input','trip-end-input','trip-budget-input','traveler-input'].forEach(function(id) { document.getElementById(id).value = ''; });
  renderTravelerChips();
}
function handleTravelerInput(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    var val = e.target.value.trim().replace(/,$/, '');
    if (val && currentTravelers.indexOf(val) === -1) { currentTravelers.push(val); renderTravelerChips(); }
    e.target.value = '';
  }
}
function renderTravelerChips() {
  document.getElementById('traveler-chips').innerHTML = currentTravelers.map(function(t, i) {
    return '<span class="chip">' + t + '<button class="chip-remove" onclick="removeTraveler(' + i + ')">x</button></span>';
  }).join('');
}
function removeTraveler(i) { currentTravelers.splice(i, 1); renderTravelerChips(); }

function createTrip() {
  var name = document.getElementById('trip-name-input').value.trim();
  var dest = document.getElementById('trip-dest-input').value.trim();
  var start = document.getElementById('trip-start-input').value;
  var end = document.getElementById('trip-end-input').value;
  var budget = parseFloat(document.getElementById('trip-budget-input').value) || 0;
  var extra = document.getElementById('traveler-input').value.trim();
  if (extra && currentTravelers.indexOf(extra) === -1) currentTravelers.push(extra);
  if (!name) { showToast('Please enter a trip name!'); return; }
  if (!dest) { showToast('Please enter a destination!'); return; }
  if (currentTravelers.length === 0) { showToast('Add at least one traveler!'); return; }
  var trip = { id: Date.now().toString(), name: name, dest: dest, start: start, end: end, budget: budget, travelers: currentTravelers.slice(), expenses: [], itinerary: [], packing: [], createdAt: new Date().toISOString() };
  trips.unshift(trip); saveTrips(); closeModal('modal-new-trip');
  showToast('"' + name + '" created! ✈️'); currentTripId = trip.id; showPage('trip');
}

function renderDashboard() {
  var grid = document.getElementById('trips-grid');
  var empty = document.getElementById('empty-trips');
  if (trips.length === 0) { empty.style.display = 'block'; grid.innerHTML = ''; grid.appendChild(empty); return; }
  empty.style.display = 'none';
  grid.innerHTML = trips.map(function(trip, i) { return renderTripCard(trip, i); }).join('');
}

function renderTripCard(trip, i) {
  var rot = CARD_ROTS[i % CARD_ROTS.length];
  var washi = WASHI[i % WASHI.length];
  var totalSpent = trip.expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  var confirmedCount = trip.itinerary.reduce(function(s, d) { return s + d.activities.filter(function(a) { return a.confirmed; }).length; }, 0);
  var photoUrl = getDestPhoto(trip.dest);
  var dateStr = trip.start ? fmtDate(trip.start) + ' - ' + fmtDate(trip.end) : 'Dates TBD';
  var countdown = getCountdown(trip.start);
  var statusHtml = '';
  if (trip.budget && totalSpent > trip.budget) statusHtml = '<span class="badge badge-owe" style="transform:rotate(-1.5deg)">Over Budget</span>';
  else if (totalSpent > 0) statusHtml = '<span class="badge badge-active" style="transform:rotate(1deg)">Active</span>';
  else statusHtml = '<span class="badge badge-settled" style="transform:rotate(2deg)">Planning</span>';
  var badges = '';
  if (confirmedCount > 0) badges += '<span class="badge badge-info">' + confirmedCount + ' confirmed</span>';
  if (totalSpent > 0) badges += '<span class="badge badge-info">&#8377;' + totalSpent.toFixed(0) + ' spent</span>';
  if (countdown !== null && countdown > 0) badges += '<span class="badge badge-active">' + countdown + ' days away</span>';
  else if (countdown === 0) badges += '<span class="badge badge-active">Today!</span>';
  var polRot = i % 2 === 0 ? '-1.5' : '1';
  return '<div class="journal-card ' + rot + '" onclick="openTrip(\'' + trip.id + '\')" id="card-' + trip.id + '">' +
    '<div class="washi-tape ' + washi + '"></div>' +
    '<div class="polaroid" style="transform:rotate(' + polRot + 'deg);margin-bottom:14px;">' +
    '<img src="' + photoUrl + '" alt="' + trip.dest + '" onerror="this.src=\'' + DEST_PHOTOS.default + '\'"/>' +
    '<span class="polaroid-caption">' + trip.dest.toLowerCase() + ', ' + (trip.start ? new Date(trip.start + 'T00:00:00').getFullYear() : '--') + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-end;">' +
    '<div><h3 style="font-family:\'Caveat\',cursive;font-size:1.8rem;color:var(--primary);line-height:1.1;">' + trip.name + '</h3>' +
    '<p style="font-family:\'Space Mono\',monospace;font-size:0.68rem;color:var(--on-surf-var);margin-top:4px;">' + dateStr + ' · ' + trip.travelers.length + ' traveler' + (trip.travelers.length !== 1 ? 's' : '') + '</p>' +
    '<div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap;">' + badges + '</div></div>' +
    statusHtml + '</div>' +
    '<button class="btn-icon btn-danger" style="position:absolute;top:10px;right:10px;font-size:0.68rem;" onclick="event.stopPropagation();deleteTrip(\'' + trip.id + '\')">' +
    '<span class="material-symbols-outlined" style="font-size:0.85rem;">delete</span></button></div>';
}

function openTrip(id) { currentTripId = id; showPage('trip'); }
function deleteTrip(id) {
  if (!confirm('Delete this trip? This cannot be undone.')) return;
  trips = trips.filter(function(t) { return t.id !== id; });
  saveTrips(); renderDashboard(); showToast('Trip deleted.');
}

function renderTripPage() {
  var trip = getTrip(); if (!trip) { showPage('dashboard'); return; }
  document.getElementById('trip-title').textContent = trip.name;
  document.getElementById('trip-dates-badge').textContent = trip.dest + (trip.start ? ' · ' + fmtDate(trip.start) + ' - ' + fmtDate(trip.end) : '');
  var cd = getCountdown(trip.start);
  var el = document.getElementById('trip-countdown');
  if (cd === null) el.textContent = '📅 No date set';
  else if (cd > 0) el.textContent = '📅 ' + cd + ' days to go!';
  else if (cd === 0) el.textContent = '🎉 Trip starts TODAY!';
  else el.textContent = '📸 ' + Math.abs(cd) + ' days ago';
  var totalSpent = trip.expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  var perPerson = trip.travelers.length > 0 ? totalSpent / trip.travelers.length : 0;
  document.getElementById('trip-summary-grid').innerHTML =
    '<div class="summary-stat" style="transform:rotate(-1deg)"><span class="stat-emoji">💰</span><span class="stat-value">&#8377;' + totalSpent.toFixed(2) + '</span><div class="stat-label">Total Spent</div></div>' +
    '<div class="summary-stat" style="transform:rotate(1deg)"><span class="stat-emoji">🧑</span><span class="stat-value">&#8377;' + perPerson.toFixed(2) + '</span><div class="stat-label">Per Person</div></div>' +
    '<div class="summary-stat" style="transform:rotate(-0.5deg)"><span class="stat-emoji">👥</span><span class="stat-value">' + trip.travelers.length + '</span><div class="stat-label">Travelers</div></div>' +
    '<div class="summary-stat" style="transform:rotate(0.8deg)"><span class="stat-emoji">🧾</span><span class="stat-value">' + trip.expenses.length + '</span><div class="stat-label">Expenses</div></div>';
  document.getElementById('trip-meta-bar').innerHTML = trip.travelers.map(function(t) {
    return '<span class="chip"><span class="material-symbols-outlined" style="font-size:0.8rem;">person</span>' + t + '</span>';
  }).join('');
  switchTab('expenses');
}

function populateExpenseModal() {
  var trip = getTrip(); if (!trip) return;
  document.getElementById('exp-paidby-input').innerHTML = trip.travelers.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  document.getElementById('exp-split-checks').innerHTML = trip.travelers.map(function(t) {
    return '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:0.82rem;"><input type="checkbox" value="' + t + '" checked style="accent-color:var(--primary);width:14px;height:14px;"/> ' + t + '</label>';
  }).join('');
}

function addExpense() {
  var trip = getTrip(); if (!trip) return;
  var desc = document.getElementById('exp-desc-input').value.trim();
  var amount = parseFloat(document.getElementById('exp-amount-input').value);
  var category = document.getElementById('exp-category-input').value;
  var paidBy = document.getElementById('exp-paidby-input').value;
  var splitBoxes = document.querySelectorAll('#exp-split-checks input:checked');
  var splitBetween = Array.from(splitBoxes).map(function(b) { return b.value; });
  if (!desc) { showToast('Add a description!'); return; }
  if (!amount || amount <= 0) { showToast('Enter a valid amount!'); return; }
  if (splitBetween.length === 0) { showToast('Select who to split between!'); return; }
  trip.expenses.push({ id: Date.now().toString(), desc: desc, amount: amount, category: category, paidBy: paidBy, splitBetween: splitBetween, settled: false, createdAt: new Date().toISOString() });
  saveTrips(); closeModal('modal-add-expense');
  document.getElementById('exp-desc-input').value = ''; document.getElementById('exp-amount-input').value = '';
  renderExpenses(); updateSummaryStats(); showToast('Expense added! 🧾');
}

function updateSummaryStats() {
  var trip = getTrip(); if (!trip) return;
  var totalSpent = trip.expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  var perPerson = trip.travelers.length > 0 ? totalSpent / trip.travelers.length : 0;
  var sg = document.getElementById('trip-summary-grid');
  if (sg) sg.innerHTML =
    '<div class="summary-stat" style="transform:rotate(-1deg)"><span class="stat-emoji">💰</span><span class="stat-value">&#8377;' + totalSpent.toFixed(2) + '</span><div class="stat-label">Total Spent</div></div>' +
    '<div class="summary-stat" style="transform:rotate(1deg)"><span class="stat-emoji">🧑</span><span class="stat-value">&#8377;' + perPerson.toFixed(2) + '</span><div class="stat-label">Per Person</div></div>' +
    '<div class="summary-stat" style="transform:rotate(-0.5deg)"><span class="stat-emoji">👥</span><span class="stat-value">' + trip.travelers.length + '</span><div class="stat-label">Travelers</div></div>' +
    '<div class="summary-stat" style="transform:rotate(0.8deg)"><span class="stat-emoji">🧾</span><span class="stat-value">' + trip.expenses.length + '</span><div class="stat-label">Expenses</div></div>';
}

function renderExpenses() {
  var trip = getTrip(); if (!trip) return;
  var total = trip.expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  if (trip.budget > 0) {
    document.getElementById('budget-bar-wrap').style.display = 'block';
    var pct = Math.min((total / trip.budget) * 100, 100);
    document.getElementById('budget-bar-fill').style.width = pct + '%';
    document.getElementById('budget-bar-fill').className = 'budget-bar-fill' + (total > trip.budget ? ' over' : '');
    document.getElementById('budget-label').textContent = '\u20b9' + total.toFixed(0) + ' / \u20b9' + trip.budget;
  }
  var list = document.getElementById('receipts-list');
  if (trip.expenses.length === 0) {
    list.innerHTML = '<div class="receipts-empty-box"><span class="receipts-empty-icon">🧾</span><span class="receipts-empty-title">No receipts yet!</span><p class="receipts-empty-sub">Hit <strong>+ Add Expense</strong> to log your first spend.<br>Everything is split automatically between travelers.</p></div>';
  } else {
    list.innerHTML = trip.expenses.map(function(exp, i) {
      var perPerson = (exp.amount / exp.splitBetween.length).toFixed(2);
      var sign = i % 2 === 0 ? '-' : '+'; var deg = 1 + (i % 2);
      return '<div class="receipt-slip" style="transform:rotate(' + sign + deg + 'deg);' + (exp.settled ? 'opacity:0.55;' : '') + '">' +
        '<div class="receipt-dashed" style="display:flex;justify-content:space-between;align-items:flex-start;">' +
        '<div><p class="receipt-desc">' + exp.desc + (exp.settled ? ' <span style="color:var(--secondary);font-family:Caveat,cursive;font-size:0.95rem;">✓ settled</span>' : '') + '</p>' +
        '<p class="receipt-meta">' + CAT_ICONS[exp.category] + ' ' + exp.category + ' · Paid by ' + exp.paidBy + '</p>' +
        '<p class="receipt-meta" style="margin-top:3px;">Split: ' + exp.splitBetween.join(', ') + ' · \u20b9' + perPerson + '/person</p></div>' +
        '<span class="receipt-amount">\u20b9' + exp.amount.toFixed(2) + '</span></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn-icon" onclick="toggleSettled(\'' + exp.id + '\')" style="font-size:0.7rem;">' + (exp.settled ? '↩ Unsettle' : '✓ Settle') + '</button>' +
        '<button class="btn-icon btn-danger" onclick="deleteExpense(\'' + exp.id + '\')" style="font-size:0.7rem;">✕ Remove</button></div></div>';
    }).join('');
  }
  renderExpenseChart(trip);
}

function renderExpenseChart(trip) {
  var cats = ['food', 'stay', 'transport', 'activities', 'misc'];
  var totals = cats.map(function(c) { return trip.expenses.filter(function(e) { return e.category === c; }).reduce(function(s, e) { return s + e.amount; }, 0); });
  var ctx = document.getElementById('expense-chart');
  if (!ctx) return;
  if (expenseChart) { expenseChart.destroy(); expenseChart = null; }
  var hasData = totals.some(function(v) { return v > 0; });
  if (!hasData) { ctx.parentElement.innerHTML = '<p style="text-align:center;color:var(--on-surf-var);font-size:0.82rem;padding:20px;">Add expenses to see breakdown</p>'; return; }
  expenseChart = new Chart(ctx, { type: 'doughnut', data: { labels: cats.map(function(c) { return CAT_ICONS[c] + ' ' + c; }), datasets: [{ data: totals, backgroundColor: cats.map(function(c) { return CAT_COLORS[c]; }), borderWidth: 2, borderColor: '#F7F1E3' }] }, options: { cutout: '62%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Space Mono', size: 10 }, padding: 8 } } } } });
  document.getElementById('category-summary').innerHTML = cats.map(function(c, i) {
    return totals[i] > 0 ? '<div style="display:flex;justify-content:space-between;font-size:0.75rem;padding:3px 0;border-bottom:1px dashed var(--outline-variant);"><span>' + CAT_ICONS[c] + ' ' + c + '</span><span style="font-family:Space Mono,monospace;font-weight:700;">\u20b9' + totals[i].toFixed(2) + '</span></div>' : '';
  }).join('');
}

function toggleSettled(expId) { var trip = getTrip(); if (!trip) return; var exp = trip.expenses.find(function(e) { return e.id === expId; }); if (exp) { exp.settled = !exp.settled; saveTrips(); renderExpenses(); updateSummaryStats(); } }
function deleteExpense(expId) { var trip = getTrip(); if (!trip) return; trip.expenses = trip.expenses.filter(function(e) { return e.id !== expId; }); saveTrips(); renderExpenses(); updateSummaryStats(); }

function calculateDebts(trip) {
  var balances = {}; trip.travelers.forEach(function(t) { balances[t] = 0; });
  trip.expenses.filter(function(e) { return !e.settled; }).forEach(function(exp) {
    var share = exp.amount / exp.splitBetween.length;
    exp.splitBetween.forEach(function(p) { balances[p] = (balances[p] || 0) - share; });
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
  });
  return balances;
}
function simplifyDebts(balances) {
  var creditors = [], debtors = [];
  Object.entries(balances).forEach(function(e) { var p = e[0], b = e[1]; if (b > 0.01) creditors.push({ person: p, amount: b }); else if (b < -0.01) debtors.push({ person: p, amount: -b }); });
  creditors.sort(function(a, b) { return b.amount - a.amount; }); debtors.sort(function(a, b) { return b.amount - a.amount; });
  var tx = [], ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    var cr = creditors[ci], db = debtors[di], amt = Math.min(cr.amount, db.amount);
    tx.push({ from: db.person, to: cr.person, amount: amt }); cr.amount -= amt; db.amount -= amt;
    if (cr.amount < 0.01) ci++; if (db.amount < 0.01) di++;
  }
  return tx;
}
function renderDebts() {
  var trip = getTrip(); if (!trip) return;
  var balances = calculateDebts(trip); var tx = simplifyDebts(balances);
  var dlist = document.getElementById('debts-list');
  dlist.innerHTML = tx.length === 0 ? '<div style="text-align:center;padding:24px;font-family:Caveat,cursive;font-size:1.6rem;color:var(--secondary);">🎉 All settled up!</div>' :
    tx.map(function(t) { return '<div class="debt-card"><span>' + t.from + '</span><span style="color:var(--primary);font-weight:700;">\u2192 \u20b9' + t.amount.toFixed(2) + ' \u2192</span><span>' + t.to + '</span><span class="badge badge-owe">owes</span></div>'; }).join('');
  document.getElementById('balances-list').innerHTML = Object.entries(balances).map(function(e) {
    var p = e[0], b = e[1];
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--surface);border:1px solid var(--outline-variant);margin-bottom:6px;box-shadow:1px 1px 0 rgba(29,28,19,0.1);">' +
      '<span><span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:middle;">person</span> ' + p + '</span>' +
      '<span style="font-family:Space Mono,monospace;font-weight:700;color:' + (b >= 0 ? 'var(--secondary)' : 'var(--error)') + ';">\u20b9' + Math.abs(b).toFixed(2) + '</span></div>';
  }).join('');
}

function addDay() {
  var trip = getTrip(); if (!trip) return;
  var label = document.getElementById('day-label-input').value.trim();
  if (!label) { showToast('Enter a day label!'); return; }
  trip.itinerary.push({ id: Date.now().toString(), label: label, activities: [] });
  saveTrips(); closeModal('modal-add-day'); document.getElementById('day-label-input').value = ''; renderItinerary(); showToast('Day added!');
}
function addActivity(dayId) {
  var trip = getTrip(); if (!trip) return;
  var input = document.getElementById('act-input-' + dayId); var text = input.value.trim(); if (!text) return;
  var day = trip.itinerary.find(function(d) { return d.id === dayId; }); if (!day) return;
  day.activities.push({ id: Date.now().toString(), text: text, upvotes: 0, downvotes: 0, confirmed: false });
  saveTrips(); input.value = ''; renderItinerary(); showToast('Activity added!');
}
function voteActivity(dayId, actId, type) {
  var trip = getTrip(); if (!trip) return;
  var day = trip.itinerary.find(function(d) { return d.id === dayId; }); if (!day) return;
  var act = day.activities.find(function(a) { return a.id === actId; }); if (!act) return;
  if (type === 'up') act.upvotes++; else act.downvotes++;
  var maxNet = Math.max.apply(null, day.activities.map(function(a) { return a.upvotes - a.downvotes; }));
  day.activities.forEach(function(a) { a.confirmed = (a.upvotes - a.downvotes === maxNet && maxNet > 0); });
  saveTrips(); renderItinerary();
}
function deleteDay(dayId) { var trip = getTrip(); if (!trip) return; trip.itinerary = trip.itinerary.filter(function(d) { return d.id !== dayId; }); saveTrips(); renderItinerary(); }
function deleteActivity(dayId, actId) { var trip = getTrip(); if (!trip) return; var day = trip.itinerary.find(function(d) { return d.id === dayId; }); if (!day) return; day.activities = day.activities.filter(function(a) { return a.id !== actId; }); saveTrips(); renderItinerary(); }

function renderItinerary() {
  var trip = getTrip(); if (!trip) return;
  var tl = document.getElementById('itinerary-timeline');
  if (trip.itinerary.length === 0) { tl.innerHTML = '<div class="tip-strip"><span class="tip-icon">📓</span><span>Your journey diary is blank! Click <strong>+ Add Day</strong> to create day-by-day plans. Vote on activities and the best one gets highlighted automatically.</span></div>'; return; }
  tl.innerHTML = trip.itinerary.map(function(day, di) {
    return '<div class="day-block">' +
      '<div class="day-dot" style="background:' + (di === 0 ? 'var(--secondary)' : 'var(--surface-highest)') + '"></div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><h3 class="day-heading">' + day.label + '</h3>' +
      '<button class="btn-icon btn-danger" onclick="deleteDay(\'' + day.id + '\')" style="font-size:0.68rem;">✕</button></div>' +
      (day.activities.length === 0 ? '<p style="color:var(--on-surf-var);font-size:0.8rem;margin-bottom:8px;">No activities yet</p>' : '') +
      day.activities.map(function(act) {
        return '<div class="activity-item ' + (act.confirmed ? 'confirmed' : (act.downvotes > act.upvotes ? 'maybe' : '')) + '">' +
          '<span class="activity-text">' + (act.confirmed ? '<span class="highlighter">' + act.text + '</span>' : act.text) + (act.confirmed ? ' <span style="color:var(--secondary);font-family:Caveat,cursive;font-size:0.88rem;">✓ confirmed</span>' : '') + '</span>' +
          '<button class="btn-icon voted" onclick="voteActivity(\'' + day.id + '\',\'' + act.id + '\',\'up\')" title="Upvote">👍 <span class="vote-count">' + act.upvotes + '</span></button>' +
          '<button class="btn-icon" onclick="voteActivity(\'' + day.id + '\',\'' + act.id + '\',\'down\')" title="Downvote">👎 <span class="vote-count">' + act.downvotes + '</span></button>' +
          '<button class="btn-icon btn-danger" onclick="deleteActivity(\'' + day.id + '\',\'' + act.id + '\')" title="Remove">✕</button></div>';
      }).join('') +
      '<div class="add-activity-form"><div style="display:flex;gap:8px;align-items:flex-end;">' +
      '<input id="act-input-' + day.id + '" class="journal-input" type="text" placeholder="Suggest an activity..." onkeydown="if(event.key===\'Enter\')addActivity(\'' + day.id + '\')" style="flex:1;"/>' +
      '<button class="btn btn-sm" onclick="addActivity(\'' + day.id + '\')" style="padding:6px 10px;">+ Add</button></div></div></div>';
  }).join('');
}

function addCafeToDay(dayId, cafeName) {
  var trip = getTrip(); if (!trip) return;
  var day = trip.itinerary.find(function(d) { return d.id === dayId; });
  if (!day) { showToast('Day not found. Add days in Itinerary tab first!'); return; }
  day.activities.push({ id: Date.now().toString(), text: '☕ ' + cafeName, upvotes: 0, downvotes: 0, confirmed: false });
  saveTrips(); showToast('"' + cafeName + '" added to ' + day.label + '!');
}

async function searchCafes() {
  var city = document.getElementById('cafe-city-input').value.trim();
  if (!city) { showToast('Enter a city name!'); return; }
  var loading = document.getElementById('cafe-loading'); var grid = document.getElementById('cafe-grid');
  loading.style.display = 'block'; grid.innerHTML = '';
  var FSQ_KEY = 'fsq3e4y8Q1z2qFzJ4K7M9N1P3R5T7V9X1Z3b5d7f9h1j3l5n7p9r1t3v5x7z9=';
  var url = 'https://api.foursquare.com/v3/places/search?query=cafe&near=' + encodeURIComponent(city) + '&categories=13032&limit=12&fields=name,location,rating';
  try {
    var res = await fetch(url, { headers: { 'Authorization': FSQ_KEY, 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('API error');
    var data = await res.json(); loading.style.display = 'none'; renderCafes(data.results || []);
  } catch (err) { loading.style.display = 'none'; renderCafes(getMockCafes(city)); }
}
function getMockCafes(city) {
  return [
    { name: 'The Wanderer Cafe', location: { formatted_address: '12 Main St, ' + city }, rating: 8.4 },
    { name: 'Scrapbook Coffee', location: { formatted_address: 'Old Quarter, ' + city }, rating: 9.1 },
    { name: 'Journal & Brew', location: { formatted_address: '5 Heritage Lane, ' + city }, rating: 8.7 },
    { name: 'Polaroid Espresso', location: { formatted_address: 'Bazaar Road, ' + city }, rating: 7.9 },
    { name: 'Washi Tape Cafe', location: { formatted_address: 'Near Museum, ' + city }, rating: 8.2 },
    { name: 'The Torn Receipt', location: { formatted_address: 'Market Square, ' + city }, rating: 8.8 }
  ];
}
function renderCafes(cafes) {
  var grid = document.getElementById('cafe-grid'); var trip = getTrip();
  if (cafes.length === 0) { grid.innerHTML = '<p style="color:var(--on-surf-var);font-size:0.85rem;grid-column:1/-1;">No cafes found.</p>'; return; }
  grid.innerHTML = cafes.map(function(cafe, i) {
    var addr = (cafe.location && cafe.location.formatted_address) || 'Address not available';
    var rating = cafe.rating ? 'â­ ' + cafe.rating.toFixed(1) + ' / 10' : 'â­ --';
    var daySelHtml = trip && trip.itinerary.length > 0 ?
      '<div style="margin-top:10px;"><select class="journal-input cafe-sel-' + i + '" style="font-size:0.72rem;padding:4px;width:100%;margin-bottom:6px;">' +
      trip.itinerary.map(function(d) { return '<option value="' + d.id + '">' + d.label + '</option>'; }).join('') + '</select>' +
      '<button class="btn btn-sm" style="width:100%;" onclick="addCafeToItinerary(\'' + cafe.name + '\',' + i + ')"><span class="material-symbols-outlined" style="font-size:0.85rem;">add</span> Add to Day</button></div>' :
      '<p style="font-size:0.72rem;color:var(--on-surf-var);margin-top:8px;">Add days in Itinerary tab first</p>';
    return '<div class="cafe-card" style="transform:rotate(' + (i % 2 === 0 ? '-' : '') + '0.5deg);">' +
      '<p class="cafe-name">' + cafe.name + '</p><p class="cafe-address">' + addr + '</p><p class="cafe-rating">' + rating + '</p>' + daySelHtml + '</div>';
  }).join('');
}
function addCafeToItinerary(cafeName, idx) {
  var sel = document.querySelector('.cafe-sel-' + idx);
  if (!sel) { showToast('No day selected!'); return; }
  addCafeToDay(sel.value, cafeName);
}

function addPackItem() {
  var trip = getTrip(); if (!trip) return;
  var input = document.getElementById('pack-input'); var text = input.value.trim(); if (!text) return;
  trip.packing.push({ id: Date.now().toString(), text: text, checked: false });
  saveTrips(); input.value = ''; renderPackingList(); showToast('Item added!');
}
function togglePack(itemId) { var trip = getTrip(); if (!trip) return; var item = trip.packing.find(function(p) { return p.id === itemId; }); if (item) { item.checked = !item.checked; saveTrips(); renderPackingList(); } }
function deletePackItem(itemId) { var trip = getTrip(); if (!trip) return; trip.packing = trip.packing.filter(function(p) { return p.id !== itemId; }); saveTrips(); renderPackingList(); }
function renderPackingList() {
  var trip = getTrip(); if (!trip) return;
  var checked = trip.packing.filter(function(p) { return p.checked; }).length;
  document.getElementById('packing-progress-badge').textContent = checked + '/' + trip.packing.length + ' packed';
  var list = document.getElementById('packing-list');
  if (trip.packing.length === 0) { list.innerHTML = '<div class="tip-strip"><span class="tip-icon">🎒</span><span>Your bag is empty! Type an item above and press <strong>Enter</strong> or <strong>+ Add</strong> to start your packing list.</span></div>'; return; }
  list.innerHTML = trip.packing.map(function(item) {
    return '<div class="pack-item ' + (item.checked ? 'checked' : '') + '">' +
      '<div class="pack-check ' + (item.checked ? 'checked' : '') + '" onclick="togglePack(\'' + item.id + '\')">' + (item.checked ? 'âœ“' : '') + '</div>' +
      '<span style="flex:1;font-size:0.88rem;">' + item.text + '</span>' +
      '<button class="btn-icon btn-danger" onclick="deletePackItem(\'' + item.id + '\')" style="font-size:0.7rem;">âœ•</button></div>';
  }).join('');
}

function fmtDate(d) { if (!d) return '--'; var dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
function getCountdown(startDate) { if (!startDate) return null; var now = new Date(); now.setHours(0, 0, 0, 0); var start = new Date(startDate + 'T00:00:00'); return Math.round((start - now) / (1000 * 60 * 60 * 24)); }
function getDestPhoto(dest) { var key = (dest || '').toLowerCase().split(',')[0].trim(); return DEST_PHOTOS[key] || DEST_PHOTOS['default']; }

renderDashboard();
