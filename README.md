# Enhanced GrapesJS Email Editor with AI Integration

## Overview

This project is an enhanced email template editor built on top of GrapesJS, featuring AI-powered editing capabilities. It allows users to create and edit email templates visually, with the added ability to use AI suggestions for content and style modifications.

## Features

- Visual email template editing using GrapesJS
- AI-powered suggestions for content and style changes
- Conservative update strategy to preserve email structure
- Configurable thresholds for content changes
- Real-time preview of email templates
![Uploading image.png…]()


## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   REACT_APP_PORT=3000
  SERVER_PORT=3001
  REACT_APP_API_URL=http://localhost:3001
  OPENAI_API_KEY=your_open_ai_api_key_here
  # (OPTIONAL) Unsplash API keys for email modifications
  UNSPLASH_APPLICATION_ID=
  UNSPLASH_ACCESS_KEY=
  UNSPLASH_SECRET_KEY=
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Use the visual editor to create or edit email templates

4. To use AI suggestions:
   - Select an element in the editor
   - Right-click and choose "Edit with AI"
   - Enter your request in the prompt
   - Review and apply the AI's suggestion

## Configuration

You can adjust the behavior of the AI editing feature by modifying the `config` object in `src/App.tsx`:

```javascript
const config = {
  contentChangeThreshold: 0.5, // Threshold for significant content change (50%)
  significantChangeThreshold: 0.8, // Threshold for user confirmation (80%)
};
```

- `contentChangeThreshold`: Determines when to apply conservative updates (default: 0.5)
- `significantChangeThreshold`: Threshold for prompting user confirmation (default: 0.8)

## Project Structure

- `src/App.tsx`: Main application component
- `src/apiClient.ts`: API client for AI service
- `public/`: Static assets


## Acknowledgments

- [GrapesJS](https://grapesjs.com/)
- [OpenAI](https://openai.com/) for AI capabilities
