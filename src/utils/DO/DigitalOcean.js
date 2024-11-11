import AWS from 'aws-sdk';

/**
 * Digital Ocean Spaces Connection
 */

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: import.meta.env.ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.ACCESS_SECRET_KEY,
});
export default s3;
