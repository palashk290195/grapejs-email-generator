import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/edit-with-ai', async (req, res) => {
  console.log('Received request to /api/edit-with-ai');
  try {
    const { elementHtml, elementCss, userPrompt } = req.body;
    console.log('Request body:', { elementHtml, elementCss, userPrompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are an AI assistant that helps modify HTML elements and their styles.`
        },
        {
          role: "user", 
          content: `Current HTML element: ${elementHtml}
                    Current CSS: ${JSON.stringify(elementCss)}
                    Request: ${userPrompt}
                    Respond with only the modified HTML element, including any style changes inline. Style changes should be done, only if asked, otherwise assume existing style changes will be applied.
                    VERY IMPORTANT: if user asks to change one aspect, make sure nothing else is changed in the HTML code`
        }
      ],
    });

    const modifiedHtml = response.choices[0].message?.content?.trim();
    console.log('Modified HTML:', modifiedHtml);
    res.json({ modifiedHtml });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));