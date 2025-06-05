import { useState } from 'react';

const epsList = [
  { name: 'Salud Total EPS S.A.', logo: '/assets/logos/salud_total_eps.png' },
  { name: 'EPS Sanitas', logo: '/assets/logos/eps_sanitas.png' },
  { name: 'EPS Sura', logo: '/assets/logos/eps_sura.png' },
  { name: 'Famisanar EPS', logo: '/assets/logos/famisanar_eps.png' },
  { name: 'Compensar EPS', logo: '/assets/logos/compensar_eps.png' },
  { name: 'Nueva EPS', logo: '/assets/logos/nueva_eps.png' },
  { name: 'Aliansalud EPS', logo: '/assets/logos/aliansalud_eps.png' },
  { name: 'Servicio Occidental de Salud (S.O.S.)', logo: '/assets/logos/sos_eps.png' },
  { name: 'Comfenalco Valle EPS', logo: '/assets/logos/comfenalco_valle_eps.png' },
  { name: 'Coosalud EPS-S', logo: '/assets/logos/coosalud_eps.png' },
  { name: 'Mutual Ser EPS', logo: '/assets/logos/mutual_ser_eps.png' },
  { name: 'Capital Salud EPS', logo: '/assets/logos/capital_salud_eps.png' },
  { name: 'Savia Salud EPS', logo: '/assets/logos/savia_salud_eps.png' },
  { name: 'EPS Familiar de Colombia', logo: '/assets/logos/eps_familiar_colombia.png' },
  { name: 'Asmet Salud', logo: '/assets/logos/asmet_salud.png' },
  { name: 'Emssanar E.S.S.', logo: '/assets/logos/emssanar_eps.png' },
  { name: 'Comfachocó EPS', logo: '/assets/logos/comfachoco_eps.png' },
  { name: 'Dusakawi EPS', logo: '/assets/logos/dusakawi_eps.png' },
  { name: 'Salud Bolívar EPS SAS', logo: '/assets/logos/salud_bolivar_eps.png' },
  { name: 'Pijaos Salud EPSI', logo: '/assets/logos/pijaos_salud_eps.png' },
  { name: 'AIC EPSI (Asociación Indígena del Cauca)', logo: '/assets/logos/aic_eps.png' }
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
            className="eps-item border rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(eps.name)}
          >
            <img
              src={eps.logo}
              alt={eps.name}
              className="eps-logo w-12 h-12 mr-4"
            />
            <span className="eps-name font-medium">{eps.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EPSSelector;
