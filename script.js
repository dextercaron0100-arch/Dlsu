const codeElement = document.querySelector('#captchaCode');
const refreshButton = document.querySelector('#refreshCaptcha');
const passwordInput = document.querySelector('#password');
const togglePassword = document.querySelector('#togglePassword');
const form = document.querySelector('#loginForm');
const message = document.querySelector('#formMessage');

const createCaptcha = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  codeElement.textContent = code;
  codeElement.dataset.code = code;
};

refreshButton.addEventListener('click', () => {
  createCaptcha();
  document.querySelector('#captchaInput').value = '';
  message.textContent = '';
});

togglePassword.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePassword.textContent = isHidden ? 'Hide' : 'Show';
  togglePassword.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const password = passwordInput.value;
  const captcha = document.querySelector('#captchaInput').value.trim().toUpperCase();

  if (!username || !password || !captcha) {
    message.textContent = 'Please complete all fields.';
    return;
  }
  if (captcha !== codeElement.dataset.code) {
    message.textContent = 'The security code is incorrect. Please try again.';
    createCaptcha();
    return;
  }
  message.style.color = '#08783e';
  message.textContent = 'Login form validated. Authentication will be connected next.';
});

createCaptcha();
