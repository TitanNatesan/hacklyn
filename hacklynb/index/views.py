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
    User, Profile, Education, WorkExperience, Project, Skill, Institution, Company,
    Event, Prize, Sponsor, EventApplication, Team, TeamMember, Submission, EmailOTP
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ProfileSerializer,
    EducationSerializer, WorkExperienceSerializer, ProjectSerializer,
    SkillSerializer, InstitutionSerializer, CompanySerializer,
    EventListSerializer, EventDetailSerializer, EventCreateSerializer,
    EventApplicationSerializer, ApplicationReviewSerializer,
    TeamSerializer, SubmissionSerializer, PrizeSerializer, SponsorSerializer
)


# ==================== Permissions ====================

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, others can only read"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'organizer'):
            return obj.organizer == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsEventOrganizer(permissions.BasePermission):
    """Check if user is the event organizer"""
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'event'):
            return obj.event.organizer == request.user
        return obj.organizer == request.user


# ==================== Auth Views ====================

class RegisterView(APIView):
    """Manual user registration"""
    permission_classes = []
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Manual login with username/password"""
    permission_classes = []
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


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
            return Response({
                'user': UserSerializer(request.user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


class CurrentUserView(APIView):
    """Get current authenticated user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Email OTP Views ====================

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(user, otp, purpose):
    """Send OTP email to user"""
    if purpose == 'email_verify':
        subject = 'Hacklyn - Verify Your Email'
        message = f'''Hello {user.first_name or user.username},

Your OTP for email verification is: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Best regards,
Team Hacklyn'''
    else:  # password_reset
        subject = 'Hacklyn - Password Reset OTP'
        message = f'''Hello {user.first_name or user.username},

Your OTP for password reset is: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Best regards,
Team Hacklyn'''
    
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
        
        if user.email_verified:
            return Response({'message': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Invalidate previous unused OTPs
        EmailOTP.objects.filter(user=user, purpose='email_verify', is_used=False).update(is_used=True)
        
        # Generate new OTP
        otp = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)
        
        EmailOTP.objects.create(
            user=user,
            otp=otp,
            purpose='email_verify',
            expires_at=expires_at
        )
        
        # Send email
        if send_otp_email(user, otp, 'email_verify'):
            return Response({'message': 'OTP sent to your email'})
        else:
            return Response({'error': 'Failed to send email. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailOTPView(APIView):
    """Verify OTP for email verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        otp = request.data.get('otp', '').strip()
        
        if not otp:
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.email_verified:
            return Response({'message': 'Email is already verified'})
        
        # Find valid OTP
        otp_record = EmailOTP.objects.filter(
            user=user,
            otp=otp,
            purpose='email_verify',
            is_used=False
        ).first()
        
        if not otp_record:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp_record.is_valid():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used and verify email
        otp_record.is_used = True
        otp_record.save()
        
        user.email_verified = True
        user.save()
        
        return Response({
            'message': 'Email verified successfully',
            'user': UserSerializer(user).data
        })


class ForgotPasswordView(APIView):
    """Send OTP for password reset"""
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists
            return Response({'message': 'If an account exists with this email, an OTP has been sent.'})
        
        # Invalidate previous unused OTPs
        EmailOTP.objects.filter(user=user, purpose='password_reset', is_used=False).update(is_used=True)
        
        # Generate new OTP
        otp = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)
        
        EmailOTP.objects.create(
            user=user,
            otp=otp,
            purpose='password_reset',
            expires_at=expires_at
        )
        
        # Send email
        send_otp_email(user, otp, 'password_reset')
        
        return Response({'message': 'If an account exists with this email, an OTP has been sent.'})


class ResetPasswordView(APIView):
    """Reset password with OTP"""
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')
        
        if not all([email, otp, new_password]):
            return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 1:
            return Response({'error': 'Password is too short'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find valid OTP
        otp_record = EmailOTP.objects.filter(
            user=user,
            otp=otp,
            purpose='password_reset',
            is_used=False
        ).first()
        
        if not otp_record:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp_record.is_valid():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used and update password
        otp_record.is_used = True
        otp_record.save()
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password reset successfully. Please login with your new password.'})


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
    Search for skills, institutions, or companies.
    Usage: /api/autocomplete/?type=skill&q=python
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'skill').lower()
        
        if not query:
            return Response([])



        results = []
        if search_type == 'skill':
            items = Skill.objects.filter(name__icontains=query)[:10]
            results = SkillSerializer(items, many=True).data
        elif search_type == 'institution':
            items = Institution.objects.filter(name__icontains=query)[:10]
            results = InstitutionSerializer(items, many=True).data
        elif search_type == 'company':
            items = Company.objects.filter(name__icontains=query)[:10]
            results = CompanySerializer(items, many=True).data
        elif search_type == 'organization':
            # Search both institutions and companies
            institutions = Institution.objects.filter(name__icontains=query)[:5]
            companies = Company.objects.filter(name__icontains=query)[:5]
            
            inst_data = InstitutionSerializer(institutions, many=True).data
            comp_data = CompanySerializer(companies, many=True).data
            
            # Add type field
            for item in inst_data:
                item['type'] = 'institution'
                
            for item in comp_data:
                item['type'] = 'company'
                
            results = inst_data + comp_data
            
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
            if 'fullName' in data:
                # Simple name splitting logic
                parts = data['fullName'].strip().split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
            
            if 'email' in data and data['email'] != user.email:
                # Check uniqueness if email is changed? 
                # For now just trust or ignore if taken
                if not User.objects.exclude(pk=user.pk).filter(email=data['email']).exists():
                    user.email = data['email']
            
            user.profile_completed = True
            user.save()

            # --- 2. Update Basic Profile Info ---
            profile, _ = Profile.objects.get_or_create(user=user)
            
            # Map frontend fields to model fields
            simple_fields = [
                'tagline', 'bio', 'location', 'achievements', 
                'github', 'linkedin', 'twitter', 'website'
            ]
            
            for field in simple_fields:
                if field in data:
                    setattr(profile, field, data[field])
            
            # Handle skills (Skill M2M)
            if 'skills' in data:
                skills_data = data['skills']
                if isinstance(skills_data, str):
                    skill_names = [s.strip() for s in skills_data.split(',') if s.strip()]
                elif isinstance(skills_data, list):
                    # Could be list of strings or list of objects
                    skill_names = [s if isinstance(s, str) else s.get('name', '') for s in skills_data]
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
            if 'education' in data and isinstance(data['education'], list):
                profile.education.all().delete()
                for edu in data['education']:
                    inst_name = edu.get('school', '') or edu.get('institution_name', '')
                    institution = None
                    if inst_name:
                        institution, _ = Institution.objects.get_or_create(name=inst_name)
                    
                    Education.objects.create(
                        profile=profile,
                        degree=edu.get('degree', ''),
                        institution=institution,
                        start_date=edu.get('startDate', ''),
                        end_date=edu.get('endDate', ''),
                        current=edu.get('current', False)
                    )

            # --- 4. Update Nested Data (Work Experience) ---
            if 'workExperience' in data and isinstance(data['workExperience'], list):
                profile.work_experience.all().delete()
                for work in data['workExperience']:
                    comp_name = work.get('company', '') or work.get('company_name', '')
                    company = None
                    if comp_name:
                        company, _ = Company.objects.get_or_create(name=comp_name)
                        
                    WorkExperience.objects.create(
                        profile=profile,
                        company=company,
                        job_title=work.get('jobTitle', ''),
                        start_date=work.get('startDate', ''),
                        end_date=work.get('endDate', ''),
                        current=work.get('current', False),
                        description=work.get('description', '')
                    )

            # --- 5. Update Nested Data (Projects) ---
            if 'projects' in data and isinstance(data['projects'], list):
                profile.projects.all().delete()
                for proj in data['projects']:
                    project = Project.objects.create(
                        profile=profile,
                        title=proj.get('title', ''),
                        role=proj.get('role', ''),
                        description=proj.get('description', ''),
                        link=proj.get('link', '')
                    )
                    
                    # Handle project technologies (Skill M2M)
                    techs = proj.get('technologies', '')
                    if isinstance(techs, str):
                        tech_names = [t.strip() for t in techs.split(',') if t.strip()]
                    elif isinstance(techs, list):
                        tech_names = [t if isinstance(t, str) else t.get('name', '') for t in techs]
                    else:
                        tech_names = []
                        
                    for t_name in tech_names:
                        if t_name:
                            skill, _ = Skill.objects.get_or_create(name=t_name)
                            project.technologies.add(skill)

            # --- 6. Return updated user and tokens ---
            # Refresh tokens to embed new profile_completed status if needed (though tokens often stateless)
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Profile completed successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetailView(generics.RetrieveAPIView):
    """View any user's public profile"""
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'


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
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventListSerializer
    
    def create(self, request, *args, **kwargs):
        # Check email verification before creating event
        if not request.user.email_verified:
            return Response({
                'error': 'Please verify your email before hosting events.',
                'email_verified': False
            }, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Event.objects.filter(status__in=['published', 'ongoing'])
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(tagline__icontains=search) |
                Q(organizer_name__icontains=search)
            )
        
        # Filter by mode
        mode = self.request.query_params.get('mode')
        if mode:
            queryset = queryset.filter(mode=mode)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        return queryset.order_by('-is_featured', '-created_at')


class FeaturedEventsView(generics.ListAPIView):
    """Get featured events"""
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Event.objects.filter(
            is_featured=True, 
            status__in=['published', 'ongoing']
        ).order_by('-created_at')[:6]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete an event"""
    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateSerializer
        return EventDetailSerializer


class EventBySlugView(generics.RetrieveAPIView):
    """Get event by slug"""
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class MyEventsView(generics.ListAPIView):
    """List events organized by current user"""
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).order_by('-created_at')


# ==================== Event Application Views ====================

class ApplyToEventView(APIView):
    """Apply to participate in an event"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        # Check email verification
        if not request.user.email_verified:
            return Response({
                'error': 'Please verify your email before applying to events.',
                'email_verified': False
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already applied
        if EventApplication.objects.filter(event=event, user=request.user).exists():
            return Response({'error': 'Already applied to this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check registration period
        now = timezone.now()
        if event.registration_end and now > event.registration_end:
            return Response({'error': 'Registration is closed'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EventApplicationSerializer(data={
            'event': event.id,
            'team_name': request.data.get('team_name', ''),
            'role': request.data.get('role', ''),
            'motivation': request.data.get('motivation', ''),
        })
        
        if serializer.is_valid():
            serializer.save(user=request.user, event=event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(generics.ListAPIView):
    """List current user's event applications"""
    serializer_class = EventApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EventApplication.objects.filter(user=self.request.user).order_by('-applied_at')


class EventApplicationsView(generics.ListAPIView):
    """List all applications for an event (organizer only)"""
    serializer_class = EventApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs.get('pk')
        event = Event.objects.filter(pk=event_id, organizer=self.request.user).first()
        if not event:
            return EventApplication.objects.none()
        
        queryset = event.applications.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-applied_at')


class ReviewApplicationView(APIView):
    """Approve or reject an application (organizer only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk, app_id):
        try:
            event = Event.objects.get(pk=pk, organizer=request.user)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            application = EventApplication.objects.get(pk=app_id, event=event)
        except EventApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ApplicationReviewSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            reason = serializer.validated_data.get('reason', '')
            
            if action == 'approve':
                application.status = 'approved'
            elif action == 'reject':
                application.status = 'rejected'
                application.rejection_reason = reason
            elif action == 'waitlist':
                application.status = 'waitlisted'
            
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()
            
            return Response(EventApplicationSerializer(application).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkReviewApplicationsView(APIView):
    """Approve or reject multiple applications at once"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk, organizer=request.user)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)
        
        application_ids = request.data.get('application_ids', [])
        action = request.data.get('action')
        reason = request.data.get('reason', '')
        
        if action not in ['approve', 'reject', 'waitlist']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        applications = EventApplication.objects.filter(pk__in=application_ids, event=event)
        
        status_map = {'approve': 'approved', 'reject': 'rejected', 'waitlist': 'waitlisted'}
        
        for app in applications:
            app.status = status_map[action]
            if action == 'reject':
                app.rejection_reason = reason
            app.reviewed_at = timezone.now()
            app.reviewed_by = request.user
            app.save()
        
        return Response({'message': f'{applications.count()} applications updated'})


# ==================== Prize & Sponsor Views ====================

class PrizeListCreateView(generics.ListCreateAPIView):
    """List or create prizes for an event"""
    serializer_class = PrizeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Prize.objects.filter(event_id=self.kwargs.get('pk'))
    
    def perform_create(self, serializer):
        event = Event.objects.get(pk=self.kwargs.get('pk'), organizer=self.request.user)
        serializer.save(event=event)


class SponsorListCreateView(generics.ListCreateAPIView):
    """List or create sponsors for an event"""
    serializer_class = SponsorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Sponsor.objects.filter(event_id=self.kwargs.get('pk'))
    
    def perform_create(self, serializer):
        event = Event.objects.get(pk=self.kwargs.get('pk'), organizer=self.request.user)
        serializer.save(event=event)


# ==================== Team Views ====================

class TeamListCreateView(generics.ListCreateAPIView):
    """List teams for an event or create a team"""
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.filter(event_id=self.kwargs.get('pk'))
    
    def perform_create(self, serializer):
        event = Event.objects.get(pk=self.kwargs.get('pk'))
        team = serializer.save(event=event, leader=self.request.user)
        TeamMember.objects.create(team=team, user=self.request.user, role='Leader')


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
        team = Team.objects.get(pk=self.kwargs.get('team_id'))
        submission, _ = Submission.objects.get_or_create(team=team)
        return submission


class SubmitProjectView(APIView):
    """Final submission of project"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            if not team.members.filter(user=request.user).exists():
                return Response({'error': 'Not a team member'}, status=status.HTTP_403_FORBIDDEN)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        submission, _ = Submission.objects.get_or_create(team=team)
        submission.status = 'submitted'
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
        
        return Response({
            'organized_events_count': organized_events.count(),
            'active_events_count': organized_events.filter(status__in=['published', 'ongoing']).count(),
            'pending_applications_as_organizer': sum(
                e.applications.filter(status='pending').count() for e in organized_events
            ),
            'my_applications_count': my_applications.count(),
            'approved_applications_count': my_applications.filter(status='approved').count(),
            'pending_applications_count': my_applications.filter(status='pending').count(),
            'teams_count': my_teams.distinct().count(),
        })
