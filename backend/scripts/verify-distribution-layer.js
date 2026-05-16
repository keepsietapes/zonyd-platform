const p = require('../src/utils/prisma');


async function check() {
  try {
    const r = await p.release.findFirst({
      select: { type: true, territories: true, labelName: true, language: true }
    });
    console.log('Release DDEX fields OK:', r !== null ? r : '(no releases yet — schema is correct)');

    const d = await p.dspDelivery.findFirst({
      select: { partnerDeliveryId: true, ddexPackageUrl: true, retryCount: true, metadata: true }
    });
    console.log('DspDelivery new fields OK:', d !== null ? d : '(no deliveries yet — schema is correct)');

    console.log('\n✅ Todos los campos del Distribution Layer están en base de datos correctamente.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await p.$disconnect();
  }
}

check();
