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
                    <button id="btnConfirm2FA">Confirmer l'activation</button>
                `
    document.getElementById('btnConfirm2FA').addEventListener('click', confirm2FAActivation)
  }
}

async function confirm2FAActivation () {
  const res = await fetch('/auth/confirm-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: currentUsername,
      code: document.getElementById('confirmCode').value
    })
  })
  const data = await res.json()
}

async function login () {
  currentUsername = document.getElementById('user').value
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: currentUsername,
      password: document.getElementById('pass').value
    })
  })
  const data = await res.json()

  if (data.requires2FA) {
    document.getElementById('zone2FA').style.display = 'block'
  } else if (data.success) {
    window.location.href = '/dashboard'
  } else {
    alert(data.error)
  }
}

document.getElementById('btnLogin').addEventListener('click', login)
document.getElementById('btnQR').addEventListener('click', chargeQR)


async function valid2FAConnection2FA () {
  const res = await fetch('/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: currentUsername,
      code: document.getElementById('code2FA').value
    })
  })
  const data = await res.json()

  if (data.success) {
    window.location.href = '/dashboard'
  } else {
    alert(data.error)
  }
}

document.getElementById('btnVerifyLogin2FA').addEventListener('click', valid2FAConnection2FA)
