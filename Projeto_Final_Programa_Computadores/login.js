const API = 'http://localhost:3000/api';

if (localStorage.getItem('authToken')) {
  window.location.href = 'index.html';
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('loginMessage');
  message.textContent = '';

  const login = document.getElementById('login').value.trim();
  const senha = document.getElementById('password').value;

  try {
    const response = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.');

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userLogin', data.usuario.login);
    window.location.href = 'index.html';
  } catch (error) {
    message.textContent = error.message;
  }
});
