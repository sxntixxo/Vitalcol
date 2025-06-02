import React, { useState } from 'react';
import { MapPin, Phone, Clock, Heart } from 'lucide-react';

interface MedicalFacilityCardProps {
  name: string;
  type: string;
  address: string;
  location: { lat: number; lng: number };
  distance?: string;
  schedule?: string;
  phone?: string;
  services?: string[];
  photoUrl?: string;
}

const MedicalFacilityCard: React.FC<MedicalFacilityCardProps> = ({
  name,
  type,
  address,
  location,
  distance,
  schedule,
  phone,
  services,
  photoUrl
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getPlaceholderImage = () => {
    switch (type) {
      case 'Hospital':
        return 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg';
      case 'Clínica':
        return 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg';
      case 'EPS':
        return 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg';
      case 'IPS':
        return 'https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg';
      default:
        return 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg';
    }
  };

  return (
    <div 
      className="relative w-full h-[280px] perspective-1000"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front side */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-[140px] bg-gray-100">
            <img
              src={!imageError && photoUrl ? photoUrl : getPlaceholderImage()}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <Heart className="absolute top-4 right-4 w-6 h-6 text-blue-500 fill-current" />
            {schedule === '24/7' && (
              <span className="absolute top-4 left-4 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                24/7
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
                <p className="text-blue-600 text-sm">{type}</p>
              </div>
              {distance && (
                <span className="text-sm text-gray-600">
                  {distance}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{address}</span>
            </div>
          </div>
        </div>

        {/* Back side */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg overflow-hidden rotate-y-180">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {schedule && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{schedule}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{phone}</span>
                </div>
              )}
            </div>

            {services && services.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Servicios disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Cómo llegar
              </a>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Llamar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalFacilityCard;