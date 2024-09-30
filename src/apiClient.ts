const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const editWithAI = async (elementHtml: string, elementCss: object, userPrompt: string) => {
  try {
    console.log(`Sending request to ${API_URL}/api/edit-with-ai`);
    const response = await fetch(`${API_URL}/api/edit-with-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ elementHtml, elementCss, userPrompt }),
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.modifiedHtml;
  } catch (error) {
    console.error('Error in editWithAI:', error);
    throw error;
  }
};