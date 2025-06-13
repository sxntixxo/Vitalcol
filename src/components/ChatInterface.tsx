import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickReplyButtons from './QuickReplyButtons';
import HospitalsSection from './HospitalsSection';
import AITypingIndicator from './AITypingIndicator';
import EPSSelector from './EPSSelector';
import EPSFacilitiesDisplay from './EPSFacilitiesDisplay';
import { Message, TriageStage, SeverityLevel, UserLocation } from '../api/types';
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
  const [isAITyping, setIsAITyping] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedEPS, setSelectedEPS] = useState<string | null>(null);
  const [showEPSSelector, setShowEPSSelector] = useState(false);
  const [showEPSFacilities, setShowEPSFacilities] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [conversationStage, setConversationStage] = useState<'waiting_name' | 'active_conversation'>('waiting_name');

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

  const detectMedicalSymptoms = (message: string): string[] => {
    const symptoms: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Diccionario de síntomas comunes
    const symptomKeywords = {
      'dolor de cabeza': ['dolor de cabeza', 'cefalea', 'migraña', 'jaqueca'],
      'fiebre': ['fiebre', 'temperatura', 'calentura', 'febril'],
      'tos': ['tos', 'tosiendo', 'toser'],
      'dolor abdominal': ['dolor de estómago', 'dolor abdominal', 'dolor de barriga', 'dolor en el abdomen'],
      'dificultad para respirar': ['dificultad para respirar', 'falta de aire', 'ahogo', 'disnea'],
      'náuseas': ['náuseas', 'ganas de vomitar', 'mareo'],
      'mareos': ['mareos', 'vértigo', 'mareado'],
      'dolor muscular': ['dolor muscular', 'dolor en los músculos', 'mialgia'],
      'fatiga': ['fatiga', 'cansancio', 'agotamiento', 'debilidad'],
      'dolor de garganta': ['dolor de garganta', 'garganta irritada', 'faringitis'],
      'congestión nasal': ['congestión nasal', 'nariz tapada', 'rinitis'],
      'diarrea': ['diarrea', 'deposiciones líquidas'],
      'vómitos': ['vómitos', 'vomitar', 'vómito'],
      'dolor en el pecho': ['dolor en el pecho', 'dolor torácico', 'opresión en el pecho']
    };

    // Buscar síntomas en el mensaje
    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          symptoms.push(symptom);
          break; // Solo agregar el síntoma una vez
        }
      }
    }

    return symptoms;
  };

  const analyzeSeverity = (symptoms: string[], message: string): SeverityLevel => {
    const lowerMessage = message.toLowerCase();
    
    // Palabras que indican gravedad
    const severeIndicators = [
      'intenso', 'fuerte', 'insoportable', 'severo', 'grave', 'agudo',
      'no puedo', 'muy mal', 'terrible', 'horrible', 'desesperante'
    ];
    
    const moderateIndicators = [
      'molesto', 'persistente', 'constante', 'regular', 'moderado'
    ];

    // Síntomas que por sí solos indican gravedad
    const severeSymptoms = [
      'dificultad para respirar',
      'dolor en el pecho'
    ];

    // Verificar síntomas graves
    if (symptoms.some(symptom => severeSymptoms.includes(symptom))) {
      return 'severe';
    }

    // Verificar indicadores de gravedad en el mensaje
    if (severeIndicators.some(indicator => lowerMessage.includes(indicator))) {
      return 'severe';
    }

    if (moderateIndicators.some(indicator => lowerMessage.includes(indicator))) {
      return 'moderate';
    }

    return 'mild';
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
          await addAIResponse('Escribe tu nombre para tener un asistente más personalizado', 1000, false, 'name_request_with_location');
        } catch (error) {
          setUserLocation(null);
          await addAIResponse('Escribe tu nombre para tener un asistente más personalizado', 1000, false, 'name_request_without_location');
        }
      } else {
        setUserLocation(null);
        await addAIResponse('Escribe tu nombre para tener un asistente más personalizado', 1000, false, 'name_request_without_location');
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
    
    if (stage === 'initial' && conversationStage === 'waiting_name') {
      // Usuario está escribiendo su nombre
      setUserName(currentInput);
      setConversationStage('active_conversation');
      
      const welcomeMessage = `Hola ${currentInput}, estoy aquí para ayudarte con orientación médica general. ¿En qué puedo asistirte hoy?`;
      await addAIResponse(welcomeMessage, 1000, false, `greeting_with_name, user_name: ${currentInput}`);
    } else if (conversationStage === 'active_conversation') {
      // Usuario está en conversación activa - detectar síntomas médicos
      const detectedSymptoms = detectMedicalSymptoms(currentInput);
      
      if (detectedSymptoms.length > 0) {
        // Se detectaron síntomas médicos - generar DIRECTAMENTE la recomendación con IA
        const detectedSeverity = analyzeSeverity(detectedSymptoms, currentInput);
        setSeverity(detectedSeverity);
        
        setIsAITyping(true);
        
        try {
          // Generar recomendación médica inteligente usando IA
          const aiRecommendation = await generateMedicalRecommendation(
            detectedSymptoms, 
            detectedSeverity, 
            userName
          );
          
          setTimeout(() => {
            setIsAITyping(false);
            // MOSTRAR DIRECTAMENTE la recomendación de la IA
            setMessages((prev) => [...prev, { sender: 'ai', content: aiRecommendation }]);
            
            // Después de la recomendación, preguntar si quiere ver centros médicos
            setTimeout(() => {
              setMessages((prev) => [...prev, { 
                sender: 'ai', 
                content: '¿Te gustaría que te muestre centros médicos cercanos donde puedas recibir atención?' 
              }]);
              setQuickReplies(['Sí, mostrar centros médicos', 'No, gracias']);
              setShowQuickReplies(true);
              setStage('recommendation');
            }, 1500);
          }, 2000);
          
        } catch (error) {
          console.error('Error generating medical recommendation:', error);
          // Fallback a recomendación básica
          setTimeout(() => {
            setIsAITyping(false);
            const fallbackMessage = `${userName}, basándome en los síntomas que mencionas (${detectedSymptoms.join(', ')}), te recomiendo descansar, mantenerte hidratado y monitorear tus síntomas. Si empeoran o persisten, consulta con un profesional médico.`;
            setMessages((prev) => [...prev, { sender: 'ai', content: fallbackMessage }]);
            
            // Después del fallback, también preguntar por centros médicos
            setTimeout(() => {
              setMessages((prev) => [...prev, { 
                sender: 'ai', 
                content: '¿Te gustaría que te muestre centros médicos cercanos donde puedas recibir atención?' 
              }]);
              setQuickReplies(['Sí, mostrar centros médicos', 'No, gracias']);
              setShowQuickReplies(true);
              setStage('recommendation');
            }, 1500);
          }, 2000);
        }
      } else {
        // No se detectaron síntomas - respuesta conversacional general
        await addAIResponse(currentInput, 1000, true, 'general_conversation');
      }
    }
    
    setInputValue('');
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
              placeholder={
                conversationStage === 'waiting_name' 
                  ? "Escribe tu nombre..." 
                  : "Describe tus síntomas o haz una consulta médica..."
              }
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