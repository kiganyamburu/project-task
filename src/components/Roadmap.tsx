export default function Roadmap() {
  const phases = [
    {
      phase: "MVP",
      duration: "Month 1-2",
      description:
        "Core matching algorithm with basic user profiles and project database",
      number: "1",
      features: [
        "GitHub integration and skill extraction",
        "Basic project recommendation engine",
        "Simple user dashboard and project browser",
        "Core matching algorithm (rule-based)",
      ],
      focus: [
        "Validate core concept with early users",
        "Basic recommendation accuracy",
        "User onboarding flow optimization",
      ],
    },
    {
      phase: "Beta",
      duration: "Month 3-4",
      description:
        "Enhanced features with early user testing and feedback incorporation",
      number: "2",
      features: [
        "Machine learning recommendation improvements",
        "Community features (reviews, discussions)",
        "Progress tracking and skill analytics",
        "LinkedIn and portfolio integrations",
      ],
      focus: [
        "Improve recommendation quality",
        "Build engaged user community",
        "Gather comprehensive user feedback",
      ],
    },
    {
      phase: "v1.0",
      duration: "Month 5-6",
      description:
        "Full-featured platform with AI-powered recommendations and community features",
      number: "3",
      features: [
        "Advanced ML models for personalization",
        "Mentor matching and code review system",
        "Career path planning and goal setting",
        "Mobile app and API access",
      ],
      focus: [
        "Scale to larger user base",
        "Monetization strategy implementation",
        "Enterprise partnerships",
      ],
    },
  ];

  return (
    <div id="roadmap" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Development Roadmap
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            From MVP to full-featured platform
          </p>
        </div>

        <div className="mt-12">
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-0 left-1/2 h-full w-1 bg-indigo-200 transform -translate-x-1/2"></div>

            {phases.map((phase, index) => (
              <div
                key={index}
                className={`relative mb-16 md:flex items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`md:w-1/2 ${
                    index % 2 === 1 ? "md:pl-12" : "md:pr-12 md:text-right"
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {phase.phase} ({phase.duration})
                  </h3>
                  <p className="mt-2 text-gray-600">{phase.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    {phase.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`flex items-start ${
                          index % 2 === 1 ? "" : "md:justify-end"
                        }`}
                      >
                        <span className="text-indigo-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 text-white mx-auto">
                  <span className="font-bold">{phase.number}</span>
                </div>
                <div
                  className={`md:w-1/2 ${
                    index % 2 === 1
                      ? "md:pr-12 md:text-right order-1"
                      : "md:pl-12"
                  } mt-4 md:mt-0`}
                >
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Focus Areas</h4>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {phase.focus.map((focus, focusIndex) => (
                        <li
                          key={focusIndex}
                          className={`flex items-start ${
                            index % 2 === 1 ? "md:justify-end" : ""
                          }`}
                        >
                          <span className="text-indigo-500 mr-2">✓</span>
                          {focus}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
