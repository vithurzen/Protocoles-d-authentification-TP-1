async function login () {
  const username = document.getElementById('user').value
  const password = document.getElementById('pass').value

  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()

  if (!res.ok) {
    alert(data.erreur)
    return
  }

  if (data.require2FA) {
    document.getElementById('zone2FA').style.display = 'block'
  } else {
    alert(data.message)
  }
}

async function valid2FAConnection2FA () {
  const code = document.getElementById('code2FA').value

  const res = await fetch('/auth/login-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  const data = await res.json()

  if (!res.ok) {
    alert(data.erreur)
    return
  }

  document.getElementById('zone2FA').style.display = 'none'
  alert(data.message)
}

let currentUsername = ''
async function chargeQR () {
  currentUsername = document.getElementById('user').value
  const res = await fetch('/auth/setup-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUsername })
  })
  const data = await res.json()

  if (data.qrCode) {
    document.getElementById('qrZone').innerHTML = `
                    <p>Scannez ce QR Code avec votre application d'authentification :</p>
                    <img src="${data.qrCode}"><br><br>
                    <input type="text" id="confirmCode" placeholder="Code à 6 chiffres">
                    <button onclick="confirm2FAActivation()">Confirmer l'activation</button>
                `
  }
}

async function confirm2FAActivation () {
  const code = document.getElementById('confirmCode').value

  const res = await fetch('/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  const data = await res.json()

  if (!res.ok) {
    alert(data.erreur)
    return
  }

  document.getElementById('qrZone').innerHTML = `<p>✅ ${data.message}</p>`
}

document.getElementById('btnLogin').addEventListener('click', login)
document.getElementById('btnVerifyLogin2FA').addEventListener('click', valid2FAConnection2FA)
document.getElementById('btnQR').addEventListener('click', chargeQR)
