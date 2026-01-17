from rest_framework import generics, status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import random
import string

from .models import (
    User,
    Email,
    Profile,
    Education,
    WorkExperience,
    Project,
    Skill,
    Organization,
    Event,
    Prize,
    Sponsor,
    EventApplication,
    Team,
    TeamMember,
    Submission,
    EmailOTP,
    EventCoHost,
    EventRequirement,
    TeamDocument,
    EventQuestion,
    ApplicationResponse,
)
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ProfileSerializer,
    EducationSerializer,
    WorkExperienceSerializer,
    ProjectSerializer,
    SkillSerializer,
    OrganizationSerializer,
    EmailSerializer,
    EmailAddSerializer,
    EventListSerializer,
    EventDetailSerializer,
    EventCreateSerializer,
    EventApplicationSerializer,
    ApplicationReviewSerializer,
    TeamSerializer,
    SubmissionSerializer,
    PrizeSerializer,
    SponsorSerializer,
    EventCoHostSerializer,
    CoHostInviteSerializer,
    CoHostUpdatePermissionsSerializer,
    EventRequirementSerializer,
    TeamDocumentSerializer,
    TeamDetailSerializer,
    TeamCreateSerializer,
    TeamJoinSerializer,
    EventQuestionSerializer,
    EventQuestionCreateSerializer,
    ApplicationResponseSerializer,
    ApplicationResponseCreateSerializer,
    EventApplicationWithResponsesSerializer,
    EventDetailWithQuestionsSerializer,
)


# ==================== Permissions ====================


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, others can only read"""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, "organizer"):
            return obj.organizer == request.user
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False


class IsEventOrganizer(permissions.BasePermission):
    """Check if user is the event organizer"""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "event"):
            return obj.event.organizer == request.user
        return obj.organizer == request.user


class IsEventOrganizerOrCoHost(permissions.BasePermission):
    """Check if user is the event organizer or an accepted co-host"""

    def has_object_permission(self, request, view, obj):
        event = obj if isinstance(obj, Event) else getattr(obj, "event", None)
        if not event:
            return False
        # Check if organizer
        if event.organizer == request.user:
            return True
        # Check if accepted co-host
        return event.cohosts.filter(user=request.user, status="accepted").exists()


class IsEventOrganizerOrCoHostWithReviewPermission(permissions.BasePermission):
    """Check if user is organizer or co-host with review permission"""

    def has_object_permission(self, request, view, obj):
        event = obj if isinstance(obj, Event) else getattr(obj, "event", None)
        if not event:
            return False
        # Organizer has full access
        if event.organizer == request.user:
            return True
        # Check if co-host with review permission
        cohost = event.cohosts.filter(user=request.user, status="accepted").first()
        if cohost and cohost.can_review_applications:
            return True
        return False


class IsEventOrganizerOrCoHostWithEditPermission(permissions.BasePermission):
    """Check if user is organizer or co-host with edit permission"""

    def has_object_permission(self, request, view, obj):
        event = obj if isinstance(obj, Event) else getattr(obj, "event", None)
        if not event:
            return False
        # Organizer has full access
        if event.organizer == request.user:
            return True
        # Check if co-host with edit permission
        cohost = event.cohosts.filter(user=request.user, status="accepted").first()
        if cohost and cohost.can_edit_event:
            return True
        return False


class ProfileCompletePermission(permissions.BasePermission):
    """
    Require user to have a complete profile.
    Complete = resume, GitHub, LinkedIn, and at least one education entry.
    """

    message = "Please complete your profile (resume, GitHub, LinkedIn, and education) before proceeding."

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        return user.is_profile_complete()


# ==================== Helper Functions ====================


def validate_profile_for_application(user):
    """
    Validate that user profile meets minimum requirements for event application.
    Requirements: education, resume, GitHub URL, LinkedIn URL
    Projects are OPTIONAL and NOT validated.
    """
    profile = getattr(user, "profile", None)
    if not profile:
        return False, "Please complete your profile first"

    missing = []
    if not profile.education.exists():
        missing.append("education details")
    if not profile.resume:
        missing.append("resume")
    if not profile.github:
        missing.append("GitHub URL")
    if not profile.linkedin:
        missing.append("LinkedIn URL")

    if missing:
        return False, f'Please complete your profile. Missing: {", ".join(missing)}'

    return True, None


# ==================== Auth Views ====================


class RegisterView(APIView):
    """Manual user registration"""

    permission_classes = []

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Manual login with username/password"""

    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class OAuthCallbackView(APIView):
    """
    Handle OAuth callback - convert allauth session to JWT tokens.
    Frontend redirects here after OAuth flow.
    """

    permission_classes = []

    def get(self, request):
        # If user is authenticated via allauth session, return JWT tokens
        if request.user.is_authenticated:
            refresh = RefreshToken.for_user(request.user)
            return Response(
                {
                    "user": UserSerializer(request.user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                }
            )
        return Response(
            {"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
        )


class CurrentUserView(APIView):
    """Get current authenticated user"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        new_email = request.data.get("email")

        # Check if email is being changed
        if new_email and new_email != user.email:
            # If OAuth user, prevent email change
            if user.auth_provider != "email":
                return Response(
                    {
                        "error": f"You cannot change your email as you are signed in via {user.auth_provider}."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Check if email is already taken
            if Email.objects.filter(email=new_email).exists():
                return Response(
                    {"error": "This email is already registered."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update user's email and create new Email record
            user.email = new_email
            user.save()

            # Update or create Email record
            email_obj, created = Email.objects.update_or_create(
                user=user,
                is_primary=True,
                defaults={"email": new_email, "is_verified": False},
            )

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Email OTP Views ====================


def generate_otp():
    """Generate a 6-digit OTP"""
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(user, otp, purpose):
    """Send OTP email to user"""
    if purpose == "email_verify":
        subject = "Hacklyn - Verify Your Email"
        message = f"""Hello {user.first_name or user.username},

Your OTP for email verification is: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Best regards,
Team Hacklyn"""
    else:  # password_reset
        subject = "Hacklyn - Password Reset OTP"
        message = f"""Hello {user.first_name or user.username},

Your OTP for password reset is: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Best regards,
Team Hacklyn"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


class SendEmailOTPView(APIView):
    """Send OTP for email verification"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        email_address = request.data.get("email", user.email)

        # Get the email record
        email_obj = Email.objects.filter(user=user, email=email_address).first()
        if not email_obj:
            return Response(
                {"error": "Email not found for this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email_obj.is_verified:
            return Response(
                {"message": "Email is already verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Invalidate previous unused OTPs
        EmailOTP.objects.filter(
            user=user, purpose="email_verify", is_used=False
        ).update(is_used=True)

        # Generate new OTP
        otp = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)

        EmailOTP.objects.create(
            user=user, otp=otp, purpose="email_verify", expires_at=expires_at
        )

        # Send email
        if send_otp_email(user, otp, "email_verify"):
            return Response({"message": "OTP sent to your email"})
        else:
            return Response(
                {"error": "Failed to send email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyEmailOTPView(APIView):
    """Verify OTP for email verification"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get("otp", "").strip()
        email_address = request.data.get("email", user.email)

        if not otp:
            return Response(
                {"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get the email record
        email_obj = Email.objects.filter(user=user, email=email_address).first()
        if not email_obj:
            return Response(
                {"error": "Email not found for this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email_obj.is_verified:
            return Response({"message": "Email is already verified"})

        # Find valid OTP
        otp_record = EmailOTP.objects.filter(
            user=user, otp=otp, purpose="email_verify", is_used=False
        ).first()

        if not otp_record:
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not otp_record.is_valid():
            return Response(
                {"error": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark OTP as used and verify email
        otp_record.is_used = True
        otp_record.save()

        email_obj.is_verified = True
        email_obj.verified_at = timezone.now()
        email_obj.save()

        return Response(
            {
                "message": "Email verified successfully",
                "user": UserSerializer(user).data,
            }
        )


class ForgotPasswordView(APIView):
    """Send OTP for password reset"""

    permission_classes = []

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists
            return Response(
                {
                    "message": "If an account exists with this email, an OTP has been sent."
                }
            )

        # Invalidate previous unused OTPs
        EmailOTP.objects.filter(
            user=user, purpose="password_reset", is_used=False
        ).update(is_used=True)

        # Generate new OTP
        otp = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)

        EmailOTP.objects.create(
            user=user, otp=otp, purpose="password_reset", expires_at=expires_at
        )

        # Send email
        send_otp_email(user, otp, "password_reset")

        return Response(
            {"message": "If an account exists with this email, an OTP has been sent."}
        )


class ResetPasswordView(APIView):
    """Reset password with OTP"""

    permission_classes = []

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        otp = request.data.get("otp", "").strip()
        new_password = request.data.get("new_password", "")

        if not all([email, otp, new_password]):
            return Response(
                {"error": "Email, OTP, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 1:
            return Response(
                {"error": "Password is too short"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Find valid OTP
        otp_record = EmailOTP.objects.filter(
            user=user, otp=otp, purpose="password_reset", is_used=False
        ).first()

        if not otp_record:
            return Response(
                {"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not otp_record.is_valid():
            return Response(
                {"error": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark OTP as used and update password
        otp_record.is_used = True
        otp_record.save()

        user.set_password(new_password)
        user.save()

        return Response(
            {
                "message": "Password reset successfully. Please login with your new password."
            }
        )


# ==================== Profile Views ====================


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's profile"""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class AutocompleteView(APIView):
    """
    Search for skills, organizations (institutions/companies).
    Usage: /api/autocomplete/?type=skill&q=python
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        search_type = request.query_params.get("type", "skill").lower()

        if not query:
            return Response([])

        results = []
        if search_type == "skill":
            items = Skill.objects.filter(name__icontains=query)[:10]
            results = SkillSerializer(items, many=True).data
        elif search_type == "institution":
            # Search organizations that are institutions (is_company=False or None)
            items = Organization.objects.filter(name__icontains=query).filter(
                Q(is_company=False) | Q(is_company__isnull=True)
            )[:10]
            results = OrganizationSerializer(items, many=True).data
        elif search_type == "company":
            # Search organizations that are companies (is_company=True or None)
            items = Organization.objects.filter(name__icontains=query).filter(
                Q(is_company=True) | Q(is_company__isnull=True)
            )[:10]
            results = OrganizationSerializer(items, many=True).data
        elif search_type == "organization":
            # Search all organizations
            items = Organization.objects.filter(name__icontains=query)[:10]
            results = OrganizationSerializer(items, many=True).data

        return Response(results)


class ProfileCompleteView(APIView):
    """
    Handle final profile completion step.
    Updates User, Profile, and creates nested data (Education, Projects, etc.)
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            data = request.data

            # --- 1. Update User Info ---
            if "fullName" in data:
                # Simple name splitting logic
                parts = data["fullName"].strip().split(" ", 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""

            if "email" in data and data["email"] != user.email:
                # Check uniqueness if email is changed?
                # For now just trust or ignore if taken
                if (
                    not User.objects.exclude(pk=user.pk)
                    .filter(email=data["email"])
                    .exists()
                ):
                    user.email = data["email"]

            user.profile_completed = True
            user.save()

            # --- 2. Update Basic Profile Info ---
            profile, _ = Profile.objects.get_or_create(user=user)

            # Map frontend fields to model fields
            simple_fields = [
                "tagline",
                "bio",
                "location",
                "achievements",
                "github",
                "linkedin",
                "twitter",
                "website",
            ]

            for field in simple_fields:
                if field in data:
                    setattr(profile, field, data[field])

            # Handle skills (Skill M2M)
            if "skills" in data:
                skills_data = data["skills"]
                if isinstance(skills_data, str):
                    skill_names = [
                        s.strip() for s in skills_data.split(",") if s.strip()
                    ]
                elif isinstance(skills_data, list):
                    # Could be list of strings or list of objects
                    skill_names = [
                        s if isinstance(s, str) else s.get("name", "")
                        for s in skills_data
                    ]
                else:
                    skill_names = []

                # Clear and set new skills
                profile.skills.clear()
                for s_name in skill_names:
                    if s_name:
                        skill, _ = Skill.objects.get_or_create(name=s_name)
                        profile.skills.add(skill)

            profile.save()

            # --- 3. Update Nested Data (Education) ---
            if "education" in data and isinstance(data["education"], list):
                profile.education.all().delete()
                for edu in data["education"]:
                    inst_name = (
                        edu.get("school", "")
                        or edu.get("institution_name", "")
                        or edu.get("organization_name", "")
                    )
                    organization = None
                    if inst_name:
                        organization, _ = Organization.objects.get_or_create(
                            name=inst_name,
                            defaults={"is_company": False},  # Education = institution
                        )

                    Education.objects.create(
                        profile=profile,
                        degree=edu.get("degree", ""),
                        organization=organization,
                        start_date=edu.get("startDate", ""),
                        end_date=edu.get("endDate", ""),
                        current=edu.get("current", False),
                    )

            # --- 4. Update Nested Data (Work Experience) ---
            if "workExperience" in data and isinstance(data["workExperience"], list):
                profile.work_experience.all().delete()
                for work in data["workExperience"]:
                    comp_name = (
                        work.get("company", "")
                        or work.get("company_name", "")
                        or work.get("organization_name", "")
                    )
                    organization = None
                    if comp_name:
                        organization, _ = Organization.objects.get_or_create(
                            name=comp_name,
                            defaults={"is_company": True},  # Work = company
                        )

                    WorkExperience.objects.create(
                        profile=profile,
                        organization=organization,
                        job_title=work.get("jobTitle", ""),
                        start_date=work.get("startDate", ""),
                        end_date=work.get("endDate", ""),
                        current=work.get("current", False),
                        description=work.get("description", ""),
                    )

            # --- 5. Update Nested Data (Projects) ---
            if "projects" in data and isinstance(data["projects"], list):
                profile.projects.all().delete()
                for proj in data["projects"]:
                    project = Project.objects.create(
                        profile=profile,
                        title=proj.get("title", ""),
                        role=proj.get("role", ""),
                        description=proj.get("description", ""),
                        link=proj.get("link", ""),
                    )

                    # Handle project technologies (Skill M2M)
                    techs = proj.get("technologies", "")
                    if isinstance(techs, str):
                        tech_names = [t.strip() for t in techs.split(",") if t.strip()]
                    elif isinstance(techs, list):
                        tech_names = [
                            t if isinstance(t, str) else t.get("name", "")
                            for t in techs
                        ]
                    else:
                        tech_names = []

                    for t_name in tech_names:
                        if t_name:
                            skill, _ = Skill.objects.get_or_create(name=t_name)
                            project.technologies.add(skill)

            # --- 6. Return updated user and tokens ---
            # Refresh tokens to embed new profile_completed status if needed (though tokens often stateless)
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Profile completed successfully",
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                }
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetailView(generics.RetrieveAPIView):
    """View any user's public profile"""

    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]
    lookup_field = "user__username"
    lookup_url_kwarg = "username"


class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(profile__user=self.request.user)


class WorkExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class WorkExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(profile__user=self.request.user)


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(profile__user=self.request.user)


# ==================== Event Views ====================


class EventListCreateView(generics.ListCreateAPIView):
    """List all published events or create new event"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EventCreateSerializer
        return EventListSerializer

    def create(self, request, *args, **kwargs):
        # Check email verification before creating event
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before hosting events.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check profile completion
        if not request.user.is_profile_complete():
            return Response(
                {
                    "error": "Please complete your profile (resume, GitHub, LinkedIn, and education) before hosting events.",
                    "profile_complete": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Event.objects.filter(status__in=["published", "ongoing"])

        # Search
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(tagline__icontains=search)
                | Q(organizer_name__icontains=search)
            )

        # Filter by mode
        mode = self.request.query_params.get("mode")
        if mode:
            queryset = queryset.filter(mode=mode)

        # Filter by city
        city = self.request.query_params.get("city")
        if city:
            queryset = queryset.filter(city__icontains=city)

        return queryset.order_by("-is_featured", "-created_at")


class FeaturedEventsView(generics.ListAPIView):
    """Get featured events"""

    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.filter(
            is_featured=True, status__in=["published", "ongoing"]
        ).order_by("-created_at")[:6]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete an event by slug"""

    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return EventCreateSerializer
        return EventDetailSerializer


class MyEventsView(generics.ListAPIView):
    """List events organized by current user or where they are a co-host"""

    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Event.objects.filter(
                Q(organizer=user) | Q(cohosts__user=user, cohosts__status="accepted")
            )
            .distinct()
            .order_by("-created_at")
        )


# ==================== Event Application Views ====================


class ApplyToEventView(APIView):
    """Apply to participate in an event"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        # Check email verification
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before applying to events.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            event = Event.objects.get(slug=slug)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already applied
        if EventApplication.objects.filter(event=event, user=request.user).exists():
            return Response(
                {"error": "Already applied to this event"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check registration period
        now = timezone.now()
        if event.registration_end and now > event.registration_end:
            return Response(
                {"error": "Registration is closed"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EventApplicationSerializer(
            data={
                "event": event.id,
                "team_name": request.data.get("team_name", ""),
                "role": request.data.get("role", ""),
                "motivation": request.data.get("motivation", ""),
            }
        )

        if serializer.is_valid():
            serializer.save(user=request.user, event=event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(generics.ListAPIView):
    """List current user's event applications"""

    serializer_class = EventApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EventApplication.objects.filter(user=self.request.user).order_by(
            "-applied_at"
        )


class EventApplicationsView(generics.ListAPIView):
    """List all applications for an event (organizer/co-host only)"""

    serializer_class = EventApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        try:
            event = Event.objects.get(slug=slug)
        except Event.DoesNotExist:
            return EventApplication.objects.none()

        # Check permissions manually since we're filtering the queryset
        is_organizer = event.organizer == self.request.user
        is_cohost = event.cohosts.filter(
            user=self.request.user, status="accepted"
        ).exists()

        if not (is_organizer or is_cohost):
            return EventApplication.objects.none()

        queryset = event.applications.all()

        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by("-applied_at")


class ReviewApplicationView(APIView):
    """Approve or reject an application (organizer/co-host with review permission only)"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug, app_id):
        try:
            event = Event.objects.get(slug=slug)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check permissions - organizer has full access, co-hosts need review permission
        is_organizer = event.organizer == request.user
        cohost = event.cohosts.filter(user=request.user, status="accepted").first()
        has_review_permission = (
            cohost and cohost.can_review_applications if cohost else False
        )

        if not (is_organizer or has_review_permission):
            return Response(
                {"error": "Not authorized to review applications"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            application = EventApplication.objects.get(pk=app_id, event=event)
        except EventApplication.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ApplicationReviewSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data["action"]
            reason = serializer.validated_data.get("reason", "")

            if action == "approve":
                application.status = "approved"
            elif action == "reject":
                application.status = "rejected"
                application.rejection_reason = reason
            elif action == "waitlist":
                application.status = "waitlisted"

            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()

            return Response(EventApplicationSerializer(application).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkReviewApplicationsView(APIView):
    """Approve or reject multiple applications at once"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            event = Event.objects.get(slug=slug, organizer=request.user)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found or not authorized"},
                status=status.HTTP_404_NOT_FOUND,
            )

        application_ids = request.data.get("application_ids", [])
        action = request.data.get("action")
        reason = request.data.get("reason", "")

        if action not in ["approve", "reject", "waitlist"]:
            return Response(
                {"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

        applications = EventApplication.objects.filter(
            pk__in=application_ids, event=event
        )

        status_map = {
            "approve": "approved",
            "reject": "rejected",
            "waitlist": "waitlisted",
        }

        for app in applications:
            app.status = status_map[action]
            if action == "reject":
                app.rejection_reason = reason
            app.reviewed_at = timezone.now()
            app.reviewed_by = request.user
            app.save()

        return Response({"message": f"{applications.count()} applications updated"})


# ==================== Prize & Sponsor Views ====================


class PrizeListCreateView(generics.ListCreateAPIView):
    """List or create prizes for an event"""

    serializer_class = PrizeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Prize.objects.filter(event__slug=self.kwargs.get("slug"))

    def perform_create(self, serializer):
        event = Event.objects.get(
            slug=self.kwargs.get("slug"), organizer=self.request.user
        )
        serializer.save(event=event)


class SponsorListCreateView(generics.ListCreateAPIView):
    """List or create sponsors for an event"""

    serializer_class = SponsorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Sponsor.objects.filter(event__slug=self.kwargs.get("slug"))

    def perform_create(self, serializer):
        event = Event.objects.get(
            slug=self.kwargs.get("slug"), organizer=self.request.user
        )
        serializer.save(event=event)


# ==================== Team Views ====================


class TeamListCreateView(generics.ListCreateAPIView):
    """List teams for an event or create a team"""

    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(event__slug=self.kwargs.get("slug"))

    def perform_create(self, serializer):
        event = Event.objects.get(slug=self.kwargs.get("slug"))
        team = serializer.save(event=event, leader=self.request.user)
        # Add leader as team member
        TeamMember.objects.create(
            team=team, user=self.request.user, role="Leader", is_leader=True
        )


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a team"""

    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Team.objects.all()


class MyTeamsView(generics.ListAPIView):
    """List teams the current user is a member of"""

    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(members__user=self.request.user)


# ==================== Submission Views ====================


class SubmissionView(generics.RetrieveUpdateAPIView):
    """Get or update team submission"""

    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        team = Team.objects.get(pk=self.kwargs.get("team_id"))
        submission, _ = Submission.objects.get_or_create(team=team)
        return submission


class SubmitProjectView(APIView):
    """Final submission of project"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            if not team.members.filter(user=request.user).exists():
                return Response(
                    {"error": "Not a team member"}, status=status.HTTP_403_FORBIDDEN
                )
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND
            )

        submission, _ = Submission.objects.get_or_create(team=team)
        submission.status = "submitted"
        submission.submitted_at = timezone.now()
        submission.save()

        return Response(SubmissionSerializer(submission).data)


# ==================== Dashboard Stats ====================


class DashboardStatsView(APIView):
    """Get dashboard statistics for current user"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Events organized
        organized_events = Event.objects.filter(organizer=user)

        # Applications
        my_applications = EventApplication.objects.filter(user=user)

        # Teams
        my_teams = Team.objects.filter(members__user=user)

        return Response(
            {
                "organized_events_count": organized_events.count(),
                "active_events_count": organized_events.filter(
                    status__in=["published", "ongoing"]
                ).count(),
                "pending_applications_as_organizer": sum(
                    e.applications.filter(status="pending").count()
                    for e in organized_events
                ),
                "my_applications_count": my_applications.count(),
                "approved_applications_count": my_applications.filter(
                    status="approved"
                ).count(),
                "pending_applications_count": my_applications.filter(
                    status="pending"
                ).count(),
                "teams_count": my_teams.distinct().count(),
            }
        )


# ==================== Team Management with Team Code ====================


class CreateTeamForEventView(APIView):
    """Create a team for an event and get team code"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_slug):
        # Check email verification
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before creating a team.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            event = Event.objects.get(slug=event_slug)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is already in a team for this event
        existing_team = Team.objects.filter(
            event=event, members__user=request.user
        ).first()
        if existing_team:
            return Response(
                {"error": "You are already in a team for this event"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if event allows teams (team_min > 1)
        if event.team_min == 1 and event.team_max == 1:
            return Response(
                {"error": "This event is solo-only. Use solo application."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate profile requirements (education, resume, github, linkedin)
        is_valid, error_msg = validate_profile_for_application(request.user)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TeamCreateSerializer(data=request.data)
        if serializer.is_valid():
            team = serializer.save(event=event, leader=request.user)
            # Add leader as team member
            TeamMember.objects.create(
                team=team, user=request.user, role="Leader", is_leader=True
            )

            return Response(
                {
                    "team": TeamDetailSerializer(team).data,
                    "message": f"Team created! Share this code with teammates: {team.team_code}",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinTeamByCodeView(APIView):
    """Join an existing team using team code"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Check email verification
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before joining a team.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TeamJoinSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        team_code = serializer.validated_data["team_code"]
        role = serializer.validated_data.get("role", "")

        try:
            team = Team.objects.get(team_code=team_code)
        except Team.DoesNotExist:
            return Response(
                {"error": "Invalid team code"}, status=status.HTTP_404_NOT_FOUND
            )

        # Validate profile requirements (education, resume, github, linkedin)
        is_valid, error_msg = validate_profile_for_application(request.user)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        # Check if team is full
        if team.is_full:
            return Response(
                {"error": "Team is full"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is already in a team for this event
        if Team.objects.filter(event=team.event, members__user=request.user).exists():
            return Response(
                {"error": "You are already in a team for this event"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if team is still forming
        if team.status != "forming":
            return Response(
                {"error": "Team is no longer accepting members"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Add member to team
        TeamMember.objects.create(
            team=team, user=request.user, role=role, joined_via_code=True
        )

        return Response(
            {
                "team": TeamDetailSerializer(team).data,
                "message": f"Successfully joined team: {team.name}",
            }
        )


class TeamByCodeView(APIView):
    """Get team details by team code (for preview before joining)"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, team_code):
        try:
            team = Team.objects.get(team_code=team_code)
        except (Team.DoesNotExist, ValueError):
            return Response(
                {"error": "Invalid team code"}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(TeamDetailSerializer(team).data)


# ==================== Co-Host Management ====================


class EventCoHostListView(generics.ListAPIView):
    """List co-hosts for an event"""

    serializer_class = EventCoHostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_slug = self.kwargs.get("event_slug")
        return EventCoHost.objects.filter(event__slug=event_slug)


class InviteCoHostView(APIView):
    """Invite a co-host to an event (main organizer only)"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_slug):
        try:
            # Only main organizer can invite co-hosts
            event = Event.objects.get(slug=event_slug, organizer=request.user)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found or you are not the main organizer"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CoHostInviteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"]
        can_review = serializer.validated_data.get("can_review_applications", True)
        can_edit = serializer.validated_data.get("can_edit_event", False)

        # Find user by username or email
        try:
            user = User.objects.get(Q(username=identifier) | Q(email=identifier))
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Can't invite yourself
        if user == request.user:
            return Response(
                {"error": "Cannot invite yourself"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already invited or is organizer
        if EventCoHost.objects.filter(event=event, user=user).exists():
            return Response(
                {"error": "User is already invited"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create invitation with permissions
        cohost = EventCoHost.objects.create(
            event=event,
            user=user,
            invited_by=request.user,
            can_review_applications=can_review,
            can_edit_event=can_edit,
        )

        return Response(
            {
                "cohost": EventCoHostSerializer(cohost).data,
                "message": f"Invitation sent to {user.username}",
            },
            status=status.HTTP_201_CREATED,
        )


class AcceptCoHostInviteView(APIView):
    """Accept a co-host invitation"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            cohost = EventCoHost.objects.get(pk=pk, user=request.user, status="pending")
        except EventCoHost.DoesNotExist:
            return Response(
                {"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND
            )

        cohost.status = "accepted"
        cohost.responded_at = timezone.now()
        cohost.save()

        return Response(
            {
                "cohost": EventCoHostSerializer(cohost).data,
                "message": f"You are now a co-host for {cohost.event.name}",
            }
        )


class RejectCoHostInviteView(APIView):
    """Reject a co-host invitation"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            cohost = EventCoHost.objects.get(pk=pk, user=request.user, status="pending")
        except EventCoHost.DoesNotExist:
            return Response(
                {"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND
            )

        cohost.status = "rejected"
        cohost.responded_at = timezone.now()
        cohost.save()

        return Response({"message": "Invitation rejected"})


class MyCoHostInvitesView(generics.ListAPIView):
    """List pending co-host invitations for current user"""

    serializer_class = EventCoHostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EventCoHost.objects.filter(user=self.request.user, status="pending")


class UpdateCoHostPermissionsView(APIView):
    """Update co-host permissions (main organizer only)"""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, event_slug, cohost_id):
        try:
            # Only main organizer can update permissions
            event = Event.objects.get(slug=event_slug, organizer=request.user)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found or you are not the main organizer"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            cohost = EventCoHost.objects.get(pk=cohost_id, event=event)
        except EventCoHost.DoesNotExist:
            return Response(
                {"error": "Co-host not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CoHostUpdatePermissionsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if "can_review_applications" in serializer.validated_data:
            cohost.can_review_applications = serializer.validated_data[
                "can_review_applications"
            ]
        if "can_edit_event" in serializer.validated_data:
            cohost.can_edit_event = serializer.validated_data["can_edit_event"]

        cohost.save()

        return Response(
            {
                "cohost": EventCoHostSerializer(cohost).data,
                "message": "Permissions updated",
            }
        )


class RemoveCoHostView(APIView):
    """Remove a co-host from an event (main organizer only)"""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, event_slug, cohost_id):
        try:
            # Only main organizer can remove co-hosts
            event = Event.objects.get(slug=event_slug, organizer=request.user)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found or you are not the main organizer"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            cohost = EventCoHost.objects.get(pk=cohost_id, event=event)
        except EventCoHost.DoesNotExist:
            return Response(
                {"error": "Co-host not found"}, status=status.HTTP_404_NOT_FOUND
            )

        username = cohost.user.username
        cohost.delete()

        return Response({"message": f"Co-host {username} removed"})


class UserEmailsView(APIView):
    """List, add, and manage user email addresses"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List all email addresses for current user"""
        emails = Email.objects.filter(user=request.user)
        return Response(EmailSerializer(emails, many=True).data)

    def post(self, request):
        """Add a new email address"""
        serializer = EmailAddSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = Email.objects.create(
            user=request.user,
            email=serializer.validated_data["email"],
            is_verified=False,
            is_primary=False,
        )

        return Response(
            {
                "email": EmailSerializer(email).data,
                "message": "Email added. Please verify it.",
            },
            status=status.HTTP_201_CREATED,
        )


class SetPrimaryEmailView(APIView):
    """Set an email as primary"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, email_id):
        try:
            email = Email.objects.get(pk=email_id, user=request.user)
        except Email.DoesNotExist:
            return Response(
                {"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if not email.is_verified:
            return Response(
                {"error": "Email must be verified before setting as primary"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set as primary (the save method handles unsetting others)
        email.is_primary = True
        email.save()

        # Update user's main email field
        request.user.email = email.email
        request.user.save()

        return Response(
            {
                "email": EmailSerializer(email).data,
                "message": "Email set as primary",
            }
        )


class DeleteEmailView(APIView):
    """Delete an email address"""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, email_id):
        try:
            email = Email.objects.get(pk=email_id, user=request.user)
        except Email.DoesNotExist:
            return Response(
                {"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if email.is_primary:
            return Response(
                {
                    "error": "Cannot delete primary email. Set another email as primary first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure user has at least one email
        if Email.objects.filter(user=request.user).count() <= 1:
            return Response(
                {"error": "Cannot delete your only email address"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email.delete()
        return Response({"message": "Email deleted"})


# ==================== Event Requirements ====================


class EventRequirementListCreateView(generics.ListCreateAPIView):
    """List or create requirements for an event (organizer only)"""

    serializer_class = EventRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_slug = self.kwargs.get("event_slug")
        return EventRequirement.objects.filter(event__slug=event_slug).order_by("order")

    def perform_create(self, serializer):
        event_slug = self.kwargs.get("event_slug")
        try:
            event = Event.objects.get(slug=event_slug)
            # Check if organizer or co-host
            is_organizer = event.organizer == self.request.user
            is_cohost = event.cohosts.filter(
                user=self.request.user, status="accepted"
            ).exists()
            if not (is_organizer or is_cohost):
                raise PermissionError("Not authorized")
        except Event.DoesNotExist:
            raise PermissionError("Event not found")

        serializer.save(event=event)


class EventRequirementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a requirement"""

    serializer_class = EventRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = EventRequirement.objects.all()


# ==================== Team Documents ====================


class TeamDocumentListCreateView(generics.ListCreateAPIView):
    """List or upload documents for a team"""

    serializer_class = TeamDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        team_id = self.kwargs.get("team_id")
        return TeamDocument.objects.filter(team_id=team_id)

    def perform_create(self, serializer):
        team_id = self.kwargs.get("team_id")
        try:
            team = Team.objects.get(pk=team_id, members__user=self.request.user)
        except Team.DoesNotExist:
            raise PermissionError("Team not found or not a member")

        serializer.save(team=team, uploaded_by=self.request.user)


class TeamDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a team document"""

    serializer_class = TeamDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        return TeamDocument.objects.filter(team__members__user=self.request.user)


class CompleteTeamApplicationView(APIView):
    """Mark team as complete and ready for submission"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(pk=team_id, leader=request.user)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found or not the leader"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if minimum members met
        if team.member_count < team.event.team_min:
            return Response(
                {
                    "error": f"Need at least {team.event.team_min} members. Current: {team.member_count}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check required documents
        required_reqs = EventRequirement.objects.filter(
            event=team.event, is_required=True
        )
        missing_docs = []
        for req in required_reqs:
            if not TeamDocument.objects.filter(team=team, requirement=req).exists():
                missing_docs.append(req.field_name)

        if missing_docs:
            return Response(
                {"error": f'Missing required documents: {", ".join(missing_docs)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        team.status = "complete"
        team.save()

        return Response(
            {
                "team": TeamDetailSerializer(team).data,
                "message": "Team is ready for submission",
            }
        )


class SubmitTeamApplicationView(APIView):
    """Submit the team application"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(pk=team_id, leader=request.user)
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found or not the leader"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if team.status != "complete":
            return Response(
                {"error": "Team must be marked complete first"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create applications for all team members
        for member in team.members.all():
            EventApplication.objects.update_or_create(
                event=team.event,
                user=member.user,
                defaults={
                    "team": team,
                    "team_name": team.name,
                    "is_solo": False,
                    "role": member.role,
                    "status": "pending",
                },
            )

        team.status = "submitted"
        team.save()

        return Response(
            {
                "team": TeamDetailSerializer(team).data,
                "message": "Application submitted successfully!",
            }
        )


class SoloApplicationView(APIView):
    """Submit a solo application for events with team_min=1"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_slug):
        # Check email verification
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before applying to events.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            event = Event.objects.get(slug=event_slug)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already applied
        if EventApplication.objects.filter(event=event, user=request.user).exists():
            return Response(
                {"error": "Already applied to this event"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate profile requirements (education, resume, github, linkedin)
        is_valid, error_msg = validate_profile_for_application(request.user)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        # Create application
        application = EventApplication.objects.create(
            event=event,
            user=request.user,
            is_solo=True,
            role=request.data.get("role", ""),
            motivation=request.data.get("motivation", ""),
            status="pending",
        )

        return Response(
            {
                "application": EventApplicationSerializer(application).data,
                "message": "Solo application submitted!",
            },
            status=status.HTTP_201_CREATED,
        )


# ==================== Event Questions (Application Form Builder) ====================


class EventQuestionListCreateView(generics.ListCreateAPIView):
    """List or create questions for an event application form"""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EventQuestionCreateSerializer
        return EventQuestionSerializer

    def get_queryset(self):
        event_slug = self.kwargs.get("event_slug")
        return EventQuestion.objects.filter(event__slug=event_slug).order_by("order")

    def perform_create(self, serializer):
        event_slug = self.kwargs.get("event_slug")
        try:
            event = Event.objects.get(slug=event_slug)
            # Check if organizer or co-host
            is_organizer = event.organizer == self.request.user
            is_cohost = event.cohosts.filter(
                user=self.request.user, status="accepted"
            ).exists()
            if not (is_organizer or is_cohost):
                raise PermissionError("Not authorized")
        except Event.DoesNotExist:
            raise PermissionError("Event not found")

        serializer.save(event=event)


class EventQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a question"""

    serializer_class = EventQuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsEventOrganizerOrCoHost]

    def get_queryset(self):
        return EventQuestion.objects.all()


class EventQuestionsBulkCreateView(APIView):
    """Bulk create/update questions for an event"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_slug):
        try:
            event = Event.objects.get(slug=event_slug)
            # Check if organizer or co-host
            is_organizer = event.organizer == request.user
            is_cohost = event.cohosts.filter(
                user=request.user, status="accepted"
            ).exists()
            if not (is_organizer or is_cohost):
                return Response(
                    {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
                )
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        questions_data = request.data.get("questions", [])

        # Delete existing questions and recreate (simplest strategy)
        event.questions.all().delete()

        created_questions = []
        for idx, q_data in enumerate(questions_data):
            serializer = EventQuestionCreateSerializer(data=q_data)
            if serializer.is_valid():
                question = serializer.save(event=event, order=idx)
                created_questions.append(question)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "questions": EventQuestionSerializer(created_questions, many=True).data,
                "message": f"{len(created_questions)} questions saved",
            },
            status=status.HTTP_201_CREATED,
        )


class EventQuestionsPublicView(generics.ListAPIView):
    """Public endpoint to get event questions (for application form)"""

    serializer_class = EventQuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        event_slug = self.kwargs.get("event_slug")
        return EventQuestion.objects.filter(event__slug=event_slug).order_by("order")


# ==================== Application Responses ====================


class ApplicationResponseListView(generics.ListAPIView):
    """List responses for an application (organizer view)"""

    serializer_class = ApplicationResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        application_id = self.kwargs.get("application_id")
        try:
            application = EventApplication.objects.get(pk=application_id)
            event = application.event
            # Check if organizer or co-host
            is_organizer = event.organizer == self.request.user
            is_cohost = event.cohosts.filter(
                user=self.request.user, status="accepted"
            ).exists()
            is_applicant = application.user == self.request.user

            if not (is_organizer or is_cohost or is_applicant):
                return ApplicationResponse.objects.none()
        except EventApplication.DoesNotExist:
            return ApplicationResponse.objects.none()

        return ApplicationResponse.objects.filter(application_id=application_id)


class SubmitApplicationWithResponsesView(APIView):
    """
    Submit application with question responses in a single request.
    Supports file uploads via multipart/form-data.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request, event_slug):
        # Check email verification
        if not request.user.email_verified:
            return Response(
                {
                    "error": "Please verify your email before applying to events.",
                    "email_verified": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            event = Event.objects.get(slug=event_slug)
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already applied
        if EventApplication.objects.filter(event=event, user=request.user).exists():
            return Response(
                {"error": "Already applied to this event"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate profile requirements
        is_valid, error_msg = validate_profile_for_application(request.user)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        # Check registration period
        now = timezone.now()
        if event.registration_end and now > event.registration_end:
            return Response(
                {"error": "Registration is closed"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get event questions
        questions = EventQuestion.objects.filter(event=event)

        # Parse responses from request
        # Format: responses[{question_id}] = value for text/url
        # Format: response_file_{question_id} = file for file uploads
        # Format: responses[{question_id}][] = [option1, option2] for multiselect

        responses_data = {}
        for key in request.data:
            if key.startswith("responses[") and key.endswith("]"):
                # Extract question_id from responses[123]
                q_id = key[10:-1]  # Remove 'responses[' and ']'
                if "[]" in q_id:
                    q_id = q_id.replace("[]", "")
                    # Multiple values (for multiselect)
                    if q_id not in responses_data:
                        responses_data[q_id] = {"selected_options": []}
                    responses_data[q_id]["selected_options"].append(request.data[key])
                else:
                    responses_data[q_id] = {"value": request.data[key]}

        # Handle file uploads
        for key in request.FILES:
            if key.startswith("response_file_"):
                q_id = key[14:]  # Remove 'response_file_'
                if q_id not in responses_data:
                    responses_data[q_id] = {}
                responses_data[q_id]["file"] = request.FILES[key]

        # Validate required questions
        for question in questions:
            q_id = str(question.id)
            response = responses_data.get(q_id, {})

            if question.is_required:
                has_value = False
                if question.field_type in ["text", "textarea"]:
                    has_value = bool(response.get("value", "").strip())
                elif question.field_type == "file":
                    has_value = "file" in response
                elif question.field_type == "url":
                    has_value = bool(response.get("value", "").strip())
                elif question.field_type in ["select", "multiselect"]:
                    has_value = bool(
                        response.get("selected_options") or response.get("value")
                    )

                if not has_value:
                    return Response(
                        {"error": f"'{question.question_text}' is required"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Create application
        application = EventApplication.objects.create(
            event=event,
            user=request.user,
            is_solo=request.data.get("is_solo", True),
            role=request.data.get("role", ""),
            motivation=request.data.get("motivation", ""),
            team_name=request.data.get("team_name", ""),
            status="pending",
        )

        # Create responses
        for question in questions:
            q_id = str(question.id)
            response_data = responses_data.get(q_id, {})

            # Skip empty optional responses
            if not response_data:
                continue

            response = ApplicationResponse(
                application=application,
                question=question,
            )

            if question.field_type in ["text", "textarea"]:
                response.text_response = response_data.get("value", "")
            elif question.field_type == "file":
                if "file" in response_data:
                    response.file_response = response_data["file"]
            elif question.field_type == "url":
                response.url_response = response_data.get("value", "")
            elif question.field_type in ["select", "multiselect"]:
                options = response_data.get("selected_options", [])
                if not options and response_data.get("value"):
                    options = [response_data["value"]]
                response.selected_options = options

            response.save()

        return Response(
            {
                "application": EventApplicationWithResponsesSerializer(
                    application
                ).data,
                "message": "Application submitted successfully!",
            },
            status=status.HTTP_201_CREATED,
        )


class EventApplicationDetailView(generics.RetrieveAPIView):
    """Get application details with responses"""

    serializer_class = EventApplicationWithResponsesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can view their own applications
        # Organizers can view applications for their events
        user = self.request.user
        return EventApplication.objects.filter(
            Q(user=user)
            | Q(event__organizer=user)
            | Q(event__cohosts__user=user, event__cohosts__status="accepted")
        ).distinct()
