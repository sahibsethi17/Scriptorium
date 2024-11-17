// components/CodeEditor.tsx
import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language }) => {
  return (
    <div className="w-full mb-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <MonacoEditor
        height="300px" // Adjusted height to make the box smaller
        language={language}
        theme="vs-dark"
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
        onChange={(value) => setCode(value || '')}
      />
    </div>
  );
};

export default CodeEditor;