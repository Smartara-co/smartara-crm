import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { LEAD_SOURCES, PRODUCTS, REGIONS, CURRENCIES } from "@/lib/data/types";

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.LEADS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "`name` is required" }, { status: 400 });
  }

  const source =
    typeof body.source === "string" && (LEAD_SOURCES as readonly string[]).includes(body.source)
      ? body.source
      : "Website";
  const productInterest =
    typeof body.product_interest === "string" &&
    (PRODUCTS as readonly string[]).includes(body.product_interest)
      ? body.product_interest
      : "Client Services";
  const regionKeys = REGIONS.map((r) => r.key) as readonly string[];
  const region = typeof body.region === "string" && regionKeys.includes(body.region) ? body.region : "gambia";
  const currency =
    typeof body.currency === "string" && (CURRENCIES as readonly string[]).includes(body.currency)
      ? body.currency
      : "GMD";
  const estimatedValue = Number(body.estimated_value) || 0;

  const payload = {
    name,
    company: typeof body.company === "string" ? body.company : null,
    email: typeof body.email === "string" ? body.email : null,
    phone: typeof body.phone === "string" ? body.phone : null,
    source,
    region,
    currency,
    estimated_value: estimatedValue,
    product_interest: productInterest,
    notes: typeof body.notes === "string" ? body.notes : null,
  };

  const supabase = createServiceClient();

  const { data, error } = await supabase.from("leads").insert(payload).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("activities").insert({
    related_type: "lead",
    related_id: data.id,
    type: "note",
    content: "Lead captured from website",
    created_by: "Muhammed",
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
