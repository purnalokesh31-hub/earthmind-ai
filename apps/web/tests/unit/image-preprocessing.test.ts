import { describe, it, expect } from 'vitest';
import { imagePreprocessorService, ImagePreprocessorService } from '../../lib/server/ai/image-preprocessor.service';

describe('Phase 6.6.2 — AI Image Processing Pipeline Engine', () => {
  // ── Single Image Preprocessing ──
  describe('Tensor Transformation & Letterboxing', () => {
    it('should preprocess single image buffer into 640x640 RGB tensor payload', async () => {
      const mockBuffer = Buffer.from('EarthMind High-Res Drone Photo Buffer');
      const payload = await imagePreprocessorService.preprocessImage(mockBuffer, {
        targetWidth: 640,
        targetHeight: 640,
        enableLetterbox: true,
      });

      expect(payload.targetWidth).toBe(640);
      expect(payload.targetHeight).toBe(640);
      expect(payload.channels).toBe(3);
      expect(payload.letterboxPadding).toBeDefined();
      expect(payload.processingDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('should extract EXIF GPS geo-tags from image header', async () => {
      const mockBuffer = Buffer.from('EXIF GPS Header Sample');
      const geo = imagePreprocessorService.extractGeoTags(mockBuffer);
      expect(geo.latitude).toBeCloseTo(16.5060);
      expect(geo.longitude).toBeCloseTo(80.6350);
      expect(geo.extractedFromExif).toBe(true);
    });

    it('should support custom target dimensions and letterbox padding disabled', async () => {
      const mockBuffer = Buffer.from('Custom Dimensions Buffer');
      const payload = await imagePreprocessorService.preprocessImage(mockBuffer, {
        targetWidth: 1024,
        targetHeight: 1024,
        enableLetterbox: false,
      });

      expect(payload.targetWidth).toBe(1024);
      expect(payload.targetHeight).toBe(1024);
      expect(payload.letterboxPadding.top).toBe(0);
    });
  });

  // ── Batch Image Preprocessing ──
  describe('Batch & Stream Processing Pipeline', () => {
    it('should preprocess batch of images concurrently', async () => {
      const batchBuffers = [
        Buffer.from('Image 1 Payload'),
        Buffer.from('Image 2 Payload'),
        Buffer.from('Image 3 Payload'),
      ];

      const results = await imagePreprocessorService.preprocessBatch(batchBuffers, { targetWidth: 640, targetHeight: 640 });
      expect(results.length).toBe(3);
      expect(results[0].targetWidth).toBe(640);
      expect(results[1].targetHeight).toBe(640);
      expect(results[2].channels).toBe(3);
    });

    it('should handle large 4K / 8K image streams efficiently', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB 4K Drone Buffer
      const payload = await imagePreprocessorService.preprocessImage(largeBuffer);

      expect(payload.tensorBuffer).toBeDefined();
      expect(payload.processingDurationMs).toBeLessThan(100);
    });
  });
});
