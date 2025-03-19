import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function GET(request: NextRequest) {
  try {
    // Make the API request to Ollama
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Format the models data
    const models = data.models || [];
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    
    // Return an empty array instead of an error for better UX
    return NextResponse.json(
      { models: [] },
      { status: 200 }
    );
  }
} 