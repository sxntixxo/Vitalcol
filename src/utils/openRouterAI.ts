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

// Respuestas de respaldo específicas para síntomas médicos
const getFallbackResponse = (userMessage: string, context: string): string => {
  const message = userMessage.toLowerCase();
  
  // Para recomendaciones médicas específicas
  if (context.includes('medical_recommendation')) {
    if (message.includes('fiebre') || message.includes('temperatura')) {
      return `**Recomendación para fiebre:**

🌡️ **Cuidados inmediatos:**
• Mantente hidratado bebiendo abundante agua
• Descansa en un lugar fresco y ventilado
• Usa ropa ligera y cómoda
• Aplica compresas tibias en frente y muñecas

⚠️ **Cuándo buscar atención médica:**
• Si la fiebre supera los 39°C
• Si persiste por más de 3 días
• Si se acompaña de dificultad para respirar
• Si hay signos de deshidratación

💊 **Medidas adicionales:**
• Puedes tomar acetaminofén según indicaciones del empaque
• Evita el ácido acetilsalicílico en menores de 18 años
• Monitorea tu temperatura cada 4-6 horas

Es importante que consultes con un profesional médico para una evaluación completa.`;
    }
    
    if (message.includes('dolor de cabeza') || message.includes('cefalea')) {
      return `**Recomendación para dolor de cabeza:**

🧠 **Cuidados inmediatos:**
• Descansa en un lugar tranquilo y oscuro
• Aplica compresas frías en la frente
• Mantente hidratado
• Evita ruidos fuertes y luces brillantes

⚠️ **Cuándo buscar atención médica:**
• Si el dolor es súbito e intenso
• Si se acompaña de fiebre alta
• Si hay cambios en la visión
• Si persiste por más de 48 horas

💊 **Medidas adicionales:**
• Puedes tomar analgésicos de venta libre
• Practica técnicas de relajación
• Mantén horarios regulares de sueño
• Evita el estrés y la tensión

Te recomiendo consultar con un médico si los episodios son frecuentes.`;
    }
    
    if (message.includes('tos') || message.includes('gripe')) {
      return `**Recomendación para tos y síntomas gripales:**

🤧 **Cuidados inmediatos:**
• Descansa y evita esfuerzos físicos
• Mantente hidratado con líquidos tibios
• Usa miel para calmar la garganta
• Humidifica el ambiente

⚠️ **Cuándo buscar atención médica:**
• Si hay dificultad para respirar
• Si la tos persiste por más de 2 semanas
• Si hay sangre en el esputo
• Si se acompaña de fiebre alta

💊 **Medidas adicionales:**
• Evita irritantes como humo y polvo
• Duerme con la cabeza elevada
• Considera jarabes naturales con miel
• Mantén buena higiene de manos

Es importante que un médico evalúe tus síntomas para descartar complicaciones.`;
    }
    
    if (message.includes('dolor abdominal') || message.includes('estómago')) {
      return `**Recomendación para dolor abdominal:**

🍽️ **Cuidados inmediatos:**
• Evita alimentos sólidos temporalmente
• Mantente hidratado con pequeños sorbos de agua
• Aplica calor suave en el abdomen
• Descansa en posición cómoda

⚠️ **Cuándo buscar atención médica INMEDIATA:**
• Si el dolor es intenso y súbito
• Si se acompaña de vómito persistente
• Si hay fiebre alta
• Si hay sangre en vómito o heces

💊 **Medidas adicionales:**
• Evita medicamentos sin prescripción médica
• No apliques calor si sospechas apendicitis
• Mantén un registro de los síntomas
• Evita alimentos irritantes

El dolor abdominal puede tener múltiples causas. Es fundamental que consultes con un médico.`;
    }
    
    if (message.includes('dificultad para respirar') || message.includes('respirar')) {
      return `**⚠️ ATENCIÓN MÉDICA INMEDIATA REQUERIDA ⚠️**

🚨 **Cuidados inmediatos:**
• Mantente calmado y en posición erguida
• Afloja ropa ajustada
• Busca aire fresco
• Respira lenta y profundamente

🏥 **BUSCA ATENCIÓN MÉDICA INMEDIATA:**
• La dificultad para respirar puede ser grave
• Llama al 123 si es severa
• Dirígete al hospital más cercano
• No conduzcas, pide ayuda

💊 **Mientras esperas ayuda:**
• Evita esfuerzos físicos
• No te acuestes completamente
• Si tienes inhalador prescrito, úsalo
• Mantén a alguien contigo

La dificultad respiratoria requiere evaluación médica urgente. No demores en buscar ayuda profesional.`;
    }
  }
  
  // Respuestas generales para otros contextos
  if (context.includes('greeting') || context.includes('saludo')) {
    return 'Hola, estoy aquí para ayudarte con orientación médica general. ¿En qué puedo asistirte hoy?';
  }
  
  if (context.includes('location') || context.includes('ubicación')) {
    return 'Perfecto. Con tu ubicación podré recomendarte centros médicos cercanos y adecuados para tus necesidades.';
  }
  
  // Respuesta por defecto solo para casos no médicos
  return 'Entiendo tu consulta. ¿Podrías proporcionar más detalles sobre tus síntomas para poder ayudarte mejor?';
};

// Función específica para generar recomendaciones médicas inteligentes
export const generateMedicalRecommendation = async (
  symptoms: string[],
  severity: 'mild' | 'moderate' | 'severe',
  userName?: string
): Promise<string> => {
  const symptomsText = symptoms.join(', ');
  const severityText = severity === 'mild' ? 'leve' : severity === 'moderate' ? 'moderada' : 'grave';
  
  const context = `medical_recommendation, symptoms: ${symptomsText}, severity: ${severityText}, user_name: ${userName || 'usuario'}`;
  
  const prompt = `El usuario ${userName || ''} presenta los siguientes síntomas: ${symptomsText}.

La gravedad estimada es ${severityText}.

Como asistente médico virtual especializado, proporciona una recomendación médica completa y profesional que incluya:

1. **Evaluación inicial**: Breve explicación de lo que podrían indicar estos síntomas
2. **Cuidados inmediatos**: Qué puede hacer ahora mismo para aliviar los síntomas
3. **Cuándo buscar atención médica**: Señales de alarma y cuándo acudir al médico
4. **Medidas preventivas**: Cómo evitar que empeore la situación
5. **Recomendaciones generales**: Estilo de vida y cuidados adicionales

IMPORTANTE: 
- Usa emojis para hacer la información más clara y fácil de leer
- Estructura la respuesta con títulos y viñetas
- Personaliza usando el nombre del usuario cuando sea apropiado
- Mantén un tono empático pero profesional
- La respuesta debe ser informativa pero no debe reemplazar el consejo médico profesional
- Enfatiza cuándo es necesario buscar atención médica profesional`;

  return await generateAIResponse(prompt, context, {
    temperature: 0.6,
    maxTokens: 500,
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