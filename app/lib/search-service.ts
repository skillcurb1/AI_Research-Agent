import axios from 'axios';

const SERPER_API_KEY = process.env.NEXT_PUBLIC_SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  position?: number;
}

export interface SearchParams {
  query: string;
  numResults?: number;
  sources?: string[]; // Array of sources to use for search
}

/**
 * Helper to determine if code is running in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Performs a web search using Serper API
 */
export async function webSearch({ 
  query, 
  numResults = 5 
}: SearchParams): Promise<SearchResult[]> {
  try {
    let response;
    
    // In the browser, we use fetch with the appropriate origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/search?query=${encodeURIComponent(query)}&num=${numResults}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, make a direct request to the Serper API
    else {
      if (!SERPER_API_KEY) {
        throw new Error('Search API key is not configured');
      }
      
      const serperResponse = await axios.post(
        SERPER_API_URL,
        { q: query, num: numResults },
        {
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const organicResults = serperResponse.data.organic || [];
      
      return organicResults.map((result, index) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        source: 'google',
        position: index + 1,
      }));
    }
    
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error performing web search:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Fetches content from a webpage
 */
export async function fetchWebpageContent(url: string): Promise<string> {
  try {
    let response;
    
    // In the browser, use fetch with proper origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/fetch-webpage?url=${encodeURIComponent(url)}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, use axios to directly fetch the content
    else {
      const webResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      return webResponse.data;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error fetching webpage content:', error);
    throw new Error(`Failed to fetch webpage content: ${error.message}`);
  }
}

/**
 * Searches Wikipedia for information
 */
export async function wikipediaSearch(query: string): Promise<SearchResult[]> {
  try {
    let response;
    
    // In the browser, use fetch with proper origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/wikipedia?query=${encodeURIComponent(query)}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, directly call the Wikipedia API
    else {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const wikiResponse = await axios.get(wikiUrl);
      
      const results = wikiResponse.data?.query?.search || [];
      
      return results.map((result, index) => ({
        title: result.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
        snippet: result.snippet.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML tags
        source: 'wikipedia',
        position: index + 1,
      }));
    }
    
    if (!response.ok) {
      throw new Error(`Wikipedia search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    throw new Error(`Wikipedia search failed: ${error.message}`);
  }
}

/**
 * Searches Scholar sources for academic information
 */
export async function scholarSearch(query: string): Promise<SearchResult[]> {
  try {
    let response;
    
    // In the browser, use fetch with proper origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/scholar?query=${encodeURIComponent(query)}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, make a direct request using Serper API with scholar parameter
    else {
      if (!SERPER_API_KEY) {
        throw new Error('Search API key is not configured');
      }
      
      const scholarResponse = await axios.post(
        'https://google.serper.dev/scholar',
        { q: query },
        {
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const organicResults = scholarResponse.data.organic || [];
      
      return organicResults.map((result, index) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || result.publication || '',
        source: 'scholar',
        position: index + 1,
      }));
    }
    
    if (!response.ok) {
      throw new Error(`Scholar search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching Scholar:', error);
    throw new Error(`Scholar search failed: ${error.message}`);
  }
}

/**
 * Searches GitHub for code and documentation
 */
export async function githubSearch(query: string): Promise<SearchResult[]> {
  try {
    let response;
    
    // In the browser, use fetch with proper origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/github?query=${encodeURIComponent(query)}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, directly call the GitHub search API
    else {
      const githubUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
      const githubResponse = await axios.get(githubUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ResearchGPT-Agent',
        }
      });
      
      const results = githubResponse.data?.items || [];
      
      return results.slice(0, 5).map((result, index) => ({
        title: result.name || '',
        link: result.html_url || '',
        snippet: result.description || '',
        source: 'github',
        position: index + 1,
      }));
    }
    
    if (!response.ok) {
      throw new Error(`GitHub search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching GitHub:', error);
    throw new Error(`GitHub search failed: ${error.message}`);
  }
}

/**
 * Searches news sources for current information
 */
export async function newsSearch(query: string): Promise<SearchResult[]> {
  try {
    let response;
    
    // In the browser, use fetch with proper origin
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/news?query=${encodeURIComponent(query)}`;
      response = await fetch(apiUrl);
    } 
    // In server environments, make a direct request using Serper API with news parameter
    else {
      if (!SERPER_API_KEY) {
        throw new Error('Search API key is not configured');
      }
      
      const newsResponse = await axios.post(
        'https://google.serper.dev/news',
        { q: query },
        {
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const articles = newsResponse.data.news || [];
      
      return articles.map((article, index) => ({
        title: article.title || '',
        link: article.link || '',
        snippet: article.snippet || article.description || '',
        source: 'news',
        position: index + 1,
      }));
    }
    
    if (!response.ok) {
      throw new Error(`News search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching News:', error);
    throw new Error(`News search failed: ${error.message}`);
  }
}

/**
 * Multi-source search - searches multiple sources and combines results
 */
export async function multiSourceSearch({
  query,
  numResults = 5,
  sources = ['web', 'wikipedia', 'news', 'scholar', 'github']
}: SearchParams): Promise<SearchResult[]> {
  try {
    // Initialize search promises based on requested sources
    const searchPromises: Promise<SearchResult[]>[] = [];
    
    if (sources.includes('web')) {
      searchPromises.push(webSearch({ query, numResults }));
    }
    
    if (sources.includes('wikipedia')) {
      searchPromises.push(wikipediaSearch(query));
    }
    
    if (sources.includes('scholar')) {
      searchPromises.push(scholarSearch(query));
    }
    
    if (sources.includes('github')) {
      searchPromises.push(githubSearch(query));
    }
    
    if (sources.includes('news')) {
      searchPromises.push(newsSearch(query));
    }
    
    // Execute all searches in parallel
    const results = await Promise.allSettled(searchPromises);
    
    // Combine and process results
    let allResults: SearchResult[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults = [...allResults, ...result.value];
      }
    });
    
    // De-duplicate and limit results
    const uniqueUrls = new Set<string>();
    const dedupedResults: SearchResult[] = [];
    
    for (const result of allResults) {
      if (!uniqueUrls.has(result.link) && dedupedResults.length < numResults) {
        uniqueUrls.add(result.link);
        dedupedResults.push(result);
      }
    }
    
    return dedupedResults;
  } catch (error) {
    console.error('Error in multi-source search:', error);
    throw new Error(`Multi-source search failed: ${error.message}`);
  }
} 