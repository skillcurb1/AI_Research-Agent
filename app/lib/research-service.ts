import { generateAIResponse } from './ai-service';
import { multiSourceSearch, SearchResult } from './search-service';

export interface ResearchParams {
  topic: string;
  provider: string;
  model: string;
  depth: 'basic' | 'detailed' | 'comprehensive';
  includeSources?: boolean;
  maxResults?: number;
  isServerSide?: boolean;
  sources?: string[]; // Add sources parameter to allow customization
}

export interface ResearchResult {
  summary: string;
  sources: SearchResult[];
  detailedAnalysis?: string;
  relatedTopics?: string[];
}

/**
 * Main research function that orchestrates the research process
 */
export async function conductResearch({
  topic,
  provider,
  model,
  depth = 'basic',
  includeSources = true,
  maxResults = depth === 'basic' ? 3 : depth === 'detailed' ? 5 : 8,
  isServerSide = false,
  sources = ['web', 'wikipedia', 'news', 'scholar', 'github'], // Default to all available sources
}: ResearchParams): Promise<ResearchResult> {
  try {
    // Limit to max 5 sources
    const limitedSources = sources.slice(0, 5);
    
    // Step 1: Gather information from multiple sources using the multiSourceSearch
    const allSources = await multiSourceSearch({
      query: topic,
      numResults: maxResults,
      sources: limitedSources,
    });
    
    // Step 2: Fetch content from top sources if needed
    let sourceContent = '';
    if (depth !== 'basic') {
      // For detailed and comprehensive research, fetch actual content
      const fetchPromises = allSources.slice(0, depth === 'detailed' ? 4 : 6).map(async (source) => {
        try {
          // Use absolute URL for fetch based on environment
          const baseUrl = typeof window !== 'undefined' 
            ? window.location.origin 
            : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          
          const fetchUrl = `${baseUrl}/api/fetch-webpage?url=${encodeURIComponent(source.link)}`;
          const response = await fetch(fetchUrl);
          const data = await response.json();
          return data.content;
        } catch (error) {
          console.error(`Error fetching content from ${source.link}:`, error);
          return source.snippet;
        }
      });
      
      const fetchedContent = await Promise.all(fetchPromises);
      sourceContent = fetchedContent.join('\n\n');
    } else {
      // For basic research, just use snippets
      sourceContent = allSources.map(source => source.snippet).join('\n\n');
    }
    
    // Step 3: Generate research summary based on depth
    const researchPrompt = generateResearchPrompt(topic, sourceContent, depth, limitedSources);
    
    // Calculate max tokens based on depth and model
    const getMaxTokens = (depth: 'basic' | 'detailed' | 'comprehensive', model: string): number => {
      // Default token limits for different depth levels
      const defaultTokens = {
        basic: 1500,     // ~1000 words
        detailed: 3000,  // ~2000+ words
        comprehensive: 8000  // ~5000+ words
      };
      
      // Adjust based on model capabilities
      if (model.includes('32k') || model.includes('turbo') || model.includes('claude-3')) {
        // Models with large context windows can handle more tokens
        return {
          basic: 2000,     // ~1200+ words
          detailed: 5000,  // ~3000+ words 
          comprehensive: 12000  // ~7000+ words
        }[depth];
      }
      
      return defaultTokens[depth];
    };
    
    // Use the helper function to determine max tokens
    const maxTokens = getMaxTokens(depth, model);
    
    const aiResponse = await generateAIResponse({
      provider: provider as any,
      model,
      prompt: researchPrompt,
      temperature: 0.5,
      max_tokens: maxTokens,
      isServerSide,
    });
    
    // Step 4: For comprehensive and detailed research, generate additional analysis
    let detailedAnalysis;
    let relatedTopics;
    
    if (depth === 'comprehensive' || depth === 'detailed') {
      // Generate deeper analysis
      const analysisPrompt = `
Based on the research about "${topic}" from sources including ${limitedSources.join(', ')}, provide a detailed analysis including:
1. Historical context
2. Current state and important developments
3. Future implications
4. Controversies or debates
5. Expert opinions
6. Comparative analysis
7. Practical applications
      `;
      
      const relatedTopicsPrompt = `
Based on the research about "${topic}" from multiple sources including ${limitedSources.join(', ')}, suggest 7-10 closely related topics that would be valuable for further research. For each topic, provide a brief explanation of its relevance to "${topic}".
      `;
      
      // Determine token limits based on model capabilities for detailed analysis
      const analysisTokens = model.includes('32k') || model.includes('turbo') || model.includes('claude-3')
        ? depth === 'detailed' ? 3000 : 5000
        : depth === 'detailed' ? 2000 : 3000;
        
      // Determine token limits for related topics
      const topicsTokens = model.includes('32k') || model.includes('turbo') || model.includes('claude-3')
        ? 2000
        : 1500;
      
      const [analysisResponse, topicsResponse] = await Promise.all([
        generateAIResponse({
          provider: provider as any,
          model,
          prompt: analysisPrompt,
          temperature: 0.7,
          max_tokens: analysisTokens,
          isServerSide,
        }),
        generateAIResponse({
          provider: provider as any,
          model,
          prompt: relatedTopicsPrompt,
          temperature: 0.8,
          max_tokens: topicsTokens,
          isServerSide,
        }),
      ]);
      
      detailedAnalysis = analysisResponse.content;
      relatedTopics = topicsResponse.content.split('\n').filter(line => line.trim().length > 0);
    }
    
    return {
      summary: aiResponse.content,
      sources: includeSources ? allSources : [],
      detailedAnalysis,
      relatedTopics,
    };
  } catch (error) {
    console.error('Error conducting research:', error);
    throw new Error(`Research failed: ${error.message}`);
  }
}

/**
 * Helper function to generate appropriate research prompts based on depth
 */
function generateResearchPrompt(
  topic: string, 
  content: string, 
  depth: 'basic' | 'detailed' | 'comprehensive',
  sources: string[]
): string {
  let prompt = '';
  const sourcesList = sources.join(', ');
  
  switch (depth) {
    case 'basic':
      prompt = `
Please provide a concise but substantial summary of the topic "${topic}" based on the following information from multiple sources (${sourcesList}):
${content}

Your summary should:
1. Be approximately 1000 words
2. Cover the most important facts and concepts
3. Be accurate, educational, and well-structured
4. Use clear, accessible language 
5. Synthesize information from multiple sources
6. Include section headings for better organization
      `;
      break;
      
    case 'detailed':
      prompt = `
Please provide a detailed research summary of the topic "${topic}" based on the following information from multiple sources (${sourcesList}):
${content}

Your summary should:
1. Be approximately 2000-3000 words
2. Provide in-depth explanation of key concepts
3. Include important facts, definitions, and context
4. Organize information logically with clear section headings
5. Mention significant debates or different perspectives
6. Be educational and suitable for someone wanting to learn deeply about this topic
7. Synthesize information from multiple sources, noting any conflicting information
8. Include a conclusion section that summarizes key points
      `;
      break;
      
    case 'comprehensive':
      prompt = `
Please provide a comprehensive research report on the topic "${topic}" based on the following information from multiple sources (${sourcesList}):
${content}

Your report should:
1. Be thorough and detailed (approximately 5000+ words)
2. Start with an executive summary of key findings
3. Include a table of contents with clearly defined sections
4. Provide extensive background and context
5. Analyze trends, patterns, and developments
6. Present multiple perspectives and interpretations
7. Discuss implications and potential future developments
8. Organize information into clear sections with logical flow
9. Be scholarly in tone while remaining accessible
10. Include relevant examples, cases, or applications
11. Synthesize information from multiple sources, comparing and contrasting viewpoints
12. End with a comprehensive conclusion section
13. Ensure citations to sources are mentioned throughout the text
      `;
      break;
  }
  
  return prompt;
} 