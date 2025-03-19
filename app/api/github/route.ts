import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get query parameter
    const query = request.nextUrl.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing required parameter: query' },
        { status: 400 }
      );
    }
    
    // Make the API request to GitHub
    const githubUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
    const response = await axios.get(githubUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ResearchGPT-Agent',
      }
    });
    
    const items = response.data?.items || [];
    
    const results = items.slice(0, 5).map((item, index) => ({
      title: item.name || '',
      link: item.html_url || '',
      snippet: item.description || '',
      source: 'github',
      position: index + 1,
    }));
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in GitHub search API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform GitHub search' },
      { status: 500 }
    );
  }
} 