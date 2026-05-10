import { createClient } from "@/lib/supabase/server";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
  const supabase = await createClient();

  // Fetch bookings with related data
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      units(code, unit_number, block, floor, projects(name, default_commission_rate)),
      customers(full_name, phone),
      employees(full_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Phiếu đặt chỗ</h1>
        <p className="text-muted-foreground font-medium">Quản lý các lượt đặt chỗ và chuyển đổi sang hợp đồng.</p>
      </div>

      <BookingsClient initialBookings={bookings || []} />
    </div>
  );
}
