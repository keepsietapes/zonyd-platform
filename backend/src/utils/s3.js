const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Si usas Cloudflare R2, necesitas el endpoint
  endpoint: process.env.AWS_ENDPOINT || undefined,
});

/**
 * Genera una URL firmada para subir un archivo directamente a S3/R2.
 * @param {string} fileName - Nombre del archivo en el storage.
 * @param {string} contentType - Tipo MIME del archivo.
 * @returns {Promise<string>} - La URL firmada.
 */
const getPresignedUploadUrl = async (fileName, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

module.exports = {
  s3Client,
  getPresignedUploadUrl,
};
