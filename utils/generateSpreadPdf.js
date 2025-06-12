/*
 * ===============================================
 * Module        : generateSpreadPdf.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Generates a print-ready spread-format PDF from a given buffer.
 *                 Pairs original pages into spreads, adds bleed, margins, and wraps
 *                 them into a centered padded layout for print compatibility.
 *
 * External Dependencies:
 * -----------------------------------------------
 * pdf-lib                : PDF manipulation library
 *
 * Custom Modules:
 * -----------------------------------------------
 * ./createSpreadPage.js : Function to render spread pages with trim guides
 *
 * Function:
 * -----------------------------------------------
 * generateSpreadPdf(buffer)
 * - Loads original PDF buffer
 * - Rearranges pages into defined spread pairs
 * - Embeds pages into spread layout with bleed and margins
 * - Adds a wrapper layout for final print-safe dimensions
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */
import { PDFDocument } from 'pdf-lib';
import { createSpreadPage } from './createSpreadPage.js';

export async function generateSpreadPdf(buffer) {
  const originalPdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();

  const POINTS_PER_MM = 2.83465;
  const BLEED_MM = 5;
  const BLEED = BLEED_MM * POINTS_PER_MM;
  const IMG_WIDTH = 575.525;
  const IMG_HEIGHT = 575.525;
  const FINAL_WIDTH = IMG_WIDTH * 2 + BLEED * 2;
  const FINAL_HEIGHT = IMG_HEIGHT + BLEED * 2;
  const MARGIN_X = BLEED;
  const MARGIN_Y = BLEED;

  const pagePairs = [
    ['blank', 1],
    [2, 15],
    [14, 3],
    [4, 13],
    [12, 5],
    [6, 11],
    [10, 7],
    [8, 9],
  ];

  const uniquePages = [...new Set(pagePairs.flat().filter(p => p !== 'blank'))];
  const copiedPages = await newPdf.copyPages(originalPdf, uniquePages);
  const pageMap = {};
  uniquePages.forEach((pageNum, index) => {
    pageMap[pageNum] = copiedPages[index];
  });

  for (const [leftIdx, rightIdx] of pagePairs) {
    const [leftPage] = leftIdx !== 'blank' && pageMap[leftIdx]
      ? await newPdf.embedPages([pageMap[leftIdx]])
      : [null];

    const [rightPage] = rightIdx !== 'blank' && pageMap[rightIdx]
      ? await newPdf.embedPages([pageMap[rightIdx]])
      : [null];

    createSpreadPage(newPdf, {
      leftPage,
      rightPage,
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
      marginX: MARGIN_X,
      marginY: 5,
      imgWidth: IMG_WIDTH,
      imgHeight: IMG_HEIGHT,
      bleed: BLEED,
      extraGutter: 0,
    });
  }

  const wrapperPdf = await PDFDocument.create();
  const finalPages = await wrapperPdf.copyPages(newPdf, newPdf.getPageIndices());

  const WRAP_PADDING = 30;
  const WRAP_WIDTH = FINAL_WIDTH + WRAP_PADDING * 2;
  const WRAP_HEIGHT = FINAL_HEIGHT + WRAP_PADDING * 2;

  for (const page of finalPages) {
    const wrapperPage = wrapperPdf.addPage([WRAP_WIDTH, WRAP_HEIGHT]);
    const [embeddedPage] = await wrapperPdf.embedPages([page]);

    wrapperPage.drawPage(embeddedPage, {
      x: (WRAP_WIDTH - FINAL_WIDTH) / 2,
      y: (WRAP_HEIGHT - FINAL_HEIGHT) / 2,
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
    });
  }

  const finalBytes = await wrapperPdf.save();
  return finalBytes; // ✅ no local save
}
