import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TASK_TYPES, IMPACT_LEVELS, TAG_CATEGORIES } from "@/constants";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      },
      { status: 401 }
    );
  }

  // Validate API key presence
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "CONFIGURATION_ERROR",
          message: "AI Assistant is currently unavailable because OPENROUTER_API_KEY is not configured.",
        },
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Malformed JSON request body.",
        },
      },
      { status: 400 }
    );
  }

  const { userMessage, chatHistory } = body;

  if (!userMessage && (!chatHistory || chatHistory.length === 0)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Either userMessage or chatHistory must be provided.",
        },
      },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch existing tags in the database for the current user to match them
    const existingTags = await prisma.tag.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // 2. Build the system prompt
    const systemPrompt = `You are a helpful AI Internship Work Log Assistant for "Work2CV".
Your goal is to help the user document their daily internship work logs.
The user will describe what they worked on in natural language. You should analyze it and:
1. Extract or draft log details.
2. Match them against the predefined constants and existing database tags.
3. Decide if you have enough information to build a complete work log draft, or if you need to ask a follow-up question.

Predefined values:
- Allowed Task Types: ${JSON.stringify(TASK_TYPES)}
- Allowed Impact Levels: ${JSON.stringify(IMPACT_LEVELS)}
- Allowed Tag Categories: ${JSON.stringify(TAG_CATEGORIES)}

Existing Database Tags (you MUST try to match user's techs/tools/skills to these exact tag names if applicable):
${JSON.stringify(existingTags, null, 2)}

Instructions for matching tags:
- If the user mentions a technology/tool/skill that matches an existing tag name (case-insensitive), include the exact tag name in "matchedTagNames".
- If the user mentions a technology/tool/skill that does NOT match any existing tag, suggest it in "suggestedNewTags" with a suitable category from Allowed Tag Categories. Do NOT include new tags in "matchedTagNames".

Instructions for links:
- Detect any URLs (e.g. GitHub pull requests, commits, Jira links) from the user input and place them in the "links" array. Ensure they are valid absolute URLs.

Instructions for Draft completeness:
- If the description is too vague (e.g., "i wrote some code", "fixed a bug"), set "isDraftReady" to false, and ask a short, friendly "followUpQuestion" asking for specific details (like: what was the feature? what tech did you use? what was the bug or fix?).
- If the user provides sufficient details to generate a professional work log, set "isDraftReady" to true and populate the "draft" object.

You must respond ONLY with a JSON object. Do not include markdown wraps or anything outside the JSON. The JSON structure must match this schema:
{
  "isDraftReady": boolean,
  "followUpQuestion": string | null,
  "draft": {
    "title": string,
    "description": string,
    "taskType": "onboarding" | "feature" | "bugfix" | "testing" | "refactor" | "code_review" | "documentation" | "meeting" | "research" | "support",
    "impactLevel": "learned" | "assisted" | "implemented" | "reviewed" | "fixed" | "improved",
    "problem": string | null,
    "solution": string | null,
    "learning": string | null,
    "links": string[],
    "matchedTagNames": string[],
    "suggestedNewTags": Array<{ "name": string, "category": "tech" | "domain" | "skill" | "tool" }>
  }
}

If "isDraftReady" is false, "draft" can be null or a partial object. "followUpQuestion" should be filled.
If "isDraftReady" is true, "followUpQuestion" should be null, and "draft" must be fully populated with professional summaries based ONLY on user input. Do not invent metrics or facts that the user did not specify. Keep descriptions concise and developer-focused.`;

    // 3. Assemble chat completion messages
    const messages = [
      { role: "system", content: systemPrompt },
    ];

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    if (userMessage) {
      messages.push({ role: "user", content: userMessage });
    }

    // 4. Call OpenRouter
    const openRouterModel = model || "google/gemini-2.5-flash:free";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/tuankiet3/WORK2CV",
        "X-Title": "Work2CV",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return NextResponse.json(
        {
          error: {
            code: "API_GATEWAY_ERROR",
            message: `OpenRouter returned an error (Status: ${response.status}).`,
          },
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantContent = data.choices?.[0]?.message?.content;

    if (!assistantContent) {
      throw new Error("Empty response received from the OpenRouter completions API.");
    }

    // Clean up markdown blocks from response text if present
    let cleanJson = assistantContent.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", assistantContent, parseErr);
      return NextResponse.json(
        {
          error: {
            code: "PARSING_ERROR",
            message: "The AI Assistant response was not valid JSON. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    // 5. Server-side validation of the AI output format
    const isDraftReady = !!parsedResponse.isDraftReady;
    const followUpQuestion = parsedResponse.followUpQuestion || null;
    const draft = parsedResponse.draft || null;

    if (isDraftReady && draft) {
      // Validate taskType
      if (draft.taskType && !TASK_TYPES.includes(draft.taskType)) {
        draft.taskType = "feature"; // Fallback to default
      }
      // Validate impactLevel
      if (draft.impactLevel && !IMPACT_LEVELS.includes(draft.impactLevel)) {
        draft.impactLevel = "implemented"; // Fallback to default
      }
      // Validate links as valid absolute URLs
      if (draft.links && Array.isArray(draft.links)) {
        draft.links = draft.links.filter((link: string) => {
          try {
            new URL(link);
            return true;
          } catch {
            return false;
          }
        });
      } else {
        draft.links = [];
      }
      // Ensure matchedTagNames is array of strings
      if (!draft.matchedTagNames || !Array.isArray(draft.matchedTagNames)) {
        draft.matchedTagNames = [];
      }
      // Ensure suggestedNewTags is valid structure
      if (!draft.suggestedNewTags || !Array.isArray(draft.suggestedNewTags)) {
        draft.suggestedNewTags = [];
      }
    }

    return NextResponse.json({
      data: {
        isDraftReady,
        followUpQuestion,
        draft,
        rawText: userMessage,
      },
    });
  } catch (err: unknown) {
    console.error("AI Assistant API handler exception:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An internal server error occurred while processing the AI request.",
        },
      },
      { status: 500 }
    );
  }
}
