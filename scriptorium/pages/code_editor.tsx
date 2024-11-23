import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import OutputDisplay from './components/OutputDisplay';
import TemplateList from './components/Templatelist';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [language, setLanguage] = useState('python'); // Default language
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false); // For toggling the save template form
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null); // To track the editing state
  const [templateDetails, setTemplateDetails] = useState({
    title: '',
    explanation: '',
    tags: '',
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger template refresh

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('');

    try {
      const response = await axios.post('/api/execute', {
        language,
        code,
        input,
      });
      setOutput(response.data.output || 'No output');
    } catch (error) {
      setOutput(error.response?.data?.error || 'An error occurred');
    }

    setIsLoading(false);
  };

  const handleRunTemplate = (template: any) => {
    console.log('Running template:', template);
    setCode(template.code);
    setLanguage(template.language);
    setInput('');
    // setInput(template.stdin ? template.stdin.split('\n').join('\n') : '');
  };

  const handleForkTemplate = async (template: any) => {
    try {
      const payload = {
        userId: 1, // Default user ID
        title: `${template.title} (Forked)`,
        explanation: template.explanation,
        tags: template.tags || '',
        code: template.code,
        stdin: [],
        language: template.language,
        forkedFrom: template.id, // Add the forkedFrom field
      };

      console.log('Forking template with payload:', payload);

      const response = await axios.post('/api/templates/create', payload);

      if (response.status === 201) {
        setRefreshTrigger((prev) => prev + 1); // Refresh templates
      } else {
        throw new Error('Failed to fork template');
      }
    } catch (error) {
      console.error('Error forking template:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to fork template');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateDetails.title || !templateDetails.explanation || !code || !language) {
      alert('Title, explanation, code, and language are required.');
      return;
    }

    try {
      const payload = {
        userId: 1, // Default user ID
        title: templateDetails.title.trim(),
        explanation: templateDetails.explanation.trim(),
        tags: templateDetails.tags.trim() || '',
        code: code.trim(),
        stdin: [],
        language,
      };

      console.log('Saving template with payload:', payload);
      console.log('Editing Template ID:', editingTemplateId);

      let response;

      if (editingTemplateId) {
        // Editing an existing template
        response = await axios.put(`/api/templates/${editingTemplateId}`, payload);
      } else {
        // Creating a new template
        response = await axios.post('/api/templates/create', payload);
      }

      if (response.status === 200 || response.status === 201) {
        setIsSavingTemplate(false);
        setEditingTemplateId(null); // Reset editing state
        setTemplateDetails({ title: '', explanation: '', tags: '' });
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh for TemplateList
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to save template');
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex flex-col bg-gray-100 p-6 dark:bg-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">Scriptorium Code Editor</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
        {/* Left Section (Code Editor + Input + Buttons) */}
        <div>
          <LanguageSelector language={language} setLanguage={setLanguage} />
          <CodeEditor code={code} setCode={setCode} language={language} />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Standard input (optional)"
            className="w-full p-3 border rounded border-gray-300 bg-white mt-4 dark:bg-gray-900 dark:text-white"
            rows={3}
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleRunCode}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={() => setIsSavingTemplate(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Save as Template
            </button>
          </div>
          <OutputDisplay output={output} className="mt-4" />

          {/* Save Template Form */}
          {isSavingTemplate && (
            <div className="mt-4 p-4 border border-gray-300 rounded bg-white">
              <h2 className="text-xl font-bold mb-4 text-black">Save as Template</h2>
              <input
                type="text"
                placeholder="Title"
                value={templateDetails.title}
                onChange={(e) =>
                  setTemplateDetails((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border rounded mb-4"
              />
              <textarea
                placeholder="Explanation"
                value={templateDetails.explanation}
                onChange={(e) =>
                  setTemplateDetails((prev) => ({ ...prev, explanation: e.target.value }))
                }
                className="w-full p-2 border rounded mb-4"
                rows={3}
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={templateDetails.tags}
                onChange={(e) =>
                  setTemplateDetails((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSaveTemplate}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setIsSavingTemplate(false);
                    setEditingTemplateId(null); // Reset editing state
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section (Templates List) */}
        <div className='margin-left-10'>
          <TemplateList
            refreshTrigger={refreshTrigger}
            onRun={handleRunTemplate}
            onEdit={(template) => {
              console.log('Editing template:', template);
              setCode(template.code);
              setLanguage(template.language);
              setInput(template.stdin ? template.stdin.split('\n').join('\n') : '');
              setTemplateDetails({
                title: template.title,
                explanation: template.explanation,
                tags: template.tags,
              });
              setEditingTemplateId(template.id);
              setIsSavingTemplate(true);
            }}
            onFork={(template) => {
              handleForkTemplate(template);
            }}
          />
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default App;