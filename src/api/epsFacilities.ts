import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const router = Router();

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Esquemas de validación
const EPSFacilitiesQuerySchema = z.object({
  epsId: z.string().uuid('EPS ID debe ser un UUID válido'),
  userLat: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Latitud inválida'),
  userLng: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Longitud inválida'),
  maxDistance: z.string().optional().transform(val => val ? parseFloat(val) : 50).refine(val => !isNaN(val) && val > 0, 'Distancia máxima inválida'),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20).refine(val => !isNaN(val) && val > 0 && val <= 100, 'Límite inválido')
});

const MedicalFacilitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['Hospital', 'IPS', 'Clínica', 'Centro de Salud', 'EPS']),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  schedule: z.string().nullable(),
  services: z.array(z.string()).nullable(),
  photo_url: z.string().nullable(),
  rating: z.number().nullable(),
  distance_km: z.number().optional()
});

type MedicalFacility = z.infer<typeof MedicalFacilitySchema>;

interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

// Función para calcular distancia usando fórmula haversine
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET /api/eps-facilities - Obtener centros médicos afiliados a una EPS
router.get('/eps-facilities', async (req: Request, res: Response) => {
  try {
    // Validar parámetros de consulta
    const validatedQuery = EPSFacilitiesQuerySchema.parse(req.query);
    const { epsId, userLat, userLng, maxDistance, limit } = validatedQuery;

    // Verificar que la EPS existe
    const { data: epsData, error: epsError } = await supabase
      .from('eps')
      .select('id, name')
      .eq('id', epsId)
      .single();

    if (epsError || !epsData) {
      const errorResponse: ErrorResponse = {
        error: 'EPS no encontrada',
        code: 'EPS_NOT_FOUND',
        details: epsError?.message
      };
      return res.status(404).json(errorResponse);
    }

    // Consultar centros médicos afiliados a la EPS
    const { data: facilitiesData, error: facilitiesError } = await supabase
      .from('medical_facilities')
      .select(`
        id,
        name,
        type,
        address,
        latitude,
        longitude,
        phone,
        schedule,
        services,
        photo_url,
        rating
      `)
      .in('id', 
        supabase
          .from('eps_facility_partnerships')
          .select('facility_id')
          .eq('eps_id', epsId)
      );

    if (facilitiesError) {
      const errorResponse: ErrorResponse = {
        error: 'Error al consultar centros médicos',
        code: 'FACILITIES_QUERY_ERROR',
        details: facilitiesError.message
      };
      return res.status(500).json(errorResponse);
    }

    if (!facilitiesData || facilitiesData.length === 0) {
      return res.json({
        eps: epsData,
        facilities: [],
        total: 0,
        message: 'No se encontraron centros médicos afiliados a esta EPS'
      });
    }

    // Calcular distancias y filtrar por distancia máxima
    const facilitiesWithDistance: (MedicalFacility & { distance_km: number })[] = facilitiesData
      .map(facility => {
        const distance = calculateDistance(userLat, userLng, facility.latitude, facility.longitude);
        return {
          ...facility,
          distance_km: Math.round(distance * 10) / 10 // Redondear a 1 decimal
        };
      })
      .filter(facility => facility.distance_km <= maxDistance)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    // Validar datos antes de enviar
    const validatedFacilities = facilitiesWithDistance.map(facility => {
      try {
        return MedicalFacilitySchema.parse(facility);
      } catch (error) {
        console.warn('Facility validation failed:', error);
        return null;
      }
    }).filter(Boolean) as MedicalFacility[];

    // Configurar headers de cache
    res.set({
      'Cache-Control': 'public, max-age=1800', // 30 minutos
      'ETag': `"${epsId}-${userLat}-${userLng}"`
    });

    return res.json({
      eps: epsData,
      facilities: validatedFacilities,
      total: validatedFacilities.length,
      query: {
        maxDistance,
        userLocation: { lat: userLat, lng: userLng }
      }
    });

  } catch (error) {
    console.error('Error in eps-facilities endpoint:', error);
    
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        error: 'Parámetros de consulta inválidos',
        code: 'INVALID_QUERY_PARAMS',
        details: error.errors
      };
      return res.status(400).json(errorResponse);
    }

    const errorResponse: ErrorResponse = {
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    return res.status(500).json(errorResponse);
  }
});

// GET /api/eps - Obtener lista de todas las EPS
router.get('/eps', async (req: Request, res: Response) => {
  try {
    const { data: epsData, error } = await supabase
      .from('eps')
      .select('id, name, logo_url')
      .order('name');

    if (error) {
      const errorResponse: ErrorResponse = {
        error: 'Error al consultar EPS',
        code: 'EPS_QUERY_ERROR',
        details: error.message
      };
      return res.status(500).json(errorResponse);
    }

    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hora
    });

    return res.json({
      eps: epsData || [],
      total: epsData?.length || 0
    });

  } catch (error) {
    console.error('Error in eps endpoint:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    return res.status(500).json(errorResponse);
  }
});

// GET /api/eps/:id/stats - Obtener estadísticas de una EPS
router.get('/eps/:id/stats', async (req: Request, res: Response) => {
  try {
    const epsId = req.params.id;

    // Validar que sea un UUID válido
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(epsId)) {
      const errorResponse: ErrorResponse = {
        error: 'ID de EPS inválido',
        code: 'INVALID_EPS_ID'
      };
      return res.status(400).json(errorResponse);
    }

    // Verificar que la EPS existe
    const { data: epsData, error: epsError } = await supabase
      .from('eps')
      .select('id, name')
      .eq('id', epsId)
      .single();

    if (epsError || !epsData) {
      const errorResponse: ErrorResponse = {
        error: 'EPS no encontrada',
        code: 'EPS_NOT_FOUND'
      };
      return res.status(404).json(errorResponse);
    }

    // Obtener estadísticas de centros afiliados
    const { data: statsData, error: statsError } = await supabase
      .from('medical_facilities')
      .select('type')
      .in('id', 
        supabase
          .from('eps_facility_partnerships')
          .select('facility_id')
          .eq('eps_id', epsId)
      );

    if (statsError) {
      const errorResponse: ErrorResponse = {
        error: 'Error al consultar estadísticas',
        code: 'STATS_QUERY_ERROR',
        details: statsError.message
      };
      return res.status(500).json(errorResponse);
    }

    // Calcular estadísticas por tipo
    const typeStats = (statsData || []).reduce((acc, facility) => {
      acc[facility.type] = (acc[facility.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.set({
      'Cache-Control': 'public, max-age=1800', // 30 minutos
    });

    return res.json({
      eps: epsData,
      totalFacilities: statsData?.length || 0,
      facilitiesByType: typeStats
    });

  } catch (error) {
    console.error('Error in eps stats endpoint:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    return res.status(500).json(errorResponse);
  }
});

export default router;