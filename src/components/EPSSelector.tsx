import { useState } from 'react';

const epsList = [
  { name: 'Salud Total EPS S.A.', logo: '/assets/logos/salud_total_eps.jpg' },
  { name: 'EPS Sanitas', logo: '/assets/logos/eps_sanitas.jpg' },
  { name: 'EPS Sura', logo: '/assets/logos/eps_sura.jpg' },
  { name: 'Famisanar EPS', logo: '/assets/logos/famisanar_eps.jpg' },
  { name: 'Compensar EPS', logo: '/assets/logos/compensar_eps.jpg' },
  { name: 'Nueva EPS', logo: '/assets/logos/nueva_eps.jpg' },
  { name: 'Aliansalud EPS', logo: '/assets/logos/aliansalud_eps.jpg' },
  { name: 'Servicio Occidental de Salud (S.O.S.)', logo: '/assets/logos/sos_eps.jpg' },
  { name: 'Comfenalco Valle EPS', logo: '/assets/logos/comfenalco_valle_eps.jpg' },
  { name: 'Coosalud EPS-S', logo: '/assets/logos/coosalud_eps.jpg' },
  { name: 'Mutual Ser EPS', logo: '/assets/logos/mutual_ser_eps.jpg' },
  { name: 'Capital Salud EPS', logo: '/assets/logos/capital_salud_eps.jpg' },
  { name: 'Savia Salud EPS', logo: '/assets/logos/savia_salud_eps.jpg' },
  { name: 'EPS Familiar de Colombia', logo: '/assets/logos/eps_familiar_colombia.jpg' },
  { name: 'Asmet Salud', logo: '/assets/logos/asmet_salud.jpg' },
  { name: 'Emssanar E.S.S.', logo: '/assets/logos/emssanar_eps.jpg' },
  { name: 'Comfachocó EPS', logo: '/assets/logos/comfachoco_eps.jpg' },
  { name: 'Dusakawi EPS', logo: '/assets/logos/dusakawi_eps.jpg' },
  { name: 'Salud Bolívar EPS SAS', logo: '/assets/logos/salud_bolivar_eps.jpg' },
  { name: 'Pijaos Salud EPSI', logo: '/assets/logos/pijaos_salud_eps.jpg' },
  { name: 'AIC EPSI (Asociación Indígena del Cauca)', logo: '/assets/logos/aic_eps.jpg' }
];

const EPSSelector = ({ onSelect }: { onSelect: (eps: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEPS = epsList.filter((eps) =>
    eps.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="eps-selector">
      <input
        type="text"
        placeholder="Buscar EPS..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input border rounded px-4 py-2 mb-4 w-full"
      />
      <div className="eps-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredEPS.map((eps) => (
          <div
            key={eps.name}
            className="eps-item border rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-100 w-full h-24" // Ajuste para uniformar tamaño
            onClick={() => onSelect(eps.name)}
          >
            <img
              src={eps.logo}
              alt={eps.name}
              className="eps-logo w-16 h-16 mr-4 object-contain"
            />
            <span className="eps-name font-medium">{eps.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EPSSelector;
