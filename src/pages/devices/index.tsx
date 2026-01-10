import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DevicesPage() {
  return (
    <Layout>
      <SEO 
        title="Devices - BKT-SimCare"
        description="Manage your devices"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
            <p className="text-muted-foreground">
              Manage devices in your system
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          Devices management interface will be available after Supabase connection
        </div>
      </div>
    </Layout>
  );
}