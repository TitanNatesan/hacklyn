from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.db.models import Count
from .models import (
    User,
    Email,
    Skill,
    Organization,
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
    TeamDocument,
    EventQuestion,
    ApplicationResponse,
)

# ==================== Shared mixins/utils ====================


class ThumbnailAdminMixin:
    def thumbnail(self, obj, field_name="logo"):
        image = getattr(obj, field_name, None)
        # Check if it's a field with a 'url' attribute (ImageField/URLField)
        url = None
        if image:
            if hasattr(image, "url"):
                try:
                    url = image.url
                except ValueError:
                    url = None
            elif isinstance(image, str) and image.startswith("http"):
                url = image

        if url:
            return format_html(
                '<img src="{}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 5px;" />',
                url,
            )
        return mark_safe('<span style="color: #999;">No image</span>')

    thumbnail.short_description = "Preview"


# ==================== Simple Tag-like Admins ====================


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "usage_count")
    search_fields = ("name",)

    def usage_count(self, obj):
        return obj.profile_set.count() + obj.project_technologies.count()

    usage_count.short_description = "Total Usage"


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "organization_type", "usage_count")
    list_filter = ("is_company",)
    search_fields = ("name",)

    def organization_type(self, obj):
        if obj.is_company is True:
            return mark_safe('<span style="color: #3b82f6;">Company</span>')
        elif obj.is_company is False:
            return mark_safe('<span style="color: #22c55e;">Institution</span>')
        return mark_safe('<span style="color: #94a3b8;">Unknown</span>')

    organization_type.short_description = "Type"

    def usage_count(self, obj):
        edu_count = obj.education_entries.count()
        exp_count = obj.experience_entries.count()
        return f"{edu_count} edu, {exp_count} work"

    usage_count.short_description = "Usage"


# ==================== User & Profile Admin ====================


class EmailInline(admin.TabularInline):
    model = Email
    extra = 0
    fields = ("email", "is_verified", "is_primary", "verified_at", "created_at")
    readonly_fields = ("verified_at", "created_at")


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile Info"
    fk_name = "user"
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin, ThumbnailAdminMixin):
    list_display = (
        "thumbnail_preview",
        "username",
        "email",
        "full_name_display",
        "is_staff",
        "profile_completed",
        "email_verified_display",
        "date_joined",
    )
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "profile_completed",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Hacklyn Status", {"fields": ("profile_completed", "avatar")}),
    )

    inlines = [EmailInline, ProfileInline]

    def thumbnail_preview(self, obj):
        return self.thumbnail(obj, "avatar")

    thumbnail_preview.short_description = "Avatar"

    def full_name_display(self, obj):
        return obj.get_full_name() or "-"

    full_name_display.short_description = "Full Name"

    def email_verified_display(self, obj):
        if obj.email_verified:
            return mark_safe('<span style="color: #22c55e;">✓ Verified</span>')
        return mark_safe('<span style="color: #ef4444;">✗ Unverified</span>')

    email_verified_display.short_description = "Email Status"


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "user",
        "is_verified",
        "is_primary",
        "verified_at",
        "created_at",
    )
    list_filter = ("is_verified", "is_primary", "created_at")
    search_fields = ("email", "user__username")
    readonly_fields = ("verified_at", "created_at")

    actions = ["mark_verified", "mark_unverified"]

    @admin.action(description="Mark selected emails as verified")
    def mark_verified(self, request, queryset):
        from django.utils import timezone

        queryset.update(is_verified=True, verified_at=timezone.now())

    @admin.action(description="Mark selected emails as unverified")
    def mark_unverified(self, request, queryset):
        queryset.update(is_verified=False, verified_at=None)


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
class ProfileAdmin(admin.ModelAdmin, ThumbnailAdminMixin):
    list_display = (
        "user_thumbnail",
        "user",
        "tagline",
        "location",
        "skills_count",
        "created_at",
    )
    list_filter = ("created_at", "location")
    search_fields = ("user__username", "user__email", "tagline", "bio", "skills__name")
    filter_horizontal = ("skills",)
    inlines = [EducationInline, WorkExperienceInline, ProjectInline]

    def user_thumbnail(self, obj):
        return self.thumbnail(obj.user, "avatar")

    user_thumbnail.short_description = "User"

    def skills_count(self, obj):
        return obj.skills.count()

    skills_count.short_description = "# Skills"


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("profile", "degree", "organization", "start_date", "current")
    list_filter = ("current", "organization")
    search_fields = ("profile__user__username", "degree", "organization__name")


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ("profile", "job_title", "organization", "start_date", "current")
    list_filter = ("current", "organization")
    search_fields = ("profile__user__username", "job_title", "organization__name")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "profile", "role", "tech_display")
    search_fields = (
        "title",
        "description",
        "technologies__name",
        "profile__user__username",
    )
    filter_horizontal = ("technologies",)

    def tech_display(self, obj):
        return ", ".join([t.name for t in obj.technologies.all()[:3]])

    tech_display.short_description = "Technologies"


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
    readonly_fields = ("user", "applied_at", "reviewed_at", "reviewed_by")
    fields = (
        "user",
        "status",
        "team_name",
        "is_solo",
        "role",
        "applied_at",
        "reviewed_at",
    )


class EventCoHostInline(admin.TabularInline):
    model = EventCoHost
    extra = 0
    readonly_fields = ("invited_by", "invited_at", "responded_at")
    fields = (
        "user",
        "status",
        "can_review_applications",
        "can_edit_event",
        "invited_by",
        "invited_at",
        "responded_at",
    )


class EventRequirementInline(admin.TabularInline):
    model = EventRequirement
    extra = 0
    fields = ("field_name", "field_type", "is_required", "order")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin, ThumbnailAdminMixin):
    list_display = (
        "logo_preview",
        "name",
        "organizer_display",
        "status_pill",
        "mode",
        "city",
        "is_featured",
        "registration_status",
    )
    list_filter = ("status", "mode", "is_featured", "created_at")
    search_fields = ("name", "tagline", "organizer__username", "organizer_name", "city")
    date_hierarchy = "start_date"
    ordering = ("-created_at",)

    fieldsets = (
        (
            "Branding",
            {"fields": (("logo", "cover_image"), "name", "tagline", "description")},
        ),
        (
            "Administration",
            {
                "fields": (
                    "organizer",
                    "organizer_name",
                    "organizer_email",
                    ("status", "is_featured"),
                )
            },
        ),
        (
            "Timeline & Logistics",
            {
                "fields": (
                    ("registration_start", "registration_end"),
                    ("start_date", "end_date"),
                    ("mode", "venue", "city"),
                )
            },
        ),
        (
            "Participation & Rules",
            {
                "fields": (
                    ("team_min", "team_max", "max_participants"),
                    "tracks",
                    "rules",
                    "eligibility",
                    "prize_pool",
                )
            },
        ),
        ("External Links", {"fields": ("website", "discord_link")}),
    )

    inlines = [
        PrizeInline,
        SponsorInline,
        EventCoHostInline,
        EventRequirementInline,
        EventApplicationInline,
    ]

    def logo_preview(self, obj):
        return self.thumbnail(obj, "logo")

    logo_preview.short_description = "Logo"

    def organizer_display(self, obj):
        return format_html(
            "<b>{}</b><br/><small>{}</small>",
            obj.organizer_name,
            obj.organizer.username,
        )

    organizer_display.short_description = "Organizer"

    def status_pill(self, obj):
        colors = {
            "published": "#22c55e",
            "draft": "#94a3b8",
            "ongoing": "#3b82f6",
            "completed": "#64748b",
            "cancelled": "#ef4444",
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">{}</span>',
            colors.get(obj.status, "#333"),
            obj.status,
        )

    status_pill.short_description = "Status"

    def registration_status(self, obj):
        count = obj.applications.filter(status="approved").count()
        pending = obj.applications.filter(status="pending").count()
        return format_html(
            '<b>{}</b> approved<br/><small style="color: orange;">{} pending</small>',
            count,
            pending,
        )

    registration_status.short_description = "Admissions"

    actions = [
        "make_featured",
        "remove_featured",
        "publish_events",
        "approve_all_pending",
    ]

    @admin.action(description="Mark selected events as featured")
    def make_featured(self, request, queryset):
        queryset.update(is_featured=True)

    @admin.action(description="Remove featured status")
    def remove_featured(self, request, queryset):
        queryset.update(is_featured=False)

    @admin.action(description="Publish selected events")
    def publish_events(self, request, queryset):
        queryset.update(status="published")

    @admin.action(description="Approve all pending applications")
    def approve_all_pending(self, request, queryset):
        from django.utils import timezone

        for event in queryset:
            event.applications.filter(status="pending").update(
                status="approved", reviewed_at=timezone.now(), reviewed_by=request.user
            )


# ==================== Application Admin ====================


@admin.register(EventApplication)
class EventApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "status_label", "team_name", "applied_at")
    list_filter = ("status", "applied_at", "reviewed_at")
    search_fields = ("user__username", "user__email", "event__name", "team_name")
    date_hierarchy = "applied_at"

    readonly_fields = ("applied_at",)

    def status_label(self, obj):
        color = "#f59e0b"  # pending
        if obj.status == "approved":
            color = "#10b981"
        if obj.status == "rejected":
            color = "#ef4444"
        return format_html('<b style="color: {};">{}</b>', color, obj.status.upper())

    status_label.short_description = "Status"

    actions = ["approve_applications", "reject_applications"]

    @admin.action(description="Approve selected applications")
    def approve_applications(self, request, queryset):
        from django.utils import timezone

        queryset.update(
            status="approved", reviewed_at=timezone.now(), reviewed_by=request.user
        )

    @admin.action(description="Reject selected applications")
    def reject_applications(self, request, queryset):
        from django.utils import timezone

        queryset.update(
            status="rejected", reviewed_at=timezone.now(), reviewed_by=request.user
        )


# ==================== Team & Submission Admin ====================


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0


class SubmissionInline(admin.StackedInline):
    model = Submission
    can_delete = False
    max_num = 1


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "event",
        "leader",
        "team_code_display",
        "status",
        "member_count",
        "created_at",
    )
    list_filter = ("status", "event", "created_at")
    search_fields = ("name", "leader__username", "event__name", "team_code")
    readonly_fields = ("team_code",)
    inlines = [TeamMemberInline, SubmissionInline]

    def team_code_display(self, obj):
        return format_html(
            '<code style="font-size: 10px;">{}</code>', str(obj.team_code)[:8] + "..."
        )

    team_code_display.short_description = "Team Code"


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("project_title", "team", "status", "submitted_at")
    list_filter = ("status", "submitted_at")
    search_fields = ("project_title", "team__name", "team__event__name")


@admin.register(Prize)
class PrizeAdmin(admin.ModelAdmin):
    list_display = ("position", "reward", "event", "order")
    list_filter = ("event",)


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin, ThumbnailAdminMixin):
    list_display = ("logo_preview", "name", "tier", "event")
    list_filter = ("tier", "event")

    def logo_preview(self, obj):
        return self.thumbnail(obj, "logo")


# ==================== New Model Admins ====================


@admin.register(EventCoHost)
class EventCoHostAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "event",
        "status",
        "can_review_applications",
        "can_edit_event",
        "invited_by",
        "invited_at",
        "responded_at",
    )
    list_filter = ("status", "can_review_applications", "can_edit_event", "invited_at")
    search_fields = ("user__username", "user__email", "event__name")
    readonly_fields = ("invited_at", "responded_at")


@admin.register(EventRequirement)
class EventRequirementAdmin(admin.ModelAdmin):
    list_display = ("field_name", "event", "field_type", "is_required", "order")
    list_filter = ("field_type", "is_required", "event")
    search_fields = ("field_name", "event__name", "description")
    ordering = ("event", "order")


@admin.register(TeamDocument)
class TeamDocumentAdmin(admin.ModelAdmin):
    list_display = ("requirement", "team", "uploaded_by", "uploaded_at")
    list_filter = ("requirement__field_type", "uploaded_at")
    search_fields = ("team__name", "requirement__field_name", "uploaded_by__username")
    readonly_fields = ("uploaded_at", "updated_at")


@admin.register(EventQuestion)
class EventQuestionAdmin(admin.ModelAdmin):
    list_display = (
        "question_text_short",
        "event",
        "field_type",
        "is_required",
        "order",
    )
    list_filter = ("field_type", "is_required", "event")
    search_fields = ("question_text", "event__name", "description")
    ordering = ("event", "order")

    def question_text_short(self, obj):
        return (
            obj.question_text[:50] + "..."
            if len(obj.question_text) > 50
            else obj.question_text
        )

    question_text_short.short_description = "Question"


@admin.register(ApplicationResponse)
class ApplicationResponseAdmin(admin.ModelAdmin):
    list_display = ("question_short", "application", "response_preview", "created_at")
    list_filter = ("question__field_type", "created_at", "question__event")
    search_fields = (
        "application__user__username",
        "question__question_text",
        "text_response",
    )
    readonly_fields = ("created_at", "updated_at")

    def question_short(self, obj):
        return (
            obj.question.question_text[:30] + "..."
            if len(obj.question.question_text) > 30
            else obj.question.question_text
        )

    question_short.short_description = "Question"

    def response_preview(self, obj):
        if obj.file_response:
            return format_html(
                '<a href="{}" target="_blank">📎 File</a>', obj.file_response.url
            )
        elif obj.url_response:
            return format_html(
                '<a href="{}" target="_blank">🔗 Link</a>', obj.url_response
            )
        elif obj.selected_options:
            return ", ".join(obj.selected_options[:3]) + (
                "..." if len(obj.selected_options) > 3 else ""
            )
        elif obj.text_response:
            return (
                obj.text_response[:50] + "..."
                if len(obj.text_response) > 50
                else obj.text_response
            )
        return "-"

    response_preview.short_description = "Response"
