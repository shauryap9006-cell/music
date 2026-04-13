import { NextResponse } from "next/server";

import { hasSupabaseEnv, supabase } from "@/backend/supabase/client";

export async function GET() {
  if (!hasSupabaseEnv || !supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
