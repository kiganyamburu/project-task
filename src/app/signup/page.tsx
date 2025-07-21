"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    experience: "beginner",
    goals: [] as string[],
    timeCommitment: "5-10",
    githubUsername: "",
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const experienceLevels = [
    {
      value: "beginner",
      label: "Beginner",
      description: "0-1 years of coding experience",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "1-3 years of coding experience",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "3+ years of coding experience",
    },
  ];

  const careerGoals = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Game Developer",
  ];

  const timeCommitments = [
    { value: "2-5", label: "2-5 hours/week", description: "Light commitment" },
    {
      value: "5-10",
      label: "5-10 hours/week",
      description: "Moderate commitment",
    },
    {
      value: "10-20",
      label: "10-20 hours/week",
      description: "Heavy commitment",
    },
    {
      value: "20+",
      label: "20+ hours/week",
      description: "Intensive learning",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }

    // Final submission
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store the authentication token
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Redirect to dashboard or home page
        router.push('/');
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-indigo-600">CodePath</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start your personalized coding journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                      num <= step
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        num < step ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Step {step} of 3
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="githubUsername"
                    className="block text-sm font-medium text-gray-700"
                  >
                    GitHub Username
                  </label>
                  <input
                    id="githubUsername"
                    name="githubUsername"
                    type="text"
                    value={formData.githubUsername}
                    onChange={handleInputChange}
                    placeholder="your-github-username"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We&apos;ll analyze your repositories to better understand
                    your skills
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Experience
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Current Experience Level
                  </label>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <label key={level.value} className="flex items-start">
                        <input
                          type="radio"
                          name="experience"
                          value={level.value}
                          checked={formData.experience === level.value}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {level.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {level.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Career Goals (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {careerGoals.map((goal) => (
                      <label key={goal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {goal}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Learning Preferences
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Time Commitment
                  </label>
                  <div className="space-y-3">
                    {timeCommitments.map((time) => (
                      <label key={time.value} className="flex items-start">
                        <input
                          type="radio"
                          name="timeCommitment"
                          value={time.value}
                          checked={formData.timeCommitment === time.value}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {time.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {time.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-900 mb-2">
                    Summary
                  </h4>
                  <div className="text-sm text-indigo-700 space-y-1">
                    <p>
                      <strong>Experience:</strong> {formData.experience}
                    </p>
                    <p>
                      <strong>Goals:</strong>{" "}
                      {formData.goals.join(", ") || "None selected"}
                    </p>
                    <p>
                      <strong>Time Commitment:</strong>{" "}
                      {formData.timeCommitment} hours/week
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Previous
                </button>
              )}

              <div className="flex-1" />

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
