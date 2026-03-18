import { NextResponse } from "next/server";
import { z } from "zod";

import { suggestGuidedSpecInput } from "@/lib/specforge/agent-assist";

const requestSchema = z.object({
  brief: z.string().min(1),
  tool: z.enum(["auto", "codex_cli", "claude_cli", "heuristic"]).optional(),
});

export async function POST(request: Request) {
  const payload = requestSchema.parse(await request.json());
  const suggestion = await suggestGuidedSpecInput({
    brief: payload.brief,
    requestedTool: payload.tool,
  });

  return NextResponse.json(suggestion);
}
