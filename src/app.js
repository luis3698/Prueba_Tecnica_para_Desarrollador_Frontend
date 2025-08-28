// Detecta si estamos sirviendo la UI desde localhost y usa la API local en ese caso.
const DEFAULT_API = 'http://46.202.88.87:8010/usuarios/api/perfil/foto/';
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
document.addEventListener('DOMContentLoaded', function() {
  // Variable para almacenar el perfil actual
  let currentProfile = null;

  // Elementos de la interfaz
  const loginForm = document.getElementById('form-login');
  const profileSection = document.getElementById('view-profile');
  const loginSection = document.getElementById('view-login');
  const editSection = document.getElementById('view-edit');
  const formEdit = document.getElementById('form-edit');
  const btnLogout = document.getElementById('btn-logout');
  const btnUploadPhoto = document.getElementById('btn-upload-photo');
  const btnEdit = document.getElementById('btn-edit');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');

  // Manejar el formulario de login
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
      const response = await fetch('http://46.202.88.87:8010/usuarios/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        loadProfile();
      } else {
        alert('Error en login: ' + (data.message || 'Credenciales incorrectas'));
      }
    } catch (error) {
      console.error(error);
      alert('Error en la conexión.');
    }
  });

  // Función para cargar el perfil
  async function loadProfile() {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://46.202.88.87:8010/usuarios/api/perfil/', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const profile = await response.json();
      currentProfile = profile; // Guardar perfil para edición
      // Rellenar datos del perfil
      document.getElementById('profile-name').textContent = profile.user.first_name + ' ' + profile.user.last_name;
      document.getElementById('profile-email').textContent = profile.email || '';
      document.getElementById('profile-biography').textContent = profile.biografia || '';
      document.getElementById('profile-telefono').textContent = profile.telefono || '';
      document.getElementById('profile-tipo').textContent = profile.tipo_usuario || '';
      if (profile.foto) {
        document.getElementById('profile-photo').src = profile.foto;
      } else {
        document.getElementById('profile-photo').src = 'https://via.placeholder.com/150';
      }
      // Mostrar la sección de perfil y botón de logout
      loginSection.classList.add('d-none');
      profileSection.classList.remove('d-none');
      btnLogout.classList.remove('d-none');
      editSection.classList.add('d-none');
    } catch (e) {
      console.error(e);
      alert('Error al cargar el perfil');
    }
  }

  // Manejar el formulario de edición de perfil
  formEdit.addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const updatedProfile = {
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
    try {
      const response = await fetch('http://46.202.88.87:8010/usuarios/api/usuario/perfil/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(updatedProfile)
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(result.message);
        loadProfile();
      } else {
        alert('Error al editar perfil: ' + result.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error al editar perfil');
    }
  });

  // Manejar la subida de foto
  btnUploadPhoto.addEventListener('click', async function() {
    const token = localStorage.getItem('access_token');
    const fileInput = document.getElementById('photo-input');
    if (fileInput.files.length === 0) {
      alert('Seleccione una foto para subir.');
      return;
    }
    const formData = new FormData();
    formData.append('foto', fileInput.files[0]);
    try {
      const response = await fetch('http://46.202.88.87:8010/usuarios/api/perfil/foto/', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token
          // No se establece 'Content-Type' al enviar FormData
        },
        body: formData
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Foto actualizada correctamente.');
        loadProfile();
      } else {
        alert('Error subiendo foto: ' + result.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error al subir foto');
    }
  });

  // Manejar logout
  btnLogout.addEventListener('click', function() {
    localStorage.removeItem('access_token');
    location.reload();
  });

  // Manejar acción de editar perfil
  btnEdit.addEventListener('click', function() {
    if (!currentProfile) {
      alert('Perfil no cargado.');
      return;
    }
    // Prellenar formulario de edición con los datos actuales
    document.getElementById('edit-first_name').value = currentProfile.user.first_name || '';
    document.getElementById('edit-last_name').value = currentProfile.user.last_name || '';
    document.getElementById('edit-telefono').value = currentProfile.telefono || '';
    document.getElementById('edit-tipo_usuario').value = currentProfile.tipo_usuario || '';
    document.getElementById('edit-tipo_naturaleza').value = currentProfile.tipo_naturaleza || '';
    document.getElementById('edit-biografia').value = currentProfile.biografia || '';
    document.getElementById('edit-documento').value = currentProfile.documento || '';
    document.getElementById('edit-linkedin').value = currentProfile.linkedin || '';
    document.getElementById('edit-twitter').value = currentProfile.twitter || '';
    document.getElementById('edit-github').value = currentProfile.github || '';
    document.getElementById('edit-sitio_web').value = currentProfile.sitio_web || '';
    document.getElementById('edit-esta_verificado').checked = currentProfile.esta_verificado || false;
    // Mostrar formulario de edición y ocultar perfil
    profileSection.classList.add('d-none');
    editSection.classList.remove('d-none');
  });

  // Manejar cancelación de edición
  btnCancelEdit.addEventListener('click', function() {
    editSection.classList.add('d-none');
    profileSection.classList.remove('d-none');
  });

  // Cargar perfil si ya se tiene token
  if (localStorage.getItem('access_token')) {
    loadProfile();
  }
});
