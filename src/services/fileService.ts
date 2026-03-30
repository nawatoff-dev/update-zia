import { get, set, del } from 'idb-keyval';

export type ExportCategory = 'journal' | 'analysis' | 'performance';

const BASE_DIR_KEY = 'zZIA_base_dir_handle';

export async function getBaseDirectory() {
  const handle = await get(BASE_DIR_KEY);
  if (!handle) return null;

  try {
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') return handle;
    return null;
  } catch (e) {
    await del(BASE_DIR_KEY);
    return null;
  }
}

export async function setBaseDirectory() {
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.');
    return null;
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'zZIA_export_root',
      mode: 'readwrite'
    });
    await set(BASE_DIR_KEY, handle);
    return handle;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error selecting directory:', err);
    }
    return null;
  }
}

export async function resetBaseDirectory() {
  await del(BASE_DIR_KEY);
}

export async function savePdf(blob: Blob, filename: string, _category: ExportCategory) {
  const isIframe = window.self !== window.top;

  // Use File System Access API if not in an iframe
  if (!isIframe) {
    try {
      // 1. Check if a base directory is configured
      const baseHandle = await getBaseDirectory();
      if (baseHandle) {
        // Request permission if needed (though getBaseDirectory already checks)
        const fileHandle = await baseHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }

      // 2. Fallback to manual Save File Picker if no base directory is set
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }
    } catch (err) {
      // User cancelled or other error
      if ((err as Error).name === 'AbortError') return;
      console.error('File System Error:', err);
    }
  }

  // Fallback to standard download if API not supported, user cancels, or running in an iframe
  // In an iframe, this is the only reliable way to save a file.
  // TIP: Users can enable "Ask where to save each file before downloading" in their browser 
  // settings to get a "Save As" dialog even with this fallback.
  downloadFallback(blob, filename);

  if (isIframe) {
    console.info('Note: The "Save As" dialog is restricted by the browser when running inside a preview iframe. The file has been sent to your Downloads folder. To use the manual "Save As" feature, please open the application in a new tab.');
  }
}

function downloadFallback(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
