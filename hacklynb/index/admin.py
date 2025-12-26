from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, Profile, Education, WorkExperience, Project,
    Event, Prize, Sponsor, EventApplication, Team, TeamMember, Submission
)


# ==================== User Admin ====================

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'profile_completed', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile_completed')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Hacklyn Info', {'fields': ('profile_completed', 'avatar')}),
    )
    
    inlines = [ProfileInline]


# ==================== Profile Admin ====================

class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0


class ProjectInline(admin.TabularInline):
    model = Project
    extra = 0


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'tagline', 'location', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'tagline', 'bio')
    inlines = [EducationInline, WorkExperienceInline, ProjectInline]


# ==================== Event Admin ====================

class PrizeInline(admin.TabularInline):
    model = Prize
    extra = 0


class SponsorInline(admin.TabularInline):
    model = Sponsor
    extra = 0


class EventApplicationInline(admin.TabularInline):
    model = EventApplication
    extra = 0
    readonly_fields = ('user', 'applied_at', 'reviewed_at', 'reviewed_by')
    fields = ('user', 'status', 'team_name', 'role', 'applied_at', 'reviewed_at')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'organizer', 'status', 'mode', 'city', 'start_date', 'is_featured', 'participants_display')
    list_filter = ('status', 'mode', 'is_featured', 'created_at')
    search_fields = ('name', 'tagline', 'organizer__username', 'organizer_name', 'city')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'tagline', 'description', 'logo', 'cover_image')
        }),
        ('Organizer', {
            'fields': ('organizer', 'organizer_name', 'organizer_email', 'website', 'discord_link')
        }),
        ('Timeline', {
            'fields': ('registration_start', 'registration_end', 'start_date', 'end_date')
        }),
        ('Location', {
            'fields': ('mode', 'venue', 'city')
        }),
        ('Team & Participants', {
            'fields': ('team_min', 'team_max', 'max_participants')
        }),
        ('Details', {
            'fields': ('tracks', 'rules', 'eligibility', 'prize_pool')
        }),
        ('Status', {
            'fields': ('status', 'is_featured')
        }),
    )
    
    inlines = [PrizeInline, SponsorInline, EventApplicationInline]
    
    def participants_display(self, obj):
        count = obj.applications.filter(status='approved').count()
        pending = obj.applications.filter(status='pending').count()
        if pending > 0:
            return format_html('<span style="color: green;">{}</span> (<span style="color: orange;">{} pending</span>)', count, pending)
        return count
    participants_display.short_description = 'Participants'
    
    actions = ['make_featured', 'remove_featured', 'publish_events', 'approve_all_pending']
    
    @admin.action(description='Mark selected events as featured')
    def make_featured(self, request, queryset):
        queryset.update(is_featured=True)
    
    @admin.action(description='Remove featured status')
    def remove_featured(self, request, queryset):
        queryset.update(is_featured=False)
    
    @admin.action(description='Publish selected events')
    def publish_events(self, request, queryset):
        queryset.update(status='published')
    
    @admin.action(description='Approve all pending applications')
    def approve_all_pending(self, request, queryset):
        from django.utils import timezone
        for event in queryset:
            event.applications.filter(status='pending').update(
                status='approved',
                reviewed_at=timezone.now(),
                reviewed_by=request.user
            )


# ==================== Application Admin ====================

@admin.register(EventApplication)
class EventApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'team_name', 'applied_at', 'reviewed_at')
    list_filter = ('status', 'applied_at', 'reviewed_at')
    search_fields = ('user__username', 'user__email', 'event__name', 'team_name')
    date_hierarchy = 'applied_at'
    ordering = ('-applied_at',)
    
    readonly_fields = ('applied_at',)
    
    fieldsets = (
        ('Application', {
            'fields': ('event', 'user', 'team_name', 'role', 'motivation', 'applied_at')
        }),
        ('Review', {
            'fields': ('status', 'rejection_reason', 'reviewed_at', 'reviewed_by')
        }),
    )
    
    actions = ['approve_applications', 'reject_applications', 'waitlist_applications']
    
    @admin.action(description='Approve selected applications')
    def approve_applications(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='approved', reviewed_at=timezone.now(), reviewed_by=request.user)
    
    @admin.action(description='Reject selected applications')
    def reject_applications(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='rejected', reviewed_at=timezone.now(), reviewed_by=request.user)
    
    @admin.action(description='Waitlist selected applications')
    def waitlist_applications(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='waitlisted', reviewed_at=timezone.now(), reviewed_by=request.user)


# ==================== Team Admin ====================

class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0


class SubmissionInline(admin.StackedInline):
    model = Submission
    can_delete = False
    max_num = 1


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'event', 'leader', 'member_count_display', 'created_at')
    list_filter = ('event', 'created_at')
    search_fields = ('name', 'leader__username', 'event__name')
    
    inlines = [TeamMemberInline, SubmissionInline]
    
    def member_count_display(self, obj):
        return obj.members.count()
    member_count_display.short_description = 'Members'


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('project_title', 'team', 'status', 'submitted_at', 'created_at')
    list_filter = ('status', 'submitted_at')
    search_fields = ('project_title', 'team__name', 'team__event__name')
    
    fieldsets = (
        ('Team', {
            'fields': ('team',)
        }),
        ('Project', {
            'fields': ('project_title', 'project_description', 'technologies')
        }),
        ('Links', {
            'fields': ('demo_link', 'repo_link', 'video_link', 'presentation_file')
        }),
        ('Status', {
            'fields': ('status', 'submitted_at')
        }),
    )


# ==================== Register remaining models ====================

@admin.register(Prize)
class PrizeAdmin(admin.ModelAdmin):
    list_display = ('position', 'reward', 'event', 'order')
    list_filter = ('event',)
    search_fields = ('position', 'reward', 'event__name')


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'event')
    list_filter = ('tier', 'event')
    search_fields = ('name', 'event__name')
