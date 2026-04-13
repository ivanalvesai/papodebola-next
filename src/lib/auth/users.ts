import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export interface User {
  username: string;
  password: string; // SHA-256 hash
  role: "admin" | "editor";
}

const USERS_FILE = join(process.cwd(), "data", "users.json");

function hashPassword(password: string): string {
  return createHash("sha256").update(`pdb_${password}`).digest("hex");
}

const DEFAULT_USERS: User[] = [
  {
    username: "admin",
    password: hashPassword("admin123"),
    role: "admin",
  },
];

async function readUsers(): Promise<User[]> {
  try {
    const data = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet — try to create it, but don't fail if we can't
    try {
      await ensureDir();
      await writeFile(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2));
    } catch {
      // Read-only filesystem — return defaults in memory
    }
    return DEFAULT_USERS;
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await ensureDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function ensureDir(): Promise<void> {
  const { mkdir } = await import("fs/promises");
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
  } catch {
    // Already exists
  }
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  const users = await readUsers();
  const hashed = hashPassword(password);
  return users.find((u) => u.username === username && u.password === hashed) || null;
}

export async function getAllUsers(): Promise<Omit<User, "password">[]> {
  const users = await readUsers();
  return users.map(({ username, role }) => ({ username, role }));
}

export async function createUser(
  username: string,
  password: string,
  role: "admin" | "editor" = "editor"
): Promise<boolean> {
  const users = await readUsers();
  if (users.find((u) => u.username === username)) return false;

  users.push({ username, password: hashPassword(password), role });
  await saveUsers(users);
  return true;
}

export async function updateUser(
  username: string,
  updates: { password?: string; role?: "admin" | "editor"; username?: string }
): Promise<boolean> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.username === username);
  if (index === -1) return false;

  if (updates.password) users[index].password = hashPassword(updates.password);
  if (updates.role) users[index].role = updates.role;
  if (updates.username) users[index].username = updates.username;

  await saveUsers(users);
  return true;
}

export async function deleteUser(username: string): Promise<boolean> {
  if (username === "admin") return false;

  const users = await readUsers();
  const filtered = users.filter((u) => u.username !== username);
  if (filtered.length === users.length) return false;

  await saveUsers(filtered);
  return true;
}
