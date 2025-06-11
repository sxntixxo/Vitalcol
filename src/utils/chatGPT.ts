import axios from 'axios';

export const fetchChatGPTRecommendation = async (userMessage: string): Promise<string> => {
  try {
    // Note: Replace with your actual OpenAI API key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente médico virtual profesional y empático. Proporciona recomendaciones médicas claras, precisas y comprensibles. Siempre recuerda que no reemplazas la consulta médica profesional.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error fetching recommendation from OpenAI:', error);
    
    // Provide a more specific error message
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Error de autenticación con la API de OpenAI. Verifica tu clave de API.';
      } else if (error.response?.status === 429) {
        return 'Límite de solicitudes excedido. Por favor, intenta de nuevo en unos momentos.';
      }
    }
    
    return 'Lo siento, no pude obtener una recomendación en este momento. Por favor, consulta con un profesional médico.';
  }
};