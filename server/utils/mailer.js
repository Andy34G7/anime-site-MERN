import nodemailer from 'nodemailer'

export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'

  if (!host || !user || !pass) return null

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
  return transporter
}

export async function sendPasswordResetEmail(to, token) {
  const transporter = getTransport()
  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const from = process.env.EMAIL_FROM || 'no-reply@animebloom.local'
  const resetUrl = `${appUrl}/reset?token=${encodeURIComponent(token)}`

  const html = `
    <p>We received a request to reset your password.</p>
    <p>Click the link below to set a new password (valid for 15 minutes):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `
  const text = `Reset your password: ${resetUrl}`

  if (!transporter) {
    console.log('[DEV email] To:', to)
    console.log('[DEV email] Subject: Password Reset')
    console.log('[DEV email] Body:', text)
    return { dev: true }
  }

  await transporter.sendMail({ from, to, subject: 'Password Reset', text, html })
  return { dev: false }
}

export async function sendContactEmail(payload) {
  const transporter = getTransport()
  const from = process.env.EMAIL_FROM || 'no-reply@animebloom.local'
  const to = process.env.CONTACT_INBOX || process.env.EMAIL_FROM || 'support@animebloom.local'
  const fullName = `${payload.firstName} ${payload.lastName || ''}`.trim()
  const subject = `New contact form submission from ${fullName}`

  const textLines = [
    `Name: ${fullName}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    '',
    payload.message
  ].filter(Boolean)
  const text = textLines.join('\n')
  const html = `
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${payload.message.replace(/\n/g, '<br/>')}</p>
  `

  if (!transporter) {
    console.log('[DEV contact form]', { to, subject, text })
    return { dev: true }
  }

  await transporter.sendMail({ from, to, replyTo: payload.email, subject, text, html })
  return { dev: false }
}
