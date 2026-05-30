import { NextResponse } from "next/server";
import { updateGuestResponse } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const updated = await updateGuestResponse(token, body);
    return NextResponse.json({ success: true, guest: updated });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Failed to save RSVP.";
    const message =
      rawMessage === "RSVP is locked for this guest."
        ? "Rok za online izmenu je istekao. Molimo vas da se obratite domaćinima."
        : rawMessage;

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}


