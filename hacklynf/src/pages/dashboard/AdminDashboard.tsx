import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExternalLink, Shield } from "lucide-react";

/**
 * Admin Dashboard - Redirects to Django Admin
 * In the new Devfolio-style architecture, admin management is via Django Admin with Jazzmin UI
 */
const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Card className="p-8">
          <CardContent className="space-y-6">
            <Shield className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              System administration is now managed through the Django Admin panel
              with Jazzmin UI. Login with your admin credentials to access full
              management capabilities.
            </p>
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')}
                className="gap-2 w-full"
              >
                <ExternalLink className="w-4 h-4" />
                Open Admin Panel
              </Button>
              <p className="text-xs text-muted-foreground">
                Default credentials: admin / admin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
