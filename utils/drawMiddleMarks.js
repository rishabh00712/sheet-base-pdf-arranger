/*
 * ===============================================
 * Module        : drawMiddleMarks.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Draws vertical middle alignment marks along the top and bottom
 *                 of a PDF spread to assist with binding or folding.
 *
 * External Dependencies:
 * -----------------------------------------------
 * pdf-lib                : PDF manipulation library
 *
 * Function:
 * -----------------------------------------------
 * drawMiddleMarks(page, options)
 * - Calculates center X positions with optional gutter/offsets
 * - Draws vertical lines at specified positions for alignment
 *
 * Parameters:
 * - page: PDF page object
 * - options: Includes imgWidth, bleed, finalHeight, extraGutter, offset1, offset2
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */

import { rgb } from 'pdf-lib';

export function drawMiddleMarks(page, options) {
  const {
    imgWidth,
    bleed,
    finalHeight,
    extraGutter = 0,
    offset1 = -1,
    offset2 = 30,
  } = options;

  const centerX1 = imgWidth + bleed + offset1;
  const centerX2 = imgWidth + bleed + extraGutter;
  const centerX3 = imgWidth + bleed + offset2;

  const drawLine = (x, y1, y2) => {
    page.drawLine({
      start: { x, y: y1 },
      end: { x, y: y2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  };

  drawLine(centerX1+1, bleed - 10, bleed);
  drawLine(centerX1+1, finalHeight - bleed - 10, finalHeight - bleed);
}
