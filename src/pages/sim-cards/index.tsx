import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SimCardsPage() {
  return (
    <Layout>
      <SEO 
        title="SIM Cards - BKT-SimCare"
        description="Manage your SIM cards"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SIM Cards</h1>
            <p className="text-muted-foreground">
              Manage and track your SIM card inventory
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add SIM Card
          </Button>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          SIM Cards management interface will be available after Supabase connection
        </div>
      </div>
    </Layout>
  );
}