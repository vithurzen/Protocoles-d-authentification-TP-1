async function loadProfile() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.status === 401) {
      // Session expirée ou inexistante : retour à l'accueil
      window.location.href = '/';
      return;
    }
    const data = await res.json();
    document.getElementById('user-username').innerText = data.name;
    document.getElementById('user-email').innerText = data.email;
  } catch (err) {
    console.error("Erreur d'affichage :", err);
  }
}

loadProfile();

document.getElementById('reload-profile-btn').addEventListener('click', loadProfile);

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
});
