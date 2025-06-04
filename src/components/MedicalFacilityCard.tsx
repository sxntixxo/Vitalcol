import React, { useState } from 'react';
import { MapPin, Heart } from 'lucide-react';

interface MedicalFacilityCardProps {
  name: string;
  type: string;
  address: string;
  location: { lat: number; lng: number };
  distance?: string;
  photoUrl?: string;
}

const MedicalFacilityCard: React.FC<MedicalFacilityCardProps> = ({
  name,
  type,
  address,
  location,
  distance,
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
    <div className="relative w-full h-[280px] perspective-1000" onClick={handleFlip}>
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
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
          </div>
        </div>

        {/* Back side */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg overflow-hidden rotate-y-180">
          <div className="p-6 space-y-4">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalFacilityCard;