from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/oauth/callback/', views.OAuthCallbackView.as_view(), name='oauth_callback'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current_user'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', views.ProfileDetailView.as_view(), name='profile_detail'),
    path('profile/education/', views.EducationListCreateView.as_view(), name='education_list'),
    path('profile/education/<int:pk>/', views.EducationDetailView.as_view(), name='education_detail'),
    path('profile/experience/', views.WorkExperienceListCreateView.as_view(), name='experience_list'),
    path('profile/experience/<int:pk>/', views.WorkExperienceDetailView.as_view(), name='experience_detail'),
    path('profile/projects/', views.ProjectListCreateView.as_view(), name='project_list'),
    path('profile/projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    
    # Events
    path('events/', views.EventListCreateView.as_view(), name='event_list'),
    path('events/featured/', views.FeaturedEventsView.as_view(), name='featured_events'),
    path('events/my/', views.MyEventsView.as_view(), name='my_events'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event_detail'),
    path('events/<int:pk>/prizes/', views.PrizeListCreateView.as_view(), name='event_prizes'),
    path('events/<int:pk>/sponsors/', views.SponsorListCreateView.as_view(), name='event_sponsors'),
    
    # Event Applications
    path('events/<int:pk>/apply/', views.ApplyToEventView.as_view(), name='apply_to_event'),
    path('events/<int:pk>/applications/', views.EventApplicationsView.as_view(), name='event_applications'),
    path('events/<int:pk>/applications/<int:app_id>/review/', views.ReviewApplicationView.as_view(), name='review_application'),
    path('events/<int:pk>/applications/bulk-review/', views.BulkReviewApplicationsView.as_view(), name='bulk_review_applications'),
    path('applications/my/', views.MyApplicationsView.as_view(), name='my_applications'),
    
    # Teams
    path('events/<int:pk>/teams/', views.TeamListCreateView.as_view(), name='event_teams'),
    path('teams/<int:pk>/', views.TeamDetailView.as_view(), name='team_detail'),
    path('teams/my/', views.MyTeamsView.as_view(), name='my_teams'),
    
    # Submissions
    path('teams/<int:team_id>/submission/', views.SubmissionView.as_view(), name='team_submission'),
    path('teams/<int:team_id>/submit/', views.SubmitProjectView.as_view(), name='submit_project'),
    
    # Dashboard
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard_stats'),
]
