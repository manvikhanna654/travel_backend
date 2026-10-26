const params = new URLSearchParams(window.location.search);
const card = document.querySelector('.auth-card');
const title = document.querySelector('#auth-title');
const subtitle = document.querySelector('#auth-subtitle');
const nameField = document.querySelector('#auth-name');
const emailField = document.querySelector('#auth-email');
const passwordField = document.querySelector('#auth-password');
const confirmField = document.querySelector('#auth-confirm');
const termsField = document.querySelector('#auth-terms');
const error = document.querySelector('#auth-error');
const submit = document.querySelector('#auth-submit');
let mode = params.get('mode') === 'signup' ? 'signup' : 'login';
const API_BASE = 'http://localhost:5000/api';

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === 'signup';
  card.classList.toggle('is-signup', signup);
  title.textContent = signup ? 'Start your journal.' : 'Welcome back.';
  subtitle.textContent = signup ? 'Create an account and keep every adventure close.' : 'Log in to pick up where you left off.';
  submit.innerHTML = `${signup ? 'Create account' : 'Log in'} <span>→</span>`;
  passwordField.autocomplete = signup ? 'new-password' : 'current-password';
  nameField.required = signup;
  confirmField.required = signup;
  termsField.required = signup;
  confirmField.value = '';
  termsField.checked = false;
  document.querySelector('#login-tab').classList.toggle('is-active', !signup);
  document.querySelector('#signup-tab').classList.toggle('is-active', signup);
  document.querySelector('#login-tab').setAttribute('aria-selected', String(!signup));
  document.querySelector('#signup-tab').setAttribute('aria-selected', String(signup));
  error.textContent = '';
}

function setError(message) {
  error.textContent = message;
  submit.disabled = false;
}

function saveSession(user, token) {
  try {
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    localStorage.setItem('authToken', token);
    return true;
  } catch (storageError) {
    setError('Your browser blocked local storage. Please enable it and try again.');
    return false;
  }
}

document.querySelector('#login-tab').addEventListener('click', () => setMode('login'));
document.querySelector('#signup-tab').addEventListener('click', () => setMode('signup'));

document.querySelector('#auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const name = nameField.value.trim();
  const email = emailField.value.trim().toLowerCase();
  const password = passwordField.value;
  if (mode === 'signup' && name.length < 2) return setError('Please add your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
  if (password.length < 6) return setError('Password must be at least 6 characters.');
  if (mode === 'signup' && confirmField.value !== password) return setError('Your passwords do not match.');
  if (mode === 'signup' && !termsField.checked) return setError('Please accept the terms to continue.');
  submit.disabled = true;
  const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
  const body = mode === 'signup' ? { name, email, password } : { email, password };
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) return setError(result.message || 'Authentication failed. Please try again.');
    if (!saveSession(result.user, result.token)) return;
    // Keep the dashboard on the same host/port that served this login page.
    // This also avoids mixing localhost and 127.0.0.1 localStorage sessions.
    window.location.assign(`${window.location.origin}/index.html?app=1`);
  } catch (networkError) {
    setError('Could not reach the backend. Make sure the server is running on port 5000.');
  } finally {
    submit.disabled = false;
  }
});

setMode(mode);
