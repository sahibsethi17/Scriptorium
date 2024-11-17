// OutputDisplay.tsx
import React from 'react';

interface OutputDisplayProps {
  output: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ output }) => (
  <div className="output-box w-full mt-6">
    <h2 className="font-semibold text-lg mb-2">Output:</h2>
    <pre className="text-sm font-mono whitespace-pre-wrap">{output || 'No output yet'}</pre>
  </div>
);

export default OutputDisplay;