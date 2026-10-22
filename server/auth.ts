import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Connect, type Plugin } from 'vite'

interface Account {
  id: string
  name: string
  email: string
  passwordHash: string
  avatar: string
  provider: 'password' | 'google' | 'github'
  providerId: string
}

interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string
  provider: Account['provider']
}

const accountsFile = '.accounts.json'
const avatarDir = '.avatars'
const secretFile = '.auth-secret'
const sessionCookie = 'made-site-session'
const stateCookie = 'made-site-oauth-state'

function authSecret(env: Record<string, string>) {
  if (env.AUTH_SECRET) return env.AUTH_SECRET
  if (existsSync(secretFile)) return readFileSync(secretFile, 'utf8').trim()

  const secret = randomBytes(32).toString('hex')
  writeFileSync(secretFile, secret, { mode: 0o600 })
  return secret
}

function readAccounts(): Account[] {
  if (!existsSync(accountsFile)) return []

  try {
    const parsed = JSON.parse(readFileSync(accountsFile, 'utf8')) as Account[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: Account[]) {
  writeFileSync(accountsFile, JSON.stringify(accounts, null, 2), { mode: 0o600 })
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 32).toString('base64url')
  return `${salt}.${hash}`
}

function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split('.')
  if (!salt || !hash) return false

  const actual = scryptSync(password, salt, 32)
  const expected = Buffer.from(hash, 'base64url')
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function createToken(user: SessionUser, secret: string) {
  const body = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
  ).toString('base64url')
  return `${body}.${sign(body, secret)}`
}

function readToken(token: string, secret: string): SessionUser | null {
  const [body, mac] = token.split('.')
  if (!body || !mac) return null

  const expected = sign(body, secret)
  const actualBuffer = Buffer.from(mac)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null
  }

  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionUser & { exp?: number }
    if (!data.exp || data.exp < Date.now()) return null
    if (!data.id || !data.email || !data.provider) return null
    return {
      id: data.id,
      name: data.name || data.email,
      email: data.email,
      avatar: data.avatar || '',
      provider: data.provider,
    }
  } catch {
    return null
  }
}

function cookies(req: IncomingMessage) {
  const header = req.headers.cookie ?? ''
  const result: Record<string, string> = {}

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (!key) continue
    result[key] = decodeURIComponent(rest.join('='))
  }

  return result
}

function appendCookie(res: ServerResponse, cookie: string) {
  const current = res.getHeader('Set-Cookie')
  const next = current == null ? [] : Array.isArray(current) ? current.map(String) : [String(current)]
  next.push(cookie)
  res.setHeader('Set-Cookie', next)
}

function setCookie(res: ServerResponse, name: string, value: string, maxAge: number) {
  appendCookie(
    res,
    `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  )
}

function clearCookie(res: ServerResponse, name: string) {
  appendCookie(res, `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

function redirect(res: ServerResponse, location: string) {
  res.statusCode = 302
  res.setHeader('Location', location)
  res.end()
}

function originOf(req: IncomingMessage) {
  const host = req.headers.host ?? 'localhost'
  return `http://${host}`
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/api/')) return '/'
  return value
}

function providers(env: Record<string, string>) {
  return {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  }
}

function avatarPath(id: string) {
  return `${avatarDir}/${id}`
}

function removeAvatar(id: string) {
  rmSync(avatarPath(id), { force: true })
  rmSync(`${avatarPath(id)}.type`, { force: true })
}

function saveAvatar(id: string, dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl)
  if (!match || !/^[a-f0-9]+$/.test(id)) return false

  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64')
  if (buffer.length < 32 || buffer.length > 1_500_000) return false

  mkdirSync(avatarDir, { recursive: true })
  writeFileSync(avatarPath(id), buffer, { mode: 0o600 })
  writeFileSync(`${avatarPath(id)}.type`, match[1], { mode: 0o600 })
  return true
}

function sessionUser(account: Account): SessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    avatar: account.avatar,
    provider: account.provider,
  }
}

async function readJson(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const text = Buffer.concat(chunks).toString()
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

function textField(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function exchangeGoogle(env: Record<string, string>, code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenResponse.ok) return null

  const token = (await tokenResponse.json()) as { id_token?: string }
  if (!token.id_token) return null

  const infoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token.id_token)}`,
  )
  if (!infoResponse.ok) return null

  const info = (await infoResponse.json()) as {
    aud?: string
    sub?: string
    email?: string
    email_verified?: string | boolean
    name?: string
    picture?: string
  }

  const verified = info.email_verified === true || info.email_verified === 'true'
  if (!verified || info.aud !== env.GOOGLE_CLIENT_ID || !info.sub || !info.email) return null

  return {
    providerId: info.sub,
    email: info.email.toLowerCase(),
    name: info.name || info.email,
    avatar: info.picture || '',
  }
}

async function exchangeGithub(env: Record<string, string>, code: string, redirectUri: string) {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!tokenResponse.ok) return null

  const token = (await tokenResponse.json()) as { access_token?: string }
  if (!token.access_token) return null

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token.access_token}`,
      'user-agent': 'made-site',
    },
  })
  if (!userResponse.ok) return null

  const user = (await userResponse.json()) as {
    id?: number
    login?: string
    name?: string | null
    avatar_url?: string
    email?: string | null
  }
  if (!user.id || !user.login) return null

  let email = user.email?.toLowerCase() ?? ''
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token.access_token}`,
        'user-agent': 'made-site',
      },
    })
    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as { email?: string; primary?: boolean; verified?: boolean }[]
      const primary = emails.find((item) => item.primary && item.verified) ?? emails.find((item) => item.verified)
      email = primary?.email?.toLowerCase() ?? ''
    }
  }

  if (!email) email = `${user.id}+${user.login}@users.noreply.github.com`

  return {
    providerId: String(user.id),
    email,
    name: user.name || user.login,
    avatar: user.avatar_url || '',
  }
}

function upsertProviderAccount(
  provider: 'google' | 'github',
  profile: { providerId: string; email: string; name: string; avatar: string },
) {
  const accounts = readAccounts()
  const existing =
    accounts.find((account) => account.provider === provider && account.providerId === profile.providerId) ??
    accounts.find((account) => account.email === profile.email)

  if (existing) {
    existing.avatar = profile.avatar || existing.avatar
    if (!existing.providerId) {
      existing.providerId = profile.providerId
    }
    writeAccounts(accounts)
    return existing
  }

  const account: Account = {
    id: randomBytes(16).toString('hex'),
    name: profile.name,
    email: profile.email,
    passwordHash: '',
    avatar: profile.avatar,
    provider,
    providerId: profile.providerId,
  }
  accounts.push(account)
  writeAccounts(accounts)
  return account
}

function createAuthHandler(env: Record<string, string>): Connect.NextHandleFunction {
  const secret = authSecret(env)

  return async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/auth')) {
      next()
      return
    }

    try {
      if (url.pathname === '/api/auth/session' && req.method === 'GET') {
        const token = cookies(req)[sessionCookie]
        const session = token ? readToken(token, secret) : null
        const account = session ? readAccounts().find((item) => item.id === session.id) : undefined
        sendJson(res, 200, { user: account ? sessionUser(account) : session, providers: providers(env) })
        return
      }

      if (url.pathname === '/api/auth/avatar' && req.method === 'GET') {
        const token = cookies(req)[sessionCookie]
        const session = token ? readToken(token, secret) : null
        const file = session && /^[a-f0-9]+$/.test(session.id) ? avatarPath(session.id) : ''
        if (!session || !file || !existsSync(file)) {
          res.statusCode = 404
          res.end()
          return
        }

        const type = existsSync(`${file}.type`) ? readFileSync(`${file}.type`, 'utf8') : 'image/png'
        res.statusCode = 200
        res.setHeader('content-type', type)
        res.setHeader('cache-control', 'private, max-age=3600')
        res.end(readFileSync(file))
        return
      }

      if (req.method === 'POST' && req.headers['x-made-site'] !== '1') {
        sendJson(res, 403, { error: 'Forbidden' })
        return
      }

      if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
        clearCookie(res, sessionCookie)
        sendJson(res, 200, { ok: true })
        return
      }

      if (url.pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await readJson(req)
        const name = textField(body.name)
        const email = textField(body.email).toLowerCase()
        const password = typeof body.password === 'string' ? body.password : ''

        if (name.length < 2 || name.length > 80) {
          sendJson(res, 400, { error: 'Enter your name.' })
          return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          sendJson(res, 400, { error: 'Enter a valid email.' })
          return
        }
        if (password.length < 8) {
          sendJson(res, 400, { error: 'Use at least 8 characters for the password.' })
          return
        }

        const accounts = readAccounts()
        if (accounts.some((account) => account.email === email)) {
          sendJson(res, 409, { error: 'An account with this email already exists.' })
          return
        }

        const account: Account = {
          id: randomBytes(16).toString('hex'),
          name,
          email,
          passwordHash: hashPassword(password),
          avatar: '',
          provider: 'password',
          providerId: '',
        }
        accounts.push(account)
        writeAccounts(accounts)
        setCookie(res, sessionCookie, createToken(sessionUser(account), secret), 60 * 60 * 24 * 7)
        sendJson(res, 200, { user: sessionUser(account) })
        return
      }

      if (url.pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await readJson(req)
        const email = textField(body.email).toLowerCase()
        const password = typeof body.password === 'string' ? body.password : ''
        const account = readAccounts().find((item) => item.email === email && item.passwordHash)

        if (!account || !checkPassword(password, account.passwordHash)) {
          sendJson(res, 401, { error: 'Email or password is wrong.' })
          return
        }

        setCookie(res, sessionCookie, createToken(sessionUser(account), secret), 60 * 60 * 24 * 7)
        sendJson(res, 200, { user: sessionUser(account) })
        return
      }

      if (url.pathname === '/api/auth/profile' && req.method === 'POST') {
        const token = cookies(req)[sessionCookie]
        const session = token ? readToken(token, secret) : null
        const accounts = readAccounts()
        const account = session ? accounts.find((item) => item.id === session.id) : undefined
        if (!account) {
          sendJson(res, 401, { error: 'Sign in again.' })
          return
        }

        const body = await readJson(req)
        const name = textField(body.name)
        if (name.length < 2 || name.length > 80) {
          sendJson(res, 400, { error: 'Enter your name.' })
          return
        }

        const nextPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
        if (nextPassword) {
          if (!account.passwordHash) {
            sendJson(res, 400, { error: 'This account signs in with Google or GitHub.' })
            return
          }
          const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
          if (!checkPassword(currentPassword, account.passwordHash)) {
            sendJson(res, 401, { error: 'Current password is wrong.' })
            return
          }
          if (nextPassword.length < 8) {
            sendJson(res, 400, { error: 'Use at least 8 characters for the new password.' })
            return
          }
          account.passwordHash = hashPassword(nextPassword)
        }

        if ('avatar' in body) {
          if (body.avatar === '') {
            removeAvatar(account.id)
            account.avatar = ''
          } else if (typeof body.avatar === 'string' && body.avatar.startsWith('data:image/')) {
            if (!saveAvatar(account.id, body.avatar)) {
              sendJson(res, 400, { error: 'Use a PNG, JPG, WEBP, or GIF under 1.5 MB.' })
              return
            }
            account.avatar = `/api/auth/avatar?v=${Date.now()}`
          }
        }

        account.name = name
        writeAccounts(accounts)
        const user = sessionUser(account)
        setCookie(res, sessionCookie, createToken(user, secret), 60 * 60 * 24 * 7)
        sendJson(res, 200, { user })
        return
      }

      const providerName = url.pathname.split('/')[3]
      if (providerName !== 'google' && providerName !== 'github') {
        sendJson(res, 404, { error: 'Not found' })
        return
      }

      const ready = providerName === 'google' ? providers(env).google : providers(env).github
      const redirectUri = `${originOf(req)}/api/auth/${providerName}/callback`

      if (url.pathname === `/api/auth/${providerName}/start`) {
        if (!ready) {
          redirect(res, `/login?error=${providerName}`)
          return
        }

        const nonce = randomBytes(16).toString('hex')
        const next = safeNext(url.searchParams.get('next'))
        setCookie(res, stateCookie, `${nonce}.${Buffer.from(next).toString('base64url')}`, 60 * 10)

        const authorize = new URL(
          providerName === 'google'
            ? 'https://accounts.google.com/o/oauth2/v2/auth'
            : 'https://github.com/login/oauth/authorize',
        )
        authorize.searchParams.set('client_id', providerName === 'google' ? env.GOOGLE_CLIENT_ID : env.GITHUB_CLIENT_ID)
        authorize.searchParams.set('redirect_uri', redirectUri)
        authorize.searchParams.set('state', nonce)
        if (providerName === 'google') {
          authorize.searchParams.set('response_type', 'code')
          authorize.searchParams.set('scope', 'openid email profile')
          authorize.searchParams.set('prompt', 'select_account')
        } else {
          authorize.searchParams.set('scope', 'read:user user:email')
        }
        redirect(res, authorize.toString())
        return
      }

      if (url.pathname === `/api/auth/${providerName}/callback`) {
        if (url.searchParams.get('error')) {
          clearCookie(res, stateCookie)
          redirect(res, '/login?error=denied')
          return
        }

        const saved = cookies(req)[stateCookie]?.split('.') ?? []
        const nonce = saved[0]
        const next = safeNext(saved[1] ? Buffer.from(saved[1], 'base64url').toString() : '/')
        clearCookie(res, stateCookie)

        if (!ready || !nonce || nonce !== url.searchParams.get('state') || !url.searchParams.get('code')) {
          redirect(res, '/login?error=failed')
          return
        }

        const profile =
          providerName === 'google'
            ? await exchangeGoogle(env, url.searchParams.get('code') ?? '', redirectUri)
            : await exchangeGithub(env, url.searchParams.get('code') ?? '', redirectUri)

        if (!profile) {
          redirect(res, '/login?error=failed')
          return
        }

        const account = upsertProviderAccount(providerName, profile)
        setCookie(res, sessionCookie, createToken(sessionUser(account), secret), 60 * 60 * 24 * 7)
        redirect(res, next)
        return
      }

      sendJson(res, 404, { error: 'Not found' })
    } catch {
      if (!res.headersSent) sendJson(res, 500, { error: 'Sign-in failed.' })
    }
  }
}

export function authPlugin(): Plugin {
  return {
    name: 'made-site-auth',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, '')
      server.middlewares.use(createAuthHandler(env))
    },
    configurePreviewServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, '')
      server.middlewares.use(createAuthHandler(env))
    },
  }
}
