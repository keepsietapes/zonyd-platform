const axios = require('axios');

const ZONYD_ORANGE = '#FF9F0A';
const ZONYD_BLACK = '#0B0B0F';

const sendToN8n = async (data) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes('tu-instancia')) {
    console.error('❌ Error: N8N_WEBHOOK_URL no está configurado correctamente en el .env');
    return null;
  }

  try {
    const response = await axios.post(webhookUrl, data);
    console.log('✅ Webhook enviado a n8n con éxito');
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando a n8n:', error.message);
    throw error;
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const htmlContent = `
    <div style="background-color: ${ZONYD_BLACK}; color: white; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${ZONYD_ORANGE}; font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0;">ZONYD</h1>
      </div>
      <div style="background-color: #151821; border: 1px solid #232733; padding: 30px; border-radius: 24px;">
        <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 20px;">¡Hola, ${userName}!</h2>
        <p style="color: #A1A1AA; line-height: 1.6; font-size: 16px;">
          Gracias por unirte a <b>Zonyd</b>. Estamos validando tu cuenta.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}" style="background-color: ${ZONYD_ORANGE}; color: ${ZONYD_BLACK}; padding: 16px 32px; border-radius: 50px; font-weight: 900; text-decoration: none; display: inline-block;">
            VALIDAR MI CUENTA
          </a>
        </div>
      </div>
    </div>
  `;

  return sendToN8n({
    to: userEmail,
    subject: '¡Bienvenido a la Revolución Musical! - Zonyd',
    html: htmlContent,
    userName: userName
  });
};

const sendValidationSuccessEmail = async (userEmail, userName) => {
  const htmlContent = `
    <div style="background-color: #f9f9f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background-color: ${ZONYD_BLACK}; color: white; padding: 40px; border-radius: 16px; max-width: 600px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${ZONYD_ORANGE}; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">ZONYD</h1>
          <p style="color: #888; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">The Future of Music Distribution</p>
        </div>
        
        <div style="background-color: #151821; border: 1px solid #232733; padding: 30px; border-radius: 20px;">
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 15px; color: white;">¡Tu cuenta está lista, ${userName}! 🚀</h2>
          <p style="color: #A1A1AA; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
            Gracias por validar tu identidad. Ahora eres parte del ecosistema <b>Zonyd</b>. Aquí tienes un resumen de lo que puedes hacer:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #232733;">
                <b style="color: ${ZONYD_ORANGE};">✨ FREE:</b> 80% de regalías y distribución básica.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #232733;">
                <b style="color: ${ZONYD_ORANGE};">🔥 PRO:</b> 100% regalías, lanzamientos ilimitados.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <b style="color: ${ZONYD_ORANGE};">🏛️ LABEL:</b> Gestión de catálogo y equipo.
              </td>
            </tr>
          </table>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: ${ZONYD_ORANGE}; color: ${ZONYD_BLACK}; padding: 14px 40px; border-radius: 8px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 15px;">
              ACCEDER AL DASHBOARD
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #555; font-size: 11px; line-height: 1.5;">
          <p>Estás recibiendo este correo porque te registraste en zonyd.com.</p>
          <p>Zonyd | Calle 127 #15-30, CDMX, México.<br>
          Para dejar de recibir estos correos, puedes <a href="#" style="color: #888;">ajustar tus notificaciones aquí</a>.</p>
        </div>
      </div>
    </div>
  `;

  return sendToN8n({
    to: userEmail,
    subject: `Confirmado: Tu cuenta de Zonyd está activa ✅`,
    html: htmlContent,
    userName: userName,
    fromName: "Zonyd Team" // n8n usará este campo si lo configuramos
  });
};

module.exports = {
  sendWelcomeEmail,
  sendValidationSuccessEmail
};
