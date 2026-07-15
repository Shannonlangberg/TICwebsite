import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { listSignups, getSignupDetails } from "@/lib/pco";
import { getSetting, setSetting, GATHERING_SIGNUP_ID_KEY } from "@/lib/settings";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("tic_admin")?.value === process.env.ADMIN_PASSWORD;
}

// GET: live list of PCO signups (for the picker dropdown) + which one is
// currently selected for the Gathering page.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [signups, selectedId] = await Promise.all([
    listSignups(),
    getSetting(GATHERING_SIGNUP_ID_KEY),
  ]);

  const selected = selectedId ? await getSignupDetails(selectedId) : null;

  return NextResponse.json({ signups, selectedId, selected });
}

// POST { signupId }: sets which PCO signup the Gathering page links to.
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { signupId } = await request.json();
  if (!signupId || typeof signupId !== "string") {
    return NextResponse.json({ error: "signupId is required" }, { status: 400 });
  }

  const ok = await setSetting(GATHERING_SIGNUP_ID_KEY, signupId);
  if (!ok) {
    return NextResponse.json(
      { error: "Failed to save — has the settings table migration been run?" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
