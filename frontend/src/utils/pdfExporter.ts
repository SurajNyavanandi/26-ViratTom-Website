import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { convertColorToRgb, sanitizeOklchString, inlineComputedStyles } from './colorSanitizer';

export interface AnchorLinkPosition {
  href: string;
  relLeft: number;
  relTop: number;
  relWidth: number;
  relHeight: number;
}

export interface RasterizeResult {
  imgData: string;
  anchors: AnchorLinkPosition[];
}

/**
 * Renders an HTML element directly to high-res JPEG via an isolated iframe canvas with 100% computed style fidelity.
 */
export const rasterizePageElement = async (
  sourcePageElement: HTMLElement,
  width = 794,
  height = 1123,
  scale = 1.75
): Promise<RasterizeResult> => {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-99999px';
    iframe.style.top = '0';
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return reject(new Error('Could not access iframe document'));
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000000;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
        </style>
      </head>
      <body></body>
      </html>
    `);
    doc.close();

    const clonedPage = sourcePageElement.cloneNode(true) as HTMLElement;
    clonedPage.style.transform = 'none';
    clonedPage.style.boxShadow = 'none';
    clonedPage.style.margin = '0';
    clonedPage.style.width = `${width}px`;
    clonedPage.style.height = `${height}px`;
    clonedPage.style.maxWidth = `${width}px`;
    clonedPage.style.maxHeight = `${height}px`;
    clonedPage.style.minWidth = `${width}px`;
    clonedPage.style.minHeight = `${height}px`;
    clonedPage.style.boxSizing = 'border-box';
    clonedPage.style.backgroundColor = '#ffffff';

    // Inline all resolved computed styles from live DOM into cloned DOM
    inlineComputedStyles(sourcePageElement, clonedPage);

    // Deep sanitize all elements in clonedPage to remove any modern color remnants
    const allCloned = clonedPage.querySelectorAll<HTMLElement>('*');
    allCloned.forEach((el) => {
      const s = el.getAttribute('style');
      if (s && (s.includes('oklch') || s.includes('lch') || s.includes('lab') || s.includes('color('))) {
        el.setAttribute('style', sanitizeOklchString(s));
      }
      if (el.style) {
        if (el.style.color && el.style.color.includes('oklch')) {
          el.style.color = convertColorToRgb(el.style.color);
        }
        if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
          el.style.backgroundColor = convertColorToRgb(el.style.backgroundColor);
        }
        if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
          el.style.borderColor = convertColorToRgb(el.style.borderColor);
        }
        if (el.style.borderTopColor && el.style.borderTopColor.includes('oklch')) {
          el.style.borderTopColor = convertColorToRgb(el.style.borderTopColor);
        }
        if (el.style.borderBottomColor && el.style.borderBottomColor.includes('oklch')) {
          el.style.borderBottomColor = convertColorToRgb(el.style.borderBottomColor);
        }
      }
    });

    doc.body.appendChild(clonedPage);

    setTimeout(async () => {
      try {
        if (doc.fonts && doc.fonts.ready) {
          try {
            await doc.fonts.ready;
          } catch (fe) {
            console.warn('Font loading await fallback in iframe:', fe);
          }
        }
        await new Promise((r) => setTimeout(r, 100));

        const anchorElements = clonedPage.querySelectorAll<HTMLAnchorElement>('a[href]');
        const pageRect = clonedPage.getBoundingClientRect();
        const anchors: AnchorLinkPosition[] = [];

        anchorElements.forEach((anchor) => {
          const href = anchor.getAttribute('href');
          if (href && href !== '#') {
            const r = anchor.getBoundingClientRect();
            anchors.push({
              href,
              relLeft: r.left - pageRect.left,
              relTop: r.top - pageRect.top,
              relWidth: r.width,
              relHeight: r.height,
            });
          }
        });

        const canvas = await html2canvas(clonedPage, {
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: width,
          height: height,
          windowWidth: width,
          windowHeight: height,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll<HTMLElement>('*');
            elements.forEach((node) => {
              if (node.style) {
                if (node.style.boxShadow && node.style.boxShadow.includes('oklch')) {
                  node.style.boxShadow = 'none';
                }
                if (node.style.color && node.style.color.includes('oklch')) {
                  node.style.color = convertColorToRgb(node.style.color);
                }
                if (node.style.backgroundColor && node.style.backgroundColor.includes('oklch')) {
                  node.style.backgroundColor = convertColorToRgb(node.style.backgroundColor);
                }
                if (node.style.borderColor && node.style.borderColor.includes('oklch')) {
                  node.style.borderColor = convertColorToRgb(node.style.borderColor);
                }
              }
            });
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve({ imgData, anchors });
      } catch (err) {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(err);
      }
    }, 60);
  });
};

/**
 * Generates an A4 PDF from a collection of page DOM elements and downloads it.
 */
export const exportResumePdf = async (
  pageElements: NodeListOf<HTMLElement> | HTMLElement[],
  candidateName: string
) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    const originalPage = pageElements[i];
    const { imgData, anchors } = await rasterizePageElement(originalPage, 794, 1123, 1.75);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Standard A4: 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    // Extract all link positions and embed clickable annotations into the PDF
    anchors.forEach(({ href, relLeft, relTop, relWidth, relHeight }) => {
      if (relWidth > 0 && relHeight > 0) {
        const x_mm = (relLeft / 794) * 210;
        const y_mm = (relTop / 1123) * 297;
        const w_mm = (relWidth / 794) * 210;
        const h_mm = (relHeight / 1123) * 297;

        let formattedUrl = href.trim();
        if (
          !formattedUrl.startsWith('http://') &&
          !formattedUrl.startsWith('https://') &&
          !formattedUrl.startsWith('mailto:') &&
          !formattedUrl.startsWith('tel:')
        ) {
          formattedUrl = `https://${formattedUrl}`;
        }

        pdf.link(x_mm, y_mm, w_mm, h_mm, { url: formattedUrl });
      }
    });
  }

  const safeName = (candidateName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${safeName}_Resume.pdf`);
};
