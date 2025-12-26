from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """
    Custom User model - simplified to just User and Admin.
    Admin access is controlled by is_staff flag (Django built-in).
    """
    profile_completed = models.BooleanField(default=False)
    avatar = models.URLField(blank=True, null=True, help_text="Avatar URL from OAuth provider")
    
    def __str__(self):
        return self.username
    
    @property
    def display_name(self):
        return self.get_full_name() or self.username


class Profile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text="Comma-separated skills")
    location = models.CharField(max_length=100, blank=True)
    achievements = models.TextField(blank=True)
    
    # Social links
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    website = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile of {self.user.username}"


class Education(models.Model):
    """User's education history"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=200)
    school = models.CharField(max_length=200)
    start_date = models.CharField(max_length=20, blank=True)
    end_date = models.CharField(max_length=20, blank=True)
    current = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "Education"
    
    def __str__(self):
        return f"{self.degree} at {self.school}"


class WorkExperience(models.Model):
    """User's work experience"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='work_experience')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.CharField(max_length=20, blank=True)
    end_date = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    current = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.job_title} at {self.company}"


class Project(models.Model):
    """User's portfolio projects"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    technologies = models.TextField(blank=True, help_text="Comma-separated technologies")
    link = models.URLField(blank=True)
    role = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return self.title


class Event(models.Model):
    """Hackathon/Workshop/Event model - any user can create and manage"""
    MODE_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('hybrid', 'Hybrid'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Organizer (any user can create events)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    
    # Basic info
    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    logo = models.ImageField(upload_to='event_logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='event_covers/', blank=True, null=True)
    
    # Organizer details
    organizer_name = models.CharField(max_length=200)
    organizer_email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    discord_link = models.URLField(blank=True, help_text="Discord/Slack invite link")
    
    # Timeline
    registration_start = models.DateTimeField(null=True, blank=True)
    registration_end = models.DateTimeField(null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Location
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='offline')
    venue = models.CharField(max_length=300, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Team settings
    team_min = models.PositiveIntegerField(default=1)
    team_max = models.PositiveIntegerField(default=4)
    max_participants = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum total participants")
    
    # Event details
    tracks = models.TextField(blank=True, help_text="Comma-separated tracks/themes")
    rules = models.TextField(blank=True)
    eligibility = models.TextField(blank=True, help_text="Who can participate")
    
    # Prizes
    prize_pool = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def participants_count(self):
        return self.applications.filter(status='approved').count()
    
    @property
    def pending_applications_count(self):
        return self.applications.filter(status='pending').count()


class Prize(models.Model):
    """Event prizes"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='prizes')
    position = models.CharField(max_length=50)
    reward = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.position} - {self.reward}"


class Sponsor(models.Model):
    """Event sponsors"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='sponsors')
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='sponsor_logos/', blank=True, null=True)
    tier = models.CharField(max_length=50, blank=True, help_text="e.g., Gold, Silver, Bronze")
    website = models.URLField(blank=True)
    
    def __str__(self):
        return self.name


class EventApplication(models.Model):
    """
    User application to participate in an event.
    Organizer can approve/reject applications.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_applications')
    
    # Application details
    team_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=100, blank=True, help_text="e.g., Developer, Designer")
    motivation = models.TextField(blank=True, help_text="Why do you want to participate?")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)
    
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_applications'
    )
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.name} ({self.status})"


class Team(models.Model):
    """Team for an event"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='led_teams')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['event', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.event.name})"
    
    @property
    def member_count(self):
        return self.members.count()


class TeamMember(models.Model):
    """Team membership"""
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    role = models.CharField(max_length=100, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['team', 'user']
    
    def __str__(self):
        return f"{self.user.username} in {self.team.name}"


class Submission(models.Model):
    """Project submission by a team"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
    ]
    
    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='submission')
    
    # Project details
    project_title = models.CharField(max_length=200, blank=True)
    project_description = models.TextField(blank=True)
    technologies = models.TextField(blank=True)
    
    # Links
    demo_link = models.URLField(blank=True)
    repo_link = models.URLField(blank=True)
    video_link = models.URLField(blank=True)
    presentation_file = models.FileField(upload_to='submissions/', blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.project_title or 'Untitled'} by {self.team.name}"
