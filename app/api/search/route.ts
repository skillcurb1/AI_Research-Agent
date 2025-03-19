import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const numResults = parseInt(searchParams.get('num') || '5', 10);
    
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
    
    // Make the API request to Serper
    const response = await axios.post(
      SERPER_API_URL,
      { q: query, num: numResults },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = response.data;
    const organicResults = data.organic || [];
    
    const results = organicResults.map((result, index) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      source: 'google',
      position: index + 1,
    }));
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform search' },
      { status: 500 }
    );
  }
} 