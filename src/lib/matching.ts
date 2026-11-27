import type { Profile } from "./types";

export type MatchResult = {
  profile: Profile;
  score: number;
  sharedInterests: string[];
  sharedSkills: string[];
  sharedGoals: string[];
  complementarySkills: string[];
  reasons: string[];
};

const normalize = (values: string[] = []) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const overlap = (a: string[] = [], b: string[] = []) => {
  const right = new Set(b.map((value) => value.toLocaleLowerCase()));
  return normalize(a).filter((value) => right.has(value.toLocaleLowerCase()));
};

const containsAny = (text: string[], values: string[]) => {
  const haystack = text.join(" ").toLocaleLowerCase();
  return values.some((value) => haystack.includes(value.toLocaleLowerCase()));
};

/**
 * Explainable, deterministic peer recommendations.
 * This is a hand-written scoring algorithm, not generative AI or a trained ML model.
 */
export function rankPeers(current: Profile, candidates: Profile[]): MatchResult[] {
  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((profile) => {
      const sharedInterests = overlap(current.interests, profile.interests);
      const sharedSkills = overlap(current.skills, profile.skills);
      const sharedGoals = overlap(current.learning_goals, profile.learning_goals);

      // A complementary skill is useful when one student's skill relates to
      // the other student's stated learning goal, even if they do not share it.
      const currentGoals = current.learning_goals;
      const candidateGoals = profile.learning_goals;
      const complementarySkills = [
        ...normalize(profile.skills).filter((skill) => containsAny(currentGoals, [skill])),
        ...normalize(current.skills).filter((skill) => containsAny(candidateGoals, [skill]))
      ].filter((skill, index, all) => all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index);

      const interestScore = Math.min(30, sharedInterests.length * 10);
      const skillScore = Math.min(20, sharedSkills.length * 10);
      const goalScore = Math.min(35, sharedGoals.length * 17.5);
      const complementaryScore = Math.min(15, complementarySkills.length * 7.5);
      const score = Math.round(interestScore + skillScore + goalScore + complementaryScore);

      const reasons: string[] = [];
      if (sharedInterests.length) reasons.push(`You both enjoy ${sharedInterests.slice(0, 2).join(" and ")}`);
      if (sharedGoals.length) reasons.push(`You share the goal: ${sharedGoals[0]}`);
      if (complementarySkills.length) reasons.push(`${profile.display_name} may help with ${complementarySkills[0]}`);
      if (sharedSkills.length) reasons.push(`You have experience in ${sharedSkills[0]}`);

      return { profile, score, sharedInterests, sharedSkills, sharedGoals, complementarySkills, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.profile.display_name.localeCompare(b.profile.display_name));
}
