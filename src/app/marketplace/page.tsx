import { Suspense } from "react";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
