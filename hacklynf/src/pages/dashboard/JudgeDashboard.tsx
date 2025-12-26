import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExternalLink, ShieldCheck } from "lucide-react";

/**
 * Judge Dashboard - Redirects to Django Admin
 * In the new Devfolio-style architecture, judging is managed via Django Admin
 */
const JudgeDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Card className="p-8">
          <CardContent className="space-y-6">
            <ShieldCheck className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Judge Access</h1>
            <p className="text-muted-foreground">
              Judging and evaluation is now managed through the Django Admin panel.
              If you have judge privileges, please access the admin panel.
            </p>
            <Button
              size="lg"
              onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;
