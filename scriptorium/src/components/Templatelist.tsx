import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TemplateListProps {
  refreshTrigger: number;
  onRun: (template: any) => void;
  onEdit: (template: any) => void;
  onFork: (template: any) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ refreshTrigger, onRun, onEdit, onFork }) => {
  const [templates, setTemplates] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchExplanation, setSearchExplanation] = useState('');
  const [searchTags, setSearchTags] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        setTemplates(response.data.templates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, [refreshTrigger]);

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await axios.delete(`/api/templates/${templateId}`);
      setTemplates((prevTemplates) =>
        prevTemplates.filter((template: any) => template.id !== templateId)
      );
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((template: any) => {
    const titleMatch = template.title.toLowerCase().includes(searchTitle.toLowerCase());
    const explanationMatch = template.explanation.toLowerCase().includes(searchExplanation.toLowerCase());
    const tagsMatch = searchTags
      ? template.tags?.split(',').some((tag: string) =>
          tag.trim().toLowerCase() === searchTags.trim().toLowerCase()
        )
      : true;

    return titleMatch && explanationMatch && tagsMatch;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Templates</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          placeholder="Search by title"
          className="w-full p-2 mb-2 border rounded border-gray-300"
        />
        <input
          type="text"
          value={searchExplanation}
          onChange={(e) => setSearchExplanation(e.target.value)}
          placeholder="Search by explanation"
          className="w-full p-2 mb-2 border rounded border-gray-300"
        />
        <input
          type="text"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          placeholder="Search by tags"
          className="w-full p-2 mb-2 border rounded border-gray-300"
        />
      </div>
      <div className="space-y-4">
        {filteredTemplates.map((template: any) => (
          <div key={template.id} className="border rounded p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{template.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{template.explanation}</p>
            <div className="text-sm text-blue-500">
              Tags: {template.tags ? template.tags.split(',').join(', ') : 'None'}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onRun(template)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
              >
                Run
              </button>
              <button
                onClick={() => onEdit(template)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onFork(template)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded"
              >
                Fork
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateList;