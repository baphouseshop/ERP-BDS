import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <Loader2 className="absolute top-0 left-0 w-12 h-12 text-primary animate-spin" />
      </div>
      <div className="text-sm font-medium text-muted-foreground animate-pulse">
        Đang tải dữ liệu...
      </div>
    </div>
  );
}
