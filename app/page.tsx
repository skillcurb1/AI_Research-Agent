import ResearchForm from '@/app/components/ResearchForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="w-full max-w-4xl px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI Research Agent
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Conduct in-depth research on any topic using multiple sources and AI summaries
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full my-6"></div>
        </div>
        <ResearchForm />
      </div>
    </main>
  );
}
