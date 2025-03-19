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
    
    // Make the API request to Wikipedia
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const response = await axios.get(url);
    
    const results = response.data?.query?.search || [];
    
    const formattedResults = results.map((result, index) => ({
      title: result.title,
      link: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
      snippet: result.snippet.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML tags
      source: 'wikipedia',
      position: index + 1,
    }));
    
    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Error in Wikipedia API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Wikipedia' },
      { status: 500 }
    );
  }
} 