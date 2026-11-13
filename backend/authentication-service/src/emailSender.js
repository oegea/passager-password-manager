import nodemailer from 'nodemailer'

/**
 * Sends an e-mail through the configured SMTP server.
 * Resolves with true if the message was accepted, false otherwise.
 * @param {{to: string, subject: string, text?: string, html?: string}} message
 */
export const sendEmail = async (message) => {
  const transport = nodemailer.createTransport({
    host: process.env.AUTH_SMTP_HOST,
    port: process.env.AUTH_SMTP_PORT,
    auth: {
      user: process.env.AUTH_SMTP_USER,
      pass: process.env.AUTH_SMTP_PASSWORD
    }
  })

  return await new Promise((resolve) => {
    transport.sendMail({ from: process.env.AUTH_SMTP_SENDER, ...message }, (err) => {
      resolve(!err)
    })
  })
}
