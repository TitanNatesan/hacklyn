from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path(
        "auth/oauth/callback/", views.OAuthCallbackView.as_view(), name="oauth_callback"
    ),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.CurrentUserView.as_view(), name="current_user"),
    # Email OTP
    path(
        "auth/email/send-otp/", views.SendEmailOTPView.as_view(), name="send_email_otp"
    ),
    path(
        "auth/email/verify-otp/",
        views.VerifyEmailOTPView.as_view(),
        name="verify_email_otp",
    ),
    path(
        "auth/password/forgot/",
        views.ForgotPasswordView.as_view(),
        name="forgot_password",
    ),
    path(
        "auth/password/reset/", views.ResetPasswordView.as_view(), name="reset_password"
    ),
    # Email Management
    path("auth/emails/", views.UserEmailsView.as_view(), name="user_emails"),
    path(
        "auth/emails/<int:email_id>/set-primary/",
        views.SetPrimaryEmailView.as_view(),
        name="set_primary_email",
    ),
    path(
        "auth/emails/<int:email_id>/delete/",
        views.DeleteEmailView.as_view(),
        name="delete_email",
    ),
    # Profile
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path(
        "profile/complete/",
        views.ProfileCompleteView.as_view(),
        name="profile_complete",
    ),
    path(
        "profile/<str:username>/",
        views.ProfileDetailView.as_view(),
        name="profile_detail",
    ),
    path(
        "profile/education/",
        views.EducationListCreateView.as_view(),
        name="education_list",
    ),
    path(
        "profile/education/<int:pk>/",
        views.EducationDetailView.as_view(),
        name="education_detail",
    ),
    path(
        "profile/experience/",
        views.WorkExperienceListCreateView.as_view(),
        name="experience_list",
    ),
    path(
        "profile/experience/<int:pk>/",
        views.WorkExperienceDetailView.as_view(),
        name="experience_detail",
    ),
    path(
        "profile/projects/", views.ProjectListCreateView.as_view(), name="project_list"
    ),
    path(
        "profile/projects/<int:pk>/",
        views.ProjectDetailView.as_view(),
        name="project_detail",
    ),
    # Events (all slug-based)
    path("events/", views.EventListCreateView.as_view(), name="event_list"),
    path(
        "events/featured/", views.FeaturedEventsView.as_view(), name="featured_events"
    ),
    path("events/my/", views.MyEventsView.as_view(), name="my_events"),
    path("events/<slug:slug>/", views.EventDetailView.as_view(), name="event_detail"),
    path(
        "events/<slug:slug>/prizes/",
        views.PrizeListCreateView.as_view(),
        name="event_prizes",
    ),
    path(
        "events/<slug:slug>/sponsors/",
        views.SponsorListCreateView.as_view(),
        name="event_sponsors",
    ),
    # Event Requirements (organizer only)
    path(
        "events/<slug:event_slug>/requirements/",
        views.EventRequirementListCreateView.as_view(),
        name="event_requirements",
    ),
    path(
        "requirements/<int:pk>/",
        views.EventRequirementDetailView.as_view(),
        name="requirement_detail",
    ),
    # Event Questions (Application Form Builder)
    path(
        "events/<slug:event_slug>/questions/",
        views.EventQuestionListCreateView.as_view(),
        name="event_questions",
    ),
    path(
        "events/<slug:event_slug>/questions/bulk/",
        views.EventQuestionsBulkCreateView.as_view(),
        name="event_questions_bulk",
    ),
    path(
        "events/<slug:event_slug>/questions/public/",
        views.EventQuestionsPublicView.as_view(),
        name="event_questions_public",
    ),
    path(
        "questions/<int:pk>/",
        views.EventQuestionDetailView.as_view(),
        name="question_detail",
    ),
    # Event Applications
    path(
        "events/<slug:slug>/apply/",
        views.ApplyToEventView.as_view(),
        name="apply_to_event",
    ),
    path(
        "events/<slug:event_slug>/apply/solo/",
        views.SoloApplicationView.as_view(),
        name="solo_application",
    ),
    path(
        "events/<slug:event_slug>/apply/submit/",
        views.SubmitApplicationWithResponsesView.as_view(),
        name="submit_application_with_responses",
    ),
    path(
        "applications/<int:pk>/",
        views.EventApplicationDetailView.as_view(),
        name="application_detail",
    ),
    path(
        "applications/<int:application_id>/responses/",
        views.ApplicationResponseListView.as_view(),
        name="application_responses",
    ),
    path(
        "events/<slug:slug>/applications/",
        views.EventApplicationsView.as_view(),
        name="event_applications",
    ),
    path(
        "events/<slug:slug>/applications/<int:app_id>/review/",
        views.ReviewApplicationView.as_view(),
        name="review_application",
    ),
    path(
        "events/<slug:slug>/applications/bulk-review/",
        views.BulkReviewApplicationsView.as_view(),
        name="bulk_review_applications",
    ),
    path(
        "applications/my/", views.MyApplicationsView.as_view(), name="my_applications"
    ),
    # Co-Host Management
    path(
        "events/<slug:event_slug>/cohosts/",
        views.EventCoHostListView.as_view(),
        name="event_cohosts",
    ),
    path(
        "events/<slug:event_slug>/cohosts/invite/",
        views.InviteCoHostView.as_view(),
        name="invite_cohost",
    ),
    path(
        "cohosts/<int:pk>/accept/",
        views.AcceptCoHostInviteView.as_view(),
        name="accept_cohost",
    ),
    path(
        "cohosts/<int:pk>/reject/",
        views.RejectCoHostInviteView.as_view(),
        name="reject_cohost",
    ),
    path("cohosts/my/", views.MyCoHostInvitesView.as_view(), name="my_cohost_invites"),
    path(
        "events/<slug:event_slug>/cohosts/<int:cohost_id>/permissions/",
        views.UpdateCoHostPermissionsView.as_view(),
        name="update_cohost_permissions",
    ),
    path(
        "events/<slug:event_slug>/cohosts/<int:cohost_id>/remove/",
        views.RemoveCoHostView.as_view(),
        name="remove_cohost",
    ),
    # Teams (slug-based event routes)
    path(
        "events/<slug:slug>/teams/",
        views.TeamListCreateView.as_view(),
        name="event_teams",
    ),
    path("teams/<int:pk>/", views.TeamDetailView.as_view(), name="team_detail"),
    path("teams/my/", views.MyTeamsView.as_view(), name="my_teams"),
    # Team Management with Team Code
    path(
        "events/<slug:event_slug>/teams/create/",
        views.CreateTeamForEventView.as_view(),
        name="create_team",
    ),
    path("teams/join/", views.JoinTeamByCodeView.as_view(), name="join_team"),
    path(
        "teams/by-code/<uuid:team_code>/",
        views.TeamByCodeView.as_view(),
        name="team_by_code",
    ),
    path(
        "teams/<int:team_id>/complete/",
        views.CompleteTeamApplicationView.as_view(),
        name="complete_team",
    ),
    path(
        "teams/<int:team_id>/submit/",
        views.SubmitTeamApplicationView.as_view(),
        name="submit_team_application",
    ),
    # Team Documents
    path(
        "teams/<int:team_id>/documents/",
        views.TeamDocumentListCreateView.as_view(),
        name="team_documents",
    ),
    path(
        "documents/<int:pk>/",
        views.TeamDocumentDetailView.as_view(),
        name="document_detail",
    ),
    # Submissions
    path(
        "teams/<int:team_id>/submission/",
        views.SubmissionView.as_view(),
        name="team_submission",
    ),
    # Dashboard
    path(
        "dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard_stats"
    ),
    # Autocomplete
    path("autocomplete/", views.AutocompleteView.as_view(), name="autocomplete"),
]
