async function fetchWithRetry(url, options = {}) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.warn("JWT expiré. Tentative de rafraîchissement automatique...");
    const refreshResponse = await fetch('/auth/refresh', { method: 'POST' });
    
    if (refreshResponse.ok) {
      console.log("Nouveau JWT obtenu ! Rejeu de la requête initiale.");
      response = await fetch(url, options);
    } else {
      console.error("Le Refresh Token est également invalide ou révoqué.");
      window.location.href = '/auth/login';
      return null;
    }
  }
  return response;
}

async function loadProfile() {
  try {
    const res = await fetchWithRetry('/api/me');
    if (!res) return;
    const data = await res.json();
    if (data) {
      document.getElementById('user-username').innerText = data.username;
      document.getElementById('user-role').innerText = data.role;
    }
  } catch (err) {
    console.error("Erreur d'affichage :", err);
  }
}

loadProfile();

document.getElementById('reload-profile-btn').addEventListener('click', loadProfile);

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' });
  window.location.href = '/auth/login';
});