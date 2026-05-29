import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ExecutiveReport } from './executive-report';

export async function generateBoardReportPdf(report: ExecutiveReport, repoName: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;

  // Premium Corporate Color Palette
  const primaryColor = rgb(0.08, 0.18, 0.36);   // Deep Navy (#142E5C)
  const secondaryColor = rgb(0.12, 0.44, 0.65); // Slate Teal (#1F70A5)
  const textColor = rgb(0.18, 0.22, 0.28);      // Charcoal Neutral (#2E3847)
  const mutedColor = rgb(0.45, 0.50, 0.58);     // Cool Muted Grey (#738094)
  const bgColor = rgb(0.96, 0.97, 0.99);        // Soft Background Tint (#F6F8FC)
  const borderColor = rgb(0.88, 0.91, 0.95);    // Soft Border Grey (#E0E6F0)

  // Status & Exposure Palette
  const redColor = rgb(0.78, 0.15, 0.15);       // Crimson Red (Alert/Critical)
  const greenColor = rgb(0.08, 0.48, 0.22);     // Forest Green (Safe/Healthy)
  const amberColor = rgb(0.82, 0.42, 0.05);     // Warm Amber (Warning/Medium)

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin - 20;

  // Apply a dynamic colored top accent banner
  page.drawRectangle({
    x: 0,
    y: pageHeight - 8,
    width: pageWidth,
    height: 8,
    color: primaryColor,
  });

  const newPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin - 20;

    // Apply top accent banner
    page.drawRectangle({
      x: 0,
      y: pageHeight - 8,
      width: pageWidth,
      height: 8,
      color: primaryColor,
    });

    // Running header on sub-pages
    page.drawText('DebtRadar Software Trust Report', {
      x: margin,
      y: pageHeight - 25,
      size: 7.5,
      font: bold,
      color: mutedColor,
    });
    
    page.drawText(sanitize(repoName), {
      x: pageWidth - margin - 150,
      y: pageHeight - 25,
      size: 7.5,
      font: font,
      color: mutedColor,
    });
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < 80) {
      newPage();
    }
  };

  const sanitize = (text: string) => text
    .replace(/₹/g, 'INR ')
    .replace(/[•·]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  const splitText = (text: string, maxChars: number) => {
    const words = sanitize(text).split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const candidate = (cur + ' ' + w).trim();
      if (candidate.length > maxChars) {
        if (cur) lines.push(cur.trim());
        cur = w;
      } else {
        cur = candidate;
      }
    }
    if (cur) lines.push(cur.trim());
    return lines;
  };

  const drawHeading = (text: string) => {
    ensureSpace(35);
    
    // Draw thick vertical indicator bar next to the heading
    page.drawRectangle({
      x: margin,
      y: y - 16,
      width: 4,
      height: 16,
      color: primaryColor,
    });

    page.drawText(sanitize(text), {
      x: margin + 12,
      y: y - 14,
      size: 12.5,
      font: bold,
      color: primaryColor,
    });

    // Draw subtle underline spanning the full content width
    page.drawLine({
      start: { x: margin, y: y - 22 },
      end: { x: pageWidth - margin, y: y - 22 },
      thickness: 0.5,
      color: borderColor,
    });

    y -= 34;
  };

  const drawParagraph = (text: string, size = 9.5) => {
    const lines = splitText(text, 82);
    ensureSpace(lines.length * (size + 4.5) + 8);
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y: y - size - 2,
        size,
        font,
        color: textColor,
      });
      y -= size + 4.5;
    }
    y -= 8;
  };

  const drawBulletItem = (text: string, bulletColor = secondaryColor) => {
    const lines = splitText(text, 78);
    ensureSpace(lines.length * 14 + 6);
    
    // Draw modern solid square bullet point
    page.drawRectangle({
      x: margin + 4,
      y: y - 10,
      width: 4,
      height: 4,
      color: bulletColor,
    });

    for (const line of lines) {
      page.drawText(line, {
        x: margin + 18,
        y: y - 12,
        size: 9.5,
        font: font,
        color: textColor,
      });
      y -= 14;
    }
    y -= 4; // Spacing after bullet
  };

  // --- Page 1 Title Block ---
  page.drawText('DebtRadar Software Trust Report', {
    x: margin,
    y: y - 10,
    size: 22,
    font: bold,
    color: primaryColor,
  });

  page.drawText('EXECUTIVE SUMMARY & RISK ANALYSIS', {
    x: margin,
    y: y - 25,
    size: 8,
    font: bold,
    color: secondaryColor,
  });

  // Left-bordered Metadata Cover Panel
  const metaY = y - 35;
  page.drawRectangle({
    x: margin,
    y: metaY - 60,
    width: 515,
    height: 60,
    color: bgColor,
    borderColor: borderColor,
    borderWidth: 1,
  });
  
  page.drawRectangle({
    x: margin,
    y: metaY - 60,
    width: 4,
    height: 60,
    color: secondaryColor,
  });

  page.drawText('REPOSITORY:', { x: margin + 15, y: metaY - 20, size: 7.5, font: bold, color: mutedColor });
  page.drawText(sanitize(repoName), { x: margin + 95, y: metaY - 20, size: 9, font: bold, color: textColor });
  
  page.drawText('GENERATED ON:', { x: margin + 15, y: metaY - 38, size: 7.5, font: bold, color: mutedColor });
  page.drawText(new Date().toLocaleDateString(), { x: margin + 95, y: metaY - 38, size: 9, font, color: textColor });

  y = metaY - 75;

  // --- Snapshot Section ---
  drawHeading('Software Credit & Trust Snapshot');
  
  ensureSpace(85);
  const snapshotY = y;
  page.drawRectangle({
    x: margin,
    y: snapshotY - 80,
    width: 515,
    height: 80,
    color: bgColor,
    borderColor: borderColor,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: margin,
    y: snapshotY - 80,
    width: 4,
    height: 80,
    color: primaryColor,
  });

  // Column 1: Software Credit Rating
  page.drawText('SOFTWARE CREDIT RATING', { x: margin + 18, y: snapshotY - 22, size: 7.5, font: bold, color: mutedColor });
  const risk = report.financialExposure.riskLevel;
  const riskColor = (risk === 'CRITICAL' || risk === 'HIGH') ? redColor : (risk === 'LOW' ? greenColor : amberColor);
  page.drawText(sanitize(risk), { x: margin + 18, y: snapshotY - 38, size: 13, font: bold, color: riskColor });

  // Column 2: Trust / Deployment Recommendation
  page.drawText('TRUST / DEPLOYMENT STATUS', { x: margin + 240, y: snapshotY - 22, size: 7.5, font: bold, color: mutedColor });
  const rec = report.deploymentRecommendation;
  const recColor = rec.includes('SAFE') ? greenColor : (rec.includes('CRITICAL') || rec.includes('BLOCK') ? redColor : amberColor);
  page.drawText(sanitize(rec), { x: margin + 240, y: snapshotY - 38, size: 11, font: bold, color: recColor });

  // Snapshot Divider
  page.drawLine({
    start: { x: margin + 18, y: snapshotY - 48 },
    end: { x: margin + 497, y: snapshotY - 48 },
    thickness: 0.5,
    color: borderColor,
  });

  // Health Row
  page.drawText('HEALTH POSTURE', { x: margin + 18, y: snapshotY - 66, size: 7.5, font: bold, color: mutedColor });
  page.drawText(sanitize(report.repositoryHealth), { x: margin + 130, y: snapshotY - 66, size: 9, font: bold, color: primaryColor });

  y -= 92;

  // --- Executive Summary ---
  drawHeading('Executive Summary');
  for (const paragraph of report.executiveSummary) {
    drawParagraph(paragraph);
  }

  // --- Financial Impact ---
  drawHeading('Financial Impact');
  
  ensureSpace(80);
  const finY = y;
  const colWidth = 163;
  const colGap = 13;

  const financialItems = [
    { label: 'ESTIMATED FIX COST', value: `INR ${report.financialExposure.estimatedFixCost.toLocaleString('en-IN')}`, accent: secondaryColor },
    { label: 'INCIDENT EXPOSURE', value: `INR ${report.financialExposure.estimatedIncidentExposure.toLocaleString('en-IN')}`, accent: redColor },
    { label: 'OPERATIONAL EXPOSURE', value: `INR ${report.financialExposure.estimatedOperationalExposure.toLocaleString('en-IN')}`, accent: amberColor },
  ];

  financialItems.forEach((item, index) => {
    const xPos = margin + index * (colWidth + colGap);
    
    page.drawRectangle({
      x: xPos,
      y: finY - 60,
      width: colWidth,
      height: 60,
      color: bgColor,
      borderColor: borderColor,
      borderWidth: 1,
    });

    page.drawRectangle({
      x: xPos,
      y: finY - 3,
      width: colWidth,
      height: 3,
      color: item.accent,
    });

    page.drawText(item.label, { x: xPos + 10, y: finY - 18, size: 7.5, font: bold, color: mutedColor });
    page.drawText(sanitize(item.value), { x: xPos + 10, y: finY - 38, size: 10.5, font: bold, color: primaryColor });
  });

  y -= 75;

  // --- Compliance Readiness ---
  drawHeading('Compliance Readiness');
  
  ensureSpace(85);
  const compY = y;
  
  page.drawRectangle({
    x: margin,
    y: compY - 75,
    width: 515,
    height: 75,
    color: bgColor,
    borderColor: borderColor,
    borderWidth: 1,
  });

  // Score Badge sidebar
  page.drawRectangle({
    x: margin,
    y: compY - 75,
    width: 120,
    height: 75,
    color: rgb(0.92, 0.94, 0.97),
  });

  page.drawLine({
    start: { x: margin + 120, y: compY - 75 },
    end: { x: margin + 120, y: compY },
    thickness: 1,
    color: borderColor,
  });

  page.drawText('COMPLIANCE SCORE', { x: margin + 12, y: compY - 18, size: 7.5, font: bold, color: mutedColor });
  page.drawText(`${report.complianceSummary.score}/100`, { x: margin + 12, y: compY - 38, size: 14, font: bold, color: primaryColor });
  
  page.drawText('GRADE', { x: margin + 12, y: compY - 52, size: 7.5, font: bold, color: mutedColor });
  const grade = report.complianceSummary.grade;
  const gradeColor = (grade.startsWith('A') || grade.startsWith('B')) ? greenColor : (grade.startsWith('C') ? amberColor : redColor);
  page.drawText(sanitize(grade), { x: margin + 12, y: compY - 67, size: 11, font: bold, color: gradeColor });

  // Status Summary Detail
  page.drawText('READINESS POSTURE', { x: margin + 135, y: compY - 18, size: 7.5, font: bold, color: mutedColor });
  
  const compLines = splitText(report.complianceSummary.status, 55);
  let compTextY = compY - 32;
  for (const line of compLines) {
    page.drawText(line, { x: margin + 135, y: compTextY, size: 9, font: font, color: textColor });
    compTextY -= 13;
  }

  y -= 90;

  // --- Top Business Risks ---
  drawHeading('Top Business Risks');
  for (const risk of report.topBusinessRisks.slice(0, 5)) {
    drawBulletItem(risk, redColor);
  }

  // --- Recommended Actions ---
  drawHeading('Recommended Actions');
  for (const action of report.recommendedActions.slice(0, 3)) {
    drawBulletItem(action, greenColor);
  }

  // --- Finalize Headers & Footers (Dynamic Page Numbering) ---
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    
    // Draw sleek footer divider
    p.drawLine({
      start: { x: margin, y: margin + 15 },
      end: { x: pageWidth - margin, y: margin + 15 },
      thickness: 0.5,
      color: borderColor,
    });

    p.drawText('DebtRadar Software Trust Report  |  CONFIDENTIAL', {
      x: margin,
      y: margin,
      size: 7.5,
      font: font,
      color: mutedColor,
    });

    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: pageWidth - margin - 55,
      y: margin,
      size: 7.5,
      font: font,
      color: mutedColor,
    });
  }

  return pdfDoc.save();
}

export default generateBoardReportPdf;
