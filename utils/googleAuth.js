/*
 * ===============================================
 * Module        : googleAuth.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Authenticates a service account with Google APIs using
 *                 credentials stored as a base64-encoded environment variable.
 *                 Returns an authorized Google API client for Drive operations.
 *
 * External Dependencies:
 * -----------------------------------------------
 * googleapis             : Google API client library
 *
 * Function:
 * -----------------------------------------------
 * authenticate()
 * - Decodes base64 service account credentials
 * - Instantiates and returns an authenticated Google client
 * - Validates token generation via JWT
 *
 * Environment Variables:
 * - GOOGLE_CREDENTIALS_BASE64 : base64-encoded service account credentials
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */

import { google } from 'googleapis';

export async function authenticate() {
  try {
    const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!base64) throw new Error('Missing base64 env var');

    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const credentials = JSON.parse(decoded);

    console.log('✅ Decoded service account for:', credentials.client_email);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const client = await auth.getClient();

    // Test JWT: force a token to be created
    const token = await client.getAccessToken();
    console.log('✅ Access token:', token?.token?.slice(0, 20), '...');

    return client;
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
    throw err;
  }
}
