import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

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
    
    if (!SERPER_API_KEY) {
      return NextResponse.json(
        { error: 'Search API key is not configured on the server' },
        { status: 500 }
      );
    }
    
    // Make the API request to Serper for News results
    const response = await axios.post(
      'https://google.serper.dev/news',
      { q: query },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const newsItems = response.data.news || [];
    
    const results = newsItems.map((item, index) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || item.description || '',
      source: 'news',
      position: index + 1,
    }));
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in News search API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform news search' },
      { status: 500 }
    );
  }
} 