import { registerAs } from '@nestjs/config';

export default registerAs('contentful', () => ({
  baseUrl: process.env.CONTENTFUL_URL,
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT,
  contentType: process.env.CONTENTFUL_CONTENT_TYPE,
}));
