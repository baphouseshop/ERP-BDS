import { createClient } from "@/lib/supabase/server";
import { MarketingClient } from "./marketing-client";

export default async function MarketingPage() {
  const supabase = await createClient();

  const [
    { data: expenses },
    { data: projects },
    { data: analysis }
  ] = await Promise.all([
    supabase.from("expenses").select("*, projects(name)").order("expense_date", { ascending: false }),
    supabase.from("projects").select("*").order("name"),
    supabase.from("view_expense_analysis").select("*")
  ]);

  return (
    <div className="container mx-auto py-8">
      <MarketingClient 
        initialExpenses={expenses || []} 
        projects={projects || []}
        analysis={analysis || []}
      />
    </div>
  );
}
