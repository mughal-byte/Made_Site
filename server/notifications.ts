import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { loadEnv, type Connect, type Plugin } from 'vite'
import {
  isAdminAccount,
  readAccounts,
  sessionFromRequest,
  type Account,
} from './auth.ts'
import { readJson, sendJson, textField } from './http.ts'

export interface StoredNotification {
  id: string
  title: string
  body: string
  link: string
  createdAt: string
  senderId: string
  senderName: string
  target: 'all' | string
}

interface NotificationStore {
  items: StoredNotification[]
  cleared: Record<string, string>
  read: Record<string, string[]>
}

const storeFile = '.notifications.json'

function emptyStore(): NotificationStore {
  return { items: [], cleared: {}, read: {} }
}

function readStore(): NotificationStore {
  if (!existsSync(storeFile)) return emptyStore()

  try {
    const parsed = JSON.parse(readFileSync(storeFile, 'utf8')) as Partial<NotificationStore>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      cleared: parsed.cleared ?? {},
      read: parsed.read ?? {},
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: NotificationStore) {
  writeFileSync(storeFile, JSON.stringify(store, null, 2), { mode: 0o600 })
}

function visibleItems(store: NotificationStore, account: Account) {
  const clearedAt = store.cleared[account.id] ?? ''
  const readIds = new Set(store.read[account.id] ?? [])

  return store.items
    .filter((item) => item.target === 'all' || item.target === account.id)
    .filter((item) => !clearedAt || item.createdAt > clearedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => ({ ...item, read: readIds.has(item.id) }))
}

function recipientsOf(item: StoredNotification, accounts: Account[]) {
  if (item.target === 'all') return accounts.length
  return accounts.some((entry) => entry.id === item.target) ? 1 : 0
}

function recipientEmails(item: StoredNotification, accounts: Account[]) {
  if (item.target === 'all') return accounts.map((entry) => entry.email)

  const account = accounts.find((entry) => entry.id === item.target)
  return account ? [account.email] : []
}

function createNotificationsHandler(env: Record<string, string>): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/notifications')) {
      next()
      return
    }

    const session = sessionFromRequest(req, env)
    if (!session) {
      sendJson(res, 401, { error: 'Sign in again.' })
      return
    }

    const accounts = readAccounts()
    const account = accounts.find((item) => item.id === session.id)
    if (!account) {
      sendJson(res, 401, { error: 'Sign in again.' })
      return
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/notifications') {
        const store = readStore()
        sendJson(res, 200, { notifications: visibleItems(store, account) })
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/notifications/admin') {
        if (!isAdminAccount(account, env)) {
          sendJson(res, 403, { error: 'Only an admin can open this.' })
          return
        }

        const store = readStore()
        const items = [...store.items]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((item) => ({
            ...item,
            recipients: recipientsOf(item, accounts),
            audienceEmails: recipientEmails(item, accounts),
          }))

        sendJson(res, 200, { notifications: items, accounts: accounts.map((entry) => entry.email) })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications') {
        const body = await readJson(req)
        const title = textField(body.title)
        const message = textField(body.body)
        const link = textField(body.link)
        const targetField = textField(body.target)

        if (title.length < 2 || title.length > 120) {
          sendJson(res, 400, { error: 'Enter a title between 2 and 120 characters.' })
          return
        }
        if (message.length > 600) {
          sendJson(res, 400, { error: 'Keep the message under 600 characters.' })
          return
        }

        let target: 'all' | string

        if (!targetField || targetField === 'self') {
          target = account.id
        } else {
          if (!isAdminAccount(account, env)) {
            sendJson(res, 403, { error: 'Only an admin can send notifications.' })
            return
          }

          if (targetField === 'all') {
            target = 'all'
          } else {
            const targetAccount = accounts.find(
              (item) => item.email.toLowerCase() === targetField.toLowerCase(),
            )
            if (!targetAccount) {
              sendJson(res, 404, { error: 'No account uses that email address.' })
              return
            }
            target = targetAccount.id
          }
        }

        const store = readStore()
        const item: StoredNotification = {
          id: randomBytes(10).toString('hex'),
          title,
          body: message,
          link,
          createdAt: new Date().toISOString(),
          senderId: account.id,
          senderName: account.name,
          target,
        }

        store.items.push(item)
        writeStore(store)
        sendJson(res, 200, { notification: item, recipients: recipientsOf(item, accounts) })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications/clear') {
        const store = readStore()
        store.cleared[account.id] = new Date().toISOString()
        store.read[account.id] = []
        writeStore(store)
        sendJson(res, 200, { ok: true })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications/read') {
        const body = await readJson(req)
        const id = textField(body.id)
        if (!id) {
          sendJson(res, 400, { error: 'Which notification?' })
          return
        }

        const store = readStore()
        const read = new Set(store.read[account.id] ?? [])
        read.add(id)
        store.read[account.id] = [...read]
        writeStore(store)
        sendJson(res, 200, { ok: true })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications/read-all') {
        const store = readStore()
        const ids = visibleItems(store, account).map((item) => item.id)
        store.read[account.id] = [...new Set([...(store.read[account.id] ?? []), ...ids])]
        writeStore(store)
        sendJson(res, 200, { ok: true })
        return
      }

      sendJson(res, 404, { error: 'Not found' })
    } catch {
      if (!res.headersSent) sendJson(res, 500, { error: 'The notification could not be loaded.' })
    }
  }
}

export function notificationsPlugin(): Plugin {
  return {
    name: 'made-site-notifications',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, '')
      server.middlewares.use(createNotificationsHandler(env))
    },
    configurePreviewServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, '')
      server.middlewares.use(createNotificationsHandler(env))
    },
  }
}
