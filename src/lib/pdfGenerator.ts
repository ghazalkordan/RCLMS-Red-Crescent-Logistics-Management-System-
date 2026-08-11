import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  language?: 'fa' | 'en' | 'ar' | string;
  sections: Array<{
    heading?: string;
    text?: string;
    table?: {
      headers: string[];
      rows: (string | number)[][];
    };
    keyValues?: Array<{ label: string; value: string | number }>;
  }>;
}

/**
 * High-fidelity, UTF-8 & RTL/LTR compliant PDF report generator.
 * Handles Persian, Arabic, and English languages with proper font rendering,
 * exact letter shaping, and correct orientation based on active language.
 */
export async function generatePdfReport(options: PdfReportOptions): Promise<void> {
  const lang = options.language || 'fa';
  const isRtl = lang === 'fa' || lang === 'ar';

  // 1. Create hidden off-screen A4 container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 pixel width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.direction = isRtl ? 'rtl' : 'ltr';
  container.style.textAlign = isRtl ? 'right' : 'left';
  container.style.fontFamily =
    "Vazirmatn, 'Noto Sans Arabic', Tahoma, 'IRANSans', Arial, sans-serif";
  container.style.letterSpacing = 'normal';
  container.style.wordSpacing = 'normal';
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';

  const dateFormatted = new Date().toLocaleDateString(
    lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-EG' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  // Localized Organization Names & Headers
  let orgName = 'جمعیت هلال احمر جمهوری اسلامی ایران';
  let orgSub = 'سامانه مدیریت هوشمند عملیات و لوجستیک امداد و نجات (IRCS-LOG)';
  let dateLabel = 'تاریخ تنظیم:';
  let unitLabel = 'واحد صادرکننده:';
  let unitValue = 'ستاد مرکزی مدیریت بحران';
  let footerConfidential = 'تاییدشده توسط سیستم هوشمند پشتیبانی تصمیم‌گیری هلال احمر (گزارش محرمانه)';
  let pageLabel = 'صفحه ۱ از ۱';

  if (lang === 'en') {
    orgName = 'Iranian Red Crescent Society';
    orgSub = 'Smart Relief Operations & Logistics Command System (IRCS-LOG)';
    dateLabel = 'Date:';
    unitLabel = 'Unit:';
    unitValue = 'Disaster Management Command Center';
    footerConfidential = 'Confidential IRCS Smart Humanitarian Operations Report';
    pageLabel = 'Page 1 of 1';
  } else if (lang === 'ar') {
    orgName = 'جمعية الهلال الأحمر لجمهورية إيران الإسلامية';
    orgSub = 'نظام القيادة الذكي لعمليات الإغاثة واللوجستيات (IRCS-LOG)';
    dateLabel = 'تاريخ الإصدار:';
    unitLabel = 'الجهة المصدرة:';
    unitValue = 'المقر الرئيسي لإدارة الأزمات';
    footerConfidential = 'تقرير عمليات الإغاثة الإنسانية الذكي (سري ومحمي)';
    pageLabel = 'الصفحة ١ من ١';
  }

  // 2. Build IRCS Header
  const headerHtml = `
    <div style="background: #0f172a; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: space-between; direction: ${isRtl ? 'rtl' : 'ltr'};">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 44px; height: 44px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); shrink-0;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#D6001C"/>
          </svg>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 16px; letter-spacing: normal; color: #ffffff;">
            ${orgName}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; letter-spacing: normal;">
            ${orgSub}
          </div>
        </div>
      </div>
      <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 11px; color: #cbd5e1; line-height: 1.6; letter-spacing: normal;">
        <div><strong>${dateLabel}</strong> ${dateFormatted}</div>
        <div><strong>${unitLabel}</strong> ${unitValue}</div>
      </div>
    </div>
    <div style="height: 5px; background: #D6001C; margin-bottom: 24px;"></div>
  `;

  // 3. Build Title & Subtitle Section
  const titleHtml = `
    <div style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.4; letter-spacing: normal;">
        ${options.title}
      </h1>
      ${
        options.subtitle
          ? `<p style="margin: 8px 0 0 0; font-size: 13px; font-weight: 600; color: #475569; line-height: 1.5; letter-spacing: normal;">
              ${options.subtitle}
             </p>`
          : ''
      }
    </div>
  `;

  // 4. Build Sections (Headings, Paragraphs, Key-Values, Tables)
  let sectionsHtml = '';
  options.sections.forEach((sec) => {
    sectionsHtml += `<div style="margin-bottom: 24px; page-break-inside: avoid;">`;

    if (sec.heading) {
      sectionsHtml += `
        <div style="font-size: 14px; font-weight: 800; color: #D6001C; ${
          isRtl ? 'border-right: 4px solid #D6001C; padding-right: 10px;' : 'border-left: 4px solid #D6001C; padding-left: 10px;'
        } margin-bottom: 12px; letter-spacing: normal;">
          ${sec.heading}
        </div>
      `;
    }

    if (sec.text) {
      sectionsHtml += `
        <p style="font-size: 12px; color: #334155; line-height: 1.7; margin: 0 0 12px 0; letter-spacing: normal;">
          ${sec.text}
        </p>
      `;
    }

    if (sec.keyValues && sec.keyValues.length > 0) {
      sectionsHtml += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">`;
      sec.keyValues.forEach((kv) => {
        sectionsHtml += `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: normal;">${kv.label}</span>
            <span style="font-size: 12px; font-weight: 800; color: #0f172a; font-family: sans-serif; letter-spacing: normal;">${kv.value}</span>
          </div>
        `;
      });
      sectionsHtml += `</div>`;
    }

    if (sec.table) {
      sectionsHtml += `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; direction: ${
          isRtl ? 'rtl' : 'ltr'
        };">
          <thead>
            <tr style="background: #0f172a; color: white;">
              ${sec.table.headers
                .map(
                  (h) =>
                    `<th style="padding: 10px 12px; text-align: ${
                      isRtl ? 'right' : 'left'
                    }; font-weight: 700; letter-spacing: normal;">${h}</th>`
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${sec.table.rows
              .map(
                (row, rowIndex) => `
              <tr style="background: ${rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                ${row
                  .map(
                    (cell) =>
                      `<td style="padding: 9px 12px; color: #1e293b; font-weight: 500; text-align: ${
                        isRtl ? 'right' : 'left'
                      }; letter-spacing: normal;">${cell}</td>`
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    sectionsHtml += `</div>`;
  });

  // 5. Footer Signature Banner
  const footerHtml = `
    <div style="margin-top: 36px; border-top: 2px solid #e2e8f0; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 600; direction: ${
      isRtl ? 'rtl' : 'ltr'
    };">
      <div>${footerConfidential}</div>
      <div>${pageLabel}</div>
    </div>
  `;

  container.innerHTML = headerHtml + titleHtml + sectionsHtml + footerHtml;
  document.body.appendChild(container);

  try {
    // 6. Wait for layout rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 7. Render crisp high-DPI canvas
    const canvas = await html2canvas(container, {
      scale: 2, // 2x density for crisp text & graphics
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const safeFilename = options.filename || 'ircs_report.pdf';
    pdf.save(safeFilename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
