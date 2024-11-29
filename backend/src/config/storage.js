const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: process.env.GCP_KEYFILE,
  projectId: process.env.GCP_PROJECT_ID
});

const bucket = storage.bucket(process.env.GCP_BUCKET);

const getPublicUrl = (filename) => 
  `https://storage.googleapis.com/${process.env.GCP_BUCKET}/${filename}`;

module.exports = {
  bucket,
  getPublicUrl
}; 