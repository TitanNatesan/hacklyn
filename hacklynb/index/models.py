from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class User(AbstractUser):
    """
    Custom User model - simplified to just User and Admin.
    Admin access is controlled by is_staff flag (Django built-in).
    """
    # Override to ensure blank is properly handled and prevent IntegrityError
    first_name = models.CharField(max_length=150, blank=True, default='')
    last_name = models.CharField(max_length=150, blank=True, default='')
    
    profile_completed = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    avatar = models.URLField(blank=True, null=True, help_text="Avatar URL from OAuth provider")
    
    def __str__(self):
        return self.username
    
    @property
    def display_name(self):
        return self.get_full_name() or self.username

    @property
    def get_avatar_url(self):
        if hasattr(self, 'profile') and self.profile.profile_picture:
            return self.profile.profile_picture.url
        return self.avatar


class EmailOTP(models.Model):
    """OTP for email verification and password reset"""
    PURPOSE_CHOICES = [
        ('email_verify', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_otps')
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.email} ({self.purpose})"
    
    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class Institution(models.Model):
    name = models.CharField(max_length=200, unique=True)
    
    def __str__(self):
        return self.name


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    
    def __str__(self):
        return self.name



class Profile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True)
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
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='education_entries', null=True, blank=True)
    start_date = models.CharField(max_length=20, blank=True)
    end_date = models.CharField(max_length=20, blank=True)
    current = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "Education"
    
    def __str__(self):
        return f"{self.degree} at {self.institution}"


class WorkExperience(models.Model):
    """User's work experience"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='work_experience')
    job_title = models.CharField(max_length=200)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='experience_entries', null=True, blank=True)
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
    technologies = models.ManyToManyField(Skill, blank=True, related_name='project_technologies')
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
    slug = models.SlugField(max_length=250, unique=True, blank=True, help_text="URL-friendly identifier (auto-generated)")
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
    themes = models.TextField(blank=True, help_text="Comma-separated themes")
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
    
    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate base slug from name
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Ensure uniqueness
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
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
