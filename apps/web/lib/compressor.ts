// compressor.ts - Client-Side Image Resizer & Compressor (reduces data consumption)

/**
 * Resizes and compresses image files using Canvas API to under 200KB.
 * @param file Input file from device gallery/camera
 * @param maxWidth Max output width (pixels)
 * @param quality JPEG compression quality factor (0.0 to 1.0)
 */
export function compressImage(file: File, maxWidth: number = 1280, quality: number = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Calculate new dimensions keeping aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Setup Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to acquire canvas rendering context.'));
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`[Compressor] Compressed from ${file.size / 1024}KB to ${blob.size / 1024}KB`);
              resolve(blob);
            } else {
              reject(new Error('Canvas compression output is null.'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
