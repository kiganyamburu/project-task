export default function Features() {
  const features = [
    {
      icon: "🎯",
      title: "Personalized Matching",
      description:
        "AI analyzes your GitHub, skills, and goals to recommend projects that perfectly match your development level and career aspirations.",
    },
    {
      icon: "📈",
      title: "Skill Progression Tracking",
      description:
        "See exactly how each project will advance your skills with detailed breakdowns of technologies, concepts, and difficulty progression.",
    },
    {
      icon: "⏱️",
      title: "Time-Smart Recommendations",
      description:
        "Projects matched to your available time commitment, from 2-hour challenges to multi-week portfolio builders.",
    },
    {
      icon: "🏆",
      title: "Career-Focused Curation",
      description:
        "Every recommendation is evaluated for real-world relevance and impact on your employability in your target tech roles.",
    },
    {
      icon: "🤝",
      title: "Community Learning",
      description:
        "Connect with other developers working on similar projects, share progress, and get feedback from experienced mentors.",
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description:
        "Detailed insights into your learning velocity, skill gaps, and market-relevant expertise development over time.",
    },
  ];

  return (
    <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Developers Love CodePath
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Stop building random projects. Start building your career
            strategically.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center text-3xl bg-indigo-500 rounded-md shadow-lg p-3 mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
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
