import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const searchUnsplash = async (query: string) => {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
    return response.data.results[0].urls.regular;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    throw error;
  }
};

app.post('/api/edit-with-ai', async (req, res) => {
  try {
    const { elementHtml, userPrompt } = req.body;
    console.log('Received html:', elementHtml);

    const messages = [
      { role: 'system', content: 'You are an AI assistant that helps modify HTML elements for email templates.' },
      { role: 'user', content: `Current HTML element: ${elementHtml}\n\nUser request: ${userPrompt}\n\nRespond with the modified HTML element, including any style changes inline. If an image is requested, use the search_unsplash function to find an appropriate image.
      Only make changes to style if asked, other wise stick to current style.
      VERY IMPORTANT: Do not share anything apart from section's html which is going to exactly replace the shared element by my code. If user asks to delete the component, send empty response` }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      tools: [
        {
          type: 'function',
          function: {
            name: 'search_unsplash',
            description: 'Provide an image URL. Only call this function when there is a new requirement or replacement of image, don\'t call when image position needs to be changed.',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query for the image'
                }
              },
              required: ['query']
            }
          }
        }
      ],
      temperature: 0,
    });

    console.log('OpenAI response:', response);

    const message = response.choices[0].message;
    let aiResponse: string = '';

    if (message.tool_calls) {
      console.log('Function call detected:', message);
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === 'search_unsplash') {
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const imageUrl = await searchUnsplash(toolArgs.query);
        
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            ...messages.map(msg => ({
              role: msg.role as 'system' | 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'assistant',
              content: message.content ?? '',
              function_call: {
                name: 'search_unsplash',
                arguments: JSON.stringify({
                  query: toolArgs.query
                })
              }
            },
            {
              role: 'function',
              name: 'search_unsplash',
              content: JSON.stringify({
                query: toolArgs.query,
                image_url: imageUrl
              })
            }
          ],
          temperature: 0
        });

        aiResponse = secondResponse.choices[0].message.content ?? '';
      }
    } else {
      console.log('No function call, using direct response');
      aiResponse = message.content ?? '';
    }

    console.log('Final AI response:', aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in /api/edit-with-ai:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));