require('dotenv').config({ override: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { sendWelcomeEmail } = require('./src/services/emailService');

const testEmail = async () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('--- DEBUG INFO ---');
  console.log(`User: [${user}]`);
  console.log(`Pass Length: ${pass ? pass.length : 0} chars`);
  console.log(`Pass Starts With: ${pass ? pass.substring(0, 3) : 'N/A'}...`);
  console.log('------------------');

  const targetEmail = 'keepsietapesprod@gmail.com'; 
  console.log(`🚀 Iniciando prueba de envío Zonyd Mail a: ${targetEmail}...`);
  
  try {
    const info = await sendWelcomeEmail(targetEmail, 'Usuario de Prueba');
    if (info) {
      console.log('✅ ¡Petición enviada a n8n con éxito!');
      console.log('Respuesta de n8n:', JSON.stringify(info, null, 2));
    }
  } catch (error) {
    console.error('❌ Error en el envío:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: n8n no parece estar corriendo en el puerto 5678. Verifica que el contenedor de Docker esté activo y el puerto mapeado.');
    }
    if (error.response) {
      console.log('Data de error n8n:', error.response.data);
    }
  }
};

testEmail();
