import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { model, prompt, temperature, max_tokens } = body;
    
    // Validate required parameters
    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters: model, prompt' },
        { status: 400 }
      );
    }
    
    // Make the API request to Ollama
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature,
        max_tokens,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      response: data.response,
      prompt_eval_count: data.prompt_eval_count,
      eval_count: data.eval_count,
    });
  } catch (error) {
    console.error('Error in Ollama API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response from Ollama' },
      { status: 500 }
    );
  }
} 