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
  confirmField.value = '';
  termsField.checked = false;
  document.querySelector('#login-tab').classList.toggle('is-active', !signup);
  document.querySelector('#signup-tab').classList.toggle('is-active', signup);
  document.querySelector('#login-tab').setAttribute('aria-selected', String(!signup));
  document.querySelector('#signup-tab').setAttribute('aria-selected', String(signup));
  error.textContent = '';
}

document.querySelector('#login-tab').addEventListener('click', () => setMode('login'));
document.querySelector('#signup-tab').addEventListener('click', () => setMode('signup'));

document.querySelector('#auth-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameField.value.trim();
  const email = emailField.value.trim().toLowerCase();
  const password = passwordField.value;
  if (mode === 'signup' && name.length < 2) return error.textContent = 'Please add your name.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return error.textContent = 'Please enter a valid email address.';
  if (password.length < 6) return error.textContent = 'Password must be at least 6 characters.';
  if (mode === 'signup' && confirmField.value !== password) return error.textContent = 'Your passwords do not match.';
  if (mode === 'signup' && !termsField.checked) return error.textContent = 'Please accept the terms to continue.';
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (mode === 'signup') {
    if (users.some((user) => user.email === email)) return error.textContent = 'That email already has a journal. Try logging in.';
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
  } else {
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) return error.textContent = 'Email or password did not match. Try again.';
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
  }
  window.location.href = '../index.html?app=1';
});

setMode(mode);
