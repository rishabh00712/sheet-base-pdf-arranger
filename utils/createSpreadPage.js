/*
 * ===============================================
 * Module        : createSpreadPage.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Creates a new PDF spread page in a PDFDocument by embedding
 *                 optional left and right page images, positioning them with bleed
 *                 and margin, and drawing cut and center marks for printing alignment.
 *
 * External Dependencies:
 * -----------------------------------------------
 * pdf-lib                : PDF manipulation library for Node.js and browsers
 *
 * Custom Modules:
 * -----------------------------------------------
 * ./drawCutMarks.js      : Draws outer cut marks around the PDF spread
 * ./drawMiddleMarks.js   : Draws center gutter alignment marks
 *
 * Function Summary:
 * -----------------------------------------------
 * createSpreadPage(doc, options):
 *     Adds a new page to the document, draws left/right images,
 *     applies bleed margins, and prints necessary guide marks.
 *
 * Parameters:
 * - doc: PDFDocument instance to which the spread is added
 * - leftPage/rightPage: Embedded pages for left and right side
 * - width/height: Final size including bleed
 * - marginX/marginY: Offset from edges
 * - imgWidth/imgHeight: Dimensions for embedded images
 * - bleed: Extra margin for trimming
 * - extraGutter: Optional spacing in the center
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */
import { PDFDocument } from 'pdf-lib';
import { drawCutMarks } from './drawCutMarks.js';
import { drawMiddleMarks } from './drawMiddleMarks.js';

/**
 * Creates a PDF spread page, embeds left/right pages, adds cut & middle marks.
 * 
 * @param {PDFDocument} doc - The PDFDocument to add page to
 * @param {Object} options
 * @param {any} leftPage - The embedded left page (optional)
 * @param {any} rightPage - The embedded right page (optional)
 * @param {number} width - Final spread width (incl. bleed)
 * @param {number} height - Final spread height (incl. bleed)
 * @param {number} marginX - X margin from edge
 * @param {number} marginY - Y margin from edge
 * @param {number} imgWidth - Width of each side image
 * @param {number} imgHeight - Height of each image
 * @param {number} bleed - Bleed size in points
 * @param {number} extraGutter - Optional center offset
 */
export function createSpreadPage(doc, {
  leftPage,
  rightPage,
  width,
  height,
  marginX,
  marginY,
  imgWidth,
  imgHeight,
  bleed,
  extraGutter = 0,
}) {
  const page = doc.addPage([width, height]);

  if (leftPage) {
    page.drawPage(leftPage, {
      x: marginX,
      y: marginY,
      width: imgWidth,
      height: imgHeight,
    });
  }

  if (rightPage) {
    page.drawPage(rightPage, {
      x: marginX + imgWidth,
      y: marginY,
      width: imgWidth,
      height: imgHeight,
    });
  }

  drawCutMarks(page, width, height, bleed);
  drawMiddleMarks(page, {
    imgWidth,
    bleed,
    finalHeight: height,
    extraGutter,
  });

  return page;
}
