/*
 * ===============================================
 * Module        : generate-b64.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Utility script to convert a Google service account
 *                 JSON key file into a base64-encoded string. This string
 *                 can be stored in environment variables for secure usage.
 *
 * External Dependencies:
 * -----------------------------------------------
 * fs                    : Node.js File System module (built-in)
 *
 * Function:
 * -----------------------------------------------
 * Reads the service account file → encodes it in base64 →
 * prints it to the console for .env storage.
 *
 * Usage:
 * - Run once to generate a secure .env-friendly string:
 *   node generate-b64.js
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */

import fs from 'fs';

const filePath = 'service-account.json'; // or path to your key file
const json = fs.readFileSync(filePath, 'utf8');

const encoded = Buffer.from(json).toString('base64');
console.log('✅ Copy this into your .env as GOOGLE_CREDENTIALS_BASE64:\n');
console.log(encoded);
