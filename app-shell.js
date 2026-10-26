(function loadFeaturePages() {
  var features = [
    'html/auth.html',
    'html/header.html',
    'html/dashboard.html',
    'html/trip-shell.html?v=weather-fix-3',
    'html/expenses.html',
    'html/itinerary.html',
    'html/cafes.html?v=curated-cafes-1',
    'html/packing.html',
    'html/polls.html',
    'html/debts.html',
    'html/modals.html',
    'html/navigation.html'
  ];
  var shell = document.getElementById('app-shell');

  Promise.all(features.map(function (file) {
    return fetch(file).then(function (response) {
      if (!response.ok) throw new Error('Could not load ' + file);
      return response.text();
    });
  })).then(function (pages) {
    shell.innerHTML = pages.join('\n');
    var appScript = document.createElement('script');
    appScript.src = 'app.js?v=9';
    document.body.appendChild(appScript);
  }).catch(function (error) {
    shell.innerHTML = '<p class="shell-error">The app pages could not load. Please run this project through a local server such as VS Code Live Server.</p>';
    console.error(error);
  });
})();

