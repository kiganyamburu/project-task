import Link from "next/link";

export default function CTA() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to find your perfect project?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
          Join our beta program and never waste time on mismatched projects
          again.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-50 transition duration-300"
            >
              Get Early Access
            </Link>
          </div>
          <div className="ml-3 inline-flex">
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
