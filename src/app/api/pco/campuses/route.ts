import { NextResponse } from "next/server";
import { listCampuses } from "@/lib/pco";

// Public read endpoint — just campus id/name pairs for the sign-up form's
// campus dropdown. No PCO credentials are exposed to the client.
export async function GET() {
  const campuses = await listCampuses();
  return NextResponse.json({ campuses });
}
