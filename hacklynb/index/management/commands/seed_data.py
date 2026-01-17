"""
Seed data management command for Hacklyn.
Creates comprehensive sample data for all models including users, profiles, events, and applications.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from index.models import (
    User,
    Skill,
    Institution,
    Company,
    Profile,
    Education,
    WorkExperience,
    Project,
    Event,
    Prize,
    Sponsor,
    EventApplication,
    Team,
    TeamMember,
    Submission,
    EventCoHost,
    EventRequirement,
)


class Command(BaseCommand):
    help = "Seed the database with comprehensive sample data for testing"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...\n")

        # ==================== Create Skills ====================
        skills_data = [
            "Python",
            "JavaScript",
            "TypeScript",
            "React",
            "Next.js",
            "Django",
            "FastAPI",
            "Node.js",
            "Express",
            "MongoDB",
            "PostgreSQL",
            "MySQL",
            "Redis",
            "Docker",
            "Kubernetes",
            "AWS",
            "Azure",
            "GCP",
            "CI/CD",
            "Machine Learning",
            "Deep Learning",
            "TensorFlow",
            "PyTorch",
            "Scikit-learn",
            "Computer Vision",
            "NLP",
            "GenAI",
            "LangChain",
            "OpenAI API",
            "Blockchain",
            "Solidity",
            "Web3.js",
            "Ethereum",
            "Smart Contracts",
            "React Native",
            "Flutter",
            "Swift",
            "Kotlin",
            "Android",
            "iOS",
            "UI/UX Design",
            "Figma",
            "Adobe XD",
            "Tailwind CSS",
            "Material-UI",
            "GraphQL",
            "REST API",
            "WebSockets",
            "Microservices",
            "System Design",
            "Git",
            "GitHub",
            "GitLab",
            "Agile",
            "Scrum",
            "DevOps",
        ]

        skills = {}
        for skill_name in skills_data:
            skill, created = Skill.objects.get_or_create(name=skill_name)
            skills[skill_name] = skill
            if created:
                self.stdout.write(f"Created skill: {skill_name}")

        # ==================== Create Institutions ====================
        institutions_data = [
            "Massachusetts Institute of Technology",
            "Stanford University",
            "Harvard University",
            "University of California Berkeley",
            "Carnegie Mellon University",
            "Georgia Tech",
            "University of Washington",
            "Cornell University",
            "Princeton University",
            "University of Illinois Urbana-Champaign",
            "University of Michigan",
            "Indian Institute of Technology Delhi",
            "Indian Institute of Technology Bombay",
            "National University of Singapore",
            "Tsinghua University",
            "Oxford University",
            "Cambridge University",
            "ETH Zurich",
            "University of Toronto",
            "Waterloo University",
        ]

        institutions = {}
        for inst_name in institutions_data:
            inst, created = Institution.objects.get_or_create(name=inst_name)
            institutions[inst_name] = inst
            if created:
                self.stdout.write(f"Created institution: {inst_name}")

        # ==================== Create Companies ====================
        companies_data = [
            "Google",
            "Meta",
            "Amazon",
            "Microsoft",
            "Apple",
            "Netflix",
            "Tesla",
            "OpenAI",
            "Anthropic",
            "DeepMind",
            "Stripe",
            "Airbnb",
            "Uber",
            "Lyft",
            "Coinbase",
            "Robinhood",
            "Square",
            "PayPal",
            "Shopify",
            "Spotify",
            "Adobe",
            "Salesforce",
            "Oracle",
            "IBM",
            "Intel",
            "NVIDIA",
            "AMD",
            "Startup Inc",
            "Tech Ventures",
            "Innovation Labs",
            "Code Factory",
        ]

        companies = {}
        for company_name in companies_data:
            company, created = Company.objects.get_or_create(name=company_name)
            companies[company_name] = company
            if created:
                self.stdout.write(f"Created company: {company_name}")

        # ==================== Create Superuser Titan ====================
        titan, created = User.objects.get_or_create(
            username="titan",
            defaults={
                "email": "titan@hacklyn.com",
                "first_name": "Titan",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
                "profile_completed": True,
                "email_verified": True,
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=titan",
            },
        )
        if created:
            titan.set_password("1")
            titan.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: titan/1"))

        # ==================== Create Admin User ====================
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@hacklyn.com",
                "first_name": "Admin",
                "last_name": "User",
                "is_staff": True,
                "is_superuser": True,
                "profile_completed": True,
                "email_verified": True,
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            },
        )
        if created:
            admin.set_password("admin")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin/admin"))

        # ==================== Create Regular Users with Profiles ====================
        users_data = [
            {
                "username": "alice_dev",
                "email": "alice@example.com",
                "first_name": "Alice",
                "last_name": "Johnson",
                "tagline": "Full Stack Developer | AI Enthusiast",
                "bio": "Passionate about building scalable web applications and exploring AI/ML. Love hackathons and open source!",
                "location": "San Francisco, CA",
                "skills": [
                    "Python",
                    "JavaScript",
                    "React",
                    "Django",
                    "Machine Learning",
                    "Docker",
                ],
                "github": "https://github.com/alicedev",
                "linkedin": "https://linkedin.com/in/alicedev",
                "education": [
                    {
                        "degree": "B.S. Computer Science",
                        "institution": "Stanford University",
                        "start": "2018",
                        "end": "2022",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "Software Engineer",
                        "company": "Google",
                        "start": "2022-06",
                        "end": "",
                        "current": True,
                        "desc": "Working on search infrastructure and ML models.",
                    },
                ],
                "projects": [
                    {
                        "title": "AI Code Assistant",
                        "desc": "Built an AI-powered code completion tool using GPT-4",
                        "tech": ["Python", "OpenAI API", "React"],
                        "role": "Lead Developer",
                        "link": "https://github.com/alicedev/ai-assistant",
                    },
                ],
            },
            {
                "username": "bob_blockchain",
                "email": "bob@example.com",
                "first_name": "Bob",
                "last_name": "Smith",
                "tagline": "Blockchain Developer | Web3 Pioneer",
                "bio": "Building the decentralized future. Smart contracts, DeFi, and NFTs are my passion.",
                "location": "Austin, TX",
                "skills": [
                    "Solidity",
                    "Web3.js",
                    "Ethereum",
                    "React",
                    "Node.js",
                    "TypeScript",
                ],
                "github": "https://github.com/bobchain",
                "linkedin": "https://linkedin.com/in/bobsmith",
                "twitter": "https://twitter.com/bobchain",
                "education": [
                    {
                        "degree": "M.S. Computer Science",
                        "institution": "MIT",
                        "start": "2020",
                        "end": "2022",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "Blockchain Engineer",
                        "company": "Coinbase",
                        "start": "2022-08",
                        "end": "",
                        "current": True,
                        "desc": "Developing smart contracts and DeFi protocols.",
                    },
                ],
                "projects": [
                    {
                        "title": "DeFi Lending Protocol",
                        "desc": "Decentralized lending platform with automated market making",
                        "tech": ["Solidity", "Web3.js", "React"],
                        "role": "Founder",
                        "link": "https://github.com/bobchain/defi-lend",
                    },
                ],
            },
            {
                "username": "carol_ml",
                "email": "carol@example.com",
                "first_name": "Carol",
                "last_name": "Williams",
                "tagline": "ML Engineer | Computer Vision Specialist",
                "bio": "Turning pixels into insights. Specialized in computer vision and deep learning applications.",
                "location": "Seattle, WA",
                "skills": [
                    "Python",
                    "TensorFlow",
                    "PyTorch",
                    "Computer Vision",
                    "Deep Learning",
                    "AWS",
                ],
                "github": "https://github.com/carolml",
                "linkedin": "https://linkedin.com/in/carolwilliams",
                "education": [
                    {
                        "degree": "Ph.D. Machine Learning",
                        "institution": "Carnegie Mellon University",
                        "start": "2019",
                        "end": "2024",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "ML Research Scientist",
                        "company": "OpenAI",
                        "start": "2024-01",
                        "end": "",
                        "current": True,
                        "desc": "Research on multimodal AI models.",
                    },
                    {
                        "title": "ML Intern",
                        "company": "Meta",
                        "start": "2023-06",
                        "end": "2023-08",
                        "current": False,
                        "desc": "Worked on image recognition systems.",
                    },
                ],
                "projects": [
                    {
                        "title": "Medical Image Analyzer",
                        "desc": "Deep learning model for detecting diseases from X-rays",
                        "tech": ["Python", "TensorFlow", "Computer Vision"],
                        "role": "Lead Researcher",
                        "link": "https://github.com/carolml/medimage",
                    },
                ],
            },
            {
                "username": "david_mobile",
                "email": "david@example.com",
                "first_name": "David",
                "last_name": "Brown",
                "tagline": "Mobile App Developer | React Native Expert",
                "bio": "Creating beautiful mobile experiences. Cross-platform development is my superpower.",
                "location": "New York, NY",
                "skills": [
                    "React Native",
                    "TypeScript",
                    "Swift",
                    "Kotlin",
                    "Firebase",
                    "UI/UX Design",
                ],
                "github": "https://github.com/davidmobile",
                "linkedin": "https://linkedin.com/in/davidbrown",
                "education": [
                    {
                        "degree": "B.S. Software Engineering",
                        "institution": "Georgia Tech",
                        "start": "2017",
                        "end": "2021",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "Senior Mobile Developer",
                        "company": "Airbnb",
                        "start": "2021-07",
                        "end": "",
                        "current": True,
                        "desc": "Leading mobile app development for iOS and Android.",
                    },
                ],
                "projects": [
                    {
                        "title": "Fitness Tracker Pro",
                        "desc": "Cross-platform fitness app with AI-powered workout recommendations",
                        "tech": ["React Native", "TypeScript", "Firebase"],
                        "role": "Solo Developer",
                        "link": "https://github.com/davidmobile/fitness-pro",
                    },
                ],
            },
            {
                "username": "eve_designer",
                "email": "eve@example.com",
                "first_name": "Eve",
                "last_name": "Davis",
                "tagline": "UI/UX Designer | Frontend Developer",
                "bio": "Designing delightful user experiences. Code meets creativity in everything I build.",
                "location": "Los Angeles, CA",
                "skills": [
                    "Figma",
                    "UI/UX Design",
                    "React",
                    "Tailwind CSS",
                    "JavaScript",
                    "Adobe XD",
                ],
                "github": "https://github.com/evedesign",
                "linkedin": "https://linkedin.com/in/evedavis",
                "website": "https://evedavis.design",
                "education": [
                    {
                        "degree": "B.A. Interaction Design",
                        "institution": "University of California Berkeley",
                        "start": "2018",
                        "end": "2022",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "Product Designer",
                        "company": "Stripe",
                        "start": "2022-09",
                        "end": "",
                        "current": True,
                        "desc": "Designing payment experiences for millions of users.",
                    },
                ],
                "projects": [
                    {
                        "title": "Design System Library",
                        "desc": "Comprehensive design system with reusable components",
                        "tech": ["React", "Tailwind CSS", "Figma"],
                        "role": "Designer & Developer",
                        "link": "https://github.com/evedesign/design-system",
                    },
                ],
            },
            {
                "username": "frank_devops",
                "email": "frank@example.com",
                "first_name": "Frank",
                "last_name": "Miller",
                "tagline": "DevOps Engineer | Cloud Architecture Expert",
                "bio": "Automating everything. Building reliable, scalable infrastructure in the cloud.",
                "location": "Remote",
                "skills": [
                    "Kubernetes",
                    "Docker",
                    "AWS",
                    "Terraform",
                    "CI/CD",
                    "Python",
                ],
                "github": "https://github.com/frankdevops",
                "linkedin": "https://linkedin.com/in/frankmiller",
                "education": [
                    {
                        "degree": "B.S. Information Systems",
                        "institution": "University of Washington",
                        "start": "2016",
                        "end": "2020",
                        "current": False,
                    },
                ],
                "experience": [
                    {
                        "title": "DevOps Engineer",
                        "company": "Netflix",
                        "start": "2020-06",
                        "end": "",
                        "current": True,
                        "desc": "Managing cloud infrastructure at massive scale.",
                    },
                ],
                "projects": [
                    {
                        "title": "Auto-Scaling Platform",
                        "desc": "Kubernetes-based auto-scaling solution for microservices",
                        "tech": ["Kubernetes", "Docker", "Python"],
                        "role": "Infrastructure Lead",
                        "link": "https://github.com/frankdevops/k8s-autoscale",
                    },
                ],
            },
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "email": user_data["email"],
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                    "profile_completed": True,
                    "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data['username']}",
                },
            )
            if created:
                user.set_password("password")
                user.save()

                # Create profile
                profile = Profile.objects.create(
                    user=user,
                    tagline=user_data["tagline"],
                    bio=user_data["bio"],
                    location=user_data["location"],
                    github=user_data.get("github", ""),
                    linkedin=user_data.get("linkedin", ""),
                    twitter=user_data.get("twitter", ""),
                    website=user_data.get("website", ""),
                )

                # Add skills
                for skill_name in user_data["skills"]:
                    if skill_name in skills:
                        profile.skills.add(skills[skill_name])

                # Add education
                for edu in user_data.get("education", []):
                    Education.objects.create(
                        profile=profile,
                        degree=edu["degree"],
                        institution=institutions.get(edu["institution"]),
                        start_date=edu["start"],
                        end_date=edu["end"],
                        current=edu["current"],
                    )

                # Add work experience
                for exp in user_data.get("experience", []):
                    WorkExperience.objects.create(
                        profile=profile,
                        job_title=exp["title"],
                        company=companies.get(exp["company"]),
                        start_date=exp["start"],
                        end_date=exp["end"],
                        description=exp["desc"],
                        current=exp["current"],
                    )

                # Add projects
                for proj in user_data.get("projects", []):
                    project = Project.objects.create(
                        profile=profile,
                        title=proj["title"],
                        description=proj["desc"],
                        role=proj["role"],
                        link=proj.get("link", ""),
                    )
                    for tech_name in proj["tech"]:
                        if tech_name in skills:
                            project.technologies.add(skills[tech_name])

                self.stdout.write(
                    f"Created user: {user.username}/password with complete profile"
                )
            users.append(user)

        # ==================== Create Events ====================
        now = timezone.now()
        events_data = [
            {
                "name": "Global AI Hackathon 2025",
                "tagline": "Build the future with AI in 48 hours",
                "description": "Join developers worldwide for an epic AI hackathon. Build innovative AI solutions, win amazing prizes, and connect with the global AI community. Whether you're into GenAI, Computer Vision, or NLP, there's a track for you!",
                "organizer": users[0],
                "organizer_name": "AI Community Global",
                "organizer_email": "organizer@aihackathon.com",
                "website": "https://aihackathon.com",
                "discord_link": "https://discord.gg/aihack",
                "mode": "hybrid",
                "venue": "Tech Hub Convention Center",
                "city": "San Francisco",
                "start_date": now + timedelta(days=30),
                "end_date": now + timedelta(days=32),
                "registration_start": now - timedelta(days=10),
                "registration_end": now + timedelta(days=25),
                "team_min": 2,
                "team_max": 4,
                "max_participants": 500,
                "prize_pool": "$50,000",
                "tracks": "GenAI, Computer Vision, NLP, AI for Good",
                "rules": "All code must be written during the hackathon. Open source libraries allowed. Teams must submit by deadline.",
                "eligibility": "Open to all developers worldwide. Students get priority registration.",
                "status": "published",
                "is_featured": True,
            },
            {
                "name": "Web3 Builders Summit",
                "tagline": "Decentralize everything",
                "description": "Build the next generation of decentralized applications. Focus on DeFi, NFTs, DAOs, and blockchain infrastructure. $100K in prizes and crypto grants available!",
                "organizer": users[1],
                "organizer_name": "Web3 Foundation",
                "organizer_email": "hello@web3summit.io",
                "website": "https://web3summit.io",
                "discord_link": "https://discord.gg/web3build",
                "mode": "online",
                "city": "Virtual",
                "start_date": now + timedelta(days=45),
                "end_date": now + timedelta(days=47),
                "registration_start": now,
                "registration_end": now + timedelta(days=40),
                "team_min": 1,
                "team_max": 4,
                "max_participants": 1000,
                "prize_pool": "$100,000 in crypto",
                "tracks": "DeFi, NFT, DAO, Infrastructure, Gaming",
                "rules": "Smart contracts must be audited. No plagiarism. Open source preferred.",
                "eligibility": "Open to all. Crypto wallet required for prizes.",
                "status": "published",
                "is_featured": True,
            },
            {
                "name": "Campus CodeFest 2025",
                "tagline": "Code for your campus, win big",
                "description": "Build solutions that improve campus life. From EdTech to sustainability, create apps that make a difference for students everywhere.",
                "organizer": users[2],
                "organizer_name": "University Tech Club",
                "organizer_email": "techclub@university.edu",
                "website": "https://campuscodefest.edu",
                "mode": "offline",
                "venue": "University Auditorium",
                "city": "Boston",
                "start_date": now + timedelta(days=14),
                "end_date": now + timedelta(days=15),
                "registration_start": now - timedelta(days=20),
                "registration_end": now + timedelta(days=10),
                "team_min": 2,
                "team_max": 5,
                "max_participants": 200,
                "prize_pool": "$10,000",
                "tracks": "EdTech, Campus Life, Sustainability, Health & Wellness",
                "rules": "Must be a student. Original work only. Demos required.",
                "eligibility": "Open to all university students.",
                "status": "published",
                "is_featured": False,
            },
            {
                "name": "Mobile App Challenge",
                "tagline": "Build the next killer mobile app",
                "description": "Create innovative mobile applications for iOS and Android. Focus on user experience, performance, and creativity.",
                "organizer": users[3],
                "organizer_name": "Mobile Developers Association",
                "organizer_email": "hello@mobileappchallenge.com",
                "website": "https://mobileappchallenge.com",
                "discord_link": "https://discord.gg/mobiledev",
                "mode": "online",
                "city": "Virtual",
                "start_date": now + timedelta(days=60),
                "end_date": now + timedelta(days=62),
                "registration_start": now + timedelta(days=5),
                "registration_end": now + timedelta(days=55),
                "team_min": 1,
                "team_max": 3,
                "max_participants": 300,
                "prize_pool": "$25,000",
                "tracks": "Productivity, Social, Gaming, Health & Fitness",
                "rules": "Apps must work on both iOS and Android. UI/UX is heavily weighted.",
                "eligibility": "Open to all mobile developers.",
                "status": "published",
                "is_featured": True,
            },
            {
                "name": "Sustainability Hackathon",
                "tagline": "Tech for a greener planet",
                "description": "Use technology to solve environmental challenges. Build solutions for climate change, renewable energy, and sustainable living.",
                "organizer": users[0],
                "organizer_name": "Green Tech Initiative",
                "organizer_email": "info@greentech.org",
                "website": "https://sustainabilityhack.org",
                "mode": "hybrid",
                "venue": "Eco Center",
                "city": "Portland",
                "start_date": now + timedelta(days=90),
                "end_date": now + timedelta(days=92),
                "registration_start": now + timedelta(days=10),
                "registration_end": now + timedelta(days=85),
                "team_min": 2,
                "team_max": 6,
                "max_participants": 400,
                "prize_pool": "$30,000",
                "tracks": "Climate Tech, Renewable Energy, Sustainable Agriculture, Circular Economy",
                "rules": "Solutions must have measurable environmental impact. Open source required.",
                "eligibility": "Open to all. Environmental science students encouraged.",
                "status": "draft",
                "is_featured": False,
            },
        ]

        events = []
        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                name=event_data["name"], defaults=event_data
            )
            if created:
                # Add prizes
                prizes_list = [
                    {
                        "position": "🥇 1st Place",
                        "reward": "40% of prize pool + Mentorship",
                        "order": 1,
                    },
                    {
                        "position": "🥈 2nd Place",
                        "reward": "30% of prize pool",
                        "order": 2,
                    },
                    {
                        "position": "🥉 3rd Place",
                        "reward": "20% of prize pool",
                        "order": 3,
                    },
                    {
                        "position": "🎨 Best Design",
                        "reward": "5% of prize pool",
                        "order": 4,
                    },
                    {
                        "position": "💡 Most Innovative",
                        "reward": "5% of prize pool",
                        "order": 5,
                    },
                ]
                for prize in prizes_list:
                    Prize.objects.create(event=event, **prize)

                # Add sponsors
                sponsor_companies = [
                    "Google",
                    "Microsoft",
                    "AWS",
                    "GitHub",
                    "Stripe",
                    "OpenAI",
                ]
                tiers = ["Platinum", "Gold", "Silver", "Bronze"]
                for i, sponsor_name in enumerate(
                    random.sample(sponsor_companies, min(4, len(sponsor_companies)))
                ):
                    Sponsor.objects.create(
                        event=event,
                        name=sponsor_name,
                        tier=tiers[i % len(tiers)],
                        website=f'https://{sponsor_name.lower().replace(" ", "")}.com',
                    )

                self.stdout.write(f"Created event: {event.name}")

                # Add requirements (for some events)
                if event.team_min > 1:
                    requirements = [
                        {
                            "field_name": "Project PPT",
                            "field_type": "file",
                            "description": "Upload your project presentation (PDF/PPTX)",
                            "is_required": True,
                            "order": 1,
                        },
                        {
                            "field_name": "Demo Video URL",
                            "field_type": "url",
                            "description": "Link to your demo video (YouTube/Loom)",
                            "is_required": True,
                            "order": 2,
                        },
                        {
                            "field_name": "Problem Statement",
                            "field_type": "text",
                            "description": "Describe the problem you are solving",
                            "is_required": False,
                            "order": 3,
                        },
                    ]
                    for req in requirements:
                        EventRequirement.objects.create(event=event, **req)
                    self.stdout.write(
                        f"  Added {len(requirements)} requirements to {event.name}"
                    )
            events.append(event)

        # ==================== Create Applications ====================
        published_events = [e for e in events if e.status == "published"]
        for user in users[2:]:  # Skip first two users (organizers)
            for event in random.sample(published_events, min(2, len(published_events))):
                if not EventApplication.objects.filter(event=event, user=user).exists():
                    status = random.choice(
                        ["pending", "approved", "approved", "approved"]
                    )  # More approved than pending
                    app = EventApplication.objects.create(
                        event=event,
                        user=user,
                        team_name=f"Team {user.first_name}",
                        role=random.choice(
                            ["Developer", "Designer", "Full Stack", "ML Engineer"]
                        ),
                        motivation=f"I'm excited to participate in {event.name} because I want to build innovative solutions and learn from the community!",
                        status=status,
                    )
                    if status == "approved":
                        app.reviewed_at = timezone.now()
                        app.reviewed_by = event.organizer
                        app.save()
                    self.stdout.write(
                        f"Created application: {user.username} → {event.name} ({status})"
                    )

        # ==================== Create Teams and Submissions ====================
        for event in published_events[:2]:  # Create teams for first 2 events
            approved_apps = EventApplication.objects.filter(
                event=event, status="approved"
            )
            if approved_apps.count() >= 2:
                # Create a team
                leader = approved_apps.first().user
                team, created = Team.objects.get_or_create(
                    event=event,
                    name=f"Team {leader.first_name}",
                    defaults={"leader": leader},
                )
                if created:
                    # Add team members
                    for app in approved_apps[:3]:  # Max 3 members
                        TeamMember.objects.get_or_create(
                            team=team, user=app.user, defaults={"role": app.role}
                        )

                    # Create submission
                    Submission.objects.get_or_create(
                        team=team,
                        defaults={
                            "project_title": f"Innovative Solution for {event.name}",
                            "project_description": "Our project leverages cutting-edge technology to solve real-world problems.",
                            "technologies": ", ".join(
                                [
                                    s.name
                                    for s in random.sample(list(skills.values()), 5)
                                ]
                            ),
                            "demo_link": "https://demo.example.com",
                            "repo_link": "https://github.com/team/project",
                            "status": "submitted",
                            "submitted_at": timezone.now(),
                        },
                    )
                    self.stdout.write(
                        f"Created team and submission: {team.name} for {event.name}"
                    )

        # ==================== Create Co-Hosts ====================
        for event in published_events[:2]:  # Add co-hosts to first 2 events
            potential_cohosts = [u for u in users if u != event.organizer][:2]
            for user in potential_cohosts:
                cohost, created = EventCoHost.objects.get_or_create(
                    event=event,
                    user=user,
                    defaults={"invited_by": event.organizer, "status": "accepted"},
                )
                if created:
                    self.stdout.write(f"Added co-host: {user.username} to {event.name}")

        # ==================== Summary ====================
        self.stdout.write(self.style.SUCCESS("\n✅ Seeding completed successfully!"))
        self.stdout.write("\n📊 Database Summary:")
        self.stdout.write(f"  • Skills: {Skill.objects.count()}")
        self.stdout.write(f"  • Institutions: {Institution.objects.count()}")
        self.stdout.write(f"  • Companies: {Company.objects.count()}")
        self.stdout.write(f"  • Users: {User.objects.count()}")
        self.stdout.write(f"  • Profiles: {Profile.objects.count()}")
        self.stdout.write(f"  • Events: {Event.objects.count()}")
        self.stdout.write(f"  • Event Requirements: {EventRequirement.objects.count()}")
        self.stdout.write(f"  • Event Co-Hosts: {EventCoHost.objects.count()}")
        self.stdout.write(f"  • Applications: {EventApplication.objects.count()}")
        self.stdout.write(f"  • Teams: {Team.objects.count()}")
        self.stdout.write(f"  • Submissions: {Submission.objects.count()}")

        self.stdout.write("\n🔐 Test Accounts:")
        self.stdout.write("  Admin: admin / admin")
        self.stdout.write("  Users: alice_dev / password")
        self.stdout.write("         bob_blockchain / password")
        self.stdout.write("         carol_ml / password")
        self.stdout.write("         david_mobile / password")
        self.stdout.write("         eve_designer / password")
        self.stdout.write("         frank_devops / password")
