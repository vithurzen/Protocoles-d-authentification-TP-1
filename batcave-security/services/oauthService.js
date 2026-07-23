function getGoogleAuthUrl (state, codeChallenge) {
  const url = new URL(process.env.GOOGLE_AUTH_ENDPOINT)
  url.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID)
  url.searchParams.append('redirect_uri', process.env.REDIRECT_URI)
  url.searchParams.append('response_type', 'code')
  url.searchParams.append('scope', 'openid profile email')
  url.searchParams.append('state', state)
  url.searchParams.append('code_challenge', codeChallenge)
  url.searchParams.append('code_challenge_method', 'S256')
  return url.toString()
}

async function exchangeCodeForTokens (code, codeVerifier) {
  const response = await fetch(process.env.GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI,
      code_verifier: codeVerifier
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json()
}

function decodeIdToken (idToken) {
  const payloadBase64 = idToken.split('.')[1]
  return JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
}

module.exports = {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  decodeIdToken
}