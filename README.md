# Research-Agent - AI Research Assistant

Research-Agent is an advanced AI-powered research assistant that leverages multiple language model providers (OpenAI, Anthropic, and Ollama) to conduct comprehensive research on any topic using internet resources.

## Features

- **Multi-model LLM Support**
  - OpenAI API integration (GPT-4, GPT-3.5)
  - Anthropic API integration (Claude models)
  - Local Ollama model support
  
- **Research Capabilities**
  - Web search integration
  - Wikipedia data extraction
  - Source citation and tracking
  - Comprehensive summarization
  - In-depth analysis
  
- **User Experience**
  - Clean, modern interface
  - Research history tracking
  - Customizable research parameters
  - Exportable research reports
  - Interactive research refinement

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Create a `.env.local` file with the following variables:

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SERPER_API_KEY=your_serper_key
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes, Serverless functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **APIs**: OpenAI, Anthropic, Serper.dev, Wikipedia
- **Deployment**: Vercel

## Project Structure

```
/app
  /api             # API routes
  /components      # Reusable UI components
  /(routes)        # App routes
  /lib             # Utility functions and libraries
  /hooks           # Custom React hooks
  /types           # TypeScript type definitions
  /styles          # Global styles
  /providers       # Context providers
/prisma            # Database schema and migrations
/public            # Static assets
```

## License

MIT
