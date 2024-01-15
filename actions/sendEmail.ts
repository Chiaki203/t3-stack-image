import { TRPCError } from '@trpc/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  pool: true,
  service: 'gmail',
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  },
  maxConnections: 1
})

export const sendEmail = async(
  subject: string,
  body: string,
  sendTo: string
) => {
  const mailOptions = {
    from: `T3Stack <${process.env.EMAIL}>`,
    to: sendTo,
    subject,
    html: body
  }
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log('nodemailer sendEmail error', error)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed to send email'
      })
    }
  })
}
