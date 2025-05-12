import { createTransport } from 'nodemailer'

interface SendMailOptions {
	to: string
	subject: string
	text?: string
	html: any
}

export function sendMail({ subject, text, to, html }: SendMailOptions) {
	const transporter = createTransport({
		host: process.env.BREVO_HOST!,
		port: Number(process.env.BREVO_PORT),
		auth: {
			user: process.env.BREVO_USER,
			pass: process.env.BREVO_PASS,
		},
	})

	const mailOptions = {
		from: process.env.BREVO_SENDER,
		to,
		subject,
		text,
		html,
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error sending email:', error)
		} else {
			console.log('Email sent:', info.response)
		}
	})
}
