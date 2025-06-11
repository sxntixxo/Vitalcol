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
import { fetchChatGPTRecommendation } from '../utils/chatGPT';

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai' as const, content: 'Hola, soy tu asistente de salud. Para brindarte recomendaciones precisas de centros médicos cercanos:\n\n1. ¿Me permites acceder a tu ubicación actual?\n\nUna vez autorizada, te proporcionaré:\n- Hospitales cercanos (públicos y privados)\n- Clínicas especializadas\n- Centros de EPS\n- IPS disponibles\n- Centros de urgencias 24/7\n- Distancia aproximada desde tu ubicación\n- Información de contacto y servicios principales\n- Rutas sugeridas para llegar\n\nPor favor, activa tu GPS y autoriza el acceso a tu ubicación para poder ayudarte con recomendaciones personalizadas y relevantes para tu zona.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<TriageStage>('location_permission');
  const [severity, setSeverity] = useState<SeverityLevel>('mild');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>(['Sí, permitir acceso', 'No, gracias']);
  const [showHospitals, setShowHospitals] = useState(false);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedEPS, setSelectedEPS] = useState<{ id: string; name: string; logo: string } | null>(null);

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
    setIsAITyping(true); // Start typing animation

    contents.forEach((content, index) => {
      accumulatedDelay += delay;
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'ai', content }]);

        // Stop typing animation after the last message
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
        reject(new Error('Geolocation is not supported by your browser'));
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

    if (stage === 'recommendation' && reply === 'Sí, mostrar hospitales') {
      setShowHospitals(false); // Ensure hospitals are hidden
      setStage('eps_selection'); // Transition to EPS selection stage
      addAIResponse('Por favor, selecciona tu EPS para continuar y ver los centros médicos afiliados cercanos a tu ubicación.');
      return;
    }

    if (stage === 'recommendation') {
      if (reply === 'Sí, mostrar hospitales') {
        setShowHospitals(true);
        addAIResponse('Mostrando hospitales cercanos a tu ubicación.');
      } else {
        setShowHospitals(false);
        addAIResponse('Entendido. Si necesitas más ayuda, no dudes en pedírmelo.');
      }
      setStage('initial');
      return;
    }

    if (stage === 'location_permission') {
      if (reply === 'Sí, permitir acceso') {
        setIsAITyping(true);
        try {
          const location = await handleLocationPermission();
          setUserLocation(location);
          addAIResponse('Gracias por permitir el acceso a tu ubicación. Esto me ayudará a proporcionarte recomendaciones más precisas. ¿Cuál es tu nombre?');
        } catch (error) {
          setUserLocation(null); // Asegurarse de que userLocation sea null
          addAIResponse('No pude acceder a tu ubicación. Las recomendaciones no estarán personalizadas por ubicación. ¿Cuál es tu nombre?');
        }
      } else {
        // Establecer explícitamente userLocation como null cuando el usuario niega el permiso
        setUserLocation(null);
        addAIResponse('Entiendo. Las recomendaciones no estarán personalizadas por ubicación. ¿Cuál es tu nombre?');
      }
      setStage('initial');
      return;
    }

    if (reply.toLowerCase().includes('sí') || reply.toLowerCase().includes('mostrar')) {
      setShowHospitals(true);
      addAIResponse('Aquí tienes algunos hospitales cercanos:');
    } else {
      addAIResponse('Gracias por usar VitalCol. ¡Cuídate y esperamos que te mejores pronto!');
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    addUserMessage(inputValue);
    
    if (stage === 'initial') {
      setStage('symptoms');
      addAIResponsesSequentially([
        `Gracias ${inputValue}. Por favor, selecciona tus síntomas principales:`
      ]);
      setTimeout(() => {
        setIsAITyping(true); // Show typing animation
        setTimeout(() => {
          setShowSymptomSelector(true);
          setIsAITyping(false); // Hide typing animation
        }, 1000); // Delay for symptom selector
      }, 1000); // Ensure message appears first
    }
    
    setInputValue('');
  };

  const handleSymptomSubmit = async (symptoms: string[]) => {
    setShowSymptomSelector(false);
    
    const symptomsText = symptoms.join(', ');
    addUserMessage(`Mis síntomas son: ${symptomsText}`);
    
    // Get severity for hospital section
    const { severity } = getRecommendation(symptoms);
    setSeverity(severity);
    
    // Create prompt for AI recommendation
    const prompt = `Como asistente médico virtual, proporciona una recomendación médica profesional y empática para un paciente que presenta los siguientes síntomas: ${symptomsText}. 

La recomendación debe:
- Ser clara y comprensible
- Incluir medidas inmediatas que puede tomar
- Indicar si necesita atención médica urgente, programada o puede manejarse en casa
- Ser empática pero profesional
- No exceder 150 palabras

Responde únicamente con la recomendación médica, sin introducción ni explicaciones adicionales.`;

    try {
      setIsAITyping(true);
      
      // Get AI recommendation
      const aiRecommendation = await fetchChatGPTRecommendation(prompt);
      
      setIsAITyping(false);
      
      // Add AI recommendation and follow-up question
      setTimeout(() => {
        addAIResponsesSequentially([
          aiRecommendation,
          '¿Te gustaría ver los hospitales cercanos a tu ubicación?'
        ]);
        setStage('recommendation');

        setTimeout(() => {
          setQuickReplies(['Sí, mostrar hospitales', 'No, gracias']);
          setShowQuickReplies(true);
        }, 2000);
      }, 500);
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      
      // Fallback to original logic if AI fails
      const { recommendation } = getRecommendation(symptoms);
      
      setIsAITyping(false);
      
      setTimeout(() => {
        addAIResponsesSequentially([
          recommendation,
          '¿Te gustaría ver los hospitales cercanos a tu ubicación?'
        ]);
        setStage('recommendation');

        setTimeout(() => {
          setQuickReplies(['Sí, mostrar hospitales', 'No, gracias']);
          setShowQuickReplies(true);
        }, 2000);
      }, 500);
    }
  };

  const handleEPSSelect = (selectedEPSData: { id: string; name: string; logo: string }) => {
    console.log(`Selected EPS:`, selectedEPSData);
    setSelectedEPS(selectedEPSData);
    setStage('display_eps_facilities');
    addAIResponse(`Perfecto. Buscando centros médicos afiliados a ${selectedEPSData.name} cerca de tu ubicación...`);
  };

  const handleAIResponse = async (userMessage: string) => {
    const aiResponse = await fetchChatGPTRecommendation(userMessage);
    setMessages((prevMessages) => [...prevMessages, { sender: 'ai', content: aiResponse }]);
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
            {stage === 'eps_selection' && (
              <EPSSelector onSelect={handleEPSSelect} />
            )}
            {stage === 'display_eps_facilities' && selectedEPS && userLocation && (
              <EPSFacilitiesDisplay
                selectedEPS={selectedEPS}
                userLocation={userLocation}
                severity={severity}
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
              placeholder="Escribe un mensaje..."
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