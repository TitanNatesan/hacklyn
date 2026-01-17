import os
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Profile,
    Education,
    WorkExperience,
    Project,
    Skill,
    Organization,
    Email,
    Event,
    Prize,
    Sponsor,
    EventApplication,
    Team,
    TeamMember,
    Submission,
    EventCoHost,
    EventRequirement,
    TeamDocument,
    EventQuestion,
    ApplicationResponse,
)

User = get_user_model()


def get_full_url(url_path):
    """Helper to get full URL with backend IP"""
    if not url_path:
        return None
    if str(url_path).startswith(("http://", "https://")):
        return str(url_path)

    backend_url = os.getenv("BACKEND_URL")
    if not backend_url:
        try:
            # Try reading .env file manually from project root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            env_path = os.path.join(base_dir, ".env")
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("BACKEND_URL="):
                            backend_url = line.split("=", 1)[1].strip()
                            break
        except Exception:
            pass

    if not backend_url:
        backend_url = "http://127.0.0.1:8000"

    backend_url = backend_url.rstrip("/")
    url_path = str(url_path)
    if not url_path.startswith("/"):
        url_path = "/" + url_path

    return f"{backend_url}{url_path}"


class UserSerializer(serializers.ModelSerializer):
    """Simplified user serializer - no role field"""

    display_name = serializers.CharField(read_only=True)
    is_admin = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    is_profile_complete = serializers.SerializerMethodField()
    primary_email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "primary_email",
            "first_name",
            "last_name",
            "display_name",
            "avatar",
            "profile_picture",
            "profile_completed",
            "email_verified",
            "is_profile_complete",
            "is_admin",
            "date_joined",
            "auth_provider",
        ]
        read_only_fields = ["id", "date_joined", "is_admin"]

    def get_is_admin(self, obj):
        return obj.is_staff

    def get_email_verified(self, obj):
        return obj.email_verified

    def get_is_profile_complete(self, obj):
        return obj.is_profile_complete()

    def get_primary_email(self, obj):
        return obj.primary_email

    def get_profile_picture(self, obj):
        if hasattr(obj, "profile") and obj.profile.profile_picture:
            return get_full_url(obj.profile.profile_picture.url)
        if obj.avatar:
            return get_full_url(obj.avatar)
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    """For manual user registration"""

    password = serializers.CharField(write_only=True, min_length=1)
    password_confirm = serializers.CharField(write_only=True, min_length=1)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        ]

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        from .models import Email

        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Create empty profile
        Profile.objects.create(user=user)

        # Create Email record for the user's email
        Email.objects.create(
            user=user, email=user.email, is_primary=True, is_verified=False
        )
        return user


class EmailSerializer(serializers.ModelSerializer):
    """Serializer for user email addresses"""

    class Meta:
        model = Email
        fields = [
            "id",
            "email",
            "is_verified",
            "is_primary",
            "verified_at",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "verified_at", "created_at"]


class EmailAddSerializer(serializers.Serializer):
    """Serializer for adding a new email address"""

    email = serializers.EmailField()

    def validate_email(self, value):
        from .models import Email

        if Email.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for organizations (institutions and companies)"""

    type = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "is_company", "type"]

    def get_type(self, obj):
        if obj.is_company is True:
            return "company"
        elif obj.is_company is False:
            return "institution"
        return "unknown"


class EducationSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )
    # Backward compatibility
    institution_name = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            "id",
            "degree",
            "organization",
            "organization_name",
            "institution_name",
            "start_date",
            "end_date",
            "current",
        ]

    def get_institution_name(self, obj):
        """Backward compatibility - returns organization name"""
        if obj.organization:
            return obj.organization.name
        return None


class WorkExperienceSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )
    # Backward compatibility
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkExperience
        fields = [
            "id",
            "job_title",
            "organization",
            "organization_name",
            "company_name",
            "start_date",
            "end_date",
            "description",
            "current",
        ]

    def get_company_name(self, obj):
        """Backward compatibility - returns organization name"""
        if obj.organization:
            return obj.organization.name
        return None


class ProjectSerializer(serializers.ModelSerializer):
    technologies = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "title", "description", "technologies", "link", "role"]


class ProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, read_only=True)
    work_experience = WorkExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    resume = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "profile_picture",
            "tagline",
            "bio",
            "skills",
            "location",
            "achievements",
            "resume",
            "github",
            "linkedin",
            "twitter",
            "website",
            "education",
            "work_experience",
            "projects",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["profile_picture"] = self.get_profile_picture(instance)
        representation["resume"] = self.get_resume(instance)
        return representation

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return get_full_url(obj.profile_picture.url)
        if obj.user.avatar:
            return get_full_url(obj.user.avatar)
        return None

    def get_resume(self, obj):
        if obj.resume:
            return get_full_url(obj.resume.url)
        return None

    def update(self, instance, validated_data):
        """
        Custom update to handle skills Many-to-Many relationship.
        Skills are read_only in serializer but handled here manually.
        """
        # Handle skills separately from request data
        request = self.context.get("request")
        skills_data = request.data.get("skills", None) if request else None

        if skills_data is not None:
            # Clear existing skills
            instance.skills.clear()

            # Process skills (list of strings or objects)
            if isinstance(skills_data, list):
                for skill_item in skills_data:
                    skill_name = (
                        skill_item
                        if isinstance(skill_item, str)
                        else skill_item.get("name", "")
                    )
                    if skill_name:
                        skill, _ = Skill.objects.get_or_create(name=skill_name)
                        instance.skills.add(skill)

        # Update other fields
        for field, value in validated_data.items():
            if field not in ["skills", "education", "work_experience", "projects"]:
                setattr(instance, field, value)

        instance.save()
        return instance


class PrizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prize
        fields = ["id", "position", "reward", "order"]


class SponsorSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Sponsor
        fields = ["id", "name", "logo", "tier", "website"]

    def get_logo(self, obj):
        if obj.logo:
            return get_full_url(obj.logo.url)
        return None


class EventListSerializer(serializers.ModelSerializer):
    """Compact event serializer for lists"""

    organizer = UserSerializer(read_only=True)
    participants_count = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "name",
            "tagline",
            "logo",
            "cover_image",
            "organizer",
            "organizer_name",
            "start_date",
            "end_date",
            "registration_end",
            "mode",
            "city",
            "status",
            "is_featured",
            "prize_pool",
            "participants_count",
            "tracks",
            "themes",
            "created_at",
        ]

    def get_participants_count(self, obj):
        return (
            getattr(obj, "participants_count", 0)
            or obj.applications.filter(status="approved").count()
        )

    def get_logo(self, obj):
        if obj.logo:
            return get_full_url(obj.logo.url)
        return None

    def get_cover_image(self, obj):
        if obj.cover_image:
            return get_full_url(obj.cover_image.url)
        return None


class EventDetailSerializer(serializers.ModelSerializer):
    """Full event details"""

    organizer = UserSerializer(read_only=True)
    prizes = PrizeSerializer(many=True, read_only=True)
    sponsors = SponsorSerializer(many=True, read_only=True)
    participants_count = serializers.SerializerMethodField()
    pending_applications_count = serializers.SerializerMethodField()
    user_has_applied = serializers.SerializerMethodField()
    user_application_status = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "name",
            "tagline",
            "description",
            "logo",
            "cover_image",
            "organizer",
            "organizer_name",
            "organizer_email",
            "website",
            "discord_link",
            "registration_start",
            "registration_end",
            "start_date",
            "end_date",
            "mode",
            "venue",
            "city",
            "team_min",
            "team_max",
            "max_participants",
            "tracks",
            "themes",
            "rules",
            "eligibility",
            "prize_pool",
            "prizes",
            "sponsors",
            "status",
            "is_featured",
            "participants_count",
            "pending_applications_count",
            "user_has_applied",
            "user_application_status",
            "created_at",
            "updated_at",
        ]

    def get_participants_count(self, obj):
        return obj.applications.filter(status="approved").count()

    def get_pending_applications_count(self, obj):
        return obj.applications.filter(status="pending").count()

    def get_user_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.applications.filter(user=request.user).exists()
        return False

    def get_user_application_status(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            app = obj.applications.filter(user=request.user).first()
            return app.status if app else None
        return None

    def get_logo(self, obj):
        if obj.logo:
            return get_full_url(obj.logo.url)
        return None

    def get_cover_image(self, obj):
        if obj.cover_image:
            return get_full_url(obj.cover_image.url)
        return None


class EventCreateSerializer(serializers.ModelSerializer):
    """For creating/updating events with nested prizes"""

    prizes_data = serializers.JSONField(
        write_only=True, required=False, help_text="JSON list of prizes"
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "name",
            "tagline",
            "description",
            "logo",
            "cover_image",
            "organizer_name",
            "organizer_email",
            "website",
            "discord_link",
            "registration_start",
            "registration_end",
            "start_date",
            "end_date",
            "mode",
            "venue",
            "city",
            "team_min",
            "team_max",
            "max_participants",
            "tracks",
            "themes",
            "rules",
            "eligibility",
            "prize_pool",
            "status",
            "is_featured",
            "prizes_data",
        ]
        read_only_fields = ["slug"]

    def create(self, validated_data):
        prizes_data = validated_data.pop("prizes_data", None)
        validated_data["organizer"] = self.context["request"].user
        event = super().create(validated_data)

        if prizes_data:
            for idx, prize_item in enumerate(prizes_data):
                Prize.objects.create(
                    event=event,
                    position=prize_item.get("position", ""),
                    reward=prize_item.get("reward", ""),
                    order=idx,
                )
        return event

    def update(self, instance, validated_data):
        prizes_data = validated_data.pop("prizes_data", None)
        instance = super().update(instance, validated_data)

        if prizes_data is not None:
            # Clear existing prizes and recreate (simplest strategy for order/updates)
            instance.prizes.all().delete()
            for idx, prize_item in enumerate(prizes_data):
                Prize.objects.create(
                    event=instance,
                    position=prize_item.get("position", ""),
                    reward=prize_item.get("reward", ""),
                    order=idx,
                )
        return instance


class EventApplicationSerializer(serializers.ModelSerializer):
    """For viewing and creating applications"""

    user = UserSerializer(read_only=True)
    event_name = serializers.CharField(source="event.name", read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.username", read_only=True
    )

    class Meta:
        model = EventApplication
        fields = [
            "id",
            "event",
            "event_name",
            "user",
            "team",
            "is_solo",
            "team_name",
            "role",
            "motivation",
            "status",
            "rejection_reason",
            "applied_at",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "rejection_reason",
            "applied_at",
            "reviewed_at",
            "reviewed_by",
        ]


class ApplicationReviewSerializer(serializers.Serializer):
    """For approving/rejecting applications"""

    action = serializers.ChoiceField(choices=["approve", "reject", "waitlist"])
    reason = serializers.CharField(required=False, allow_blank=True)


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "user", "role", "is_leader", "joined_via_code", "joined_at"]


class TeamSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "event",
            "name",
            "leader",
            "team_code",
            "status",
            "members",
            "member_count",
            "is_full",
            "created_at",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    presentation_file = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "team",
            "project_title",
            "project_description",
            "technologies",
            "demo_link",
            "repo_link",
            "video_link",
            "presentation_file",
            "status",
            "submitted_at",
            "created_at",
            "updated_at",
        ]

    def get_presentation_file(self, obj):
        if obj.presentation_file:
            return get_full_url(obj.presentation_file.url)
        return None


# ==================== New Serializers for Team Management ====================


class EventCoHostSerializer(serializers.ModelSerializer):
    """Serializer for event co-hosts with permissions"""

    user = UserSerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)
    event_name = serializers.CharField(source="event.name", read_only=True)

    class Meta:
        model = EventCoHost
        fields = [
            "id",
            "event",
            "event_name",
            "user",
            "invited_by",
            "status",
            "can_review_applications",
            "can_edit_event",
            "invited_at",
            "responded_at",
        ]
        read_only_fields = ["id", "invited_by", "status", "invited_at", "responded_at"]


class CoHostInviteSerializer(serializers.Serializer):
    """Serializer for inviting co-hosts with permissions"""

    identifier = serializers.CharField(help_text="Username or email of user to invite")
    can_review_applications = serializers.BooleanField(default=True)
    can_edit_event = serializers.BooleanField(default=False)


class CoHostUpdatePermissionsSerializer(serializers.Serializer):
    """Serializer for updating co-host permissions"""

    can_review_applications = serializers.BooleanField(required=False)
    can_edit_event = serializers.BooleanField(required=False)


class EventRequirementSerializer(serializers.ModelSerializer):
    """Serializer for event requirements (document submissions)"""

    class Meta:
        model = EventRequirement
        fields = [
            "id",
            "event",
            "field_name",
            "field_type",
            "description",
            "is_required",
            "order",
        ]
        read_only_fields = ["id"]


class TeamDocumentSerializer(serializers.ModelSerializer):
    """Serializer for team document uploads"""

    requirement = EventRequirementSerializer(read_only=True)
    requirement_id = serializers.PrimaryKeyRelatedField(
        source="requirement", queryset=EventRequirement.objects.all(), write_only=True
    )
    uploaded_by = UserSerializer(read_only=True)
    value = serializers.SerializerMethodField()

    class Meta:
        model = TeamDocument
        fields = [
            "id",
            "team",
            "requirement",
            "requirement_id",
            "file_value",
            "text_value",
            "url_value",
            "value",
            "uploaded_by",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uploaded_by", "uploaded_at", "updated_at", "value"]

    def get_value(self, obj):
        if obj.requirement.field_type == "file" and obj.file_value:
            return get_full_url(obj.file_value.url)
        elif obj.requirement.field_type == "url":
            return obj.url_value
        return obj.text_value


class TeamDetailSerializer(serializers.ModelSerializer):
    """Detailed team serializer with documents"""

    leader = UserSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)
    documents = TeamDocumentSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    event_name = serializers.CharField(source="event.name", read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "event",
            "event_name",
            "name",
            "leader",
            "team_code",
            "status",
            "members",
            "documents",
            "member_count",
            "is_full",
            "created_at",
        ]


class TeamCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating teams"""

    class Meta:
        model = Team
        fields = ["id", "name", "team_code", "status"]
        read_only_fields = ["id", "team_code", "status"]


class TeamJoinSerializer(serializers.Serializer):
    """Serializer for joining a team via team code"""

    team_code = serializers.UUIDField()
    role = serializers.CharField(required=False, allow_blank=True, max_length=100)


# ==================== Event Questions & Application Responses ====================


class EventQuestionSerializer(serializers.ModelSerializer):
    """Serializer for event-specific application questions"""

    class Meta:
        model = EventQuestion
        fields = [
            "id",
            "event",
            "question_text",
            "field_type",
            "description",
            "placeholder",
            "is_required",
            "order",
            "options",
            "allowed_file_types",
            "max_file_size_mb",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_options(self, value):
        """Ensure options is a list of strings for select fields"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Options must be a list")
        return value


class EventQuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating event questions (without event field)"""

    class Meta:
        model = EventQuestion
        fields = [
            "id",
            "question_text",
            "field_type",
            "description",
            "placeholder",
            "is_required",
            "order",
            "options",
            "allowed_file_types",
            "max_file_size_mb",
        ]
        read_only_fields = ["id"]


class ApplicationResponseSerializer(serializers.ModelSerializer):
    """Serializer for application responses"""

    question = EventQuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(
        source="question", queryset=EventQuestion.objects.all(), write_only=True
    )
    value = serializers.SerializerMethodField()
    file_response_url = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationResponse
        fields = [
            "id",
            "application",
            "question",
            "question_id",
            "text_response",
            "file_response",
            "file_response_url",
            "url_response",
            "selected_options",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "value",
            "file_response_url",
        ]

    def get_value(self, obj):
        """Get the response value based on question type"""
        return obj.value

    def get_file_response_url(self, obj):
        """Get full URL for file responses"""
        if obj.file_response:
            return get_full_url(obj.file_response.url)
        return None


class ApplicationResponseCreateSerializer(serializers.Serializer):
    """Serializer for submitting responses during application"""

    question_id = serializers.IntegerField()
    text_response = serializers.CharField(required=False, allow_blank=True)
    file_response = serializers.FileField(required=False, allow_null=True)
    url_response = serializers.URLField(required=False, allow_blank=True)
    selected_options = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )

    def validate(self, data):
        """Validate that the response matches the question type"""
        question_id = data.get("question_id")
        try:
            question = EventQuestion.objects.get(id=question_id)
        except EventQuestion.DoesNotExist:
            raise serializers.ValidationError({"question_id": "Invalid question ID"})

        # Check required fields
        if question.is_required:
            field_type = question.field_type
            if field_type in ["text", "textarea"] and not data.get("text_response"):
                raise serializers.ValidationError(
                    {"text_response": "This field is required"}
                )
            elif field_type == "file" and not data.get("file_response"):
                raise serializers.ValidationError(
                    {"file_response": "A file upload is required"}
                )
            elif field_type == "url" and not data.get("url_response"):
                raise serializers.ValidationError({"url_response": "A URL is required"})
            elif field_type in ["select", "multiselect"] and not data.get(
                "selected_options"
            ):
                raise serializers.ValidationError(
                    {"selected_options": "Please select an option"}
                )

        data["question"] = question
        return data


class EventApplicationWithResponsesSerializer(serializers.ModelSerializer):
    """Extended application serializer with question responses"""

    user = UserSerializer(read_only=True)
    event_name = serializers.CharField(source="event.name", read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.username", read_only=True
    )
    responses = ApplicationResponseSerializer(many=True, read_only=True)

    class Meta:
        model = EventApplication
        fields = [
            "id",
            "event",
            "event_name",
            "user",
            "team",
            "is_solo",
            "team_name",
            "role",
            "motivation",
            "status",
            "rejection_reason",
            "applied_at",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
            "responses",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "rejection_reason",
            "applied_at",
            "reviewed_at",
            "reviewed_by",
        ]


class EventDetailWithQuestionsSerializer(EventDetailSerializer):
    """Event detail serializer that includes application questions"""

    questions = EventQuestionSerializer(many=True, read_only=True)
