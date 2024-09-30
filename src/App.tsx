import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import 'grapesjs/dist/css/grapes.min.css';
import { Loader2 } from 'lucide-react';
import { editWithAI } from './apiClient';

function App() {
  const editorRef = useRef<any>(null);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = grapesjs.init({
        container: '#gjs',
        plugins: [gjsPresetNewsletter],
        pluginsOpts: {
          gjsPresetNewsletter: {}
        },
        storageManager: false,
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '480px',
            },
          ]
        },
      });

      editorRef.current.on('component:selected', (component: any) => {
        const el = component.view.el;
        el.style.cursor = `url('/ai-logo.png'), auto`;
        el.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          setCursorPosition({ x: e.clientX, y: e.clientY });
          showCustomMenu(e, component);
        });
      });

      editorRef.current.on('component:deselected', (component: any) => {
        component.view.el.style.cursor = 'default';
      });

      editorRef.current.on('change:changesCount', () => {
        setHtmlOutput(editorRef.current.getHtml() + '<style>' + editorRef.current.getCss() + '</style>');
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const showCustomMenu = (e: MouseEvent, component: any) => {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.style.backgroundColor = 'white';
    menu.style.border = '1px solid black';
    menu.style.padding = '5px';
    menu.style.zIndex = '9999';

    const editWithAIButton = document.createElement('button');
    editWithAIButton.textContent = 'Edit with AI';
    editWithAIButton.onclick = () => handleEditWithAI(component);
    menu.appendChild(editWithAIButton);

    document.body.appendChild(menu);

    const removeMenu = () => {
      document.body.removeChild(menu);
      document.removeEventListener('click', removeMenu);
    };

    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 0);
  };

  const handleEditWithAI = async (component: any) => {
    setIsEditing(true);
    const elementHtml = component.toHTML();
    const elementCss = component.getStyle();
    console.log('Element HTML and CSS sent to AI:', { html: elementHtml, css: elementCss });

    const userPrompt = prompt('What changes would you like to make to this element?');
    if (!userPrompt) {
      setIsEditing(false);
      return;
    }

    console.log('User prompt:', userPrompt);

    try {
      const modifiedHtml = await editWithAI(elementHtml, elementCss, userPrompt);
      console.log('Modified HTML:', modifiedHtml);
      await applyAISuggestion(component, modifiedHtml);
    } catch (error) {
      console.error('Error editing with AI:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const applyAISuggestion = (component: any, modifiedHtml: string) => {
    console.log('Applying AI suggestion:', modifiedHtml);
  
    return new Promise<void>((resolve) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modifiedHtml;
      
      const newElement = tempDiv.firstElementChild as HTMLElement;
  
      if (newElement) {
        component.replaceWith(newElement.outerHTML);
        
        if (newElement.style.cssText) {
          const inlineStyles = newElement.style.cssText.split(';').reduce((acc: any, style: string) => {
            const [key, value] = style.split(':').map(s => s.trim());
            if (key && value) acc[key] = value;
            return acc;
          }, {});
          component.setStyle(inlineStyles);
        }
      }
  
      editorRef.current.trigger('change:changesCount');
  
      setTimeout(() => {
        resolve();
      }, 300);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <div style={{ width: '70%', height: '100%' }}>
        <div id="gjs" style={{ height: 'calc(100% - 40px)', border: '1px solid #ddd' }}></div>
      </div>
      <div style={{ width: '30%', padding: '20px', overflowY: 'auto' }}>
        <h3>Generated HTML:</h3>
        <textarea
          value={htmlOutput}
          readOnly
          style={{ width: '100%', height: 'calc(100% - 40px)', resize: 'none' }}
        />
      </div>
      {isEditing && (
        <div style={{
          position: 'fixed',
          left: cursorPosition.x,
          top: cursorPosition.y,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          transition: 'opacity 0.3s ease-in-out',
        }}>
          <Loader2 className="animate-spin" />
          <span style={{ marginLeft: '10px' }}>AI is editing...</span>
        </div>
      )}
    </div>
  );
}

export default App;