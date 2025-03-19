'use client';

import { useState } from 'react';
import { availableModels, ModelProvider } from '@/app/lib/ai-service';
import ResultsDisplay from './ResultsDisplay';

const AVAILABLE_SOURCES = [
  { id: 'web', label: 'Web Search' },
  { id: 'wikipedia', label: 'Wikipedia' },
  { id: 'scholar', label: 'Academic Sources' },
  { id: 'news', label: 'News Articles' },
  { id: 'github', label: 'GitHub Repositories' },
];

const RESEARCH_DEPTHS = [
  { id: 'basic', label: 'Short (~1000 words)' },
  { id: 'detailed', label: 'Medium (~2000+ words)' },
  { id: 'comprehensive', label: 'Comprehensive (~5000+ words)' },
] as const;

export default function ResearchForm() {
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState<ModelProvider>('openai');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [depth, setDepth] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed');
  const [selectedSources, setSelectedSources] = useState<string[]>(['web', 'wikipedia', 'news']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a research topic');
      return;
    }
    
    if (selectedSources.length === 0) {
      setError('Please select at least one source for research');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          provider,
          model,
          depth,
          includeSources: true,
          sources: selectedSources,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to conduct research');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during research');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        // Keep maximum 5 sources
        const newSources = [...prev, sourceId];
        return newSources.slice(0, 5);
      }
    });
  };

  return (
    <div className="w-full mx-auto">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-8 w-full bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-800/50 transition-all hover:border-slate-700/50">
          <div>
            <label htmlFor="topic" className="block text-md font-medium text-gray-200 mb-2">
              Research Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to research..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-inner transition-all"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label htmlFor="provider" className="block text-md font-medium text-gray-200 mb-2 group-hover:text-blue-400 transition-colors">
                AI Provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => {
                  const newProvider = e.target.value as ModelProvider;
                  setProvider(newProvider);
                  
                  if (newProvider === 'openai') {
                    setModel('gpt-4-turbo-preview');
                  } else if (newProvider === 'anthropic') {
                    setModel('claude-3-5-sonnet-20240620');
                  } else if (newProvider === 'ollama') {
                    setModel('llama3');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-sm transition-all"
              >
                <option value="openai" className="bg-slate-800 py-2">OpenAI</option>
                <option value="anthropic" className="bg-slate-800 py-2">Anthropic</option>
                <option value="ollama" className="bg-slate-800 py-2">Ollama (Local)</option>
              </select>
            </div>
            
            <div className="group">
              <label htmlFor="model" className="block text-md font-medium text-gray-200 mb-2 group-hover:text-blue-400 transition-colors">
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-sm transition-all"
              >
                {provider === 'openai' && availableModels.openai.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-800 py-2">
                    {model.name}
                  </option>
                ))}
                
                {provider === 'anthropic' && availableModels.anthropic.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-800 py-2">
                    {model.name}
                  </option>
                ))}
                
                {provider === 'ollama' && (
                  <option value="llama3" className="bg-slate-800 py-2">Llama 3 (Default)</option>
                )}
              </select>
            </div>
            
            <div className="group">
              <label htmlFor="depth" className="block text-md font-medium text-gray-200 mb-2 group-hover:text-blue-400 transition-colors">
                Research Depth
              </label>
              <select
                id="depth"
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-sm transition-all"
              >
                {RESEARCH_DEPTHS.map((depth) => (
                  <option key={depth.id} value={depth.id} className="bg-slate-800 py-2">
                    {depth.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-slate-800/20 p-6 rounded-xl border border-slate-700/50 transition-all hover:border-slate-600/50">
            <label className="block text-md font-medium text-gray-200 mb-4">
              Research Sources <span className="text-sm text-gray-400">(max 5)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {AVAILABLE_SOURCES.map((source) => (
                <div key={source.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 transition-all hover:border-blue-500/30 hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    id={`source-${source.id}`}
                    checked={selectedSources.includes(source.id)}
                    onChange={() => handleSourceToggle(source.id)}
                    className="h-5 w-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500/50 bg-slate-700/50"
                  />
                  <label 
                    htmlFor={`source-${source.id}`} 
                    className="text-sm font-medium text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                  >
                    {source.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {selectedSources.length} of 5 sources selected
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-medium text-white text-lg transition-all shadow-lg ${
              isLoading
                ? 'bg-blue-600/80 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                Researching - Please wait !!
                <span className="ml-2 text-blue-200">•••</span>
              </span>
            ) : (
              'Start Research'
            )}
          </button>
        </form>
      ) : (
        <div>
          <ResultsDisplay result={result} topic={topic} />
          <button
            onClick={() => setResult(null)}
            className="mt-8 py-3 px-6 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Start New Research
          </button>
        </div>
      )}
    </div>
  );
} 