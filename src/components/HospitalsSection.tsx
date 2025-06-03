import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Search, Filter } from 'lucide-react';
import MapDisplay from './MapDisplay';
import MedicalFacilityCard from './MedicalFacilityCard';
import { Loader } from '@googlemaps/js-api-loader';

interface MedicalCenter {
  id: string;
  name: string;
  type: 'EPS' | 'IPS' | 'Hospital' | 'Clínica' | 'Centro de Salud';
  address: string;
  location: { lat: number; lng: number };
  distance?: string;
  distanceKm?: number;
  phone?: string;
  schedule?: string;
  services?: string[];
  photoUrl?: string;
  placeId?: string;
  rating?: number;
}

interface HospitalsSectionProps {
  severity: 'mild' | 'moderate' | 'severe';
  userLocation?: { lat: number; lng: number } | null;
}

// Constante para el radio de búsqueda (5 km)
const MAX_DISTANCE_KM = 5;

// Tipos de centros médicos disponibles para filtrar
const FACILITY_TYPES = ['Hospital', 'EPS', 'IPS', 'Clínica', 'Centro de Salud', 'Todos'];

const HospitalsSection: React.FC<HospitalsSectionProps> = ({ severity, userLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<MedicalCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Cargar la API de Google Maps
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        console.log('Google Maps API cargada correctamente');
        setIsGoogleMapsLoaded(true);
      })
      .catch((err) => {
        console.error('Error al cargar la API de Google Maps:', err);
        setError('Error al cargar la API de Google Maps');
      });
  }, []);

  // Iniciar búsqueda cuando se carga la API y hay ubicación
  useEffect(() => {
    if (!isGoogleMapsLoaded) {
      console.log('Esperando la carga de la API de Google Maps');
      return;
    }

    if (!userLocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = { lat: latitude, lng: longitude };
          setMapCenter(userPos);
          searchNearbyMedicalCenters(userPos);
        },
        (error) => {
          console.error('Error obteniendo la ubicación del usuario:', error);
          setError('No se pudo obtener la ubicación del usuario. Mostrando centros médicos en una ubicación predeterminada.');
          // Usar una ubicación predeterminada (centro de Bogotá)
          const defaultLocation = { lat: 4.6097, lng: -74.0817 };
          setMapCenter(defaultLocation);
          searchNearbyMedicalCenters(defaultLocation);
        }
      );
    } else {
      setMapCenter(userLocation);
      searchNearbyMedicalCenters(userLocation);
    }
  }, [isGoogleMapsLoaded, userLocation]);

  // Filtrar centros médicos cuando cambia la selección o la búsqueda
  useEffect(() => {
    if (medicalCenters.length === 0) return;

    let filtered = [...medicalCenters];

    // Aplicar filtro por tipo de centro médico
    if (selectedType !== 'Todos') {
      filtered = filtered.filter(center => center.type === selectedType);
    }

    // Aplicar filtro por texto de búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        center =>
          center.name.toLowerCase().includes(query) ||
          center.address.toLowerCase().includes(query)
      );
    }

    // Ordenar por distancia
    filtered = filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    setFilteredCenters(filtered);
  }, [medicalCenters, selectedType, searchQuery]);

  // Función mejorada para buscar centros médicos cercanos
  const searchNearbyMedicalCenters = async (location: { lat: number; lng: number }, pageToken?: string) => {
    setIsLoading(true);
    setError(null);

    // Limpiar resultados anteriores si no es paginación
    if (!pageToken) {
      setMedicalCenters([]);
    }

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      // Realizar múltiples búsquedas para diferentes tipos de centros médicos
      const searchTypes = [
        { keyword: 'hospital', type: 'Hospital' },
        { keyword: 'eps salud', type: 'EPS' },
        { keyword: 'ips salud', type: 'IPS' },
        { keyword: 'clinica', type: 'Clínica' },
        { keyword: 'centro de salud', type: 'Centro de Salud' }
      ];
      
      let allResults: MedicalCenter[] = [];
      
      // Realizar búsquedas para cada tipo
      for (const searchType of searchTypes) {
        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius: MAX_DISTANCE_KM * 1000,
          type: 'health',
          keyword: searchType.keyword,
          ...(pageToken && { pageToken }),
        };

        try {
          const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
            service.nearbySearch(request, (results, status, pagination) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // Corregido: Guardar el token para la siguiente página si existe
                if (pagination && pagination.hasNextPage) {
                  // Usar el método getNextPage() para obtener más resultados
                  setNextPageToken("next_available");
                }
                resolve(results);
              } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
              } else {
                reject(new Error(`Error en la búsqueda de ${searchType.keyword}: ${status}`));
              }
            });
          });

          // Procesar los resultados de este tipo
          const processedResults = await Promise.all(
            results.map(async (place) => {
              if (!place.geometry?.location) {
                return null;
              }

              const placeLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              const distance = calculateDistance(location, placeLocation);
              const distanceKm = parseFloat(distance.replace(' km', ''));
              
              // Solo incluir lugares dentro del radio especificado
              if (distanceKm > MAX_DISTANCE_KM) {
                return null;
              }

              // Obtener detalles adicionales del lugar
              let phone = '';
              let schedule = '';
              let photoUrl = '';
              
              try {
                const placeDetails = await getPlaceDetails(service, place.place_id!);
                phone = placeDetails.formatted_phone_number || '';
                schedule = placeDetails.opening_hours?.weekday_text?.join(', ') || '';
                photoUrl = placeDetails.photos?.[0]?.getUrl() || '';
              } catch (error) {
                console.warn('No se pudieron obtener detalles adicionales:', error);
              }

              return {
                id: place.place_id || String(Date.now() + Math.random()),
                name: place.name || 'Centro Médico',
                // Determinar el tipo con mayor precisión
                type: determineType(place, searchType.type),
                address: place.vicinity || 'Dirección no disponible',
                location: placeLocation,
                distance,
                distanceKm,
                phone,
                schedule,
                photoUrl,
                placeId: place.place_id,
                rating: place.rating,
                services: [],
              } as MedicalCenter;
            })
          );

          // Filtrar resultados nulos y agregarlos a la lista completa
          allResults = [...allResults, ...processedResults.filter(Boolean) as MedicalCenter[]];
        } catch (error) {
          console.error(`Error en la búsqueda de ${searchType.keyword}:`, error);
          // Continuar con el siguiente tipo a pesar del error
        }
      }

      // Eliminar duplicados basados en placeId
      const uniqueResults = allResults.filter((center, index, self) =>
        index === self.findIndex((c) => c.placeId === center.placeId)
      );

      // Actualizar el estado con los nuevos resultados
      setMedicalCenters(prev => {
        const combined = pageToken ? [...prev, ...uniqueResults] : uniqueResults;
        // Eliminar duplicados nuevamente después de combinar
        return combined.filter((center, index, self) =>
          index === self.findIndex((c) => c.placeId === center.placeId)
        );
      });
    } catch (err) {
      console.error('Error buscando centros médicos:', err);
      setError('Error buscando centros médicos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener detalles adicionales de un lugar
  const getPlaceDetails = (service: google.maps.places.PlacesService, placeId: string): Promise<google.maps.places.PlaceResult> => {
    return new Promise((resolve, reject) => {
      service.getDetails(
        { placeId, fields: ['formatted_phone_number', 'opening_hours', 'photos'] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`No se pudieron obtener detalles: ${status}`));
          }
        }
      );
    });
  };

  // Función mejorada para calcular distancia
  const calculateDistance = (from: { lat: number; lng: number }, to: { lat: number; lng: number }): string => {
    if (!window.google?.maps?.geometry?.spherical) {
      // Fallback usando fórmula haversine
      const R = 6371; // Radio de la Tierra en km
      const dLat = (to.lat - from.lat) * Math.PI / 180;
      const dLon = (to.lng - from.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return `${distance.toFixed(1)} km`;
    }

    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(from.lat, from.lng),
      new window.google.maps.LatLng(to.lat, to.lng)
    );

    return `${(distance / 1000).toFixed(1)} km`;
  };

  // Función mejorada para determinar el tipo de centro médico
  const determineType = (place: google.maps.places.PlaceResult, searchType: string): MedicalCenter['type'] => {
    const name = place.name?.toLowerCase() || '';
    const types = place.types || [];
    const vicinity = place.vicinity?.toLowerCase() || '';
    
    // Sistema de puntuación para determinar el tipo con mayor precisión
    const scores = {
      'Hospital': 0,
      'EPS': 0,
      'IPS': 0,
      'Clínica': 0,
      'Centro de Salud': 0
    };
    
    // Dar puntos iniciales basados en el tipo de búsqueda
    scores[searchType as keyof typeof scores] += 2;
    
    // Puntuar basado en tipos de Google
    if (types.includes('hospital')) scores['Hospital'] += 3;
    if (types.includes('health')) scores['Centro de Salud'] += 1;
    if (types.includes('doctor')) scores['Clínica'] += 1;
    
    // Puntuar basado en el nombre
    if (/\bhospital\b/i.test(name)) scores['Hospital'] += 3;
    if (/\bclínica|\bclinica\b/i.test(name)) scores['Clínica'] += 3;
    if (/\beps\b/i.test(name)) scores['EPS'] += 3;
    if (/\bips\b/i.test(name)) scores['IPS'] += 3;
    if (/\bcentro.*salud\b|\bcentro.*médico|\bcentro.*medico\b/i.test(name)) scores['Centro de Salud'] += 2;
    if (/\bsalud\b/i.test(name)) scores['Centro de Salud'] += 1;
    
    // Puntuar basado en la dirección/vecindad
    if (/\bhospital\b/i.test(vicinity)) scores['Hospital'] += 1;
    if (/\bclínica|\bclinica\b/i.test(vicinity)) scores['Clínica'] += 1;
    if (/\beps\b/i.test(vicinity)) scores['EPS'] += 1;
    if (/\bips\b/i.test(vicinity)) scores['IPS'] += 1;
    if (/\bcentro.*salud\b/i.test(vicinity)) scores['Centro de Salud'] += 1;
    
    // Encontrar el tipo con mayor puntuación
    let maxScore = 0;
    let maxType: MedicalCenter['type'] = 'Centro de Salud'; // Tipo por defecto
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxType = type as MedicalCenter['type'];
      }
    }
    
    return maxType;
  };

  // Manejar cambio en el filtro de tipo
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  // Manejar cambio en el centro del mapa
  const handleMapMove = (newCenter: { lat: number; lng: number }) => {
    // Solo buscar si el centro del mapa está a más de 2.5km del centro actual
    if (mapCenter) {
      const currentDistance = parseFloat(calculateDistance(mapCenter, newCenter).replace(' km', ''));
      if (currentDistance > MAX_DISTANCE_KM / 2) {
        setMapCenter(newCenter);
        searchNearbyMedicalCenters(newCenter);
      }
    }
  };

  // Cargar más resultados
  const loadMoreResults = () => {
    if (nextPageToken && mapCenter) {
      searchNearbyMedicalCenters(mapCenter, nextPageToken);
    }
  };

  // Renderizar componente de carga
  if (isLoading && medicalCenters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Buscando centros médicos cercanos...</span>
      </div>
    );
  }

  // Renderizar componente de error
  if (error && medicalCenters.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
          <div>
            <p className="text-red-600 font-medium">Error al buscar centros médicos</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button 
              onClick={() => mapCenter && searchNearbyMedicalCenters(mapCenter)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-lg font-medium text-gray-800">
          Centros médicos cercanos ({filteredCenters.length} encontrados)
        </h3>
        
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Filtro por tipo de centro médico */}
          <div className="relative">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="h-4 w-4 text-gray-500" />
              {FACILITY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Búsqueda por texto */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar centro médico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Alerta para casos severos */}
      {severity === 'severe' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">
            Debido a la gravedad de tus síntomas, te recomendamos buscar atención médica inmediata. Considera llamar a una ambulancia al <strong>123</strong>.
          </p>
        </div>
      )}

      {/* Mapa con centros médicos */}
      {medicalCenters.length > 0 && mapCenter && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <MapDisplay
            hospitals={filteredCenters}
            userLocation={userLocation || mapCenter}
            center={mapCenter}
            isGoogleMapsLoaded={isGoogleMapsLoaded}
            onMapMove={handleMapMove}
          />
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {filteredCenters.length === 0 && medicalCenters.length > 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron centros médicos que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCenters.map((center) => (
            <MedicalFacilityCard
              key={center.id}
              name={center.name}
              type={center.type}
              address={center.address}
              location={center.location}
              distance={center.distance}
              schedule={center.schedule}
              phone={center.phone}
              services={center.services}
              photoUrl={center.photoUrl}
            />
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay centros médicos */}
      {medicalCenters.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron centros médicos</h3>
          <p className="text-gray-600 mb-4">
            No pudimos encontrar centros médicos en un radio de {MAX_DISTANCE_KM} km de tu ubicación.
          </p>
          <button 
            onClick={() => mapCenter && searchNearbyMedicalCenters(mapCenter)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Buscar de nuevo
          </button>
        </div>
      )}

      {/* Botón para cargar más resultados */}
      {nextPageToken && (
        <div className="text-center">
          <button
            onClick={loadMoreResults}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cargar más resultados
          </button>
        </div>
      )}

      {/* Indicador de carga para paginación */}
      {isLoading && medicalCenters.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando más resultados...</span>
        </div>
      )}
    </div>
  );
};

export default HospitalsSection;

