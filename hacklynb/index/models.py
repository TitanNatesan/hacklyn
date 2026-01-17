import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


def get_unique_filename(prefix, filename):
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join(prefix, filename)


def profile_picture_path(instance, filename):
    return get_unique_filename("profiles", filename)


def resume_path(instance, filename):
    return get_unique_filename("resumes", filename)


def event_logo_path(instance, filename):
    return get_unique_filename("event_logos", filename)


def event_cover_path(instance, filename):
    return get_unique_filename("event_covers", filename)


def sponsor_logo_path(instance, filename):
    return get_unique_filename("sponsor_logos", filename)


def submission_file_path(instance, filename):
    return get_unique_filename("submissions", filename)


def team_document_path(instance, filename):
    return get_unique_filename("team_documents", filename)


class User(AbstractUser):
    """
    Custom User model - simplified to just User and Admin.
    Admin access is controlled by is_staff flag (Django built-in).
    """

    # Override to ensure blank is properly handled and prevent IntegrityError
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")

    profile_completed = models.BooleanField(default=False)
    avatar = models.URLField(
        blank=True, null=True, help_text="Avatar URL from OAuth provider"
    )
    auth_provider = models.CharField(
        max_length=50,
        default="email",
        help_text="Auth provider (email, google, github)",
    )

    def __str__(self):
        return self.username

    @property
    def display_name(self):
        return self.get_full_name() or self.username

    @property
    def get_avatar_url(self):
        if hasattr(self, "profile") and self.profile.profile_picture:
            return self.profile.profile_picture.url
        return self.avatar

    @property
    def email_verified(self):
        """Check if user has at least one verified email"""
        return self.emails.filter(is_verified=True).exists()

    @property
    def primary_email(self):
        """Get the primary email for this user"""
        primary = self.emails.filter(is_primary=True).first()
        if primary:
            return primary.email
        # Fallback to the first verified email or any email
        verified = self.emails.filter(is_verified=True).first()
        if verified:
            return verified.email
        return self.emails.first().email if self.emails.exists() else self.email

    def is_profile_complete(self):
        """
        Check if profile is complete for event hosting/applying.
        Requirements: resume, github, linkedin, at least one education entry
        """
        if not hasattr(self, "profile"):
            return False
        profile = self.profile
        has_resume = bool(profile.resume)
        has_github = bool(profile.github)
        has_linkedin = bool(profile.linkedin)
        has_education = profile.education.exists()
        return all([has_resume, has_github, has_linkedin, has_education])


class EmailOTP(models.Model):
    """OTP for email verification and password reset"""

    PURPOSE_CHOICES = [
        ("email_verify", "Email Verification"),
        ("password_reset", "Password Reset"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_otps")
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP for {self.user.email} ({self.purpose})"

    def is_valid(self):
        from django.utils import timezone

        return not self.is_used and self.expires_at > timezone.now()


class Email(models.Model):
    """
    User email addresses with verification status.
    Users can have multiple emails, one marked as primary.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="emails")
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "-is_verified", "-created_at"]
        verbose_name = "Email Address"
        verbose_name_plural = "Email Addresses"

    def __str__(self):
        status = "verified" if self.is_verified else "unverified"
        primary = " (primary)" if self.is_primary else ""
        return f"{self.email} - {status}{primary}"

    def save(self, *args, **kwargs):
        # Ensure only one primary email per user
        if self.is_primary:
            Email.objects.filter(user=self.user, is_primary=True).exclude(
                pk=self.pk
            ).update(is_primary=False)
        super().save(*args, **kwargs)


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Organization(models.Model):
    """
    Combined model for institutions (schools, universities) and companies.
    Replaces the separate Institution and Company models.
    """

    name = models.CharField(max_length=200, unique=True)
    is_company = models.BooleanField(
        null=True,
        blank=True,
        help_text="True for companies, False for institutions, None if ambiguous",
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"

    def __str__(self):
        org_type = ""
        if self.is_company is True:
            org_type = " (Company)"
        elif self.is_company is False:
            org_type = " (Institution)"
        return f"{self.name}{org_type}"



class Profile(models.Model):
    """Extended user profile information"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(
        upload_to=profile_picture_path, blank=True, null=True
    )
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True)
    location = models.CharField(max_length=100, blank=True)
    achievements = models.TextField(blank=True)

    # Resume file
    resume = models.FileField(upload_to=resume_path, blank=True, null=True)

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

    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="education"
    )
    degree = models.CharField(max_length=200)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="education_entries",
        null=True,
        blank=True,
        help_text="The institution where education was obtained",
    )
    start_date = models.CharField(max_length=20, blank=True)
    end_date = models.CharField(max_length=20, blank=True)
    current = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Education"

    def __str__(self):
        org_name = self.organization.name if self.organization else "Unknown"
        return f"{self.degree} at {org_name}"


class WorkExperience(models.Model):
    """User's work experience"""

    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="work_experience"
    )
    job_title = models.CharField(max_length=200)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="experience_entries",
        null=True,
        blank=True,
        help_text="The company where work was performed",
    )
    start_date = models.CharField(max_length=20, blank=True)
    end_date = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    current = models.BooleanField(default=False)

    def __str__(self):
        org_name = self.organization.name if self.organization else "Unknown"
        return f"{self.job_title} at {org_name}"


class Project(models.Model):
    """User's portfolio projects"""

    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="projects"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    technologies = models.ManyToManyField(
        Skill, blank=True, related_name="project_technologies"
    )
    link = models.URLField(blank=True)
    role = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title


class Event(models.Model):
    """Hackathon/Workshop/Event model - any user can create and manage"""

    MODE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
        ("hybrid", "Hybrid"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    # Organizer (any user can create events)
    organizer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="organized_events"
    )

    # Basic info
    name = models.CharField(max_length=200)
    slug = models.SlugField(
        max_length=250,
        unique=True,
        blank=True,
        help_text="URL-friendly identifier (auto-generated)",
    )
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    logo = models.ImageField(upload_to=event_logo_path, blank=True, null=True)
    cover_image = models.ImageField(upload_to=event_cover_path, blank=True, null=True)

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
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default="offline")
    venue = models.CharField(max_length=300, blank=True)
    city = models.CharField(max_length=100, blank=True)

    # Team settings
    team_min = models.PositiveIntegerField(default=1)
    team_max = models.PositiveIntegerField(default=4)
    max_participants = models.PositiveIntegerField(
        null=True, blank=True, help_text="Maximum total participants"
    )

    # Event details
    tracks = models.TextField(blank=True, help_text="Comma-separated tracks/themes")
    themes = models.TextField(blank=True, help_text="Comma-separated themes")
    rules = models.TextField(blank=True)
    eligibility = models.TextField(blank=True, help_text="Who can participate")

    # Prizes
    prize_pool = models.CharField(max_length=100, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

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
        return self.applications.filter(status="approved").count()

    @property
    def pending_applications_count(self):
        return self.applications.filter(status="pending").count()


class Prize(models.Model):
    """Event prizes"""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="prizes")
    position = models.CharField(max_length=50)
    reward = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.position} - {self.reward}"


class Sponsor(models.Model):
    """Event sponsors"""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="sponsors")
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to=sponsor_logo_path, blank=True, null=True)
    tier = models.CharField(
        max_length=50, blank=True, help_text="e.g., Gold, Silver, Bronze"
    )
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name


class EventApplication(models.Model):
    """
    User application to participate in an event.
    Organizer can approve/reject applications.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("waitlisted", "Waitlisted"),
    ]

    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="applications"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="event_applications"
    )
    team = models.ForeignKey(
        "Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )

    # Application details
    is_solo = models.BooleanField(
        default=False, help_text="True if applying as solo participant"
    )
    team_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(
        max_length=100, blank=True, help_text="e.g., Developer, Designer"
    )
    motivation = models.TextField(
        blank=True, help_text="Why do you want to participate?"
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rejection_reason = models.TextField(blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )

    class Meta:
        unique_together = ["event", "user"]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.user.username} - {self.event.name} ({self.status})"


class Team(models.Model):
    """Team for an event with UUID-based team code for joining"""

    STATUS_CHOICES = [
        ("forming", "Forming"),
        ("complete", "Complete"),
        ("submitted", "Submitted"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=100)
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name="led_teams")
    team_code = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Unique code for team joining",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="forming")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["event", "name"]

    def __str__(self):
        return f"{self.name} ({self.event.name})"

    @property
    def member_count(self):
        return self.members.count()

    @property
    def is_full(self):
        return self.member_count >= self.event.team_max


class TeamMember(models.Model):
    """Team membership with tracking for how member joined"""

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="team_memberships"
    )
    role = models.CharField(max_length=100, blank=True)
    is_leader = models.BooleanField(default=False)
    joined_via_code = models.BooleanField(
        default=False, help_text="True if member joined using team code"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["team", "user"]

    def __str__(self):
        return f"{self.user.username} in {self.team.name}"


class Submission(models.Model):
    """Project submission by a team"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
    ]

    team = models.OneToOneField(
        Team, on_delete=models.CASCADE, related_name="submission"
    )

    # Project details
    project_title = models.CharField(max_length=200, blank=True)
    project_description = models.TextField(blank=True)
    technologies = models.TextField(blank=True)

    # Links
    demo_link = models.URLField(blank=True)
    repo_link = models.URLField(blank=True)
    video_link = models.URLField(blank=True)
    presentation_file = models.FileField(
        upload_to=submission_file_path, blank=True, null=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project_title or 'Untitled'} by {self.team.name}"


class EventCoHost(models.Model):
    """Collaborative hosts for events with granular permissions"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="cohosts")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="cohost_events"
    )
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="sent_cohost_invites"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    invited_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    # Granular permissions for co-hosts
    can_review_applications = models.BooleanField(
        default=True, help_text="Can approve/reject/waitlist applications and teams"
    )
    can_edit_event = models.BooleanField(
        default=False,
        help_text="Can edit event details (name, description, dates, etc.)",
    )

    class Meta:
        unique_together = ["event", "user"]
        verbose_name = "Event Co-Host"
        verbose_name_plural = "Event Co-Hosts"

    def __str__(self):
        return f"{self.user.username} - {self.event.name} ({self.status})"

    def has_permission(self, permission_name):
        """Check if co-host has a specific permission"""
        if self.status != "accepted":
            return False
        return getattr(self, f"can_{permission_name}", False)


class EventRequirement(models.Model):
    """Dynamic requirements for event applications (e.g., PPT submission)"""

    FIELD_TYPES = [
        ("file", "File Upload"),
        ("text", "Text"),
        ("url", "URL"),
    ]

    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="requirements"
    )
    field_name = models.CharField(
        max_length=100, help_text="e.g., 'Project PPT', 'Demo Video URL'"
    )
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default="file")
    description = models.TextField(
        blank=True, help_text="Instructions for participants"
    )
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "Event Requirement"
        verbose_name_plural = "Event Requirements"

    def __str__(self):
        return f"{self.field_name} ({self.event.name})"


class TeamDocument(models.Model):
    """Documents uploaded by teams to fulfill event requirements"""

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="documents")
    requirement = models.ForeignKey(
        EventRequirement, on_delete=models.CASCADE, related_name="submissions"
    )

    # Different value types based on requirement field_type
    file_value = models.FileField(upload_to=team_document_path, blank=True, null=True)
    text_value = models.TextField(blank=True)
    url_value = models.URLField(blank=True)

    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="uploaded_documents"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["team", "requirement"]
        verbose_name = "Team Document"
        verbose_name_plural = "Team Documents"

    def __str__(self):
        return f"{self.requirement.field_name} - {self.team.name}"

    @property
    def value(self):
        """Return the appropriate value based on requirement type"""
        if self.requirement.field_type == "file":
            return self.file_value.url if self.file_value else None
        elif self.requirement.field_type == "url":
            return self.url_value
        return self.text_value


def application_response_file_path(instance, filename):
    return get_unique_filename("application_responses", filename)


class EventQuestion(models.Model):
    """
    Custom questions that event organizers can add to their application forms.
    Similar to Google Forms - supports text, file upload, URL, and select options.
    """

    FIELD_TYPES = [
        ("text", "Short Text"),
        ("textarea", "Long Text"),
        ("file", "File Upload"),
        ("url", "URL Link"),
        ("select", "Single Select"),
        ("multiselect", "Multiple Select"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="questions")
    question_text = models.CharField(
        max_length=500, help_text="The question to ask applicants"
    )
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default="text")
    description = models.TextField(
        blank=True, help_text="Additional instructions or context"
    )
    placeholder = models.CharField(
        max_length=200, blank=True, help_text="Placeholder text for input"
    )
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    # For select/multiselect types - store options as JSON array
    options = models.JSONField(
        default=list, blank=True, help_text="Options for select fields (JSON array)"
    )

    # File upload constraints
    allowed_file_types = models.CharField(
        max_length=200,
        blank=True,
        default=".pdf,.doc,.docx,.ppt,.pptx",
        help_text="Comma-separated file extensions (e.g., .pdf,.docx)",
    )
    max_file_size_mb = models.PositiveIntegerField(
        default=10, help_text="Max file size in MB"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]
        verbose_name = "Event Question"
        verbose_name_plural = "Event Questions"

    def __str__(self):
        return f"{self.question_text[:50]} ({self.event.name})"


class ApplicationResponse(models.Model):
    """
    Stores participant responses to event-specific questions.
    Each response links to an EventApplication and an EventQuestion.
    """

    application = models.ForeignKey(
        EventApplication, on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(
        EventQuestion, on_delete=models.CASCADE, related_name="responses"
    )

    # Response values - only one will be used based on question type
    text_response = models.TextField(blank=True)
    file_response = models.FileField(
        upload_to=application_response_file_path, blank=True, null=True
    )
    url_response = models.URLField(blank=True)
    # For select/multiselect - store selected option(s) as JSON
    selected_options = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["application", "question"]
        verbose_name = "Application Response"
        verbose_name_plural = "Application Responses"

    def __str__(self):
        return f"Response to '{self.question.question_text[:30]}' by {self.application.user.username}"

    @property
    def value(self):
        """Return the appropriate value based on question type"""
        field_type = self.question.field_type
        if field_type == "file":
            return self.file_response.url if self.file_response else None
        elif field_type == "url":
            return self.url_response
        elif field_type in ["select", "multiselect"]:
            return self.selected_options
        return self.text_response
