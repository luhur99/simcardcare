import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import { SimCard } from "@/lib/supabase";

export default function TestDashboard() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("🔍 Starting data load...");
      setLoading(true);
      setError(null);
      
      const cards = await simService.getSimCards();
      console.log("✅ Data loaded:", cards);
      
      setSimCards(Array.isArray(cards) ? cards : []);
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError(err.message || "Unknown error");
      setSimCards([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("🎨 Rendering TestDashboard...");
  console.log("📊 State:", { simCards, loading, error });

  return (
    <Layout>
      <SEO 
        title="Test Dashboard - BKT-SimCare"
        description="Testing dashboard functionality"
      />

      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Test Dashboard</h1>
        
        {loading && (
          <div className="p-4 bg-blue-100 rounded">
            Loading data...
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="p-4 bg-green-100 rounded">
            <p>✅ Data loaded successfully!</p>
            <p>Total SIM cards: {simCards.length}</p>
            
            {simCards.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-bold">SIM Cards:</h3>
                {simCards.map((sim) => (
                  <div key={sim.id} className="p-2 bg-white rounded">
                    <p><strong>Phone:</strong> {sim.phone_number}</p>
                    <p><strong>Status:</strong> {sim.status}</p>
                    <p><strong>Provider:</strong> {sim.provider}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}