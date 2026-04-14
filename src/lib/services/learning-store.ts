/**
 * Learning Store — persists feedback from reviewer + manual choices
 * Used by Creator agent to improve prompts over time
 * Used by Reviewer agent to calibrate approvals
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FEEDBACK_FILE = join(DATA_DIR, "feedback-history.json");
const CHOICES_FILE = join(DATA_DIR, "manual-choices.json");

async function ensureDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await readFile(file, "utf-8")); } catch { return fallback; }
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  await ensureDir();
  await writeFile(file, JSON.stringify(data, null, 2));
}

// ==================== FEEDBACK HISTORY ====================

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  postTitle: string;
  teamContext: string; // extracted team name
  prompt: string;
  approved: boolean;
  score: number;
  feedback: string;
  issues: string[];
  attempt: number;
}

export async function getFeedbackHistory(): Promise<FeedbackEntry[]> {
  return readJSON(FEEDBACK_FILE, []);
}

export async function addFeedback(entry: Omit<FeedbackEntry, "id" | "timestamp">): Promise<void> {
  const history = await getFeedbackHistory();
  history.push({
    ...entry,
    id: `fb_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  });
  // Keep last 200 entries
  if (history.length > 200) history.splice(0, history.length - 200);
  await writeJSON(FEEDBACK_FILE, history);
}

// Get recent rejections for a team to avoid repeating mistakes
export async function getTeamRejections(teamContext: string, limit: number = 10): Promise<FeedbackEntry[]> {
  const history = await getFeedbackHistory();
  const lower = teamContext.toLowerCase();
  return history
    .filter((e) => !e.approved && e.teamContext.toLowerCase().includes(lower))
    .slice(-limit);
}

// Get recent approvals for a team to learn what works
export async function getTeamApprovals(teamContext: string, limit: number = 5): Promise<FeedbackEntry[]> {
  const history = await getFeedbackHistory();
  const lower = teamContext.toLowerCase();
  return history
    .filter((e) => e.approved && e.score >= 7 && e.teamContext.toLowerCase().includes(lower))
    .slice(-limit);
}

// ==================== MANUAL CHOICES ====================

export interface ManualChoice {
  id: string;
  timestamp: string;
  postTitle: string;
  teamContext: string;
  chosenImageUrl: string;
  chosenImageType: "gallery" | "generated";
  rejectedPrompts: string[]; // prompts that were rejected before manual choice
}

export async function getManualChoices(): Promise<ManualChoice[]> {
  return readJSON(CHOICES_FILE, []);
}

export async function addManualChoice(entry: Omit<ManualChoice, "id" | "timestamp">): Promise<void> {
  const choices = await getManualChoices();
  choices.push({
    ...entry,
    id: `mc_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  });
  if (choices.length > 100) choices.splice(0, choices.length - 100);
  await writeJSON(CHOICES_FILE, choices);
}

// Get patterns: what type of images does the user prefer for a team?
export async function getTeamPreferences(teamContext: string): Promise<{
  prefersGallery: boolean;
  commonThemes: string[];
}> {
  const choices = await getManualChoices();
  const lower = teamContext.toLowerCase();
  const teamChoices = choices.filter((c) => c.teamContext.toLowerCase().includes(lower));

  if (teamChoices.length === 0) return { prefersGallery: false, commonThemes: [] };

  const galleryCount = teamChoices.filter((c) => c.chosenImageType === "gallery").length;
  const prefersGallery = galleryCount > teamChoices.length / 2;

  // Extract common themes from chosen gallery images (titles)
  const themes = teamChoices
    .filter((c) => c.chosenImageType === "gallery")
    .map((c) => c.chosenImageUrl)
    .slice(-5);

  return { prefersGallery, commonThemes: themes };
}

// ==================== LEARNING SUMMARY ====================

// Builds a context string for the Creator agent with learned lessons
export async function buildLearningContext(teamContext: string): Promise<string> {
  const rejections = await getTeamRejections(teamContext, 5);
  const approvals = await getTeamApprovals(teamContext, 3);
  const prefs = await getTeamPreferences(teamContext);

  const lines: string[] = [];

  if (rejections.length > 0) {
    lines.push("PREVIOUS MISTAKES TO AVOID:");
    for (const r of rejections) {
      lines.push(`- Rejected (score ${r.score}/10): ${r.feedback}`);
      if (r.issues.length > 0) lines.push(`  Issues: ${r.issues.join(", ")}`);
    }
  }

  if (approvals.length > 0) {
    lines.push("\nPROMPTS THAT WORKED WELL:");
    for (const a of approvals) {
      lines.push(`- Approved (score ${a.score}/10): "${a.prompt.substring(0, 100)}..."`);
    }
  }

  if (prefs.prefersGallery) {
    lines.push("\nNOTE: User prefers real match photos over AI-generated images for this team.");
    lines.push("Generate images that look like real match photography, not illustrations.");
  }

  return lines.join("\n");
}

// Builds context for the Reviewer agent with calibration data
export async function buildReviewerContext(teamContext: string): Promise<string> {
  const choices = await getManualChoices();
  const lower = teamContext.toLowerCase();
  const teamChoices = choices.filter((c) => c.teamContext.toLowerCase().includes(lower));

  if (teamChoices.length === 0) return "";

  const lines: string[] = ["USER CALIBRATION DATA:"];

  if (teamChoices.some((c) => c.chosenImageType === "gallery")) {
    lines.push("- User has manually chosen real match photos for this team before");
    lines.push("- Be stricter: AI-generated images should closely match real sports photography");
  }

  const rejectCount = teamChoices.reduce((sum, c) => sum + c.rejectedPrompts.length, 0);
  if (rejectCount > 3) {
    lines.push(`- User has rejected ${rejectCount} AI images for this team — raise quality bar`);
  }

  return lines.join("\n");
}
