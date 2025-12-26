import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Award,
  FileText,
  BarChart3,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    description: "Create, schedule, and manage events with ease. Set rules, prizes, and deadlines in minutes.",
  },
  {
    icon: Users,
    title: "Team Formation",
    description: "Enable team registration with invite codes. Track team members and submissions effortlessly.",
  },
  {
    icon: Trophy,
    title: "Hackathon Support",
    description: "Built specifically for hackathons with project submission, judging, and leaderboard features.",
  },
  {
    icon: Award,
    title: "Auto Certificates",
    description: "Generate professional certificates automatically for winners and participants.",
  },
  {
    icon: BarChart3,
    title: "Score Aggregation",
    description: "Automated scoring system with multi-judge support and real-time result calculation.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Separate portals for students, organizers, judges, and admins with appropriate permissions.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Run
            <span className="block gradient-text">Successful Campus Events</span>
          </h2>
          <p className="text-muted-foreground">
            A complete toolkit designed for modern campus event management, 
            from ideation to certification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="interactive"
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
