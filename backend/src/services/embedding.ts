import axios from 'axios';

// Gemini 2.5 Flash embedding via REST
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  // Using text-embedding-004 (compatible with Gemini) endpoint format
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedText?key=${apiKey}`;
  const { data } = await axios.post(url, { text });
  const values: number[] = data?.embedding?.value || data?.embedding?.values || data?.data?.[0]?.embedding?.values;
  if (!values) throw new Error('Unexpected embedding response');
  return values;
}
