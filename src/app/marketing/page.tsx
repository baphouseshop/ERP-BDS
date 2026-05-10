import { createClient } from "@/lib/supabase/server";
import { MarketingClient } from "./marketing-client";

export default async function MarketingPage() {
  const supabase = await createClient();

  const [
    { data: expenses },
    { data: projects }
  ] = await Promise.all([
    supabase.from("expenses").select("*, projects(name)").order("expense_date", { ascending: false }),
    supabase.from("projects").select("*").order("name")
  ]);

  return (
    <div className="container mx-auto py-8">
      <MarketingClient 
        initialExpenses={expenses || []} 
        projects={projects || []}
      />
    </div>
  );
}
