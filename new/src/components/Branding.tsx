export default function Branding() {
  const colorPalette = [
    { name: "Primary", bg: "bg-indigo-600", text: "text-white" },
    { name: "Secondary", bg: "bg-indigo-500", text: "text-white" },
    { name: "Accent", bg: "bg-indigo-400", text: "text-white" },
    { name: "Dark", bg: "bg-gray-800", text: "text-white" },
    { name: "Light", bg: "bg-gray-200", text: "text-gray-800" },
    {
      name: "Background",
      bg: "bg-white border border-gray-200",
      text: "text-gray-800",
    },
  ];

  const toneExamples = [
    {
      tone: "Professional",
      color: "text-indigo-600",
      example:
        "Our algorithm evaluates 27 factors to match you with optimal projects for skill growth.",
    },
    {
      tone: "Encouraging",
      color: "text-indigo-600",
      example:
        "Great job completing that React project! Ready to level up with these slightly more challenging options?",
    },
    {
      tone: "Concise",
      color: "text-indigo-600",
      example:
        "Python • 8-12 hrs • Data visualization • Matches 3/5 of your skills",
    },
  ];

  const differentiators = [
    {
      icon: "👤",
      title: "Hyper-Personalization",
      description:
        "Goes beyond simple skill matching to consider career goals, learning style, and time constraints.",
    },
    {
      icon: "🔗",
      title: "Project Sequencing",
      description:
        "Recommends not just individual projects but strategic sequences that build expertise systematically.",
    },
    {
      icon: "📈",
      title: "Career Alignment",
      description:
        "Focuses on projects that have maximum impact on career advancement based on real market data.",
    },
  ];

  return (
    <div className="py-16 bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Brand Identity
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Professional yet approachable for developers
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Visual Style
            </h3>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {colorPalette.map((color, index) => (
                <div
                  key={index}
                  className={`${color.bg} h-20 rounded-md flex items-center justify-center`}
                >
                  <span className={`${color.text} font-medium`}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-gray-600">
              Clean, modern interface with a focus on readability and
              developer-friendly aesthetics. Uses monospace fonts for code
              elements alongside clean sans-serif for UI.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Tone of Voice
            </h3>
            <div className="mt-6 space-y-4">
              {toneExamples.map((example, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className={`font-medium ${example.color}`}>
                    {example.tone}
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    &quot;{example.example}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Differentiation
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {differentiators.map((diff, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm text-center"
              >
                <div className="h-12 w-12 mx-auto flex items-center justify-center bg-indigo-100 rounded-full">
                  <span className="text-2xl">{diff.icon}</span>
                </div>
                <h4 className="mt-4 font-medium text-gray-900">{diff.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{diff.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
