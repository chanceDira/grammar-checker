import axios from "axios";
import type { GrammarResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const checkGrammar = async (text: string): Promise<GrammarResult> => {
  if (!text || text.trim().length === 0) {
    return { errors: [], correctedText: text };
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/grammar-check`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error: unknown) {
    const errorObj = error as { response?: { data?: { error?: string; fallback?: boolean }; status?: number }; code?: string; message?: string };
    
    if (errorObj.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (errorObj.response?.status === 500 && errorObj.response.data?.fallback) {
      throw new Error(errorObj.response.data.error || 'Service temporarily unavailable');
    } else if (errorObj.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    } else if (errorObj.response?.status === 0 || errorObj.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to grammar service. Please ensure the API server is running.');
    } else {
      throw new Error(errorObj.response?.data?.error || errorObj.message || 'Grammar check failed');
    }
  }
};