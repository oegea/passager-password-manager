/**
 * Tiny SMTP server for tests and local development. It has no TLS, accepts any
 * credentials and keeps every received message in memory.
 *
 * It can also be started from the command line to develop without a real mail
 * server; every message (and the login code found in it) is printed:
 *
 *   node shared/testing/fakeSmtp.js [port=2525]
 */
import net from 'node:net'
import { fileURLToPath } from 'node:url'

const decodeQP = (s) => Buffer.from(
  s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))), 'latin1'
).toString('utf8')

export const parseMessage = (raw) => {
  const idx = raw.indexOf('\r\n\r\n')
  const headerText = raw.slice(0, idx).replace(/\r\n[ \t]+/g, ' ')
  const headers = {}
  for (const line of headerText.split('\r\n')) {
    const i = line.indexOf(':')
    headers[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim()
  }
  let body = raw.slice(idx + 4).replace(/\r\n\.\./g, '\r\n.')
  const enc = (headers['content-transfer-encoding'] || '7bit').toLowerCase()
  if (enc === 'quoted-printable') body = decodeQP(body)
  else if (enc === 'base64') body = Buffer.from(body, 'base64').toString('utf8')
  const decodeWord = (v = '') => v.replace(/=\?UTF-8\?([QB])\?([^?]*)\?=/gi, (_, t, d) =>
    t.toUpperCase() === 'B' ? Buffer.from(d, 'base64').toString('utf8') : decodeQP(d.replace(/_/g, ' ')))
  return {
    from: headers.from, to: headers.to, subject: decodeWord(headers.subject),
    contentType: headers['content-type'], body: body.replace(/\r\n/g, '\n')
  }
}

export const startFakeSmtp = (port, onMessage = () => {}) => new Promise((resolve) => {
  const messages = []
  const server = net.createServer((socket) => {
    let buffer = ''
    let inData = false
    let data = ''
    let loginStage = 0
    let envelope = { from: null, to: [] }
    socket.setEncoding('latin1')
    socket.write('220 localhost ESMTP fake\r\n')
    socket.on('error', () => {})
    socket.on('data', (chunk) => {
      buffer += chunk
      for (;;) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n')
          if (end === -1) return
          data = buffer.slice(0, end)
          buffer = buffer.slice(end + 5)
          inData = false
          const message = { envelope, raw: data, ...parseMessage(data), receivedAt: new Date().toISOString() }
          messages.push(message)
          onMessage(message)
          envelope = { from: null, to: [] }
          socket.write('250 OK queued\r\n')
          continue
        }
        const nl = buffer.indexOf('\r\n')
        if (nl === -1) return
        const line = buffer.slice(0, nl)
        buffer = buffer.slice(nl + 2)
        const upper = line.toUpperCase()
        if (loginStage === 1) { loginStage = 2; socket.write('334 UGFzc3dvcmQ6\r\n'); continue }
        if (loginStage === 2) { loginStage = 0; socket.write('235 Authentication successful\r\n'); continue }
        if (upper.startsWith('EHLO')) socket.write('250-localhost\r\n250-8BITMIME\r\n250 AUTH PLAIN LOGIN\r\n')
        else if (upper.startsWith('HELO')) socket.write('250 localhost\r\n')
        else if (upper.startsWith('AUTH PLAIN')) socket.write('235 Authentication successful\r\n')
        else if (upper.startsWith('AUTH LOGIN')) { loginStage = 1; socket.write('334 VXNlcm5hbWU6\r\n') }
        else if (upper.startsWith('MAIL FROM')) { envelope.from = line.slice(10); socket.write('250 OK\r\n') }
        else if (upper.startsWith('RCPT TO')) { envelope.to.push(line.slice(8)); socket.write('250 OK\r\n') }
        else if (upper === 'DATA') { inData = true; socket.write('354 End data with <CR><LF>.<CR><LF>\r\n') }
        else if (upper === 'RSET') socket.write('250 OK\r\n')
        else if (upper === 'QUIT') { socket.write('221 Bye\r\n'); socket.end() }
        else socket.write('250 OK\r\n')
      }
    })
  })
  server.listen(port, '127.0.0.1', () => resolve({ server, messages }))
})

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 2525)
  await startFakeSmtp(port, (message) => {
    const code = /\b(\d{7})\b/.exec(message.body)?.[1]
    console.log(`[fake-smtp] mail to ${message.to} - code ${code}`)
  })
  console.log(`[fake-smtp] listening on 127.0.0.1:${port}`)
}
