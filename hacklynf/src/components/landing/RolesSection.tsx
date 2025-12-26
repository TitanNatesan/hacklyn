import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Scale, ShieldCheck } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Student / Participant",
    badge: "student",
    features: [
      "Discover and browse events",
      "Register individually or with teams",
      "Submit projects and track status",
      "Download participation certificates",
    ],
  },
  {
    icon: Users,
    title: "Event Organizer",
    badge: "organizer",
    features: [
      "Create and publish events",
      "Monitor registrations in real-time",
      "Assign judges to events",
      "Announce results and notifications",
    ],
  },
  {
    icon: Scale,
    title: "Judge",
    badge: "judge",
    features: [
      "View assigned event submissions",
      "Score projects with criteria",
      "Provide detailed feedback",
      "Access judging dashboard",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Administrator",
    badge: "admin",
    features: [
      "Manage all users and roles",
      "Approve or reject events",
      "Access system-wide analytics",
      "Configure platform settings",
    ],
  },
];

export function RolesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tailored Experience for
            <span className="block gradient-text">Every Role</span>
          </h2>
          <p className="text-muted-foreground">
            Whether you're a student, organizer, judge, or admin — we've built 
            dedicated dashboards with role-specific features.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Card 
              key={role.title} 
              variant="elevated"
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <role.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={role.badge as any}>{role.badge}</Badge>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  {role.title}
                </h3>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
