import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, AlertTriangle, Search } from 'lucide-react';
import MapDisplay from './MapDisplay';
import MedicalFacilityCard from './MedicalFacilityCard';
import { Loader } from '@googlemaps/js-api-loader';

interface MedicalCenter {
  id: string;
  name: string;
  type: 'EPS' | 'IPS' | 'Hospital' | 'Clínica';
  address: string;
  location: { lat: number; lng: number };
  distance?: string;
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

const MAX_DISTANCE_KM = 5; // Aumentamos el radio de búsqueda

const HospitalsSection: React.FC<HospitalsSectionProps> = ({ severity, userLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        console.log('Google Maps API loaded successfully');
        setIsGoogleMapsLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading Google Maps API:', err);
        setError('Error loading Google Maps API');
      });
  }, []);

  useEffect(() => {
    if (!isGoogleMapsLoaded || !userLocation) {
      console.log('Waiting for Google Maps API and user location');
      return;
    }

    searchNearbyMedicalCenters();
  }, [isGoogleMapsLoaded, userLocation]);

  const searchNearbyMedicalCenters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const allResults: google.maps.places.PlaceResult[] = [];

      // Búsquedas múltiples con diferentes keywords (sin tipo específico para mayor flexibilidad)
      const searches = [
        { keyword: 'hospital' },
        { keyword: 'clínica' },
        { keyword: 'centro médico' },
        { keyword: 'EPS' },
        { keyword: 'IPS' },
        { keyword: 'centro de salud' },
        { keyword: 'policlínica' },
        { keyword: 'unidad médica' }
      ] as Array<{keyword: string, type?: string}>;

      console.log('Starting searches for medical centers...');

      for (const search of searches) {
        try {
          const request: any = {
            location: new window.google.maps.LatLng(userLocation!.lat, userLocation!.lng),
            radius: 5000, // 5km radius
            keyword: search.keyword,
          };

          // Solo agregar tipo si existe
          if (search.type) {
            request.type = search.type;
          }

          console.log('Searching with:', request);

          const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
              console.log(`Search for ${search.keyword}:`, status, results?.length || 0, 'results');
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]); // No rechazamos, solo devolvemos array vacío
              } else {
                console.warn(`Search failed for ${search.keyword}:`, status);
                resolve([]); // En lugar de rechazar, devolvemos array vacío
              }
            });
          });

          allResults.push(...results);
        } catch (err) {
          console.warn('Individual search failed:', err);
          // Continuamos con las demás búsquedas
        }
      }

      console.log('Total results found:', allResults.length);

      // Si no encontramos resultados con las búsquedas específicas, hacemos una búsqueda general
      if (allResults.length === 0) {
        console.log('No specific results found, trying general search...');
        try {
          const generalRequest = {
            location: new window.google.maps.LatLng(userLocation!.lat, userLocation!.lng),
            radius: 10000, // Expandimos a 10km
            keyword: 'hospital OR clínica OR centro médico OR salud',
          };

          const generalResults = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
            service.nearbySearch(generalRequest, (results, status) => {
              console.log('General search:', status, results?.length || 0, 'results');
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
          });

          allResults.push(...generalResults);
        } catch (err) {
          console.warn('General search failed:', err);
        }
      }

      // Procesar y filtrar resultados
      const processedCenters = allResults
        .filter((place, index, self) => {
          // Eliminar duplicados por place_id
          const isDuplicate = index !== self.findIndex((p) => p.place_id === place.place_id);
          if (isDuplicate) return false;

          // Filtrar lugares irrelevantes
          const name = place.name?.toLowerCase() || '';
          const isRelevant = !/(farmacia|droguería|laboratorio|veterinaria|spa|estética|odontología|óptica)/i.test(name);
          
          // Debe tener ubicación
          const hasLocation = place.geometry?.location;

          console.log('Filtering place:', name, 'isRelevant:', isRelevant, 'hasLocation:', !!hasLocation);

          return isRelevant && hasLocation;
        })
        .map((place) => {
          const location = {
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
          };

          const distance = calculateDistance(userLocation!, location);
          const distanceKm = parseFloat(distance.replace(' km', ''));

          return {
            id: place.place_id || Math.random().toString(),
            name: place.name || 'Centro Médico',
            type: determineType(place),
            address: place.vicinity || place.formatted_address || 'Dirección no disponible',
            location,
            distance,
            distanceKm,
            placeId: place.place_id,
            rating: place.rating,
          };
        })
        .filter(center => center.distanceKm <= MAX_DISTANCE_KM) // Filtrar por distancia
        .sort((a, b) => a.distanceKm - b.distanceKm); // Ordenar por distancia

      console.log('Processed centers:', processedCenters.length);

      if (processedCenters.length === 0) {
        setError('No se encontraron centros médicos cercanos. Intenta expandir el área de búsqueda.');
      } else {
        setMedicalCenters(processedCenters);
        setError(null);
      }

    } catch (err) {
      console.error('Error searching medical centers:', err);
      setError('Error buscando centros médicos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const determineType = (place: google.maps.places.PlaceResult): MedicalCenter['type'] => {
    const name = place.name?.toLowerCase() || '';
    const types = place.types || [];

    // Verificar en types primero
    if (types.includes('hospital')) return 'Hospital';
    
    // Luego verificar en el nombre
    if (/hospital/i.test(name)) return 'Hospital';
    if (/clínica|clinica/i.test(name)) return 'Clínica';
    if (/eps/i.test(name)) return 'EPS';
    if (/ips/i.test(name)) return 'IPS';
    if (/centro.*médico|centro.*medico/i.test(name)) return 'Clínica';

    // Por defecto, si es un lugar de salud
    return 'Clínica';
  };

  const filteredCenters = medicalCenters.filter(
    (center) =>
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Buscando centros médicos cercanos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
          <div>
            <p className="text-red-600 font-medium">Error al buscar centros médicos</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button 
              onClick={() => searchNearbyMedicalCenters()}
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">
          Centros médicos cercanos ({medicalCenters.length} encontrados)
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar centro médico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {severity === 'severe' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">
            Debido a la gravedad de tus síntomas, te recomendamos buscar atención médica inmediata. Considera llamar a una ambulancia al <strong>123</strong>.
          </p>
        </div>
      )}

      {medicalCenters.length > 0 && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <MapDisplay
            hospitals={medicalCenters}
            userLocation={userLocation}
            center={userLocation || { lat: 4.6097, lng: -74.0817 }}
            isGoogleMapsLoaded={isGoogleMapsLoaded}
          />
        </div>
      )}

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

      {medicalCenters.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron centros médicos</h3>
          <p className="text-gray-600 mb-4">
            No pudimos encontrar centros médicos en un radio de {MAX_DISTANCE_KM} km de tu ubicación.
          </p>
          <button 
            onClick={() => searchNearbyMedicalCenters()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Buscar de nuevo
          </button>
        </div>
      )}
    </div>
  );
};

export default HospitalsSection;