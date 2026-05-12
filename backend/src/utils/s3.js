const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.R2_ACCOUNT_ID 
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : process.env.AWS_ENDPOINT,
});

/**
 * Genera una URL firmada para subir un archivo directamente a S3/R2.
 * @param {string} fileName - Nombre del archivo en el storage.
 * @param {string} contentType - Tipo MIME del archivo.
 * @returns {Promise<string>} - La URL firmada.
 */
const getPresignedUploadUrl = async (fileName, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

module.exports = {
  s3Client,
  getPresignedUploadUrl,
};
