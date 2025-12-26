import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Zap, 
  Award,
  CheckCircle2
} from "lucide-react";

const stats = [
  { value: "500+", label: "Events Hosted" },
  { value: "10,000+", label: "Participants" },
  { value: "50+", label: "Partner Colleges" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to making campus events accessible, organized, and impactful for every student.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building connections between students, organizers, and industry professionals.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Continuously improving our platform with cutting-edge technology and user feedback.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Setting the standard for how campus events should be managed and experienced.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="default" className="mb-6">About Us</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Empowering Campus Communities
                <span className="block gradient-text">Through Technology</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Hacklyn was born from a simple idea: campus events deserve better tools. 
                We've built a platform that makes organizing, participating, and managing 
                events seamless for everyone involved.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  Founded in 2023, Hacklyn started as a project by a group of engineering 
                  students frustrated with the chaos of managing college hackathons. Spreadsheets 
                  everywhere, manual registration tracking, and endless email chains – there had 
                  to be a better way.
                </p>
                <p>
                  Today, we serve over 50 colleges and have helped organize more than 500 events, 
                  from small workshops to large-scale national hackathons. Our platform handles 
                  everything from registration to certification, letting organizers focus on what 
                  matters most – creating amazing experiences for participants.
                </p>
                <p>
                  We believe that every student deserves access to well-organized events that can 
                  shape their career and help them grow. That's why we're committed to making 
                  Hacklyn accessible, intuitive, and powerful for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={value.title} 
                  variant="interactive"
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
