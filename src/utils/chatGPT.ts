import axios from 'axios';

export const fetchChatGPTRecommendation = async (userMessage: string): Promise<string> => {
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: userMessage,
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error fetching recommendation from ChatGPT:', error);
    return 'Lo siento, no pude obtener una recomendación en este momento.';
  }
};
