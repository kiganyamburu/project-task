export default function TechStack() {
  const techStacks = [
    {
      category: "Frontend",
      icon: "🎨",
      color: "blue",
      technologies: [
        "React/Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
      ],
    },
    {
      category: "Backend",
      icon: "⚙️",
      color: "green",
      technologies: [
        "Node.js/Python",
        "FastAPI/Express",
        "PostgreSQL",
        "Redis",
      ],
    },
    {
      category: "AI/ML",
      icon: "🤖",
      color: "purple",
      technologies: ["TensorFlow", "Scikit-learn", "OpenAI API", "Vector DB"],
    },
    {
      category: "DevOps",
      icon: "🚀",
      color: "yellow",
      technologies: ["Kubernetes", "AWS/GCP", "GitHub Actions"],
    },
  ];

  const integrations = [
    { name: "GitHub", icon: "📁", color: "gray-800" },
    { name: "LinkedIn", icon: "💼", color: "blue-700" },
    { name: "Dev.to", icon: "💻", color: "gray-800" },
    { name: "Stack Overflow", icon: "📚", color: "orange-500" },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      yellow: "bg-yellow-50",
    };
    return colorMap[color] || "bg-gray-50";
  };

  return (
    <div id="tech" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Recommended Tech Stack
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            For rapid MVP development with scalability
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {techStacks.map((stack, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm text-center"
              >
                <div
                  className={`h-16 w-16 mx-auto flex items-center justify-center ${getColorClasses(
                    stack.color
                  )} rounded-full`}
                >
                  <span className="text-2xl">{stack.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {stack.category}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={techIndex}>{tech}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              Key Integrations
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {integrations.map((integration, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-3xl mb-2">{integration.icon}</span>
                  <span className="text-sm font-medium">
                    {integration.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
