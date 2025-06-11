// Mock ChatGPT service for development
export const fetchChatGPTRecommendation = async (userMessage: string): Promise<string> => {
  try {
    // Check if OpenAI API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. Using fallback recommendations.');
      return getFallbackRecommendation(userMessage);
    }

    // If API key is available, make the actual API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente médico que proporciona recomendaciones generales de salud. Responde en español de manera concisa y profesional.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || getFallbackRecommendation(userMessage);
  } catch (error) {
    console.error('Error fetching recommendation from OpenAI:', error);
    return getFallbackRecommendation(userMessage);
  }
};

// Fallback recommendations when OpenAI API is not available
const getFallbackRecommendation = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('fiebre') || message.includes('temperatura')) {
    return 'Para la fiebre, mantente hidratado, descansa y considera tomar acetaminofén según las indicaciones. Si la fiebre persiste por más de 3 días o supera los 39°C, consulta a un médico.';
  }
  
  if (message.includes('dolor de cabeza') || message.includes('cefalea')) {
    return 'Para el dolor de cabeza, descansa en un lugar tranquilo y oscuro, mantente hidratado y considera tomar un analgésico de venta libre. Si el dolor es severo o persistente, consulta a un médico.';
  }
  
  if (message.includes('tos') || message.includes('gripe')) {
    return 'Para la tos y síntomas gripales, descansa, mantente hidratado, usa miel para calmar la garganta y considera un humidificador. Si los síntomas empeoran o persisten, consulta a un médico.';
  }
  
  if (message.includes('dolor abdominal') || message.includes('estómago')) {
    return 'Para el dolor abdominal leve, evita alimentos irritantes, mantente hidratado y descansa. Si el dolor es severo, persistente o se acompaña de otros síntomas, busca atención médica inmediata.';
  }
  
  return 'Te recomiendo descansar, mantenerte hidratado y monitorear tus síntomas. Si los síntomas empeoran o persisten, no dudes en consultar con un profesional de la salud.';
};