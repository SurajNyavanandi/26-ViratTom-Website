import SEO from '../components/SEO';
import AppleCard from '../components/AppleCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <SEO
        title="VIRAT TOM | Static and Dynamic Website Development"
        description="Static and Dynamic Website Development"
      />

      <main className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
        <AppleCard />
      </main>
    </div>
  );
}
