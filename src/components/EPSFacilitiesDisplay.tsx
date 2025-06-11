import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Star, AlertCircle } from 'lucide-react';
import { UserLocation } from '../api/types';

interface EPSFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clínica' | 'IPS' | 'Centro de Salud';
  address: string;
  location: { lat: number; lng: number };
  phone?: string;
  schedule?: string;
  services: string[];
  distance?: string;
  rating?: number;
  partnership_type: 'direct' | 'network' | 'preferred';
}

interface EPSFacilitiesDisplayProps {
  selectedEPS: string;
  userLocation: UserLocation | null;
}

const EPSFacilitiesDisplay: React.FC<EPSFacilitiesDisplayProps> = ({
  selectedEPS,
  userLocation,
}) => {
  const [facilities, setFacilities] = useState<EPSFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEPS) {
      fetchEPSFacilities();
    }
  }, [selectedEPS, userLocation]);

  const fetchEPSFacilities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured. Using mock data.');
        setFacilities(getMockFacilities());
        setIsLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        eps_name: selectedEPS,
      });

      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', '10'); // 10km radius
      }

      const response = await fetch(`/api/eps-facilities?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFacilities(data.facilities || []);
    } catch (error) {
      console.error('Error fetching EPS facilities:', error);
      setError('No se pudieron cargar los centros médicos. Mostrando datos de ejemplo.');
      setFacilities(getMockFacilities());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockFacilities = (): EPSFacility[] => {
    return [
      {
        id: '1',
        name: 'Hospital San Juan de Dios',
        type: 'Hospital',
        address: 'Carrera 10 #15-20, Bogotá',
        location: { lat: 4.6097, lng: -74.0817 },
        phone: '+57 1 234-5678',
        schedule: 'Lun-Dom: 24 horas',
        services: ['Urgencias', 'Hospitalización', 'Cirugía', 'UCI'],
        distance: '2.3 km',
        rating: 4.2,
        partnership_type: 'direct',
      },
      {
        id: '2',
        name: 'Clínica del Country',
        type: 'Clínica',
        address: 'Carrera 16 #82-57, Bogotá',
        location: { lat: 4.6482, lng: -74.0648 },
        phone: '+57 1 345-6789',
        schedule: 'Lun-Vie: 6:00-20:00, Sáb: 8:00-16:00',
        services: ['Consulta Externa', 'Especialidades', 'Laboratorio'],
        distance: '5.1 km',
        rating: 4.5,
        partnership_type: 'network',
      },
      {
        id: '3',
        name: 'IPS Salud Total',
        type: 'IPS',
        address: 'Calle 26 #13-47, Bogotá',
        location: { lat: 4.6126, lng: -74.0705 },
        phone: '+57 1 456-7890',
        schedule: 'Lun-Vie: 7:00-19:00, Sáb: 8:00-14:00',
        services: ['Medicina General', 'Odontología', 'Fisioterapia'],
        distance: '1.8 km',
        rating: 4.0,
        partnership_type: 'preferred',
      },
    ];
  };

  const getPartnershipBadge = (type: string) => {
    const badges = {
      direct: { text: 'Directo', color: 'bg-green-100 text-green-800' },
      network: { text: 'Red', color: 'bg-blue-100 text-blue-800' },
      preferred: { text: 'Preferente', color: 'bg-purple-100 text-purple-800' },
    };
    return badges[type as keyof typeof badges] || badges.network;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando centros médicos afiliados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="text-yellow-500 mr-2 h-5 w-5" />
          <div>
            <p className="text-yellow-700 font-medium">Información limitada</p>
            <p className="text-yellow-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">
          Centros médicos afiliados a {selectedEPS}
        </h3>
        <span className="text-sm text-gray-500">
          {facilities.length} centros encontrados
        </span>
      </div>

      {facilities.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron centros médicos
          </h3>
          <p className="text-gray-600">
            No hay centros médicos afiliados a {selectedEPS} en tu área.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                  <p className="text-sm text-blue-600">{facility.type}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {facility.distance && (
                    <span className="text-xs text-gray-500">{facility.distance}</span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getPartnershipBadge(facility.partnership_type).color
                    }`}
                  >
                    {getPartnershipBadge(facility.partnership_type).text}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{facility.address}</span>
                </div>

                {facility.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{facility.phone}</span>
                  </div>
                )}

                {facility.schedule && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{facility.schedule}</span>
                  </div>
                )}

                {facility.rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500" />
                    <span>{facility.rating}/5.0</span>
                  </div>
                )}
              </div>

              {facility.services.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Servicios:</p>
                  <div className="flex flex-wrap gap-1">
                    {facility.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                    {facility.services.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{facility.services.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facility.location.lat},${facility.location.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-500 text-white text-center py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors block"
                >
                  Cómo llegar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EPSFacilitiesDisplay;