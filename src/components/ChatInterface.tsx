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
import { generateMedicalRecommendation, generateConversationalResponse } from '../utils/openRouterAI';

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai' as const, content: 'Hola, soy tu asistente de salud. Para brindarte el mejor servicio posible, ¿me permites acceder a tu ubicación actual?\n\nEsto me permitirá recomendarte centros médicos cercanos y adecuados para tus necesidades.' }
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
  const [selectedEPS, setSelectedEPS] = useState<string | null>(null);
  const [showEPSSelector, setShowEPSSelector] = useState(false);
  const [showEPSFacilities, setShowEPSFacilities] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  const addAIResponse = async (content: string, delay: number = 1000, useAI: boolean = false, context: string = '') => {
    setIsAITyping(true);
    
    let responseContent = content;
    
    if (useAI) {
      try {
        responseContent = await generateConversationalResponse(content, context, userName);
      } catch (error) {
        console.error('Error generating AI response:', error);
        // Usar el contenido original como fallback
      }
    }
    
    setTimeout(() => {
      setIsAITyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', content: responseContent }]);
    }, delay);
  };

  const addAIResponsesSequentially = async (contents: string[], delay: number = 1000, useAI: boolean = false) => {
    let accumulatedDelay = 0;
    setIsAITyping(true);

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      accumulatedDelay += delay;
      
      let responseContent = content;
      
      if (useAI) {
        try {
          responseContent = await generateConversationalResponse(content, 'conversation', userName);
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      }
      
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'ai', content: responseContent }]);

        if (i === contents.length - 1) {
          setIsAITyping(false);
        }
      }, accumulatedDelay);
    }
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
      await addAIResponse('Por favor, selecciona tu EPS para continuar y ver los centros médicos afiliados.', 1000, true, 'eps_selection');
      return;
    }

    if (stage === 'recommendation') {
      if (reply === 'Sí, mostrar centros médicos') {
        setShowHospitals(true);
        await addAIResponse('Mostrando centros médicos cercanos a tu ubicación.', 1000, true, 'showing_hospitals');
      } else {
        setShowHospitals(false);
        await addAIResponse('Entendido. Si necesitas más ayuda, no dudes en pedírmelo.', 1000, true, 'conversation_end');
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
          await addAIResponse('¡Perfecto! Ahora, para brindarte un asistente más personalizado, ¿cuál es tu nombre?', 1000, true, 'name_request_with_location');
        } catch (error) {
          setUserLocation(null);
          await addAIResponse('Entiendo. Para brindarte un asistente más personalizado, ¿cuál es tu nombre?', 1000, true, 'name_request_without_location');
        }
      } else {
        setUserLocation(null);
        await addAIResponse('Entiendo. Para brindarte un asistente más personalizado, ¿cuál es tu nombre?', 1000, true, 'name_request_without_location');
      }
      setStage('initial');
      return;
    }

    if (reply.toLowerCase().includes('sí') || reply.toLowerCase().includes('mostrar')) {
      setShowHospitals(true);
      await addAIResponse('Aquí tienes algunos centros médicos cercanos:', 1000, true, 'showing_hospitals');
    } else {
      await addAIResponse('Gracias por usar VitalCol. ¡Cuídate y esperamos que te mejores pronto!', 1000, true, 'farewell');
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    addUserMessage(inputValue);
    const currentInput = inputValue;
    
    if (stage === 'initial') {
      setUserName(currentInput);
      setStage('symptoms');
      
      const welcomeMessage = `¡Mucho gusto, ${currentInput}! Ahora que nos conocemos, por favor selecciona tus síntomas principales para poder ayudarte mejor:`;
      await addAIResponse(welcomeMessage, 1000, true, `greeting_with_name, user_name: ${currentInput}`);
      
      setTimeout(() => {
        setIsAITyping(true);
        setTimeout(() => {
          setShowSymptomSelector(true);
          setIsAITyping(false);
        }, 1000);
      }, 1000);
    } else {
      // Respuesta conversacional general usando IA
      await addAIResponse(currentInput, 1000, true, 'general_conversation');
    }
    
    setInputValue('');
  };

  const handleSymptomSubmit = async (symptoms: string[]) => {
    setShowSymptomSelector(false);
    
    const symptomsText = symptoms.join(', ');
    addUserMessage(`Mis síntomas son: ${symptomsText}`);
    
    const { severity: detectedSeverity } = getRecommendation(symptoms);
    setSeverity(detectedSeverity);
    
    // Generar respuesta de gravedad usando IA con el nombre del usuario
    const severityMessage = `${userName}, basado en tus síntomas, tu situación parece ser de gravedad ${
      detectedSeverity === 'mild' ? 'LEVE' : detectedSeverity === 'moderate' ? 'MODERADA' : 'GRAVE'
    }.`;
    
    await addAIResponse(severityMessage, 1000, true, `severity_assessment: ${detectedSeverity}, user_name: ${userName}`);
    
    // Generar recomendación médica usando IA
    setTimeout(async () => {
      try {
        const aiRecommendation = await generateMedicalRecommendation(symptoms, detectedSeverity, userName);
        
        await addAIResponsesSequentially([
          aiRecommendation,
          '¿Te gustaría ver los centros médicos cercanos a tu ubicación?'
        ], 1500);
        
        setStage('recommendation');

        setTimeout(() => {
          setQuickReplies(['Sí, mostrar centros médicos', 'No, gracias']);
          setShowQuickReplies(true);
        }, 3000);
      } catch (error) {
        console.error('Error generating medical recommendation:', error);
        // Fallback a la lógica original
        const { recommendation } = getRecommendation(symptoms);
        await addAIResponsesSequentially([
          recommendation,
          '¿Te gustaría ver los centros médicos cercanos a tu ubicación?'
        ], 1500);
        
        setStage('recommendation');

        setTimeout(() => {
          setQuickReplies(['Sí, mostrar centros médicos', 'No, gracias']);
          setShowQuickReplies(true);
        }, 3000);
      }
    }, 1500);
  };

  const handleEPSSelect = async (selectedEPSName: string) => {
    setSelectedEPS(selectedEPSName);
    setShowEPSSelector(false);
    setShowEPSFacilities(true);
    const personalizedMessage = userName 
      ? `Perfecto, ${userName}. Mostrando centros médicos afiliados a ${selectedEPSName} cerca de tu ubicación.`
      : `Perfecto. Mostrando centros médicos afiliados a ${selectedEPSName} cerca de tu ubicación.`;
    await addAIResponse(personalizedMessage, 1000, true, `eps_selected: ${selectedEPSName}, user_name: ${userName}`);
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
              placeholder={stage === 'initial' ? "Escribe tu nombre..." : "Escribe un mensaje..."}
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