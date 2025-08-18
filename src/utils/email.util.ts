// src/utils/email.util.ts
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// V undoneVérifiez la configuration SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('Erreur configuration SMTP:', error);
  } else {
    console.log('Configuration SMTP valide');
  }
});

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.APP_URL}/auth/verify-token?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Vérifiez votre adresse email pour Chrono-Carto',
      html: `
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit sur Chrono-Carto. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <p><a href="${url}">Vérifier mon email</a></p>
        <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
      `,
    });
    console.log(`Email de vérification envoyé à ${to} avec l'URL: ${url}`);
    return info;
  } catch (error) {
    console.error(`Erreur d'envoi email de vérification à ${to}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Réinitialisation de votre mot de passe Chrono-Carto',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien ci-dessous :</p>
        <p><a href="${url}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 1 heure. Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email.</p>
      `,
    });
    console.log(`Email de réinitialisation envoyé à ${to} avec l'URL: ${url}`);
    return info;
  } catch (error) {
    console.error(`Erreur d'envoi email de réinitialisation à ${to}:`, error);
    throw error;
  }
}