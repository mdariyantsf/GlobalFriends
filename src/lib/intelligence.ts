export type RoadmapStep = {
  title: string;
  description: string;
  outcome: string;
};

const roadmapLibrary: Array<{
  keywords: string[];
  title: string;
  steps: RoadmapStep[];
}> = [
  {
    keywords: ["website", "web", "app", "coding", "software", "programming", "python", "javascript", "html", "react"],
    title: "Build a digital project",
    steps: [
      { title: "Define the problem", description: "Write one clear sentence describing who your project helps and what problem it addresses.", outcome: "A focused project brief" },
      { title: "Learn the foundations", description: "Review HTML, CSS, JavaScript, and the basics of accessible interface design.", outcome: "A small practice page" },
      { title: "Create a first version", description: "Build one useful feature before adding extra pages or complex tools.", outcome: "A working prototype" },
      { title: "Test with learners", description: "Ask a few trusted classmates to try the prototype and note where they get confused.", outcome: "A short feedback list" },
      { title: "Improve and present", description: "Fix the most important issues and explain the problem, design choices, and limitations.", outcome: "A clearer project demo" }
    ]
  },
  {
    keywords: ["research", "science", "climate", "environment", "data", "robotics"],
    title: "Complete a student research project",
    steps: [
      { title: "Choose a research question", description: "Turn your broad interest into one specific, answerable question.", outcome: "A focused research question" },
      { title: "Review reliable sources", description: "Compare information from credible scientific, educational, or public-data sources.", outcome: "A source notebook" },
      { title: "Plan your method", description: "Decide what evidence you need and how you will collect or analyze it safely.", outcome: "A simple research plan" },
      { title: "Analyze the evidence", description: "Organize observations or data, explain patterns, and note uncertainty.", outcome: "A results summary" },
      { title: "Share your findings", description: "Prepare a short report or presentation that separates evidence from interpretation.", outcome: "A research presentation" }
    ]
  },
  {
    keywords: ["english", "language", "writing", "communication", "presentation"],
    title: "Strengthen communication skills",
    steps: [
      { title: "Set a practical target", description: "Choose one real task, such as introducing a project or writing a short explanation.", outcome: "A measurable practice goal" },
      { title: "Build useful vocabulary", description: "Collect topic-specific words and write a simple example sentence for each.", outcome: "A personal vocabulary list" },
      { title: "Practice in small pieces", description: "Write or speak for a few minutes, then revise for clarity and accuracy.", outcome: "A first draft or recording" },
      { title: "Get constructive feedback", description: "Ask a teacher or trusted peer to identify one strength and one improvement.", outcome: "A focused feedback note" },
      { title: "Repeat with a new topic", description: "Apply the feedback to a second task and compare what became clearer.", outcome: "A stronger second attempt" }
    ]
  }
];

export function createLearningRoadmap(goal: string, skills: string[], interests: string[]): {
  title: string;
  steps: RoadmapStep[];
  context: string;
} {
  const text = `${goal} ${skills.join(" ")} ${interests.join(" ")}`.toLocaleLowerCase();
  const selected = roadmapLibrary.find((item) => item.keywords.some((keyword) => text.includes(keyword))) ?? {
    title: "Make steady progress toward your goal",
    steps: [
      { title: "Make the goal specific", description: "Describe what you want to be able to do and how you will know you have improved.", outcome: "A clear success target" },
      { title: "Find trusted learning material", description: "Choose one beginner-friendly course, book, or resource from a reliable source.", outcome: "A short resource list" },
      { title: "Practice one small skill", description: "Break the goal into a small task that you can complete and review.", outcome: "A completed practice task" },
      { title: "Create something that shows progress", description: "Apply what you learned in a short explanation, project, or demonstration.", outcome: "A piece of work to review" },
      { title: "Reflect and adjust", description: "Note what worked, what was difficult, and what you should learn next.", outcome: "Your next learning target" }
    ]
  };

  const contextParts = [
    goal.trim() ? `Goal: ${goal.trim()}` : "Goal: general skill development",
    skills.length ? `Skills considered: ${skills.join(", ")}` : "No current skills were entered",
    interests.length ? `Interests considered: ${interests.join(", ")}` : "No interests were entered"
  ];

  return { title: selected.title, steps: selected.steps, context: contextParts.join(" · ") };
}
