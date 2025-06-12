import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickReplyButtons from './QuickReplyButtons';
import HospitalsSection from './HospitalsSection';
import SymptomSelector from './SymptomSelector';
import AITypingIndicator from './AITypingIndicator';
import EPSSelector from './EPSSelector';
import EPSFacilitiesDisplay from './EPSFacilitiesDisplay';
import { Message, TriageStage, SeverityLevel, UserLocation } from '../api/types';
import { getRecommendation } from '../utils/triageLogic';

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai' as const, content: 'Buenos días. Soy su asistente virtual de salud especializado en orientación médica. Para brindarle recomendaciones precisas y personalizadas sobre centros médicos en su área, requiero acceso a su ubicación geográfica actual.\n\n**Servicios que le proporcionaré:**\n\n• **Hospitales públicos y privados** cercanos a su ubicación\n• **Clínicas especializadas** por área médica\n• **Centros de EPS** afiliados a su entidad de salud\n• **Instituciones Prestadoras de Servicios (IPS)** disponibles\n• **Centros de urgencias** con atención 24/7\n• **Cálculo de distancias** y tiempos de desplazamiento\n• **Información de contacto** y servicios especializados\n• **Rutas optimizadas** para llegar a cada centro médico\n\n**Para continuar, por favor:**\nActive la geolocalización de su dispositivo y autorice el acceso a su ubicación. Esto me permitirá ofrecerle recomendaciones médicas relevantes y centros de atención apropiados para su zona geográfica específica.\n\n¿Autoriza el acceso a su ubicación actual?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<TriageStage>('location_permission');
  const [severity, setSeverity] = useState<SeverityLevel>('mild');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>(['Sí, autorizar acceso', 'No, continuar sin ubicación']);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedEPS, setSelectedEPS] = useState<string | null>(null);
  const [showEPSSelector, setShowEPSSelector] = useState(false);
  const [showEPSFacilities, setShowEPSFacilities] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  const addAIResponse = (content: string, delay: number = 1000) => {
    setIsAITyping(true);
    setTimeout(() => {
      setIsAITyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', content }]);
    }, delay);
  };

  const addAIResponsesSequentially = (contents: string[], delay: number = 1000) => {
    let accumulatedDelay = 0;
    setIsAITyping(true);

    contents.forEach((content, index) => {
      accumulatedDelay += delay;
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'ai', content }]);

        if (index === contents.length - 1) {
          setIsAITyping(false);
        }
      }, accumulatedDelay);
    });
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { sender: 'user', content }]);
  };

  const handleLocationPermission = () => {
    return new Promise<UserLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está disponible en su navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleQuickReply = async (reply: string) => {
    addUserMessage(reply);
    setShowQuickReplies(false);

    if (stage === 'recommendation' && reply === 'Sí, mostrar centros médicos') {
      setShowHospitals(false);
      setStage('eps_selection');
      setShowEPSSelector(true);
      addAIResponse('Excelente. Por favor, seleccione su Entidad Promotora de Salud (EPS) para continuar con la búsqueda de centros médicos afiliados.');
      return;
    }

    if (stage === 'recommendation') {
      if (reply === 'Sí, mostrar centros médicos') {
        setShowHospitals(true);
        addAIResponse('Procesando búsqueda de centros médicos en su área geográfica.');
      } else {
        setShowHospitals(false);
        addAIResponse('Entendido. Quedo a su disposición para cualquier consulta adicional que requiera.');
      }
      setStage('initial');
      return;
    }

    if (stage === 'location_permission') {
      if (reply === 'Sí, autorizar acceso') {
        setIsAITyping(true);
        try {
          const location = await handleLocationPermission();
          setUserLocation(location);
          addAIResponse('Perfecto. Su ubicación ha sido registrada exitosamente. Esto me permitirá proporcionarle recomendaciones médicas precisas y personalizadas. Para continuar, por favor indíqueme su nombre completo.');
        } catch (error) {
          setUserLocation(null);
          addAIResponse('No fue posible acceder a su ubicación en este momento. Continuaremos sin personalización geográfica. Por favor, indíqueme su nombre completo para proceder.');
        }
      } else {
        setUserLocation(null);
        addAIResponse('Entendido. Procederemos sin personalización por ubicación. Las recomendaciones serán de carácter general. Por favor, indíqueme su nombre completo para continuar.');
      }
      setStage('initial');
      return;
    }

    if (reply.toLowerCase().includes('sí') || reply.toLowerCase().includes('mostrar')) {
      setShowHospitals(true);
      addAIResponse('A continuación, encontrará los centros médicos disponibles en su área:');
    } else {
      addAIResponse('Gracias por utilizar VitalCol. Le deseamos una pronta recuperación y quedamos a su disposición para futuras consultas.');
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    addUserMessage(inputValue);
    
    if (stage === 'initial') {
      setStage('symptoms');
      addAIResponsesSequentially([
        `Estimado/a ${inputValue}, es un placer atenderle. Para brindarle una evaluación médica preliminar adecuada, por favor seleccione los síntomas que presenta actualmente:`
      ]);
      setTimeout(() => {
        setIsAITyping(true);
        setTimeout(() => {
          setShowSymptomSelector(true);
          setIsAITyping(false);
        }, 1000);
      }, 1000);
    }
    
    setInputValue('');
  };

  const handleSymptomSubmit = (symptoms: string[]) => {
    setShowSymptomSelector(false);
    
    const symptomsText = symptoms.join(', ');
    addUserMessage(`Los síntomas que presento son: ${symptomsText}`);
    
    const { severity, recommendation } = getRecommendation(symptoms);
    setSeverity(severity);
    
    addAIResponse(`Basándome en la evaluación de sus síntomas, su condición médica se clasifica como de gravedad ${
      severity === 'mild' ? 'LEVE' : severity === 'moderate' ? 'MODERADA' : 'ALTA'
    }.`);
    
    setTimeout(() => {
      addAIResponsesSequentially([
        recommendation,
        '¿Desea que le proporcione información sobre centros médicos cercanos a su ubicación?'
      ]);
      setStage('recommendation');

      setTimeout(() => {
        setQuickReplies(['Sí, mostrar centros médicos', 'No, gracias']);
        setShowQuickReplies(true);
      }, 1000);
    }, 1500);
  };

  const handleEPSSelect = (selectedEPSName: string) => {
    setSelectedEPS(selectedEPSName);
    setShowEPSSelector(false);
    setShowEPSFacilities(true);
    addAIResponse(`Excelente elección. Procesando búsqueda de centros médicos afiliados a ${selectedEPSName} en su área geográfica.`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isAITyping && <AITypingIndicator />}
            {showSymptomSelector && (
              <SymptomSelector onSubmit={handleSymptomSubmit} />
            )}
            {showQuickReplies && (
              <QuickReplyButtons
                replies={quickReplies}
                onReplyClick={handleQuickReply}
              />
            )}
            {showHospitals && <HospitalsSection severity={severity} userLocation={userLocation} />}
            {showEPSSelector && (
              <EPSSelector onSelect={handleEPSSelect} />
            )}
            {showEPSFacilities && selectedEPS && (
              <EPSFacilitiesDisplay 
                selectedEPS={selectedEPS} 
                userLocation={userLocation} 
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escriba su mensaje aquí..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={showQuickReplies || isAITyping}
            />
            <button
              onClick={handleSendMessage}
              className="rounded-full bg-blue-500 p-2.5 text-white transition-colors hover:bg-blue-600"
              aria-label="Enviar mensaje"
              disabled={showQuickReplies || isAITyping}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;