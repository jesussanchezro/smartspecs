import React, { useState, KeyboardEvent } from 'react';

interface RequirementTagsProps {
  tags: string[];
  isEditing: boolean;
  onTagsChange?: (tags: string[]) => void;
}

const RequirementTags: React.FC<RequirementTagsProps> = ({
  tags,
  isEditing,
  onTagsChange,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (!inputValue.trim() || !onTagsChange) return;
    
    const newTag = inputValue.trim();
    if (!tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!onTagsChange) return;
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex items-start space-x-2">
      <div className="flex flex-wrap gap-2">
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-sky-200 text-sky-800 transition-all duration-200"
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 hover:text-sky-900 focus:outline-none transition-colors"
                  type="button"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No tags</span>
        )}
      </div>
      
      {isEditing && (
        <div className="flex items-center space-x-1 flex-shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-32"
          />
        </div>
      )}
    </div>
  );
};

export default RequirementTags;

