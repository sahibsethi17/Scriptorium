import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import OutputDisplay from './components/OutputDisplay';
import axios from 'axios';

const App: React.FC = () => {
  const [language, setLanguage] = useState('python'); // Default language
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('');

    try {
      const response = await axios.post('/api/execute', {
        language,
        code,
        input, // Include the standard input in the payload
      });
      setOutput(response.data.output || 'No output');
    } catch (error) {
      setOutput(error.response?.data?.error || 'An error occurred');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-gray-100 p-6">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">Scriptorium Code Editor</h1>
        <LanguageSelector language={language} setLanguage={setLanguage} />
        <CodeEditor code={code} setCode={setCode} language={language} />
        <div className="w-full mt-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Standard input (optional)"
            className="w-full p-3 border rounded border-gray-300"
            rows={3}
          />
        </div>
        <button
          onClick={handleRunCode}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 mt-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
        <OutputDisplay output={output} />
      </div>
    </div>
  );
};

export default App;