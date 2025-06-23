import React, { useState } from 'react';

type IdeaInputProps = {
  onAdd: (data: { idea: string; tags: string[] }) => void;
};

function IdeaInput({ onAdd }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [tags, setTags] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!idea.trim()) return;
    onAdd({ idea, tags: tags.split(/\s+/).filter(Boolean) });
    setIdea('');
    setTags('');
  }

  return (
    <form className="idea-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={idea}
        onChange={e => setIdea(e.target.value)}
        placeholder="Quick idea..."
        className="idea-text"
      />
      <input
        type="text"
        value={tags}
        onChange={e => setTags(e.target.value)}
        placeholder="#tags (space-separated)"
        className="idea-tags"
      />
      <button type="submit" className="idea-add">Add</button>
    </form>
  );
}

export default IdeaInput; 