import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

export const sendTicketEmail = async (ticket) => {
  try {
    const { user, event } = ticket;
    
    const mailOptions = {
      from: '"Kanzey.CO" <noreply@kanzey.co>',
      to: user.email,
      subject: `Votre billet pour ${event.title} - Kanzey.CO`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: #FFD700; padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0;">🎫 Kanzey.CO</h1>
            <h2 style="color: #000; margin: 10px 0 0 0;">Votre billet est prêt!</h2>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Détails de l'événement</h3>
              <p><strong>Événement:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Heure:</strong> ${event.time}</p>
              <p><strong>Lieu:</strong> ${event.location}</p>
              <p><strong>Adresse:</strong> ${event.address}</p>
            </div>
            
            <div style="background: #000; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #FFD700; margin-top: 0;">Informations du billet</h3>
              <p><strong>Numéro de billet:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Quantité:</strong> ${ticket.quantity}</p>
              <p><strong>Montant:</strong> ${ticket.totalAmount.toLocaleString()} FCFA</p>
              <p><strong>Statut:</strong> Confirmé ✅</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <img src="${ticket.qrCode}" alt="Code QR" style="max-width: 200px; border: 2px solid #FFD700; border-radius: 10px;"/>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Présentez ce code QR à l'entrée de l'événement
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #FFD700; border-radius: 5px; padding: 15px; margin-top: 20px;">
              <h4 style="color: #856404; margin-top: 0;">Instructions importantes:</h4>
              <ul style="color: #856404; margin: 10px 0;">
                <li>Conservez ce billet jusqu'à l'événement</li>
                <li>Arrivez 30 minutes avant le début</li>
                <li>Une pièce d'identité peut être demandée</li>
                <li>Le billet est personnel et non transférable</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p>Merci d'avoir choisi Kanzey.CO pour vos événements!</p>
            <p>Pour toute question, contactez-nous à support@kanzey.co</p>
            <div style="margin-top: 15px;">
              <span style="background: #FFD700; color: #000; padding: 5px 10px; border-radius: 15px; font-weight: bold;">
                Kanzey.CO - Votre plateforme de billetterie au Sénégal
              </span>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket email sent to ${user.email}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: '"Kanzey.CO" <noreply@kanzey.co>',
      to: user.email,
      subject: 'Bienvenue sur Kanzey.CO!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: #FFD700; padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0;">🎉 Bienvenue sur Kanzey.CO!</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2>Salut ${user.firstName}!</h2>
            <p>Merci de nous avoir rejoint sur la première plateforme de billetterie événementielle du Sénégal.</p>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h3>Avec Kanzey.CO, vous pouvez:</h3>
              <ul>
                <li>🎫 Acheter des billets en ligne facilement</li>
                <li>💳 Payer en toute sécurité avec Intouch</li>
                <li>📱 Recevoir vos billets par email</li>
                <li>🎪 Découvrir les meilleurs événements du Sénégal</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="background: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Découvrir les événements
              </a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p>L'équipe Kanzey.CO</p>
            <p>support@kanzey.co</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    throw error;
  }
};