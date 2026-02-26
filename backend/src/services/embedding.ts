import axios from 'axios';

// Gemini text embedding via REST
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  // Using embedContent endpoint for text-embedding-004 model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const { data } = await axios.post(url, { 
    content: {
      parts: [{ text }]
    }
  });
  const values: number[] = data?.embedding?.values;
  if (!values) throw new Error('Unexpected embedding response');
  return values;
}
