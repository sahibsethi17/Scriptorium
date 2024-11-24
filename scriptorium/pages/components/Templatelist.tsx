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
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null); // Store logged-in user's ID
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [searchTitle, setSearchTitle] = useState('');
  const [searchExplanation, setSearchExplanation] = useState('');
  const [searchTags, setSearchTags] = useState('');
  const itemsPerPage = 5; // Number of templates per page

  useEffect(() => {
    // Fetch templates with pagination
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        setTemplates(response.data.templates);
        setTotalPages(response.data.totalPages); // Set the total number of pages
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    // Fetch logged-in user's ID
    const fetchUserId = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          setLoggedInUserId(parseInt(userId, 10));
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchTemplates();
    fetchUserId();
  }, [refreshTrigger, currentPage]);

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await axios.delete(`/api/templates/${templateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Templates</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          placeholder="Search by title"
          className="w-full p-2 mb-2 border rounded bg-white border-gray-300 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="text"
          value={searchExplanation}
          onChange={(e) => setSearchExplanation(e.target.value)}
          placeholder="Search by explanation"
          className="w-full p-2 mb-2 border rounded bg-white border-gray-300 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="text"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          placeholder="Search by tags"
          className="w-full p-2 mb-2 border rounded bg-white border-gray-300 dark:bg-gray-900 dark:text-white"
        />
      </div>
      <div className="space-y-4">
        {filteredTemplates.map((template: any) => (
          <div
            key={template.id}
            className="border rounded p-4 shadow-sm bg-white text-black dark:bg-gray-900 dark:text-white"
          >
            <h3 className="text-lg font-semibold dark:text-white">{template.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{template.explanation}</p>
            <div className="text-sm text-blue-500">
              Tags: {template.tags ? template.tags.split(',').join(', ') : 'None'}
            </div>
            {loggedInUserId === template.userId && (
              <span className="block bg-green-400 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded mt-2">
                Created by You
              </span>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onRun(template)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
              >
                Run
              </button>
              <button
                onClick={() => onEdit(template)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onFork(template)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
              >
                Fork
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TemplateList;