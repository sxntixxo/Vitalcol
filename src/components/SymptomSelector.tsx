import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface SymptomSelectorProps {
  onSubmit: (symptoms: string[]) => void;
}

const commonSymptoms = [
  'Dolor de cabeza',
  'Fiebre',
  'Tos',
  'Dolor abdominal',
  'Dificultad para respirar',
  'Náuseas',
  'Mareos',
  'Dolor muscular',
  'Fatiga',
  'Dolor de garganta',
  'Congestión nasal',
  'Diarrea',
  'Vómitos',
  'Dolor en el pecho',
];

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ onSubmit }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length > 0) {
      onSubmit(selectedSymptoms);
    }
  };

  const clearSelection = () => {
    setSelectedSymptoms([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Selecciona tus síntomas
        </h3>
        <span className="text-sm text-gray-500">
          {selectedSymptoms.length} seleccionados
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => toggleSymptom(symptom)}
            className={`p-2 rounded-lg text-left text-sm transition-colors ${
              selectedSymptoms.includes(symptom)
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 mr-2 rounded flex items-center justify-center ${
                selectedSymptoms.includes(symptom)
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300'
              }`}>
                {selectedSymptoms.includes(symptom) && <Check size={12} />}
              </div>
              {symptom}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={clearSelection}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
        >
          <X size={16} className="mr-1" />
          Limpiar selección
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedSymptoms.length === 0}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedSymptoms.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar síntomas
        </button>
      </div>
    </div>
  );
};

export default SymptomSelector;