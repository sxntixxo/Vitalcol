interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export const generateAIResponse = async (
  userMessage: string, 
  context: string = '',
  options: AIRequestOptions = {}
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenRouter API key not found. Using fallback responses.');
      return getFallbackResponse(userMessage, context);
    }

    const {
      temperature = 0.7,
      maxTokens = 300,
      model = 'openai/gpt-4-turbo-preview' // ChatGPT-4.1 en OpenRouter
    } = options;

    const systemPrompt = `Eres un asistente médico virtual especializado en triaje y orientación médica en Colombia. 

INSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español
- Sé empático, profesional y conciso
- Proporciona información médica general, NO diagnósticos específicos
- Recomienda consultar profesionales médicos cuando sea apropiado
- Mantén un tono cálido pero profesional
- Si no tienes información suficiente, recomienda consultar un médico
- Enfócate en orientación y primeros auxilios básicos
- Usa el nombre del usuario cuando esté disponible para personalizar la experiencia

CONTEXTO: ${context}

Responde de manera útil y profesional.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'VitalCol - Asistente Médico'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    const aiResponse = data.choices[0].message.content.trim();
    
    if (!aiResponse) {
      throw new Error('Empty response from OpenRouter API');
    }

    return aiResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return getFallbackResponse(userMessage, context);
  }
};

// Respuestas de respaldo cuando la API no está disponible
const getFallbackResponse = (userMessage: string, context: string): string => {
  const message = userMessage.toLowerCase();
  
  // Respuestas contextuales basadas en el contexto
  if (context.includes('symptoms') || context.includes('síntomas')) {
    if (message.includes('fiebre') || message.includes('temperatura')) {
      return 'Para la fiebre, es importante mantenerse hidratado, descansar y monitorear la temperatura. Si supera los 38.5°C o persiste por más de 3 días, te recomiendo consultar con un médico.';
    }
    
    if (message.includes('dolor de cabeza') || message.includes('cefalea')) {
      return 'Para el dolor de cabeza, intenta descansar en un lugar tranquilo y oscuro, mantente hidratado y evita el estrés. Si el dolor es intenso o frecuente, es recomendable consultar con un profesional de la salud.';
    }
    
    if (message.includes('tos') || message.includes('gripe')) {
      return 'Para la tos y síntomas gripales, es importante descansar, mantenerse hidratado y evitar cambios bruscos de temperatura. Si los síntomas persisten o empeoran, consulta con un médico.';
    }
    
    if (message.includes('dolor abdominal') || message.includes('estómago')) {
      return 'Para el dolor abdominal, evita alimentos irritantes, mantente hidratado y descansa. Si el dolor es intenso, persistente o se acompaña de fiebre, busca atención médica.';
    }
    
    if (message.includes('dificultad para respirar') || message.includes('respirar')) {
      return 'La dificultad para respirar puede ser seria. Te recomiendo buscar atención médica inmediata. Mientras tanto, mantente calmado y en posición erguida.';
    }
  }
  
  // Respuestas generales
  if (context.includes('greeting') || context.includes('saludo')) {
    return 'Hola, estoy aquí para ayudarte con orientación médica general. ¿En qué puedo asistirte hoy?';
  }
  
  if (context.includes('location') || context.includes('ubicación')) {
    return 'Perfecto. Con tu ubicación podré recomendarte centros médicos cercanos y adecuados para tus necesidades.';
  }
  
  // Respuesta por defecto
  return 'Entiendo tu consulta. Te recomiendo mantener un estilo de vida saludable y consultar con un profesional médico para una evaluación más detallada de tu situación.';
};

// Función específica para generar recomendaciones médicas
export const generateMedicalRecommendation = async (
  symptoms: string[],
  severity: 'mild' | 'moderate' | 'severe',
  userName?: string
): Promise<string> => {
  const symptomsText = symptoms.join(', ');
  const severityText = severity === 'mild' ? 'leve' : severity === 'moderate' ? 'moderada' : 'grave';
  
  const context = `symptoms, severity: ${severityText}, user_name: ${userName || 'usuario'}`;
  const userGreeting = userName ? `${userName}, ` : '';
  
  const prompt = `${userGreeting}presentas los siguientes síntomas: ${symptomsText}. 
  
La gravedad estimada es ${severityText}. 

Por favor, proporciona una recomendación médica general apropiada, incluyendo:
1. Cuidados inmediatos recomendados
2. Cuándo buscar atención médica
3. Medidas preventivas si aplica

Mantén la respuesta concisa pero informativa y personalizada.`;

  return await generateAIResponse(prompt, context, {
    temperature: 0.6,
    maxTokens: 250,
    model: 'openai/gpt-4-turbo-preview'
  });
};

// Función para respuestas conversacionales generales
export const generateConversationalResponse = async (
  userMessage: string,
  conversationContext: string = '',
  userName?: string
): Promise<string> => {
  const context = userName ? `${conversationContext}, user_name: ${userName}` : conversationContext;
  
  return await generateAIResponse(userMessage, context, {
    temperature: 0.8,
    maxTokens: 200,
    model: 'openai/gpt-4-turbo-preview'
  });
};