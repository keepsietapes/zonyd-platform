const { create } = require('xmlbuilder2');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * DDEX ERN 4.3 Service — Zonyd Distribution Engine
 * Genera paquetes XML conformes al estándar DDEX Electronic Release Notification (ERN) versión 4.3.
 * Compatible con: Spotify, Apple Music, Deezer, Amazon Music, YouTube Music, TikTok.
 * 
 * Estructura del paquete generado:
 *   release-package/
 *   ├── audio/           (referencias a archivos de audio procesados)
 *   ├── cover/           (referencia a artwork 3000x3000)
 *   ├── metadata/        ([upc]_ern43.xml — el manifest DDEX)
 *   └── checksum/        (manifest.md5 — checksums para validación)
 */

// Zonyd DDEX Party ID (reemplazar con ID real al obtener DDEX membership)
const ZONYD_PARTY_ID = process.env.DDEX_PARTY_ID || 'PADPIDA2024ZONYD01';
const ZONYD_PARTY_NAME = 'Zonyd Music Distribution';
const ERN_NAMESPACE = 'http://ddex.net/xml/ern/43';
const ERN_SCHEMA = 'http://ddex.net/xml/ern/43 http://ddex.net/xml/ern/43/release-notification.xsd';

/**
 * Genera el XML DDEX ERN 4.3 completo para un release.
 * @param {Object} release - Objeto de release desde Prisma (incluye tracks y artist)
 * @param {Object} options - Opciones adicionales de distribución
 * @returns {Object} { xml: string, packageDir: string, checksums: Object }
 */
async function generateDDEXPackage(release, options = {}) {
  const {
    territories = 'worldwide',
    dealType = 'PayAsYouGoModel',
    useTypes = ['OnDemandStream', 'PermanentDownload'],
    labelName = release.labelName || 'Zonyd Independent',
    language = release.language || 'es',
    releaseType = release.type || 'Single',
  } = options;

  const messageId = `ZONYD-${release.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
  const packageTimestamp = new Date().toISOString();

  logger.info(`[DDEXService] Generando paquete DDEX ERN 4.3 para release ${release.id} (${release.title})`);

  // ─────────────────────────────────────────────────────────────────
  // RAÍZ DEL DOCUMENTO
  // ─────────────────────────────────────────────────────────────────
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('ern:NewReleaseMessage', {
      'xmlns:ern': ERN_NAMESPACE,
      'xmlns:xs': 'http://www.w3.org/2001/XMLSchema-instance',
      'xs:schemaLocation': ERN_SCHEMA,
      MessageSchemaVersionId: 'ern/43',
      LanguageAndScriptCode: language,
    });

  // ─────────────────────────────────────────────────────────────────
  // 1. MESSAGE HEADER
  // ─────────────────────────────────────────────────────────────────
  const header = root.ele('MessageHeader');
  header.ele('MessageThreadId').txt(`THREAD-${release.id}`);
  header.ele('MessageId').txt(messageId);
  header.ele('MessageFileName').txt(`${release.upc || release.id}_ern43.xml`);

  const sender = header.ele('MessageSender');
  sender.ele('PartyId').txt(ZONYD_PARTY_ID);
  sender.ele('PartyName').ele('FullName').txt(ZONYD_PARTY_NAME);

  header.ele('SentOnBehalfOf').ele('PartyName').ele('FullName').txt(labelName);
  header.ele('MessageCreateDateTime').txt(packageTimestamp);
  header.ele('MessageControlType').txt('LiveMessage');

  // ─────────────────────────────────────────────────────────────────
  // 2. RESOURCE LIST (SoundRecordings + Image)
  // ─────────────────────────────────────────────────────────────────
  const resourceList = root.ele('ResourceList');

  // 2a. SoundRecording por cada track
  const tracks = release.tracks || [];
  tracks.forEach((track, index) => {
    const srRef = `RSR${String(index + 1).padStart(3, '0')}`;
    const sr = resourceList.ele('SoundRecording');

    sr.ele('SoundRecordingType').txt('MusicalWorkSoundRecording');

    const srId = sr.ele('SoundRecordingId');
    if (track.isrc) srId.ele('ISRC').txt(track.isrc.replace(/-/g, ''));
    srId.ele('ProprietaryId', { Namespace: 'ZONYD' }).txt(track.id);

    sr.ele('ResourceReference').txt(srRef);

    const refTitle = sr.ele('ReferenceTitle');
    refTitle.ele('TitleText').txt(track.title);

    // Language
    sr.ele('LanguageAndScriptCode').txt(language.toUpperCase());

    // Duration ISO 8601
    const durationSec = track.duration || 0;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    sr.ele('Duration').txt(`PT${mins}M${secs}S`);

    // Explicit content flag
    sr.ele('ParentalWarningType').txt(track.explicit ? 'Explicit' : 'NotExplicit');

    // Contributors (artistId → artista primario)
    const displayArtist = sr.ele('DisplayArtist');
    displayArtist.ele('PartyName').ele('FullName').txt(
      release.artist?.stageName || 'Artista Desconocido'
    );
    displayArtist.ele('ArtistRole').txt('MainArtist');

    // Additional performers/collaborators
    if (track.collaborators && track.collaborators.length > 0) {
      track.collaborators.forEach(collab => {
        const contributor = sr.ele('Contributor');
        contributor.ele('PartyName').ele('FullName').txt(collab.artist?.stageName || 'Colaborador');
        contributor.ele('Role').txt(_mapCollaboratorRole(collab.role));
      });
    }

    // Author/composer from track metadata
    if (track.authorName) {
      const contributor = sr.ele('Contributor');
      contributor.ele('PartyName').ele('FullName').txt(track.authorName);
      contributor.ele('Role').txt('Author');
    }

    // Label
    const label = sr.ele('LabelName');
    label.txt(labelName);

    // PLine (copyright)
    const pline = sr.ele('PLine');
    pline.ele('Year').txt(new Date(release.releaseDate || release.createdAt).getFullYear().toString());
    pline.ele('PLineText').txt(`℗ ${new Date(release.releaseDate || release.createdAt).getFullYear()} ${labelName}`);

    // Audio file reference
    const audioDetailsByTerritory = sr.ele('SoundRecordingDetailsByTerritory');
    audioDetailsByTerritory.ele('TerritoryCode').txt('Worldwide');

    const audioFile = audioDetailsByTerritory.ele('TechnicalSoundRecordingDetails');
    audioFile.ele('TechnicalResourceDetailsReference').txt(`TRSR${String(index + 1).padStart(3, '0')}`);
    audioFile.ele('AudioCodecType').txt('FLAC');
    audioFile.ele('SamplingRate').txt('44100');
    audioFile.ele('BitsPerSample').txt('24');
    audioFile.ele('NumberOfChannels').txt('2');
    if (track.flacPath) {
      audioFile.ele('File').ele('URI').txt(track.flacPath);
    }
  });

  // 2b. Image (Artwork)
  if (release.coverUrl) {
    const imgRef = `RSR${String(tracks.length + 1).padStart(3, '0')}`;
    const image = resourceList.ele('Image');
    image.ele('ImageType').txt('FrontCoverImage');
    image.ele('ResourceReference').txt(imgRef);

    const imgId = image.ele('ImageId');
    imgId.ele('ProprietaryId', { Namespace: 'ZONYD' }).txt(`IMG-${release.id}`);

    image.ele('ParentalWarningType').txt('NotExplicit');

    const imgDetails = image.ele('ImageDetailsByTerritory');
    imgDetails.ele('TerritoryCode').txt('Worldwide');
    const techImg = imgDetails.ele('TechnicalImageDetails');
    techImg.ele('TechnicalResourceDetailsReference').txt(`TRIMG001`);
    techImg.ele('ImageCodecType').txt('JPEG');
    techImg.ele('HorizontalPixels').txt('3000');
    techImg.ele('VerticalPixels').txt('3000');
    techImg.ele('ColorDepth').txt('24');
    techImg.ele('ImageResolution').txt('72');
    techImg.ele('File').ele('URI').txt(release.coverUrl);
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. RELEASE LIST
  // ─────────────────────────────────────────────────────────────────
  const releaseList = root.ele('ReleaseList');
  const rel = releaseList.ele('Release');

  const releaseId = rel.ele('ReleaseId');
  if (release.upc) releaseId.ele('ICPN').txt(release.upc);
  releaseId.ele('ProprietaryId', { Namespace: 'ZONYD' }).txt(release.id);

  rel.ele('ReleaseReference').txt('RR001');
  rel.ele('ReferenceTitle').ele('TitleText').txt(release.title);

  // Type
  rel.ele('ReleaseType').txt(_mapReleaseType(releaseType));

  // Resource references
  const resourceRefList = rel.ele('ReleaseResourceReferenceList');
  tracks.forEach((_, index) => {
    resourceRefList.ele('ReleaseResourceReference', { ReleaseResourceType: 'PrimaryResource' })
      .txt(`RSR${String(index + 1).padStart(3, '0')}`);
  });
  if (release.coverUrl) {
    resourceRefList.ele('ReleaseResourceReference', { ReleaseResourceType: 'SecondaryResource' })
      .txt(`RSR${String(tracks.length + 1).padStart(3, '0')}`);
  }

  // Release details by territory
  const relDetails = rel.ele('ReleaseDetailsByTerritory');
  _buildTerritories(relDetails, territories);

  const displayArtistRel = relDetails.ele('DisplayArtist');
  displayArtistRel.ele('PartyName').ele('FullName').txt(
    release.artist?.stageName || 'Artista Desconocido'
  );
  displayArtistRel.ele('ArtistRole').txt('MainArtist');

  relDetails.ele('LabelName').txt(labelName);
  relDetails.ele('Genre').ele('GenreText').txt(release.genre || 'Pop');

  const plinePrimary = relDetails.ele('PLine');
  plinePrimary.ele('Year').txt(
    new Date(release.releaseDate || release.createdAt).getFullYear().toString()
  );
  plinePrimary.ele('PLineText').txt(
    `℗ ${new Date(release.releaseDate || release.createdAt).getFullYear()} ${labelName}`
  );

  const clinePrimary = relDetails.ele('CLine');
  clinePrimary.ele('Year').txt(
    new Date(release.releaseDate || release.createdAt).getFullYear().toString()
  );
  clinePrimary.ele('CLineText').txt(
    `© ${new Date(release.releaseDate || release.createdAt).getFullYear()} ${labelName}`
  );

  relDetails.ele('OriginalReleaseDate').txt(
    (release.releaseDate ? new Date(release.releaseDate) : new Date()).toISOString().split('T')[0]
  );

  relDetails.ele('ParentalWarningType').txt(
    tracks.some(t => t.explicit) ? 'Explicit' : 'NotExplicit'
  );

  // ─────────────────────────────────────────────────────────────────
  // 4. DEAL LIST
  // ─────────────────────────────────────────────────────────────────
  const dealList = root.ele('DealList');
  const releaseDeal = dealList.ele('ReleaseDeal');
  releaseDeal.ele('DealReleaseReference').txt('RR001');

  const deal = releaseDeal.ele('Deal');
  const dealTerms = deal.ele('DealTerms');
  dealTerms.ele('CommercialModelType').txt(dealType);

  const usage = dealTerms.ele('Usage');
  useTypes.forEach(useType => usage.ele('UseType').txt(useType));

  _buildTerritories(dealTerms, territories);
  dealTerms.ele('ValidityPeriod').ele('StartDate').txt(
    (release.releaseDate ? new Date(release.releaseDate) : new Date()).toISOString().split('T')[0]
  );

  // ─────────────────────────────────────────────────────────────────
  // GENERAR XML Y CHECKSUMS
  // ─────────────────────────────────────────────────────────────────
  const xmlString = root.end({ prettyPrint: true });

  // Calcular checksum MD5 del XML
  const xmlChecksum = crypto.createHash('md5').update(xmlString).digest('hex');

  // Guardar paquete localmente para subir a Supabase
  const packageDir = path.join('generated', 'ddex', release.id);
  fs.mkdirSync(path.join(packageDir, 'metadata'), { recursive: true });
  fs.mkdirSync(path.join(packageDir, 'checksum'), { recursive: true });

  const xmlFilePath = path.join(packageDir, 'metadata', `${release.upc || release.id}_ern43.xml`);
  const checksumPath = path.join(packageDir, 'checksum', 'manifest.md5');

  fs.writeFileSync(xmlFilePath, xmlString, 'utf8');

  const checksums = {
    xml: xmlChecksum,
    generatedAt: packageTimestamp,
    releaseId: release.id,
    messageId,
  };
  fs.writeFileSync(checksumPath, JSON.stringify(checksums, null, 2), 'utf8');

  logger.info(`[DDEXService] Paquete DDEX generado: ${xmlFilePath} (MD5: ${xmlChecksum})`);

  return {
    xml: xmlString,
    xmlFilePath,
    checksumPath,
    packageDir,
    messageId,
    checksums,
  };
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function _buildTerritories(parent, territories) {
  if (territories === 'worldwide' || territories === '*') {
    parent.ele('TerritoryCode').txt('Worldwide');
  } else {
    const territoryList = Array.isArray(territories)
      ? territories
      : territories.split(',').map(t => t.trim());
    territoryList.forEach(tc => parent.ele('TerritoryCode').txt(tc.toUpperCase()));
  }
}

function _mapReleaseType(type) {
  const map = {
    Single: 'Single',
    EP: 'EP',
    Album: 'Album',
    Compilation: 'Compilation',
    LiveAlbum: 'LiveAlbum',
    Mixtape: 'Mixtape',
  };
  return map[type] || 'Single';
}

function _mapCollaboratorRole(role) {
  const map = {
    FEATURED: 'FeaturedArtist',
    PRODUCER: 'Producer',
    WRITER: 'Author',
    COMPOSER: 'Composer',
    MIXER: 'Mixer',
    REMIXER: 'Remixer',
  };
  return map[role?.toUpperCase()] || 'Contributor';
}

/**
 * Valida que el XML generado tenga la estructura mínima DDEX ERN 4.3.
 * @param {string} xmlString - XML a validar
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateDDEXStructure(xmlString) {
  const errors = [];
  const requiredElements = [
    'MessageHeader',
    'MessageId',
    'MessageSender',
    'ResourceList',
    'SoundRecording',
    'ReleaseList',
    'Release',
    'DealList',
    'ReleaseDeal',
  ];
  requiredElements.forEach(el => {
    if (!xmlString.includes(`<${el}`) && !xmlString.includes(`<ern:${el}`)) {
      errors.push(`Elemento requerido DDEX ausente: ${el}`);
    }
  });
  return { valid: errors.length === 0, errors };
}

module.exports = { generateDDEXPackage, validateDDEXStructure };
