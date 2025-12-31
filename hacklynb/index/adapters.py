"""
Custom Social Account Adapter for django-allauth.
Handles auto-signup, JWT token generation, and OAuth redirect with tokens.
"""
import os
import logging
import urllib.parse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom account adapter to redirect to frontend with JWT tokens after OAuth.
    """
    
    def _build_token_redirect_url(self, user):
        """
        Generate redirect URL with JWT tokens for the authenticated user.
        Shared logic for both login and signup redirects.
        """
        if not user or not user.is_authenticated:
            logger.warning("_build_token_redirect_url called with unauthenticated user")
            return None
            
        logger.info(f"Building token redirect URL for user: {user.username} (id={user.id})")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Build frontend callback URL with tokens
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        callback_url = f"{frontend_url}/oauth-callback"
        
        # Add tokens as URL parameters (encoded)
        params = {
            'access': access_token,
            'refresh': refresh_token,
            'user_id': str(user.id),
            'email': user.email or '',
            'username': user.username or '',
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'is_staff': str(user.is_staff).lower(),
            'profile_completed': str(getattr(user, 'profile_completed', False)).lower(),
            'avatar': getattr(user, 'avatar', '') or '',
        }
        
        query_string = urllib.parse.urlencode(params)
        redirect_url = f"{callback_url}?{query_string}"
        logger.info(f"Token redirect URL built successfully for user {user.username}")
        return redirect_url
    
    def get_login_redirect_url(self, request):
        """
        Generate redirect URL with JWT tokens for login.
        """
        logger.info(f"get_login_redirect_url called, user authenticated: {request.user.is_authenticated}")
        
        if request.user.is_authenticated:
            url = self._build_token_redirect_url(request.user)
            if url:
                return url
        
        return super().get_login_redirect_url(request)
    
    def get_signup_redirect_url(self, request):
        """
        Generate redirect URL with JWT tokens for new signups.
        This ensures new OAuth signups also receive tokens.
        """
        logger.info(f"get_signup_redirect_url called")
        
        # Fallback to request.user
        if request.user.is_authenticated:
            url = self._build_token_redirect_url(request.user)
            if url:
                return url
        
        return super().get_signup_redirect_url(request)




class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to auto-create users from social login
    without showing the intermediate signup form.
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        If user with email already exists, connect the social account.
        """
        if sociallogin.is_existing:
            return
        
        # Get email from social account
        email = sociallogin.account.extra_data.get('email')
        if not email:
            emails = sociallogin.email_addresses
            if emails:
                email = emails[0].email
        
        if email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
                # Connect the social account to existing user
                sociallogin.connect(request, user)
            except User.DoesNotExist:
                pass
    
    def populate_user(self, request, sociallogin, data):
        """
        Populate user data from social account info with defensive defaults.
        Extract first_name, last_name, email from OAuth providers.
        Auto-generate username from email if not provided.
        """
        user = super().populate_user(request, sociallogin, data)
        extra_data = sociallogin.account.extra_data
        provider = sociallogin.account.provider
        
        # Extract email with fallback
        email = data.get('email') or extra_data.get('email') or ''
        if email:
            user.email = email
        
        # Ensure defaults are set (safety check)
        user.first_name = user.first_name or ''
        user.last_name = user.last_name or ''
        
        # Extract name based on provider
        if provider == 'google':
            # Google provides 'given_name' and 'family_name'
            given_name = extra_data.get('given_name', '')
            family_name = extra_data.get('family_name', '')
            
            # Use OAuth data if available, otherwise keep existing or use empty string
            user.first_name = given_name or data.get('first_name', '') or user.first_name
            user.last_name = family_name or data.get('last_name', '') or user.last_name
            
            # Set avatar from Google
            picture = extra_data.get('picture', '')
            if picture:
                user.avatar = picture
                
        elif provider == 'github':
            # GitHub provides 'name' as full name, need to split
            full_name = extra_data.get('name', '') or data.get('name', '')
            if full_name:
                name_parts = full_name.strip().split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ''
            # GitHub also has 'login' as username
            # Set avatar from GitHub
            avatar_url = extra_data.get('avatar_url', '')
            if avatar_url:
                user.avatar = avatar_url
        
        # Final safety check - ensure they're never None or unset
        user.first_name = user.first_name or ''
        user.last_name = user.last_name or ''
        
        # Generate username from email if not set
        if email and not user.username:
            base_username = email.split('@')[0]
            username = base_username
            
            # Ensure username is unique
            from django.contrib.auth import get_user_model
            User = get_user_model()
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user.username = username
        
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user and ensure profile is created.
        OAuth users have their email auto-verified.
        """
        user = super().save_user(request, sociallogin, form)
        
        # Auto-verify email for OAuth users (Google/GitHub have already verified)
        if not user.email_verified:
            user.email_verified = True
            user.save()
        
        # Create profile if it doesn't exist
        from index.models import Profile
        profile, created = Profile.objects.get_or_create(user=user)
        
        # Try to populate profile with location from OAuth if available
        extra_data = sociallogin.account.extra_data
        if sociallogin.account.provider == 'github':
            location = extra_data.get('location', '')
            bio = extra_data.get('bio', '')
            if location and not profile.location:
                profile.location = location
            if bio and not profile.bio:
                profile.bio = bio
            profile.save()
        
        return user
