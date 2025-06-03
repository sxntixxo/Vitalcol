import React, { useEffect, useRef, useState } from 'react';

interface MapDisplayProps {
  hospitals: Array<{
    id: string;
    name: string;
    type: 'EPS' | 'IPS' | 'Hospital' | 'Clínica' | 'Centro de Salud';
    location: { lat: number; lng: number };
  }>;
  userLocation: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  isGoogleMapsLoaded: boolean;
  onMapMove?: (center: { lat: number; lng: number }) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  hospitals,
  userLocation,
  center,
  isGoogleMapsLoaded,
  onMapMove,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  // Colores para los diferentes tipos de centros médicos
  const markerColors = {
    'Hospital': 'red',
    'EPS': 'blue',
    'IPS': 'green',
    'Clínica': 'purple',
    'Centro de Salud': 'orange'
  };

  // Inicializar el mapa cuando la API está cargada
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(center.lat, center.lng),
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;

    // Crear una ventana de información reutilizable
    const infoWindowInstance = new google.maps.InfoWindow();
    setInfoWindow(infoWindowInstance);

    // Agregar listener para detectar movimiento del mapa
    if (onMapMove) {
      map.addListener('idle', () => {
        const newCenter = map.getCenter();
        if (newCenter) {
          onMapMove({
            lat: newCenter.lat(),
            lng: newCenter.lng(),
          });
        }
      });
    }

    // Limpiar al desmontar
    return () => {
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }
      if (infoWindowInstance) {
        infoWindowInstance.close();
      }
    };
  }, [isGoogleMapsLoaded, center.lat, center.lng, onMapMove]);

  // Actualizar marcadores cuando cambian los hospitales
  useEffect(() => {
    if (!googleMapRef.current || !isGoogleMapsLoaded) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Crear marcadores para cada centro médico
    hospitals.forEach(hospital => {
      // Determinar el color del marcador según el tipo
      const markerColor = markerColors[hospital.type] || 'gray';
      
      // Crear un SVG personalizado para el marcador
      const svgMarker = {
        path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
        fillColor: markerColor,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        rotation: 0,
        scale: 2,
        anchor: new google.maps.Point(12, 22),
        labelOrigin: new google.maps.Point(12, 9)
      };

      // Crear el marcador
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(hospital.location.lat, hospital.location.lng),
        map: googleMapRef.current,
        title: hospital.name,
        icon: svgMarker,
        animation: google.maps.Animation.DROP,
      });

      // Agregar evento de clic al marcador
      marker.addListener('click', () => {
        if (infoWindow) {
          infoWindow.close();
          
          // Contenido de la ventana de información
          const content = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${hospital.name}</h3>
              <p style="margin: 0 0 4px; font-size: 14px; color: #666;">
                <strong>Tipo:</strong> ${hospital.type}
              </p>
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(googleMapRef.current, marker);
          setSelectedHospital(hospital.id);
        }
      });

      markersRef.current.push(marker);
    });

    // Agregar marcador para la ubicación del usuario
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        map: googleMapRef.current,
        title: 'Tu ubicación',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000, // Asegurar que esté por encima de otros marcadores
      });

      markersRef.current.push(userMarker);
    }

    // Ajustar el zoom para mostrar todos los marcadores si hay más de uno
    if (markersRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      googleMapRef.current.fitBounds(bounds);
      
      // Limitar el zoom máximo
      const listener = google.maps.event.addListener(googleMapRef.current, 'idle', () => {
        if (googleMapRef.current!.getZoom()! > 16) {
          googleMapRef.current!.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [hospitals, userLocation, isGoogleMapsLoaded, infoWindow]);

  // Actualizar el centro del mapa cuando cambia
  useEffect(() => {
    if (googleMapRef.current && center) {
      googleMapRef.current.setCenter(new google.maps.LatLng(center.lat, center.lng));
    }
  }, [center]);

  // Si la API de Google Maps no está cargada, mostrar un mensaje
  if (!isGoogleMapsLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center h-64 flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-lg"></div>
      
      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md text-sm">
        <h4 className="font-medium mb-1">Leyenda</h4>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(markerColors).map(([type, color]) => (
            <div key={type} className="flex items-center">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: color }}
              ></span>
              <span>{type}</span>
            </div>
          ))}
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-2 bg-blue-500 border border-white"></span>
            <span>Tu ubicación</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;

