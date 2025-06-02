import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Header from './Header';
import QuickReplyButtons from './QuickReplyButtons';
import HospitalsSection from './HospitalsSection';
import SymptomSelector from './SymptomSelector';
import AITypingIndicator from './AITypingIndicator';
import { Message, TriageStage, SeverityLevel, UserLocation } from '../types';
import { getInitialMessages, getRecommendation } from '../utils/triageLogic';

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState<TriageStage>('location_permission');
  const [userName, setUserName] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel>('mild');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>(['Sí, permitir acceso', 'No, gracias']);
  const [assessment, setAssessment] = useState<{ severity: SeverityLevel; recommendation: string }>({
    severity: 'mild',
    recommendation: '',
  });
  const [showHospitals, setShowHospitals] = useState(false);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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

    if (stage === 'location_permission') {
      if (reply === 'Sí, permitir acceso') {
        setIsAITyping(true);
        try {
          const location = await handleLocationPermission();
          setUserLocation(location);
          addAIResponse('Gracias por permitir el acceso a tu ubicación. Esto me ayudará a proporcionarte recomendaciones más precisas. ¿Cuál es tu nombre?');
        } catch (error) {
          addAIResponse('No pude acceder a tu ubicación. Las recomendaciones no estarán personalizadas por ubicación. ¿Cuál es tu nombre?');
        }
      } else {
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
      setUserName(inputValue);
      setStage('symptoms');
      addAIResponse(`Gracias ${inputValue}. Por favor, selecciona tus síntomas principales:`);
      setShowSymptomSelector(true);
    }
    
    setInputValue('');
  };

  const handleSymptomSubmit = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
    setShowSymptomSelector(false);
    
    const symptomsText = symptoms.join(', ');
    addUserMessage(`Mis síntomas son: ${symptomsText}`);
    
    const { severity, recommendation } = getRecommendation(symptoms);
    setAssessment({ severity, recommendation });
    setSeverity(severity);
    
    addAIResponse(`Basado en tus síntomas, tu situación parece ser de gravedad ${
      severity === 'mild' ? 'LEVE' : severity === 'moderate' ? 'MODERADA' : 'GRAVE'
    }.`);
    
    setTimeout(() => {
      addAIResponse(recommendation);
      setStage('recommendation');
      
      setTimeout(() => {
        addAIResponse('¿Te gustaría ver los hospitales cercanos a tu ubicación?');
        setQuickReplies(['Sí, mostrar hospitales', 'No, gracias']);
        setShowQuickReplies(true);
      }, 1500);
    }, 1500);
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