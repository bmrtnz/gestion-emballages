import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter(): void {
    const nodeEnv = this.configService.get('NODE_ENV');

    if (nodeEnv === 'development') {
      // MailCatcher configuration for development
      this.transporter = nodemailer.createTransport({
        host: 'localhost', // MailCatcher host
        port: 1025, // MailCatcher SMTP port
        secure: false, // No TLS/SSL
        ignoreTLS: true,
        tls: {
          rejectUnauthorized: false,
        },
      } as nodemailer.TransportOptions); // Type assertion for MailHog configuration
    } else {
      // Production email service configuration
      this.transporter = nodemailer.createTransport({
        service: this.configService.get('EMAIL_SERVICE', 'gmail'),
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASSWORD'),
        },
      });
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string = 'Utilisateur'): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'Blue Whale Portal <noreply@localhost>'),
      to: email,
      subject: 'Réinitialisation de mot de passe - Blue Whale Portal',
      html: this.getPasswordResetTemplate(resetUrl, userName),
      text: this.getPasswordResetTextTemplate(resetUrl, userName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error.stack);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, userName: string, temporaryPassword?: string): Promise<void> {
    const loginUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/login`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'Blue Whale Portal <noreply@localhost>'),
      to: email,
      subject: 'Bienvenue sur Blue Whale Portal',
      html: this.getWelcomeTemplate(userName, loginUrl, temporaryPassword),
      text: this.getWelcomeTextTemplate(userName, loginUrl, temporaryPassword),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending welcome email:', error.stack);
      throw error;
    }
  }

  private getPasswordResetTemplate(resetUrl: string, userName: string): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Réinitialisation de mot de passe</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .button { 
          display: inline-block; 
          background: #2563eb; 
          color: white !important; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Blue Whale Portal</div>
        </div>
        
        <h2>Réinitialisation de votre mot de passe</h2>
        
        <p>Bonjour ${userName},</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Blue Whale Portal.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Réinitialiser le mot de passe</a>
        </div>
        
        <div class="warning">
          <strong>Important :</strong>
          <ul>
            <li>Ce lien expire dans 24 heures</li>
            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
            <li>Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau</li>
          </ul>
        </div>
        
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Blue Whale Portal - Système de gestion des emballages agricoles</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getPasswordResetTextTemplate(resetUrl: string, userName: string): string {
    return `
Blue Whale Portal - Réinitialisation de mot de passe

Bonjour ${userName},

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Blue Whale Portal.

Pour créer un nouveau mot de passe, visitez ce lien :
${resetUrl}

IMPORTANT:
- Ce lien expire dans 24 heures
- Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
- Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau

Cet email a été envoyé automatiquement, merci de ne pas y répondre.

© ${new Date().getFullYear()} Blue Whale Portal
`;
  }

  private getWelcomeTemplate(userName: string, loginUrl: string, temporaryPassword?: string): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Bienvenue sur Blue Whale Portal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .button { 
          display: inline-block; 
          background: #16a34a; 
          color: white !important; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .credentials { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Blue Whale Portal</div>
        </div>
        
        <h2>Bienvenue ${userName} !</h2>
        
        <p>Votre compte a été créé avec succès sur la plateforme Blue Whale Portal.</p>
        
        ${
          temporaryPassword
            ? `
        <div class="credentials">
          <h3>Vos informations de connexion :</h3>
          <p><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>
          <p><strong>Important :</strong> Veuillez changer votre mot de passe temporaire lors de votre première connexion.</p>
        </div>
        `
            : ''
        }
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="button">Se connecter</a>
        </div>
        
        <div class="footer">
          <p>Si vous avez des questions, contactez votre administrateur système.</p>
          <p>© ${new Date().getFullYear()} Blue Whale Portal</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getWelcomeTextTemplate(userName: string, loginUrl: string, temporaryPassword?: string): string {
    return `
Blue Whale Portal - Bienvenue ${userName} !

Votre compte a été créé avec succès sur la plateforme Blue Whale Portal.

${temporaryPassword ? `Mot de passe temporaire : ${temporaryPassword}\nIMPORTANT: Veuillez changer votre mot de passe temporaire lors de votre première connexion.\n` : ''}

Pour vous connecter, visitez : ${loginUrl}

Si vous avez des questions, contactez votre administrateur système.

© ${new Date().getFullYear()} Blue Whale Portal
`;
  }
}
