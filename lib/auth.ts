import { createHash, randomBytes } from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const AUTH_FILE = path.join(DATA_DIR, "auth.json");

export interface AuthData {
  user1: { passwordHash: string } | null;
  user2: { passwordHash: string } | null;
  sessions: Record<string, { userId: string; expiresAt: number }>;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Hash password using SHA-256
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Generate session token
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Get auth data
export function getAuthData(): AuthData {
  ensureDataDir();
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultAuth: AuthData = {
      user1: null,
      user2: null,
      sessions: {},
    };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(defaultAuth, null, 2));
    return defaultAuth;
  }
  return JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
}

// Save auth data
export function saveAuthData(data: AuthData): void {
  ensureDataDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2));
}

// Check if password is set for a user
export function hasPassword(userId: "user1" | "user2"): boolean {
  const auth = getAuthData();
  return auth[userId] !== null;
}

// Check if any password is set (app-level protection)
export function isPasswordEnabled(): boolean {
  const auth = getAuthData();
  return auth.user1 !== null || auth.user2 !== null;
}

// Set password for a user
export function setPassword(userId: "user1" | "user2", password: string): void {
  const auth = getAuthData();
  auth[userId] = { passwordHash: hashPassword(password) };
  saveAuthData(auth);
}

// Verify password
export function verifyPassword(userId: "user1" | "user2", password: string): boolean {
  const auth = getAuthData();
  const userAuth = auth[userId];
  if (!userAuth) {
    // If no password set, allow access
    return true;
  }
  return userAuth.passwordHash === hashPassword(password);
}

// Create session
export function createSession(userId: "user1" | "user2"): string {
  const auth = getAuthData();
  const token = generateToken();
  // Session expires in 7 days
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  auth.sessions[token] = { userId, expiresAt };
  // Clean up expired sessions
  for (const [key, session] of Object.entries(auth.sessions)) {
    if (session.expiresAt < Date.now()) {
      delete auth.sessions[key];
    }
  }
  saveAuthData(auth);
  return token;
}

// Verify session token
export function verifySession(token: string): { valid: boolean; userId?: "user1" | "user2" } {
  if (!token) {
    return { valid: false };
  }
  const auth = getAuthData();
  const session = auth.sessions[token];
  if (!session) {
    return { valid: false };
  }
  if (session.expiresAt < Date.now()) {
    // Session expired, clean up
    delete auth.sessions[token];
    saveAuthData(auth);
    return { valid: false };
  }
  return { valid: true, userId: session.userId as "user1" | "user2" };
}

// Delete session (logout)
export function deleteSession(token: string): void {
  const auth = getAuthData();
  delete auth.sessions[token];
  saveAuthData(auth);
}

// Remove password for a user
export function removePassword(userId: "user1" | "user2"): void {
  const auth = getAuthData();
  auth[userId] = null;
  saveAuthData(auth);
}

// Check if password matches the other user's password
export function isPasswordUsedByOther(userId: "user1" | "user2", password: string): boolean {
  const auth = getAuthData();
  const otherUserId = userId === "user1" ? "user2" : "user1";
  const otherUserAuth = auth[otherUserId];
  if (!otherUserAuth) {
    return false;
  }
  return otherUserAuth.passwordHash === hashPassword(password);
}
