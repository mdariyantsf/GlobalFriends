# AI Use Disclosure — GlobalFriends

## AI tools used while building the project
- **ChatGPT (OpenAI):** helped plan the structure and drafted the first source files, configuration and SQL schema.
- **Lovable:** produced the initial visual-only prototype (layout and styling, sample content, no backend).
- **Claude (Anthropic):** reviewed the repository against the hackathon rules, fixed a missing-file build error, removed the leftover sample profiles, added the admin panel and its database rules, and rewrote the documentation.

Ariyan Tausif is responsible for reviewing, testing and explaining the final project.

## "Intelligence" features inside the app
- Peer recommendations use a hand-written scoring formula (shared interests, skills, learning goals, complementary skills).
- Learning roadmaps are chosen from hand-written templates using keyword rules.
- These are rule-based features. They are not generative AI, not machine-learning models, and they call no external AI service.
- Text typed on the Intelligence page stays in the browser and is not saved or sent anywhere.

If a real AI model is added later, this file must be updated with the provider, what data is sent and the safeguards.
