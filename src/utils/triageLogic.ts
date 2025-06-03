import { SeverityLevel } from '../types';

export const getInitialMessages = () => {
  return [
    { 
      sender: 'ai', 
      content: 'Hola, soy tu asistente de salud. Para brindarte recomendaciones precisas de centros médicos cercanos:\n\n1. ¿Me permites acceder a tu ubicación actual?\n\nUna vez autorizada, te proporcionaré:\n- Hospitales cercanos (públicos y privados)\n- Clínicas especializadas\n- Centros de EPS\n- IPS disponibles\n- Centros de urgencias 24/7\n- Distancia aproximada desde tu ubicación\n- Información de contacto y servicios principales\n- Rutas sugeridas para llegar\n\nPor favor, activa tu GPS y autoriza el acceso a tu ubicación para poder ayudarte con recomendaciones personalizadas y relevantes para tu zona.'
    }
  ];
};

export const getSymptomQuestions = () => {
  return '¿Presentas algún otro síntoma que quieras mencionar?';
};

export const analyzeSeverity = (symptoms: string[]): SeverityLevel => {
  const severeSymptoms = [
    'dificultad para respirar', 
    'dolor en el pecho', 
    'desvanecimiento',
    'desmayo',
    'confusión',
    'pérdida de conciencia',
    'convulsión'
  ];

  const moderateSymptoms = [
    'fiebre alta', 
    'vómito persistente', 
    'deshidratación', 
    'dolor intenso', 
    'dolor fuerte'
  ];

  // Convertir síntomas a minúsculas para comparación
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  // Verificar síntomas graves usando coincidencias exactas o patrones más específicos
  for (const symptom of lowerSymptoms) {
    if (severeSymptoms.some(s => 
      symptom === s || 
      symptom.includes(s) && !symptom.includes("no " + s) && !symptom.includes("sin " + s)
    )) {
      return 'severe';
    }
  }

  // Verificar síntomas moderados
  for (const symptom of lowerSymptoms) {
    if (moderateSymptoms.some(s => 
      symptom === s || 
      symptom.includes(s) && !symptom.includes("no " + s) && !symptom.includes("sin " + s)
    )) {
      return 'moderate';
    }
  }

  return 'mild';
};

export const getRecommendation = (symptoms: string[]) => {
  const severity = analyzeSeverity(symptoms);
  
  let recommendation = '';
  
  if (severity === 'mild') {
    recommendation = 'Te recomiendo descansar, mantenerte hidratado y tomar medicamentos de venta libre según sea necesario. Monitorea tus síntomas y si empeoran, consulta con un médico.';
  } else if (severity === 'moderate') {
    recommendation = 'Te recomiendo programar una consulta por telemedicina lo antes posible. Un profesional médico podrá evaluar mejor tu situación y darte un diagnóstico más preciso.';
  } else {
    recommendation = 'Debes buscar atención médica inmediata. Te recomiendo acudir al hospital o centro de urgencias más cercano. Tus síntomas requieren evaluación profesional sin demora.';
  }
  
  return { severity, recommendation };
};