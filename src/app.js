// Detecta si estamos sirviendo la UI desde localhost y usa la API local en ese caso.
const DEFAULT_API = 'http://46.202.88.87:8010/usuarios/api';
const LOCAL_API = 'http://localhost:8010/usuarios/api';
const API_BASE = (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? LOCAL_API : DEFAULT_API;

// ---------- Helpers ----------
function setToken(access) {
  localStorage.setItem('access_token', access);
}
function getToken() {
  return localStorage.getItem('access_token');
}
function authHeader() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function apiGetProfile() {
  const res = await fetch(`${API_BASE}/perfil/`, {
    headers: { ...authHeader() }
  });
  return res.json();
}

async function apiUpdateProfile(payload) {
  const res = await fetch(`${API_BASE}/usuario/perfil/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function apiUploadPhoto(file) {
  const fd = new FormData();
  fd.append('foto', file);
  const res = await fetch(`${API_BASE}/perfil/foto/`, {
    method: 'PATCH',
    headers: { ...authHeader() },
    body: fd
  });
  return res.json();
}

// ---------- UI ----------
function showMessage(type, text) {
  const box = document.getElementById('messageBox');
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
    ${text}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

function showView(id) {
  document.getElementById('view-login').classList.add('d-none');
  document.getElementById('view-profile').classList.add('d-none');
  document.getElementById('view-edit').classList.add('d-none');
  document.getElementById(id).classList.remove('d-none');
}

function updateNavForAuth() {
  const btn = document.getElementById('btn-logout');
  if (getToken()) {
    btn.classList.remove('d-none');
  } else {
    btn.classList.add('d-none');
  }
}

async function loadAndShowProfile() {
  try {
    const data = await apiGetProfile();
    if (data && data.status === 'success' && data.data) {
      const p = data.data;
      const usr = p.user || {};
      document.getElementById('profile-name').textContent = `${usr.first_name || ''} ${usr.last_name || ''}`;
      document.getElementById('profile-email').textContent = usr.email || '';
  document.getElementById('profile-telefono').textContent = p.telefono || '';
  document.getElementById('profile-tipo').textContent = p.tipo_usuario || '';
  // headline: use a short combination or fallback
  const headline = p.titulo || p.headline || `${p.tipo_usuario || ''} ${p.tipo_naturaleza || ''}`;
  document.getElementById('profile-headline').textContent = (headline || '').trim();
      document.getElementById('profile-biography').textContent = p.biografia || '';
      document.getElementById('profile-meta').textContent = `${p.tipo_usuario || ''} · ${p.tipo_naturaleza || ''}`;
      // photo
      const img = document.getElementById('profile-photo');
      if (p.foto) {
        img.src = p.foto + '?t=' + Date.now();
      } else {
        img.src = 'https://via.placeholder.com/600x400?text=Sin+foto';
      }
      // socials
      const ul = document.getElementById('profile-socials');
      ul.innerHTML = '';
      [['LinkedIn', p.linkedin], ['Twitter', p.twitter], ['GitHub', p.github], ['Sitio', p.sitio_web]].forEach(([label, url]) => {
        if (url) {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${label}:</strong> <a href="${url}" target="_blank">${url}</a>`;
          ul.appendChild(li);
        }
      });
      // populate edit form
      populateEditForm(p);
      showView('view-profile');
      updateNavForAuth();
    } else {
      showMessage('warning', data.message || 'No se pudo obtener el perfil');
    }
  } catch (err) {
    console.error(err);
    showMessage('danger', 'Error de conexión al obtener el perfil');
  }
}

function populateEditForm(p) {
  const usr = (p && p.user) ? p.user : {};
  document.getElementById('edit-first_name').value = usr.first_name || '';
  document.getElementById('edit-last_name').value = usr.last_name || '';
  document.getElementById('edit-telefono').value = p.telefono || '';
  document.getElementById('edit-tipo_usuario').value = p.tipo_usuario || '';
  document.getElementById('edit-tipo_naturaleza').value = p.tipo_naturaleza || '';
  document.getElementById('edit-biografia').value = p.biografia || '';
  document.getElementById('edit-documento').value = p.documento || '';
  document.getElementById('edit-linkedin').value = p.linkedin || '';
  document.getElementById('edit-twitter').value = p.twitter || '';
  document.getElementById('edit-github').value = p.github || '';
  document.getElementById('edit-sitio_web').value = p.sitio_web || '';
  document.getElementById('edit-esta_verificado').checked = (p.esta_verificado === true || p.esta_verificado === 'true');
}

// ---------- Events ----------
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formEdit = document.getElementById('form-edit');
  const btnEdit = document.getElementById('btn-edit');
  const btnCancel = document.getElementById('btn-cancel-edit');
  const btnLogout = document.getElementById('btn-logout');
  const btnUpload = document.getElementById('btn-upload-photo');

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    showMessage('info', 'Iniciando sesión...');
    try {
      const res = await apiLogin(u, p);
      if (res && res.access) {
        setToken(res.access);
        showMessage('success', 'Login exitoso');
        await loadAndShowProfile();
      } else {
        showMessage('danger', (res && (res.detail || res.message)) || 'Error en login');
      }
    } catch (err) {
      console.error(err);
      showMessage('danger', 'Error de red en login');
    }
  });

  btnEdit.addEventListener('click', () => showView('view-edit'));
  btnCancel.addEventListener('click', () => showView('view-profile'));

  formEdit.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      user: {
        first_name: document.getElementById('edit-first_name').value,
        last_name: document.getElementById('edit-last_name').value
      },
      telefono: document.getElementById('edit-telefono').value,
      tipo_usuario: document.getElementById('edit-tipo_usuario').value,
      tipo_naturaleza: document.getElementById('edit-tipo_naturaleza').value,
      biografia: document.getElementById('edit-biografia').value,
      documento: document.getElementById('edit-documento').value,
      linkedin: document.getElementById('edit-linkedin').value,
      twitter: document.getElementById('edit-twitter').value,
      github: document.getElementById('edit-github').value,
      sitio_web: document.getElementById('edit-sitio_web').value,
      esta_verificado: document.getElementById('edit-esta_verificado').checked
    };
    showMessage('info', 'Guardando cambios...');
    try {
      const res = await apiUpdateProfile(payload);
      if (res && res.status === 'success') {
        showMessage('success', res.message || 'Perfil actualizado correctamente');
        await loadAndShowProfile();
      } else {
        showMessage('danger', (res && (res.message || JSON.stringify(res))) || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      showMessage('danger', 'Error de red al actualizar');
    }
  });

  btnUpload.addEventListener('click', async () => {
    const input = document.getElementById('photo-input');
    if (!input.files || input.files.length === 0) {
      showMessage('warning', 'Selecciona un archivo primero');
      return;
    }
    const file = input.files[0];
    showMessage('info', 'Subiendo foto...');
    try {
      const res = await apiUploadPhoto(file);
      if (res && res.status === 'success') {
        showMessage('success', res.message || 'Foto actualizada');
        await loadAndShowProfile();
      } else {
        showMessage('danger', (res && (res.message || JSON.stringify(res))) || 'Error al subir foto');
      }
    } catch (err) {
      console.error(err);
      showMessage('danger', 'Error de red al subir foto');
    }
  });

  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    updateNavForAuth();
    showView('view-login');
  });

  // inicial
  if (getToken()) {
    loadAndShowProfile();
  } else {
    showView('view-login');
  }
});
