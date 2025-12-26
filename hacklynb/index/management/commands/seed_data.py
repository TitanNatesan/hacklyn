"""
Seed data management command for Hacklyn.
Creates sample users, events, and applications for testing.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from index.models import (
    User, Profile, Education, WorkExperience, Project,
    Event, Prize, Sponsor, EventApplication, Team, TeamMember
)


class Command(BaseCommand):
    help = 'Seed the database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')
        
        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@hacklyn.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin/admin'))
        
        # Create regular users
        users = []
        for i in range(1, 6):
            user, created = User.objects.get_or_create(
                username=f'user{i}',
                defaults={
                    'email': f'user{i}@example.com',
                    'first_name': f'User',
                    'last_name': f'{i}',
                    'profile_completed': True,
                }
            )
            if created:
                user.set_password('password')
                user.save()
                
                # Create profile
                profile = Profile.objects.create(
                    user=user,
                    tagline=f'Software Developer #{i}',
                    bio=f'Passionate developer building cool stuff.',
                    skills='Python, JavaScript, React, Django',
                    location='Remote',
                    github=f'https://github.com/user{i}',
                    linkedin=f'https://linkedin.com/in/user{i}',
                )
                
                # Add education
                Education.objects.create(
                    profile=profile,
                    degree='B.Tech Computer Science',
                    school='Tech University',
                    start_date='2020',
                    end_date='2024',
                    current=False,
                )
                
                self.stdout.write(f'Created user: user{i}/password')
            users.append(user)
        
        # Create events
        now = timezone.now()
        events_data = [
            {
                'name': 'Global Hackathon 2025',
                'tagline': 'Build the future in 48 hours',
                'description': 'Join developers worldwide for an epic hackathon. Build innovative solutions, win prizes, and connect with the community.',
                'organizer': users[0],
                'organizer_name': 'Tech Community',
                'organizer_email': 'organizer@hackathon.com',
                'mode': 'hybrid',
                'venue': 'Tech Hub',
                'city': 'San Francisco',
                'start_date': now + timedelta(days=30),
                'end_date': now + timedelta(days=32),
                'registration_start': now - timedelta(days=10),
                'registration_end': now + timedelta(days=25),
                'team_min': 2,
                'team_max': 4,
                'max_participants': 500,
                'prize_pool': '$50,000',
                'tracks': 'AI/ML, Web3, Sustainability, FinTech',
                'status': 'published',
                'is_featured': True,
            },
            {
                'name': 'AI Innovation Challenge',
                'tagline': 'Pushing AI boundaries',
                'description': 'Build groundbreaking AI applications that solve real-world problems.',
                'organizer': users[1],
                'organizer_name': 'AI Labs',
                'organizer_email': 'ai@challenge.com',
                'mode': 'online',
                'city': 'Virtual',
                'start_date': now + timedelta(days=45),
                'end_date': now + timedelta(days=47),
                'registration_start': now,
                'registration_end': now + timedelta(days=40),
                'team_min': 1,
                'team_max': 3,
                'prize_pool': '$25,000',
                'tracks': 'Computer Vision, NLP, GenAI',
                'status': 'published',
                'is_featured': True,
            },
            {
                'name': 'Campus CodeFest',
                'tagline': 'Code for your campus',
                'description': 'Build solutions for campus life. Open to all students.',
                'organizer': users[2],
                'organizer_name': 'University Tech Club',
                'organizer_email': 'techclub@university.edu',
                'mode': 'offline',
                'venue': 'University Auditorium',
                'city': 'Boston',
                'start_date': now + timedelta(days=14),
                'end_date': now + timedelta(days=15),
                'registration_start': now - timedelta(days=20),
                'registration_end': now + timedelta(days=10),
                'team_min': 2,
                'team_max': 5,
                'prize_pool': '$5,000',
                'tracks': 'EdTech, Campus Life, Sustainability',
                'status': 'published',
                'is_featured': False,
            },
            {
                'name': 'Web3 Builders Weekend',
                'tagline': 'Decentralize everything',
                'description': 'Build the next generation of decentralized applications.',
                'organizer': users[0],
                'organizer_name': 'Crypto Community',
                'organizer_email': 'web3@builders.com',
                'mode': 'online',
                'city': 'Virtual',
                'start_date': now + timedelta(days=60),
                'end_date': now + timedelta(days=62),
                'registration_start': now,
                'registration_end': now + timedelta(days=55),
                'team_min': 1,
                'team_max': 4,
                'prize_pool': '$100,000 in crypto',
                'tracks': 'DeFi, NFT, DAO, Infrastructure',
                'status': 'published',
                'is_featured': True,
            },
        ]
        
        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                name=event_data['name'],
                defaults=event_data
            )
            if created:
                # Add prizes
                prizes = [
                    {'position': '1st Place', 'reward': '40% of prize pool', 'order': 1},
                    {'position': '2nd Place', 'reward': '30% of prize pool', 'order': 2},
                    {'position': '3rd Place', 'reward': '20% of prize pool', 'order': 3},
                    {'position': 'Best UI/UX', 'reward': '5% of prize pool', 'order': 4},
                    {'position': 'Most Innovative', 'reward': '5% of prize pool', 'order': 5},
                ]
                for prize in prizes:
                    Prize.objects.create(event=event, **prize)
                
                # Add sponsors
                sponsors = [
                    {'name': 'Tech Corp', 'tier': 'Gold'},
                    {'name': 'Cloud Provider', 'tier': 'Silver'},
                    {'name': 'Dev Tools Inc', 'tier': 'Bronze'},
                ]
                for sponsor in sponsors:
                    Sponsor.objects.create(event=event, **sponsor)
                
                self.stdout.write(f'Created event: {event.name}')
        
        # Create some applications
        events = Event.objects.filter(status='published')
        for i, user in enumerate(users[2:], start=1):
            for j, event in enumerate(events[:2]):
                if not EventApplication.objects.filter(event=event, user=user).exists():
                    status = 'pending' if (i + j) % 3 == 0 else 'approved'
                    EventApplication.objects.create(
                        event=event,
                        user=user,
                        team_name=f'Team {user.username}',
                        role='Developer',
                        motivation='I want to build something awesome!',
                        status=status,
                    )
                    self.stdout.write(f'Created application: {user.username} -> {event.name} ({status})')
        
        self.stdout.write(self.style.SUCCESS('\nSeeding completed!'))
        self.stdout.write('\nTest accounts:')
        self.stdout.write('  Admin: admin/admin')
        self.stdout.write('  Users: user1/password, user2/password, etc.')
