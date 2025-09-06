import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

const parseGrammarErrors = (aiResponse, originalText) => {
  try {
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return {
          errors: [],
          correctedText: originalText,
        };
      }
    }

    const errors = (parsed.errors || []).map((error, index) => ({
      id: error.id || `error-${index}`,
      type: error.type || 'grammar',
      start: error.start || 0,
      end: error.end || 0,
      context: error.context || originalText.slice(error.start || 0, error.end || 0) || '',
      message: error.message || 'Grammar issue detected',
      suggestions: error.suggestions || [],
    }));

    return {
      errors,
      correctedText: parsed.correctedText || originalText,
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      errors: [],
      correctedText: originalText,
    };
  }
};

const checkGrammarWithOpenAI = async (text) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Please analyze the following text for grammar, spelling, and punctuation errors. Return a JSON response with the following structure:

  {
    "errors": [
      {
        "id": "unique-id",
        "type": "grammar|spelling|punctuation|style",
        "start": start_position_in_text,
        "end": end_position_in_text,
        "context": "the problematic text",
        "message": "description of the issue",
        "suggestions": ["corrected version 1", "corrected version 2"]
      }
    ],
    "correctedText": "fully corrected version of the text",
    "confidence": 0.95
  }

  Text to analyze: "${text.replace(/"/g, '\\"')}"

  Please be thorough but only flag actual errors, not stylistic preferences unless they significantly impact clarity.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional grammar checker. Analyze text and return detailed error information in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from OpenAI service');
    }

    return parseGrammarErrors(aiResponse, text);
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    } else {
      throw new Error(`Grammar check failed: ${error.message}`);
    }
  }
};

const checkGrammarWithGemini = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a professional grammar checker. Analyze this text for grammar, spelling, and punctuation errors.

  CRITICAL: The "suggestions" field must contain the COMPLETE replacement text that should replace the "context".

  Return JSON in this exact format:
  {
    "errors": [
      {
        "id": "error-1",
        "type": "grammar",
        "start": 2,
        "end": 8,
        "context": "I goes",
        "message": "Subject-verb disagreement",
        "suggestions": ["I go"]
      }
    ],
    "correctedText": "fully corrected version of the entire text",
    "confidence": 0.95
  }

  Text to analyze: "${text.replace(/"/g, '\\"')}"

  Return only the JSON response:`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response from Gemini service');
    }

    return parseGrammarErrors(aiResponse, text);
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid Gemini API key');
    } else {
      throw new Error(`Grammar check with Gemini failed: ${error.message}`);
    }
  }
};

const generateMockErrors = (text) => {
  const mockErrors = [];
  const patterns = [
    { pattern: /\bteh\b/gi, type: 'spelling', suggestions: ['the'] },
    { pattern: /\brecieve\b/gi, type: 'spelling', suggestions: ['receive'] },
    {
      pattern: /\btheir\b(?=\s+(?:is|are|was|were))/gi,
      type: 'grammar',
      suggestions: ['there'],
    },
    {
      pattern: /\byour\b(?=\s+(?:welcome|right))/gi,
      type: 'grammar',
      suggestions: ["you're"],
    },
  ];

  patterns.forEach((pattern, index) => {
    let match;
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      mockErrors.push({
        id: `mock-error-${index}-${match.index}`,
        type: pattern.type,
        start: match.index,
        end: match.index + match[0].length,
        context: match[0],
        message: `${pattern.type === 'spelling' ? 'Possible spelling mistake' : 'Grammar issue detected'}: "${match[0]}"`,
        suggestions: pattern.suggestions,
      });
    }
  });

  let correctedText = text;
  mockErrors.reverse().forEach((error) => {
    if (error.suggestions.length > 0) {
      correctedText = correctedText.slice(0, error.start) + error.suggestions[0] + correctedText.slice(error.end);
    }
  });

  return {
    errors: mockErrors.reverse(),
    correctedText,
    confidence: 0.85,
  };
};

app.post('/api/grammar-check', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.json({ errors: [], correctedText: text || '' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text too long. Maximum 50,000 characters.' });
    }

    const openAIKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let result;

    try {
      if (openAIKey) {
        result = await checkGrammarWithOpenAI(text);
      } else if (geminiKey) {
        console.log("with gemini")
        result = await checkGrammarWithGemini(text);
      } else {
        console.warn('No API keys configured. Using mock grammar service.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = generateMockErrors(text);
      }
    } catch (error) {
      if (openAIKey && geminiKey && !error.message.includes('OpenAI')) {
        try {
          result = await checkGrammarWithGemini(text);
        } catch (fallbackError) {
          throw error;
        }
      } else {
        throw error;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      fallback: true 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Grammar Checker API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});