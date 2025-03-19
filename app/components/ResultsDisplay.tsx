'use client';

import { useState } from 'react';
import { SearchResult } from '@/app/lib/search-service';
import { generateResearchPDF } from '@/app/lib/pdf-service';

interface ResearchResult {
  summary: string;
  sources: SearchResult[];
  detailedAnalysis?: string;
  relatedTopics?: string[];
}

interface ResultsDisplayProps {
  result: ResearchResult;
  topic: string; // Add topic prop for better PDF title
}

// Source badge colors based on source type
const SOURCE_BADGE_COLORS = {
  'web': 'bg-blue-600',
  'wikipedia': 'bg-gray-600',
  'scholar': 'bg-green-600',
  'github': 'bg-purple-600',
  'news': 'bg-orange-600',
};

// Pretty source names for display
const SOURCE_NAMES = {
  'web': 'Web',
  'wikipedia': 'Wikipedia',
  'scholar': 'Academic',
  'github': 'GitHub',
  'news': 'News',
};

export default function ResultsDisplay({ result, topic }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'sources' | 'related'>('summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { summary, sources, detailedAnalysis, relatedTopics } = result;

  // Group sources by type for better organization
  const groupedSources = sources.reduce((groups, source) => {
    const sourceType = source.source || 'web';
    if (!groups[sourceType]) {
      groups[sourceType] = [];
    }
    groups[sourceType].push(source);
    return groups;
  }, {} as Record<string, SearchResult[]>);
  
  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateResearchPDF(result, topic);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  return (
    <div className="text-white">
      <div className="flex flex-wrap justify-between items-center border-b border-slate-700 mb-4">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-4 ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Summary
          </button>
          
          {detailedAnalysis && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-4 ${
                activeTab === 'analysis'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Analysis
            </button>
          )}
          
          {sources && sources.length > 0 && (
            <button
              onClick={() => setActiveTab('sources')}
              className={`py-2 px-4 ${
                activeTab === 'sources'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sources ({sources.length})
            </button>
          )}
          
          {relatedTopics && relatedTopics.length > 0 && (
            <button
              onClick={() => setActiveTab('related')}
              className={`py-2 px-4 ${
                activeTab === 'related'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Related Topics
            </button>
          )}
        </div>
        
        {/* PDF Download Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors ml-auto mr-2"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
      
      <div className="prose prose-invert max-w-none">
        {activeTab === 'summary' && (
          <div className="whitespace-pre-line">
            {summary.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-gray-200 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        
        {activeTab === 'analysis' && detailedAnalysis && (
          <div className="whitespace-pre-line">
            {detailedAnalysis.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-gray-200 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        
        {activeTab === 'sources' && sources && (
          <div>
            {/* Source type filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(groupedSources).map((sourceType) => (
                <div 
                  key={sourceType}
                  className={`text-xs px-2 py-1 rounded-full ${SOURCE_BADGE_COLORS[sourceType] || 'bg-slate-600'}`}
                >
                  {SOURCE_NAMES[sourceType] || sourceType}: {groupedSources[sourceType].length}
                </div>
              ))}
            </div>

            {/* Source listing by type */}
            {Object.keys(groupedSources).map((sourceType) => (
              <div key={sourceType} className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  {SOURCE_NAMES[sourceType] || sourceType} Sources
                </h3>
                
                <div className="space-y-4">
                  {groupedSources[sourceType].map((source, index) => (
                    <div key={index} className="p-4 bg-slate-900 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-medium text-white">{source.title}</h3>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${SOURCE_BADGE_COLORS[source.source] || 'bg-slate-600'}`}
                        >
                          {SOURCE_NAMES[source.source] || source.source}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{source.snippet}</p>
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm inline-flex items-center"
                      >
                        Visit Source
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'related' && relatedTopics && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white mb-4">Related Research Topics</h3>
            <ul className="space-y-3">
              {relatedTopics.map((topic, index) => (
                <li key={index} className="p-3 bg-slate-900 rounded-lg text-gray-200">
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 