import { NextResponse } from "next/server";
import { spawn } from "child_process";

const SSH_KEY = process.env.PROMOTE_SSH_KEY || "/app/.ssh/promote_executor";
const SSH_HOST = process.env.PROMOTE_SSH_HOST || "host.docker.internal";
const SSH_USER = process.env.PROMOTE_SSH_USER || "ivan";
const SSH_PORT = process.env.PROMOTE_SSH_PORT || "1822";

function runPromoteCommand(cmd: "preview" | "promote", timeoutMs: number): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const args = [
      "-i", SSH_KEY,
      "-o", "StrictHostKeyChecking=no",
      "-o", "UserKnownHostsFile=/dev/null",
      "-o", "BatchMode=yes",
      "-p", SSH_PORT,
      `${SSH_USER}@${SSH_HOST}`,
      cmd,
    ];
    const child = spawn("ssh", args);
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ code: 124, stdout, stderr: stderr + "\nTIMEOUT" });
    }, timeoutMs);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function GET() {
  const { code, stdout, stderr } = await runPromoteCommand("preview", 15000);
  if (code !== 0) {
    return NextResponse.json({ error: "preview falhou", stderr, stdout }, { status: 500 });
  }
  try {
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "resposta invalida", raw: stdout }, { status: 500 });
  }
}

export async function POST() {
  const { code, stdout, stderr } = await runPromoteCommand("promote", 300000);
  return NextResponse.json(
    {
      success: code === 0,
      exitCode: code,
      stdout,
      stderr,
    },
    { status: code === 0 ? 200 : 500 }
  );
}
