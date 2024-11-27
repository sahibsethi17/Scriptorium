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
    <div className="w-full mb-4">
      <MonacoEditor
        height="100%" 
        width="100%"
        language={language}
        
        theme="vs-dark"
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
        
        onChange={(value) => setCode(value || '')}
      />
    </div>
  );
};

export default CodeEditor;