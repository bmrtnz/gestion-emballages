const transporter = require('../config/email');

/**
 * Email service for sending various types of emails
 * Uses email templates and handles different email scenarios
 */
class EmailService {
  /**
   * Send password reset email to user
   * @param {string} email - User's email address
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User's full name
   * @returns {Promise} - Email sending promise
   */
  async sendPasswordResetEmail(email, resetToken, userName = 'Utilisateur') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Gestion Emballages <noreply@localhost>',
      to: email,
      subject: 'Réinitialisation de mot de passe - Gestion Emballages',
      html: this.getPasswordResetTemplate(resetUrl, userName),
      text: this.getPasswordResetTextTemplate(resetUrl, userName)
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @param {string} temporaryPassword - Temporary password (optional)
   * @returns {Promise} - Email sending promise
   */
  async sendWelcomeEmail(user, temporaryPassword = null) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Gestion Emballages <noreply@localhost>',
      to: user.email,
      subject: 'Bienvenue sur Gestion Emballages',
      html: this.getWelcomeTemplate(user, loginUrl, temporaryPassword),
      text: this.getWelcomeTextTemplate(user, loginUrl, temporaryPassword)
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send order notification email
   * @param {Object} order - Order object
   * @param {string[]} recipients - Array of email addresses
   * @param {string} type - Type of notification (created, updated, shipped, etc.)
   * @returns {Promise} - Email sending promise
   */
  async sendOrderNotification(order, recipients, type = 'updated') {
    const orderUrl = `${process.env.FRONTEND_URL}/commandes/${order._id}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Gestion Emballages <noreply@localhost>',
      to: recipients.join(', '),
      subject: `Commande ${order.numeroCommande} - ${this.getOrderStatusLabel(type)}`,
      html: this.getOrderNotificationTemplate(order, orderUrl, type),
      text: this.getOrderNotificationTextTemplate(order, orderUrl, type)
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Order notification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending order notification email:', error);
      throw error;
    }
  }

  // Email Templates

  /**
   * HTML template for password reset email
   */
  getPasswordResetTemplate(resetUrl, userName) {
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
          <div class="logo">Gestion Emballages</div>
        </div>
        
        <h2>Réinitialisation de votre mot de passe</h2>
        
        <p>Bonjour ${userName},</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Gestion Emballages.</p>
        
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
          <p>© ${new Date().getFullYear()} Gestion Emballages - Système de gestion des emballages agricoles</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Text template for password reset email
   */
  getPasswordResetTextTemplate(resetUrl, userName) {
    return `
Gestion Emballages - Réinitialisation de mot de passe

Bonjour ${userName},

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Gestion Emballages.

Pour créer un nouveau mot de passe, visitez ce lien :
${resetUrl}

IMPORTANT:
- Ce lien expire dans 24 heures
- Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
- Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau

Cet email a été envoyé automatiquement, merci de ne pas y répondre.

© ${new Date().getFullYear()} Gestion Emballages
`;
  }

  /**
   * HTML template for welcome email
   */
  getWelcomeTemplate(user, loginUrl, temporaryPassword) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Bienvenue sur Gestion Emballages</title>
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
          <div class="logo">Gestion Emballages</div>
        </div>
        
        <h2>Bienvenue ${user.nomComplet} !</h2>
        
        <p>Votre compte a été créé avec succès sur la plateforme Gestion Emballages.</p>
        
        <div class="credentials">
          <h3>Vos informations de connexion :</h3>
          <p><strong>Email :</strong> ${user.email}</p>
          <p><strong>Rôle :</strong> ${this.getRoleDisplayName(user.role)}</p>
          ${temporaryPassword ? `<p><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>` : ''}
        </div>
        
        ${temporaryPassword ? '<p><strong>Important :</strong> Veuillez changer votre mot de passe temporaire lors de votre première connexion.</p>' : ''}
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="button">Se connecter</a>
        </div>
        
        <div class="footer">
          <p>Si vous avez des questions, contactez votre administrateur système.</p>
          <p>© ${new Date().getFullYear()} Gestion Emballages</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Text template for welcome email
   */
  getWelcomeTextTemplate(user, loginUrl, temporaryPassword) {
    return `
Gestion Emballages - Bienvenue ${user.nomComplet} !

Votre compte a été créé avec succès sur la plateforme Gestion Emballages.

Vos informations de connexion :
- Email : ${user.email}
- Rôle : ${this.getRoleDisplayName(user.role)}
${temporaryPassword ? `- Mot de passe temporaire : ${temporaryPassword}` : ''}

${temporaryPassword ? 'IMPORTANT: Veuillez changer votre mot de passe temporaire lors de votre première connexion.' : ''}

Pour vous connecter, visitez : ${loginUrl}

Si vous avez des questions, contactez votre administrateur système.

© ${new Date().getFullYear()} Gestion Emballages
`;
  }

  /**
   * HTML template for order notifications
   */
  getOrderNotificationTemplate(order, orderUrl, type) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Notification de commande</title>
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
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Gestion Emballages</div>
        </div>
        
        <h2>Commande ${order.numeroCommande} - ${this.getOrderStatusLabel(type)}</h2>
        
        <div class="order-info">
          <h3>Détails de la commande :</h3>
          <p><strong>Numéro :</strong> ${order.numeroCommande}</p>
          <p><strong>Statut :</strong> ${order.statut}</p>
          <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${orderUrl}" class="button">Voir la commande</a>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Gestion Emballages</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Text template for order notifications
   */
  getOrderNotificationTextTemplate(order, orderUrl, type) {
    return `
Gestion Emballages - Notification de commande

Commande ${order.numeroCommande} - ${this.getOrderStatusLabel(type)}

Détails de la commande :
- Numéro : ${order.numeroCommande}
- Statut : ${order.statut}
- Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}

Pour voir la commande : ${orderUrl}

© ${new Date().getFullYear()} Gestion Emballages
`;
  }

  // Utility methods

  getRoleDisplayName(role) {
    const roleNames = {
      'Manager': 'Manager',
      'Gestionnaire': 'Gestionnaire',
      'Station': 'Station',
      'Fournisseur': 'Fournisseur'
    };
    return roleNames[role] || role;
  }

  getOrderStatusLabel(type) {
    const statusLabels = {
      'created': 'Créée',
      'confirmed': 'Confirmée',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'updated': 'Mise à jour'
    };
    return statusLabels[type] || 'Mise à jour';
  }
}

module.exports = new EmailService();