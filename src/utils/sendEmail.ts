import nodemailer from "nodemailer";

interface SendEmailProps {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ email, subject, html }: SendEmailProps) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }
};
