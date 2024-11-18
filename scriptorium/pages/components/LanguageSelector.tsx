import React from 'react';

interface LanguageSelectorProps {
  language: string;
  setLanguage: (language: string) => void;
}

const languages = ['python', 'javascript', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift'];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => (
  <div className="w-full mb-4">
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="w-full p-3 border rounded border-gray-300 text-black"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  </div>
);

export default LanguageSelector;