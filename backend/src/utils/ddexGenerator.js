const { create } = require('xmlbuilder2');

/**
 * Genera un archivo XML en formato DDEX (ERN 4.2 o similar)
 * Este es un esqueleto inicial para la estructura oficial.
 * @param {Object} release - Objeto de lanzamiento desde Prisma
 * @param {Array} tracks - Array de tracks asociados
 * @returns {String} XML content
 */
function generateDDEX(release, tracks) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('ern:NewReleaseMessage', {
      'xmlns:ern': 'http://ddex.net/xml/ern/42',
      'xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
      'xs:schemaLocation': 'http://ddex.net/xml/ern/42 http://ddex.net/xml/ern/42/release-notification.xsd',
      MessageSchemaVersionId: 'ern/42'
    });

  // 1. MessageHeader
  const header = root.ele('MessageHeader');
  header.ele('MessageThreadId').txt(`ZONYD-RELEASE-${release.id}`);
  header.ele('MessageId').txt(`MSG-${Date.now()}`);
  header.ele('MessageSender')
    .ele('PartyId').txt('PADPIDA12345').up() // ID ficticio de Zonyd como distribuidor DDEX
    .ele('PartyName').ele('FullName').txt('Zonyd Distribution').up().up();
  header.ele('MessageCreateDateTime').txt(new Date().toISOString());

  // 2. ResourceList (SoundRecordings & Images)
  const resourceList = root.ele('ResourceList');
  
  tracks.forEach((track, index) => {
    const soundRecording = resourceList.ele('SoundRecording');
    soundRecording.ele('SoundRecordingType').txt('MusicalWorkSoundRecording');
    soundRecording.ele('SoundRecordingId')
      .ele('ISRC').txt(track.isrc || `ZNY${Date.now()}${index}`);
    
    soundRecording.ele('ReferenceTitle')
      .ele('TitleText').txt(track.title);
    
    soundRecording.ele('Duration').txt(`PT${track.duration || 0}S`); // Format ISO 8601
  });

  if (release.coverUrl) {
    const image = resourceList.ele('Image');
    image.ele('ImageType').txt('FrontCoverImage');
    image.ele('ImageId').ele('ProprietaryId').txt(`IMG-${release.id}`);
  }

  // 3. ReleaseList
  const releaseList = root.ele('ReleaseList');
  const rel = releaseList.ele('Release');
  rel.ele('ReleaseId').ele('ICPN').txt(release.upc || '0000000000000'); // Barcode
  rel.ele('ReferenceTitle').ele('TitleText').txt(release.title);
  rel.ele('ReleaseResourceReferenceList')
    // Referencias a los recursos (Audio e Imágenes)
    .ele('ReleaseResourceReference').txt(`RSR-IMG-${release.id}`).up();

  // 4. DealList (Condiciones comerciales)
  const dealList = root.ele('DealList');
  const releaseDeal = dealList.ele('ReleaseDeal');
  releaseDeal.ele('DealReleaseReference').txt(release.upc || '0000000000000');
  const deal = releaseDeal.ele('Deal');
  const dealTerms = deal.ele('DealTerms');
  dealTerms.ele('CommercialModelType').txt('PayAsYouGoModel');
  dealTerms.ele('Usage').ele('UseType').txt('Stream').up().ele('UseType').txt('Download');

  return root.end({ prettyPrint: true });
}

module.exports = { generateDDEX };
