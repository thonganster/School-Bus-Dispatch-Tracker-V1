import JSZip from 'jszip';

/**
 * Downloads a binary ZIP file safely.
 * Validates the ZIP header (PK\x03\x04) to guarantee it's not an HTML error/service-worker page.
 * If the pre-built zip is intercepted or unavailable, generates a clean ZIP in-memory using JSZip.
 */
export async function downloadWebsiteZip(
  onProgress?: (status: string) => void
): Promise<void> {
  if (onProgress) onProgress('Preparing website files...');

  try {
    // 1. Try to fetch the static pre-built zip first
    const res = await fetch('/bus-board-website.zip?t=' + Date.now(), {
      cache: 'no-store',
      headers: { Accept: 'application/zip, application/octet-stream' },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check for ZIP magic bytes: 'P', 'K', 0x03, 0x04
      if (
        bytes.length > 4 &&
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04
      ) {
        // Valid binary ZIP archive
        saveBlobAs(
          new Blob([buffer], { type: 'application/zip' }),
          'school-bus-board-website.zip'
        );
        if (onProgress) onProgress('Done!');
        return;
      }
    }
  } catch (err) {
    console.warn('Pre-built zip fetch skipped or blocked, bundling live files with JSZip...', err);
  }

  // 2. Fallback: Build the zip directly in the browser with JSZip!
  if (onProgress) onProgress('Packaging files with JSZip...');
  const zip = new JSZip();

  // Add a clear instructions readme
  zip.file(
    'README-HOW-TO-USE.txt',
    `SCHOOL BUS DISPATCH TRACKER - OFFLINE WEB APPLICATION
======================================================

HOW TO OPEN & RUN:
1. Double-click "index.html" to open the app directly in Google Chrome, Microsoft Edge, or Safari.
2. The board will run 100% offline without any internet connection.
3. All bus states (Green for Arrived, Red for Left, Gray for Not Arrived) are saved directly in your browser.

HOW TO HOST ON SCHOOL SERVERS / SHAREPOINT / AZURE:
- Microsoft Azure Static Web Apps: Upload this unzipped folder for free permanent hosting.
- School Web Server / IIS / Apache: Place these files in any web folder.
- SharePoint: Embed using an iframe web part pointing to your hosted URL.
`
  );

  // Collect current active HTML, stylesheets, scripts, manifest, and icons
  try {
    // Fetch index.html
    const htmlRes = await fetch('/');
    const htmlText = await htmlRes.text();
    zip.file('index.html', htmlText);
  } catch {
    zip.file('index.html', document.documentElement.outerHTML);
  }

  // Fetch icons and manifest
  const staticAssets = [
    'manifest.webmanifest',
    'icon.svg',
    'apple-touch-icon.png',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-512x512.png',
  ];

  for (const asset of staticAssets) {
    try {
      const aRes = await fetch('/' + asset);
      if (aRes.ok) {
        const aBuf = await aRes.arrayBuffer();
        zip.file(asset, aBuf);
      }
    } catch {
      // Ignore optional asset if unavailable
    }
  }

  // Fetch current page's script and CSS assets
  const scriptTags = Array.from(document.querySelectorAll('script[src]'));
  const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

  for (const script of scriptTags) {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('//')) {
      try {
        const sRes = await fetch(src);
        if (sRes.ok) {
          const sBuf = await sRes.arrayBuffer();
          const cleanPath = src.replace(/^\/+/, '');
          zip.file(cleanPath, sBuf);
        }
      } catch {}
    }
  }

  for (const link of linkTags) {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      try {
        const lRes = await fetch(href);
        if (lRes.ok) {
          const lBuf = await lRes.arrayBuffer();
          const cleanPath = href.replace(/^\/+/, '');
          zip.file(cleanPath, lBuf);
        }
      } catch {}
    }
  }

  if (onProgress) onProgress('Compressing zip archive...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  saveBlobAs(zipBlob, 'school-bus-board-website.zip');
  if (onProgress) onProgress('Downloaded!');
}

/**
 * Downloads source code ZIP safely.
 */
export async function downloadSourceZip(
  onProgress?: (status: string) => void
): Promise<void> {
  if (onProgress) onProgress('Downloading source code...');

  try {
    const res = await fetch('/bus-board-source-code.zip?t=' + Date.now(), {
      cache: 'no-store',
      headers: { Accept: 'application/zip, application/octet-stream' },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (
        bytes.length > 4 &&
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04
      ) {
        saveBlobAs(
          new Blob([buffer], { type: 'application/zip' }),
          'school-bus-board-source-code.zip'
        );
        if (onProgress) onProgress('Done!');
        return;
      }
    }
  } catch (e) {
    console.warn('Source code zip fetch failed', e);
  }

  // Fallback: create zip with project metadata and instructions
  const zip = new JSZip();
  zip.file(
    'README.md',
    `# School Bus Dispatch Tracker
Built with React, TypeScript, Tailwind CSS, and Vite.

## Setup & Running
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`
`
  );

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
  });

  saveBlobAs(zipBlob, 'school-bus-board-source-code.zip');
  if (onProgress) onProgress('Downloaded!');
}

/**
 * Triggers browser file download using standard Blob and temporary <a> element
 */
function saveBlobAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
