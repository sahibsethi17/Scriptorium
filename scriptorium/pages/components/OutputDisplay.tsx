import React from 'react';

interface OutputDisplayProps {
  output: string;
  className?: string; // Add className as an optional prop
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, className }) => {
  return (
    <div className={`p-3 border rounded border-gray-300 bg-white ${className || ''} dark:bg-gray-900 dark:text-white`}>
      <h2 className="text-xl font-semibold mb-2 text-black dark:bg-gray-900 dark:text-white">Output:</h2>
      <pre className="whitespace-pre-wrap">{output}</pre>
    </div>
  );
};

export default OutputDisplay;