// MODIFIED FROM CHATGPT

import React, { useState } from "react";

interface BlogFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string;
  onSubmit: (title: string, description: string, tags: string) => void;
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialTitle = "",
  initialDescription = "",
  initialTags = "",
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, tags);
  };

  // GENERATED WITH CHATGPT
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 dark:bg-gray-600 dark:text-white mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium dark:text-white" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="block w-full p-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium dark:text-white" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter blog description"
            className="block w-full p-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium dark:text-white" htmlFor="tags">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags, separated by commas"
            className="block w-full p-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
