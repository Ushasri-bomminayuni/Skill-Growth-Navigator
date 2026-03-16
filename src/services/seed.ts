import { createOpportunity } from "./database";

const INITIAL_OPPORTUNITIES = [
  {
    title: "Google STEP Internship 2024",
    organization: "Google",
    category: "Internships",
    description: "STEP (Student Training in Engineering Program), formerly known as Engineering Practicum, is a 12-week internship for first and second-year undergraduate students with a passion for computer science.",
    skills_required: ["Java", "Python", "C++", "Data Structures"],
    deadline: "2024-11-15T00:00:00.000Z",
    location: "Mountain View, CA / Remote",
    apply_link: "https://careers.google.com/jobs/results/step-intern-2024/",
    eligibility: "First or second-year undergraduate students pursuing a Bachelor's degree in Computer Science.",
    benefits: "Competitive stipend, mentorship, housing support.",
    application_steps: "Online application, technical interviews, host matching.",
    verified: true
  },
  {
    title: "Generation Google Scholarship",
    organization: "Google",
    category: "Scholarships",
    description: "The Generation Google Scholarship was established to help aspiring computer scientists excel in technology and become leaders in the field.",
    skills_required: ["Leadership", "Community Engagement", "Academic Excellence"],
    deadline: "2024-12-01T00:00:00.000Z",
    location: "Global",
    apply_link: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship/",
    eligibility: "Currently enrolled as a full-time student in a Bachelor's program.",
    benefits: "Financial award of $10,000 USD (or local equivalent).",
    application_steps: "Online application, essay responses, academic transcripts.",
    verified: true
  },
  {
    title: "Microsoft Imagine Cup 2024",
    organization: "Microsoft",
    category: "Competitions",
    description: "Imagine Cup is more than just a competition. It’s an opportunity to build with technology, learn from mentors, and make an impact on the world.",
    skills_required: ["Azure", "Software Development", "Pitching", "Innovation"],
    deadline: "2024-10-30T00:00:00.000Z",
    location: "Global / Finals in Seattle",
    apply_link: "https://imaginecup.microsoft.com/",
    eligibility: "Students aged 16+ enrolled in an accredited educational institution.",
    benefits: "$100,000 USD grand prize, mentorship from Microsoft CEO.",
    application_steps: "Register, submit project proposal, regional semifinals, world finals.",
    verified: true
  },
  {
    title: "Meta University (Engineering)",
    organization: "Meta",
    category: "Internships",
    description: "Meta University is an 8-week early career program for students from underrepresented communities to gain skills and experience in software engineering.",
    skills_required: ["Problem Solving", "Growth Mindset", "Foundational Coding"],
    deadline: "2024-11-20T00:00:00.000Z",
    location: "Menlo Park, CA / Remote",
    apply_link: "https://www.metacareers.com/students/",
    eligibility: "Current second-year undergraduate students.",
    benefits: "Hands-on experience, competitive pay, networking.",
    application_steps: "Application, logic-based assessment, interviews.",
    verified: true
  },
  {
    title: "Adobe Research Fellowship",
    organization: "Adobe",
    category: "Fellowships",
    description: "The Adobe Research Fellowship program recognizes outstanding graduate students who are doing exceptional research in areas of importance to Adobe.",
    skills_required: ["Research", "Computer Graphics", "AI/ML", "Creative Tools"],
    deadline: "2024-12-15T00:00:00.000Z",
    location: "San Jose, CA",
    apply_link: "https://research.adobe.com/fellowship/",
    eligibility: "Full-time Ph.D. students.",
    benefits: "$10,000 USD award, internship at Adobe Research.",
    application_steps: "CV, research statement, 3 recommendation letters.",
    verified: true
  }
];

export const seedInitialOpportunities = async () => {
  console.log("Starting database seed...");
  try {
    const results = await Promise.all(
      INITIAL_OPPORTUNITIES.map(opp => createOpportunity(opp))
    );
    console.log(`Successfully seeded ${results.length} opportunities.`);
    return true;
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
};
