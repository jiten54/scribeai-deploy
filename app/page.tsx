import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">ScribeAI</h1>
      <p className="text-slate-300 max-w-xl">
        Prototype AI-powered audio scribing & meeting transcription app. 
        This build is deployment-ready for a separate Next.js frontend and Node.js + Socket.io backend.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
