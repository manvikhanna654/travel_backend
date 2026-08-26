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

function getUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem('users') || '[]');
    return Array.isArray(stored) ? stored.filter((user) => user && typeof user === 'object') : [];
  } catch (storageError) {
    return [];
  }
}

function saveSession(user) {
  try {
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    return true;
  } catch (storageError) {
    setError('Your browser blocked local storage. Please enable it and try again.');
    return false;
  }
}

document.querySelector('#login-tab').addEventListener('click', () => setMode('login'));
document.querySelector('#signup-tab').addEventListener('click', () => setMode('signup'));

document.querySelector('#auth-form').addEventListener('submit', (event) => {
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
  const users = getUsers();
  submit.disabled = true;
  if (mode === 'signup') {
    if (users.some((user) => String(user.email || '').trim().toLowerCase() === email)) return setError('That email already has a journal. Try logging in.');
    users.push({ name, email, password });
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (storageError) {
      return setError('Could not save your account in this browser. Please try again.');
    }
    if (!saveSession({ name, email })) return;
  } else {
    const user = users.find((item) => String(item.email || '').trim().toLowerCase() === email && item.password === password);
    if (!user) return setError('Email or password did not match. Try again.');
    if (!saveSession({ name: user.name, email: user.email })) return;
  }
  window.location.href = '../index.html?app=1';
});

setMode(mode);
