export default function RecommendationEngine() {
  const matchingFactors = [
    {
      icon: "💻",
      title: "Technical Skill Level",
      description:
        "Analyzes your GitHub commits, project complexity, and code quality to assess your current programming proficiency across different languages and frameworks.",
    },
    {
      icon: "🎯",
      title: "Career Goals",
      description:
        "Matches projects to your target role (frontend, backend, full-stack, DevOps, etc.) and desired career progression timeline.",
    },
    {
      icon: "⏰",
      title: "Time Availability",
      description:
        "Considers your schedule constraints and commitment level to recommend projects with appropriate scope and duration.",
    },
    {
      icon: "📚",
      title: "Learning Style",
      description:
        "Adapts recommendations based on your preference for tutorial-guided, documentation-heavy, or experimental learning approaches.",
    },
    {
      icon: "🏢",
      title: "Industry Context",
      description:
        "Prioritizes projects using technologies and patterns commonly found in your target industry or company type.",
    },
    {
      icon: "🚀",
      title: "Portfolio Impact",
      description:
        "Evaluates how each project will enhance your portfolio&apos;s appeal to recruiters and technical interviewers.",
    },
  ];

  const ruleBasedFilters = [
    "Hard requirement matching (languages, frameworks)",
    "Minimum/maximum difficulty thresholds",
    "Time commitment boundaries",
    "Prerequisites and dependency checking",
  ];

  const mlRanking = [
    "Career goal alignment scoring",
    "Skill progression optimization",
    "Personal interest prediction",
    "Success probability estimation",
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Advanced Recommendation Engine
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our AI considers 27+ factors to find your perfect project match
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {matchingFactors.map((factor, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{factor.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {factor.title}
                </h3>
              </div>
              <p className="text-gray-600">{factor.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-indigo-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            Hybrid Recommendation Approach
          </h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-indigo-700">
                Rule-Based Filtering
              </h4>
              <ul className="mt-2 space-y-2 text-gray-600">
                {ruleBasedFilters.map((filter, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    {filter}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-indigo-700">
                Machine Learning Ranking
              </h4>
              <ul className="mt-2 space-y-2 text-gray-600">
                {mlRanking.map((ranking, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    {ranking}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
