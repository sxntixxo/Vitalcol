import { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';

interface EPS {
  id: string;
  name: string;
  logo_url: string;
}

interface EPSResponse {
  eps: EPS[];
  total: number;
}

interface EPSSelectorProps {
  onSelect: (eps: { id: string; name: string; logo: string }) => void;
}

const EPSSelector: React.FC<EPSSelectorProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de EPS desde la API
  useEffect(() => {
    const fetchEPS = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/eps');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data: EPSResponse = await response.json();
        setEpsList(data.eps);
      } catch (err) {
        console.error('Error fetching EPS list:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las EPS');
        
        // Fallback a datos estáticos si la API falla
        setEpsList([
          { id: '1', name: 'Salud Total EPS S.A.', logo_url: '/assets/logos/salud_total_eps.jpg' },
          { id: '2', name: 'EPS Sanitas', logo_url: '/assets/logos/eps_sanitas.jpg' },
          { id: '3', name: 'EPS Sura', logo_url: '/assets/logos/eps_sura.jpg' },
          { id: '4', name: 'Famisanar EPS', logo_url: '/assets/logos/famisanar_eps.jpg' },
          { id: '5', name: 'Compensar EPS', logo_url: '/assets/logos/compensar_eps.jpg' },
          { id: '6', name: 'Nueva EPS', logo_url: '/assets/logos/nueva_eps.jpg' },
          { id: '7', name: 'Aliansalud EPS', logo_url: '/assets/logos/aliansalud_eps.jpg' },
          { id: '8', name: 'Servicio Occidental de Salud (S.O.S.)', logo_url: '/assets/logos/sos_eps.jpg' },
          { id: '9', name: 'Comfenalco Valle EPS', logo_url: '/assets/logos/comfenalco_valle_eps.jpg' },
          { id: '10', name: 'Coosalud EPS-S', logo_url: '/assets/logos/coosalud_eps.jpg' },
          { id: '11', name: 'Mutual Ser EPS', logo_url: '/assets/logos/mutual_ser_eps.jpg' },
          { id: '12', name: 'Capital Salud EPS', logo_url: '/assets/logos/capital_salud_eps.jpg' },
          { id: '13', name: 'Savia Salud EPS', logo_url: '/assets/logos/savia_salud_eps.jpg' },
          { id: '14', name: 'EPS Familiar de Colombia', logo_url: '/assets/logos/eps_familiar_colombia.jpg' },
          { id: '15', name: 'Asmet Salud', logo_url: '/assets/logos/asmet_salud.jpg' },
          { id: '16', name: 'Emssanar E.S.S.', logo_url: '/assets/logos/emssanar_eps.jpg' },
          { id: '17', name: 'Comfachocó EPS', logo_url: '/assets/logos/comfachoco_eps.jpg' },
          { id: '18', name: 'Dusakawi EPS', logo_url: '/assets/logos/dusakawi_eps.jpg' },
          { id: '19', name: 'Salud Bolívar EPS SAS', logo_url: '/assets/logos/salud_bolivar_eps.jpg' },
          { id: '20', name: 'Pijaos Salud EPSI', logo_url: '/assets/logos/pijaos_salud_eps.jpg' },
          { id: '21', name: 'AIC EPSI (Asociación Indígena del Cauca)', logo_url: '/assets/logos/aic_eps.jpg' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEPS();
  }, []);

  // Filtrar EPS según el término de búsqueda
  const filteredEPS = epsList.filter((eps) =>
    eps.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEPSSelect = (eps: EPS) => {
    onSelect({
      id: eps.id,
      name: eps.name,
      logo: eps.logo_url
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando EPS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <Building2 className="text-blue-500 mr-2 h-6 w-6" />
        <h3 className="text-lg font-semibold text-gray-900">
          Selecciona tu EPS
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            {error}. Mostrando lista de respaldo.
          </p>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar tu EPS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Lista de EPS */}
      <div className="max-h-96 overflow-y-auto">
        {filteredEPS.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No se encontraron EPS que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredEPS.map((eps) => (
              <button
                key={eps.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                onClick={() => handleEPSSelect(eps)}
              >
                <div className="flex-shrink-0 w-12 h-12 mr-4">
                  <img
                    src={eps.logo_url}
                    alt={`Logo de ${eps.name}`}
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {eps.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Selecciona tu EPS para ver los centros médicos afiliados cercanos a tu ubicación
        </p>
      </div>
    </div>
  );
};

export default EPSSelector;