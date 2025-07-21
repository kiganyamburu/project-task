export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Your Profiles",
      description:
        "Link your GitHub, LinkedIn, and portfolio to give us a complete picture of your current skills and experience.",
      details: [
        "GitHub repository analysis",
        "Skill extraction from your code",
        "Career goal assessment",
        "Learning preference identification",
      ],
    },
    {
      step: "02",
      title: "Get Matched Projects",
      description:
        "Our AI recommends projects that perfectly balance challenge and achievability based on your unique profile.",
      details: [
        "Difficulty calibrated to your level",
        "Time commitment matching your schedule",
        "Technologies aligned with your goals",
        "Progressive skill building sequences",
      ],
    },
    {
      step: "03",
      title: "Build & Grow",
      description:
        "Work on projects with guided resources, community support, and real-time progress tracking.",
      details: [
        "Step-by-step implementation guides",
        "Code review and feedback systems",
        "Peer collaboration opportunities",
        "Skill progression analytics",
      ],
    },
  ];

  return (
    <div id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How CodePath Works
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Three simple steps to accelerated learning and career growth
          </p>
        </div>

        <div className="mt-16">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start">
                    <div className="flex items-center justify-center w-16 h-16 bg-indigo-500 text-white text-xl font-bold rounded-full">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-start lg:justify-start justify-center"
                      >
                        <span className="text-indigo-500 mr-2">✓</span>
                        <span className="text-sm text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
