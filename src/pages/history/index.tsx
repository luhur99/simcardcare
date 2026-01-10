import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function HistoryPage() {
  return (
    <Layout>
      <SEO 
        title="Status History - BKT-SimCare"
        description="View SIM card status change history"
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status History</h1>
          <p className="text-muted-foreground">
            Track all SIM card status changes
          </p>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          Status history will be available after Supabase connection
        </div>
      </div>
    </Layout>
  );
}