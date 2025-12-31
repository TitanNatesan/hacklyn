from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Profile, Education, WorkExperience, Project, Skill, Institution, Company,
    Event, Prize, Sponsor, EventApplication, Team, TeamMember, Submission
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Simplified user serializer - no role field"""
    display_name = serializers.CharField(read_only=True)
    is_admin = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'display_name', 'avatar', 'profile_picture', 'profile_completed', 
                  'email_verified', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_admin']
    
    def get_is_admin(self, obj):
        return obj.is_staff

    def get_profile_picture(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.profile_picture.url)
            return obj.profile.profile_picture.url
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    """For manual user registration"""
    password = serializers.CharField(write_only=True, min_length=1)
    password_confirm = serializers.CharField(write_only=True, min_length=1)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create empty profile
        Profile.objects.create(user=user)
        return user


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']


class EducationSerializer(serializers.ModelSerializer):
    institution = InstitutionSerializer(read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    class Meta:
        model = Education
        fields = ['id', 'degree', 'institution', 'institution_name', 'start_date', 'end_date', 'current']


class WorkExperienceSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = WorkExperience
        fields = ['id', 'job_title', 'company', 'company_name', 'start_date', 'end_date', 'description', 'current']


class ProjectSerializer(serializers.ModelSerializer):
    technologies = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'technologies', 'link', 'role']


class ProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, read_only=True)
    work_experience = WorkExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'profile_picture', 'tagline', 'bio', 'skills', 
                  'location', 'achievements', 'github', 'linkedin', 'twitter', 
                  'website', 'education', 'work_experience', 'projects', 
                  'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        """
        Custom update to handle skills Many-to-Many relationship.
        Skills are read_only in serializer but handled here manually.
        """
        # Handle skills separately from request data
        request = self.context.get('request')
        skills_data = request.data.get('skills', None) if request else None
        
        if skills_data is not None:
            # Clear existing skills
            instance.skills.clear()
            
            # Process skills (list of strings or objects)
            if isinstance(skills_data, list):
                for skill_item in skills_data:
                    skill_name = skill_item if isinstance(skill_item, str) else skill_item.get('name', '')
                    if skill_name:
                        skill, _ = Skill.objects.get_or_create(name=skill_name)
                        instance.skills.add(skill)
        
        # Update other fields
        for field, value in validated_data.items():
            if field not in ['skills', 'education', 'work_experience', 'projects']:
                setattr(instance, field, value)
        
        instance.save()
        return instance



class PrizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prize
        fields = ['id', 'position', 'reward', 'order']


class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'tier', 'website']


class EventListSerializer(serializers.ModelSerializer):
    """Compact event serializer for lists"""
    organizer = UserSerializer(read_only=True)
    participants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'slug', 'name', 'tagline', 'logo', 'cover_image', 'organizer',
                  'organizer_name', 'start_date', 'end_date', 'registration_end',
                  'mode', 'city', 'status', 'is_featured', 'prize_pool',
                  'participants_count', 'tracks', 'themes', 'created_at']
    
    def get_participants_count(self, obj):
        return getattr(obj, 'participants_count', 0) or obj.applications.filter(status='approved').count()


class EventDetailSerializer(serializers.ModelSerializer):
    """Full event details"""
    organizer = UserSerializer(read_only=True)
    prizes = PrizeSerializer(many=True, read_only=True)
    sponsors = SponsorSerializer(many=True, read_only=True)
    participants_count = serializers.SerializerMethodField()
    pending_applications_count = serializers.SerializerMethodField()
    user_has_applied = serializers.SerializerMethodField()
    user_application_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'slug', 'name', 'tagline', 'description', 'logo', 'cover_image',
                  'organizer', 'organizer_name', 'organizer_email', 'website', 'discord_link',
                  'registration_start', 'registration_end', 'start_date', 'end_date',
                  'mode', 'venue', 'city', 'team_min', 'team_max', 'max_participants',
                  'tracks', 'themes', 'rules', 'eligibility', 'prize_pool', 'prizes', 'sponsors',
                  'status', 'is_featured', 'participants_count', 'pending_applications_count',
                  'user_has_applied', 'user_application_status', 'created_at', 'updated_at']
    
    def get_participants_count(self, obj):
        return obj.applications.filter(status='approved').count()
    
    def get_pending_applications_count(self, obj):
        return obj.applications.filter(status='pending').count()
    
    def get_user_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(user=request.user).exists()
        return False
    
    def get_user_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            app = obj.applications.filter(user=request.user).first()
            return app.status if app else None
        return None


class EventCreateSerializer(serializers.ModelSerializer):
    """For creating/updating events"""
    class Meta:
        model = Event
        fields = ['id', 'slug', 'name', 'tagline', 'description', 'logo', 'cover_image',
                  'organizer_name', 'organizer_email', 'website', 'discord_link',
                  'registration_start', 'registration_end', 'start_date', 'end_date',
                  'mode', 'venue', 'city', 'team_min', 'team_max', 'max_participants',
                  'tracks', 'themes', 'rules', 'eligibility', 'prize_pool', 'status', 'is_featured']
        read_only_fields = ['slug']
    
    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class EventApplicationSerializer(serializers.ModelSerializer):
    """For viewing and creating applications"""
    user = UserSerializer(read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = EventApplication
        fields = ['id', 'event', 'event_name', 'user', 'team_name', 'role', 
                  'motivation', 'status', 'rejection_reason', 'applied_at', 
                  'reviewed_at', 'reviewed_by', 'reviewed_by_name']
        read_only_fields = ['id', 'user', 'status', 'rejection_reason', 
                            'applied_at', 'reviewed_at', 'reviewed_by']


class ApplicationReviewSerializer(serializers.Serializer):
    """For approving/rejecting applications"""
    action = serializers.ChoiceField(choices=['approve', 'reject', 'waitlist'])
    reason = serializers.CharField(required=False, allow_blank=True)


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'role', 'joined_at']


class TeamSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'event', 'name', 'leader', 'members', 'member_count', 'created_at']


class SubmissionSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'team', 'project_title', 'project_description', 'technologies',
                  'demo_link', 'repo_link', 'video_link', 'presentation_file',
                  'status', 'submitted_at', 'created_at', 'updated_at']
