import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    // Get URL from query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 400 }
      );
    }
    
    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    // Parse HTML content
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, meta, link, noscript, iframe, svg').remove();
    
    // Get main content (focus on main tags, article tags, or body)
    let content = '';
    
    // Try to find main content containers
    const mainContent = $('main, article, .content, .article, .post, .entry');
    
    if (mainContent.length > 0) {
      // If we found main content containers, use those
      content = mainContent.text();
    } else {
      // Otherwise, get content from body with some basic cleaning
      content = $('body').text();
    }
    
    // Clean up content
    content = content
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim();
    
    // Limit content length to avoid overwhelming the model
    const maxLength = 8000;
    
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Error fetching webpage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch webpage content' },
      { status: 500 }
    );
  }
} 