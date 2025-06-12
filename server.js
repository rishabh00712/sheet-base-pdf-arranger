/*
 * ===============================================
 * Project: PDF Processing and Google Drive Upload
 * ===============================================
 *
 * Author       : Rishabh Garai
 * Email        : rishabhgarai33@gmail.com
 *
 * Description  : Express server to handle PDF downloads from Google Drive,
 *                process PDFs using custom PDF generation utility, and
 *                upload processed PDFs back to Google Drive with public access.
 *
 * External Dependencies:
 * -----------------------------------------------
 * express       : Node.js web server framework
 * axios         : HTTP client for handling HTTP requests
 * googleapis    : Google API client for Drive interactions
 * dotenv        : Loads environment variables from .env
 *
 * Custom Modules:
 * -----------------------------------------------
 * ./utils/googleAuth.js        : Handles Google API authentication
 * ./utils/generateSpreadPdf.js : Custom PDF processing module
 *
 * Node.js Built-in Modules:
 * -----------------------------------------------
 * path          : Utilities for file and directory paths
 * url           : Utilities for URL resolution and parsing
 * stream        : Utilities for handling stream operations
 *
 * Utility Functions:
 * -----------------------------------------------
 * extractFileId(link)          : Extracts Google Drive file ID from a URL
 * sanitizeFileName(name)       : Cleans filenames for safe uploading
 *
 * API Endpoints:
 * -----------------------------------------------
 * POST /handle-preview         : Processes incoming PDF links, generates processed PDFs,
 *                                uploads to Google Drive, and makes files publicly accessible.
 * GET  /health                 : Health check endpoint to confirm server status
 *
 * Server Details:
 * -----------------------------------------------
 * Port                         : 5000
 * Start command                : node <filename>
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */

import express from 'express';
import axios from 'axios';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticate } from './utils/googleAuth.js';
import { generateSpreadPdf } from './utils/generateSpreadPdf.js';
import { Readable } from 'stream';
import 'dotenv/config';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Use built-in JSON body parser
app.use(express.json());

// 🔧 Utility to extract file ID from Google Drive share link
function extractFileId(link) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// 🔧 Sanitize filename from Drive
function sanitizeFileName(name) {
  if (!name) return 'Processed_File.pdf';
  return name
    .replace(/(_\d{8}_\d{6}(_\d+)?)+\.pdf$/i, '')
    .replace(/\.pdf+$/i, '')
    .trim() + '.pdf';
}

// ✅ Handle preview processing
app.post('/handle-preview', async (req, res) => {
  console.log("📩 Incoming request to /handle-preview");
  console.log("🧾 Request body:", req.body);

  const link = req.body.link;
  const row = parseInt(req.body.row, 10); // Ensure number type

  if (!link || isNaN(row)) {
    console.error("❌ Missing or invalid 'link' or 'row'");
    return res.status(400).json({ error: 'Missing or invalid preview link or row number.' });
  }

  const fileId = extractFileId(link);
  if (!fileId) {
    return res.status(400).json({ error: 'Invalid Google Drive link format.' });
  }

  try {
    // 🔐 Step 1: Auth
    const auth = await authenticate();
    const drive = google.drive({ version: 'v3', auth });

    // 📄 Step 2: Get file name
    const fileMeta = await drive.files.get({
      fileId,
      fields: 'name'
    });

    const rawName = fileMeta.data.name || `Processed_Row_${row}.pdf`;
    const originalName = sanitizeFileName(rawName);

    // 📥 Step 3: Download original PDF
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    const originalBuffer = Buffer.from(response.data);

    // 🖨 Step 4: Process PDF
    const processedBuffer = await generateSpreadPdf(originalBuffer);

    // 📤 Step 5: Upload processed file
    const fileMetadata = {
      name: originalName,
      parents: ['1TGTQSdxLcewHaa8MSCs6DqHV1bcyDwq0'] // Replace with your folder ID
    };

    const media = {
      mimeType: 'application/pdf',
      body: Readable.from([processedBuffer])
    };

    const uploadRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id'
    });

    const uploadedFileId = uploadRes.data.id;

    // 🔓 Step 6: Make file public
    await drive.permissions.create({
      fileId: uploadedFileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const publicUrl = `https://drive.google.com/file/d/${uploadedFileId}/view?usp=sharing`;
    console.log(`✅ Uploaded & Shared File for row ${row}: ${publicUrl}`);

    res.json({
      link: publicUrl,
      row: row
    });

  } catch (err) {
    console.error('❌ Failed to handle preview:\n', err);
    res.status(500).json({ error: 'Failed to process and upload PDF.', detail: err.message });
  }
});

// ✅ Optional: health check route
app.get('/health', (req, res) => {
  res.send('Server is alive!');
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
