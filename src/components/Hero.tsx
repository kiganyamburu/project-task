import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Find Your Perfect
          <span className="block text-indigo-200">Coding Project</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
          Stop wasting time on projects that don&apos;t advance your career. Our
          AI-powered platform matches you with coding projects perfectly aligned
          to your skills, goals, and growth trajectory.
        </p>
        <div className="mt-10 flex justify-center space-x-6">
          <Link
            href="/signup"
            className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-50 transition duration-300"
          >
            Get Started Free
          </Link>
          <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-300">
            Watch Demo
          </button>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-indigo-200">Curated Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">98%</div>
            <div className="text-indigo-200">Match Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">12x</div>
            <div className="text-indigo-200">Faster Learning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
