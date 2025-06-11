import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Search, Filter, Building2, Phone, Clock } from 'lucide-react';
import MapDisplay from './MapDisplay';
import MedicalFacilityCard from './MedicalFacilityCard';

interface EPSFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'IPS' | 'Clínica' | 'Centro de Salud' | 'EPS';
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  schedule?: string;
  services?: string[];
  photo_url?: string;
  rating?: number;
  distance_km?: number;
}

interface EPSInfo {
  id: string;
  name: string;
}

interface EPSFacilitiesResponse {
  eps: EPSInfo;
  facilities: EPSFacility[];
  total: number;
  message?: string;
}

interface EPSFacilitiesDisplayProps {
  selectedEPS: {
    id: string;
    name: string;
    logo: string;
  };
  userLocation: { lat: number; lng: number };
  severity?: 'mild' | 'moderate' | 'severe';
}

const FACILITY_TYPES = ['Todos', 'Hospital', 'IPS', 'Clínica', 'Centro de Salud'];

const EPSFacilitiesDisplay: React.FC<EPSFacilitiesDisplayProps> = ({
  selectedEPS,
  userLocation,
  severity = 'mild'
}) => {
  const [facilities, setFacilities] = useState<EPSFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<EPSFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [epsInfo, setEpsInfo] = useState<EPSInfo | null>(null);

  // Cargar centros médicos afiliados a la EPS
  useEffect(() => {
    const fetchEPSFacilities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          epsId: selectedEPS.id,
          userLat: userLocation.lat.toString(),
          userLng: userLocation.lng.toString(),
          maxDistance: '50', // 50 km de radio
          limit: '50'
        });

        const response = await fetch(`/api/eps-facilities?${params}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: EPSFacilitiesResponse = await response.json();
        
        setEpsInfo(data.eps);
        setFacilities(data.facilities);
        
        if (data.facilities.length === 0 && data.message) {
          setError(data.message);
        }
      } catch (err) {
        console.error('Error fetching EPS facilities:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar centros médicos');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedEPS.id && userLocation) {
      fetchEPSFacilities();
    }
  }, [selectedEPS.id, userLocation]);

  // Filtrar centros médicos
  useEffect(() => {
    let filtered = [...facilities];

    // Filtrar por tipo
    if (selectedType !== 'Todos') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        facility =>
          facility.name.toLowerCase().includes(query) ||
          facility.address.toLowerCase().includes(query) ||
          facility.type.toLowerCase().includes(query)
      );
    }

    // Ordenar por distancia
    filtered.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

    setFilteredFacilities(filtered);
  }, [facilities, selectedType, searchQuery]);

  // Convertir EPSFacility a formato compatible con MapDisplay
  const mapFacilities = filteredFacilities.map(facility => ({
    id: facility.id,
    name: facility.name,
    type: facility.type,
    location: { lat: facility.latitude, lng: facility.longitude }
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando centros médicos afiliados a {selectedEPS.name}...</p>
        </div>
      </div>
    );
  }

  if (error && facilities.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="text-yellow-500 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-800 font-medium mb-2">
              Centros médicos no encontrados
            </h3>
            <p className="text-yellow-700 text-sm mb-3">{error}</p>
            <p className="text-yellow-600 text-sm">
              Te recomendamos contactar directamente a {selectedEPS.name} para obtener información 
              actualizada sobre centros médicos afiliados en tu zona.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con información de la EPS */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <Building2 className="text-blue-500 mr-3 h-6 w-6" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Centros médicos afiliados a {epsInfo?.name || selectedEPS.name}
            </h3>
            <p className="text-sm text-gray-600">
              {filteredFacilities.length} de {facilities.length} centros encontrados
            </p>
          </div>
        </div>
      </div>

      {/* Alerta para casos severos */}
      {severity === 'severe' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm">
                <strong>Atención urgente requerida:</strong> Debido a la gravedad de tus síntomas, 
                te recomendamos acudir inmediatamente al centro médico más cercano o llamar al 
                <strong> 123</strong> para una ambulancia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filtros por tipo */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          {FACILITY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar centro médico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Mapa */}
      {filteredFacilities.length > 0 && (
        <div className="rounded-lg overflow-hidden shadow-md">
          <MapDisplay
            hospitals={mapFacilities}
            userLocation={userLocation}
            center={userLocation}
            isGoogleMapsLoaded={true}
          />
        </div>
      )}

      {/* Lista de centros médicos */}
      {filteredFacilities.length === 0 && facilities.length > 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros o términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <div key={facility.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <MedicalFacilityCard
                name={facility.name}
                type={facility.type}
                address={facility.address}
                location={{ lat: facility.latitude, lng: facility.longitude }}
                distance={facility.distance_km ? `${facility.distance_km} km` : undefined}
                photoUrl={facility.photo_url}
              />
              
              {/* Información adicional */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                {facility.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a 
                      href={`tel:${facility.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {facility.phone}
                    </a>
                  </div>
                )}
                
                {facility.schedule && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{facility.schedule}</span>
                  </div>
                )}
                
                {facility.services && facility.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {facility.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {facility.services.length > 3 && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{facility.services.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {facilities.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Building2 className="text-blue-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">
                Información importante
              </p>
              <p className="text-blue-700">
                Los centros médicos mostrados tienen convenio con {epsInfo?.name || selectedEPS.name}. 
                Te recomendamos verificar la disponibilidad de servicios y horarios antes de tu visita. 
                Para urgencias, siempre puedes llamar al <strong>123</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPSFacilitiesDisplay;