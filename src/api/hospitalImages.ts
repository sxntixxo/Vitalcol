import { Router, Request, Response } from 'express';
import sharp from 'sharp';
import { HospitalImageSchema, type HospitalImage, type ErrorResponse } from './types';

const router = Router();
const imageCache = new Map<number, HospitalImage>();
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

router.get('/:id/image', async (req: Request, res: Response) => {
  try {
    const hospitalId = parseInt(req.params.id);

    const cachedImage = imageCache.get(hospitalId);
    if (cachedImage) {
      res.set({
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"${hospitalId}"`,
      });
      return res.json(cachedImage);
    }

    const hospitalImage: HospitalImage = {
      hospitalId,
      name: `Hospital ${hospitalId}`,
      imageUrl: `https://api.example.com/hospitals/${hospitalId}/image.jpg`,
      imageAlt: `Imagen del Hospital ${hospitalId}`,
    };

    const validatedImage = HospitalImageSchema.parse(hospitalImage);

    try {
      const imageResponse = await fetch(validatedImage.imageUrl);
      const contentType = imageResponse.headers.get('content-type');
      const contentLength = parseInt(imageResponse.headers.get('content-length') || '0');

      if (!contentType?.startsWith('image/') || 
          !SUPPORTED_FORMATS.some(format => contentType.includes(format))) {
        throw new Error('Unsupported image format');
      }

      if (contentLength > MAX_FILE_SIZE) {
        throw new Error('Image file size too large');
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      await sharp(Buffer.from(imageBuffer))
        .resize(800, 600, { fit: 'inside' })
        .toBuffer();

    } catch (error) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid image',
        code: 'INVALID_IMAGE',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      return res.status(400).json(errorResponse);
    }

    imageCache.set(hospitalId, validatedImage);

    res.set({
      'Cache-Control': 'public, max-age=3600',
      'ETag': `"${hospitalId}"`,
    });

    return res.json(validatedImage);

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch hospital image',
      code: 'FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(errorResponse);
  }
});

router.get('/images', async (req: Request, res: Response) => {
  try {
    const ids = req.query.ids?.toString().split(',').map(Number) || [];

    if (!ids.length) {
      return res.status(400).json({
        error: 'No hospital IDs provided',
        code: 'MISSING_IDS',
      });
    }

    const images = await Promise.all(
      ids.map(async (id) => {
        try {
          const cachedImage = imageCache.get(id);
          if (cachedImage) return cachedImage;

          const hospitalImage: HospitalImage = {
            hospitalId: id,
            name: `Hospital ${id}`,
            imageUrl: `https://api.example.com/hospitals/${id}/image.jpg`,
            imageAlt: `Imagen del Hospital ${id}`,
          };

          if (!/hospital|clinica|eps|ips/i.test(hospitalImage.name)) {
            return null;
          }

          return HospitalImageSchema.parse(hospitalImage);
        } catch (error) {
          return null;
        }
      })
    );

    const validImages = images.filter((image): image is HospitalImage => image !== null);

    validImages.forEach(image => {
      imageCache.set(image.hospitalId, image);
    });

    res.set({
      'Cache-Control': 'public, max-age=3600',
      'ETag': `"${ids.join('-')}"`,
    });

    return res.json(validImages);

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch hospital images',
      code: 'FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(errorResponse);
  }
});

export default router;