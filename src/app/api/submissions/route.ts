import { NextResponse } from "next/server";
import { clearAllSubmissions, createSubmission } from "@/lib/submissions";

const ADMIN_USERNAME = process.env.CLEAR_ALL_USERNAME;
const ADMIN_PASSWORD = process.env.CLEAR_ALL_PASSWORD;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createSubmission(payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.errors?.[0] ?? "Submission failed.",
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Clear endpoint is not configured on server." },
        { status: 500 },
      );
    }

    const payload = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const result = await clearAllSubmissions();

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.errors?.[0] ?? "Failed to clear submissions.",
          errors: result.errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        deletedCount: result.deletedCount ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
