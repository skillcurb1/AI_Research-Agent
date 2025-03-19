import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/app/lib/ai-service';
import { ModelProvider } from '@/app/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required parameters
    const { provider, model, prompt, temperature, max_tokens } = body;
    
    if (!provider || !model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters: provider, model, prompt' },
        { status: 400 }
      );
    }
    
    // Generate AI response with explicit server-side flag
    const response = await generateAIResponse({
      provider: provider as ModelProvider,
      model,
      prompt,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 10000,
      isServerSide: true,
    });
    
    // Return results
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Completion API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    );
  }
} 