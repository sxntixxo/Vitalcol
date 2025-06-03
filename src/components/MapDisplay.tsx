import React, { useEffect, useRef } from 'react';

interface MapDisplayProps {
  hospitals: Array<{
    name: string;
    address: string;
    location: { lat: number; lng: number };
    type: string;
    distance?: string;
    rating?: number;
  }>;
  center: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  isGoogleMapsLoaded: boolean;
  onMapMove: (newCenter: { lat: number; lng: number }) => void; // Prop para manejar movimiento del mapa
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  hospitals,
  center,
  userLocation,
  isGoogleMapsLoaded,
  onMapMove // Desestructurar prop
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    console.log('Initializing map with center:', center);
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi.medical",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "poi.business",
          elementType: "labels",
          stylers: [{ visibility: "simplified" }]
        }
      ]
    });
  }, [isGoogleMapsLoaded, center]);

  // Update markers when hospitals or user location changes
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current) return;

    console.log('Updating markers, hospitals count:', hospitals.length);
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const map = mapInstanceRef.current;

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: "Tu ubicación",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        zIndex: 1000, // Ensure user marker is on top
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium text-blue-600">Tu ubicación</h3>
            <p class="text-sm text-gray-600">Aquí te encuentras</p>
          </div>
        `
      });

      userMarker.addListener("click", () => {
        userInfoWindow.open(map, userMarker);
      });

      markersRef.current.push(userMarker);
      bounds.extend(userLocation);
    }

    // Add hospital markers
    hospitals.forEach((hospital, index) => {
      console.log('Adding marker for:', hospital.name, hospital.type);

      const markerIcon = {
        url: getMarkerIcon(hospital.type),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32), // Center the icon properly
      };

      const marker = new google.maps.Marker({
        position: hospital.location,
        map,
        title: hospital.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
        zIndex: 100 - index, // Higher priority for closer hospitals
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-lg mb-1">${hospital.name}</h3>
            <div class="flex items-center mb-2">
              <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(hospital.type)}">${hospital.type}</span>
              ${hospital.rating ? `<span class="ml-2 text-sm text-yellow-600">★ ${hospital.rating}</span>` : ''}
            </div>
            <p class="text-sm text-gray-600 mb-2">${hospital.address}</p>
            ${hospital.distance ? `<p class="text-sm font-medium text-blue-600">📍 ${hospital.distance}</p>` : ''}
          </div>
        `
      });

      marker.addListener("click", () => {
        // Close all other info windows
        markersRef.current.forEach(m => {
          if (m !== marker && (m as any).infoWindow) {
            (m as any).infoWindow.close();
          }
        });
        infoWindow.open(map, marker);
      });

      // Store info window reference for later use
      (marker as any).infoWindow = infoWindow;

      markersRef.current.push(marker);
      bounds.extend(hospital.location);
    });

    // Adjust map view to show all markers
    if (markersRef.current.length > 1) {
      // Add padding to bounds
      const paddingOptions = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      };
      
      map.fitBounds(bounds, paddingOptions);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    } else if (markersRef.current.length === 1) {
      // If only user marker, center on user location
      map.setCenter(userLocation || center);
      map.setZoom(14);
    }

  }, [hospitals, userLocation, isGoogleMapsLoaded]);

  // Escuchar eventos de movimiento del mapa y actualizar resultados
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const handleIdle = () => {
      const center = map.getCenter();
      if (center) {
        const newCenter = { lat: center.lat(), lng: center.lng() };
        onMapMove(newCenter); // Llamar a la función para actualizar resultados
      }
    };

    map.addListener('idle', handleIdle);

    return () => {
      google.maps.event.clearListeners(map, 'idle');
    };
  }, [isGoogleMapsLoaded, onMapMove]);

  // Mejorar la lógica de asignación de tipos
  const getMarkerIcon = (type: string): string => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';

    switch (type.toLowerCase()) {
      case 'hospital':
        return `${baseUrl}red-dot.png`;
      case 'clínica':
      case 'clinica':
        return `${baseUrl}pink-dot.png`;
      case 'eps':
        return `${baseUrl}blue-dot.png`;
      case 'ips':
        return `${baseUrl}green-dot.png`;
      case 'centro de salud':
        return `${baseUrl}yellow-dot.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  };

  // Optimizar el cálculo de distancia
  const calculateDistance = (from: { lat: number; lng: number }, to: { lat: number; lng: number }): string => {
    if (!window.google?.maps?.geometry?.spherical) {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (to.lat - from.lat) * Math.PI / 180;
      const dLon = (to.lng - from.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return `${distance.toFixed(1)} km`;
    }

    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(from.lat, from.lng),
      new window.google.maps.LatLng(to.lat, to.lng)
    );

    return `${(distance / 1000).toFixed(1)} km`;
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'bg-red-100 text-red-800';
      case 'clínica':
      case 'clinica':
        return 'bg-pink-100 text-pink-800';
      case 'eps':
        return 'bg-blue-100 text-blue-800';
      case 'ips':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isGoogleMapsLoaded) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg shadow-inner"
      />
      
      {hospitals.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
          <div className="font-medium mb-2">Leyenda:</div>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Hospitales</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-pink-500 rounded-full mr-2"></div>
              <span>Clínicas</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>EPS</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>IPS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;