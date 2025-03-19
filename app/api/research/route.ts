import { NextRequest, NextResponse } from 'next/server';
import { conductResearch } from '@/app/lib/research-service';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required parameters
    const { topic, provider, model, depth, includeSources } = body;
    
    if (!topic || !provider || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters: topic, provider, model' },
        { status: 400 }
      );
    }
    
    // Conduct research
    const researchResults = await conductResearch({
      topic,
      provider,
      model,
      depth: depth || 'basic',
      includeSources: includeSources ?? true,
      isServerSide: true, // Signal that this is running server-side
    });
    
    // Return results
    return NextResponse.json(researchResults);
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to conduct research' },
      { status: 500 }
    );
  }
} 