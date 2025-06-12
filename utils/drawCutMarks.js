/*
 * ===============================================
 * Module        : drawCutMarks.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Draws cut marks (trim lines) around the edges of a PDF page
 *                 for accurate print trimming using the specified bleed.
 *
 * External Dependencies:
 * -----------------------------------------------
 * pdf-lib                : PDF manipulation library
 *
 * Function:
 * -----------------------------------------------
 * drawCutMarks(page, width, height, bleed)
 * - Draws horizontal and vertical guide lines at each corner
 *   based on the bleed margin to guide cutting after print.
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */

import { rgb } from 'pdf-lib';

export function drawCutMarks(page, width, height, bleed) {
  const drawLine = (x1, y1, x2, y2) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  };

  // === Bottom-Left
  //horizontal
  drawLine(bleed - 10, bleed+7, bleed, bleed+7);
  //virtica
  drawLine(bleed+7, bleed - 10, bleed+7, bleed);

  // === Bottom-Right
  drawLine(width - bleed, bleed+7, width - bleed + 10, bleed+7);
  drawLine(width - bleed-7, bleed - 10, width - bleed-7, bleed);

  // === Top-Left
  drawLine(bleed - 10, height - bleed - 16, bleed + 1, height - bleed - 16);
  drawLine(bleed+7, height - bleed - 10, bleed+7, height - bleed);

  // === Top-Right
  drawLine(width - bleed - 2, height - bleed - 16, width - bleed + 9, height - bleed -16);
  drawLine(width - bleed -8, height - bleed - 9, width - bleed - 8, height - bleed + 1);
}
