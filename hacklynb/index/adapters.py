"""
Custom Social Account Adapter for django-allauth.
Handles auto-signup and prevents the intermediate signup form.
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_email, user_username


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
        Populate user data from social account info.
        Auto-generate username from email if not provided.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Get email from social account
        email = data.get('email')
        if email and not user.username:
            # Generate username from email (before @)
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
        
        # Set avatar from social provider
        if sociallogin.account.provider == 'google':
            picture = sociallogin.account.extra_data.get('picture')
            if picture:
                user.avatar = picture
        elif sociallogin.account.provider == 'github':
            avatar_url = sociallogin.account.extra_data.get('avatar_url')
            if avatar_url:
                user.avatar = avatar_url
        
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user and ensure profile is created.
        """
        user = super().save_user(request, sociallogin, form)
        
        # Create profile if it doesn't exist
        from index.models import Profile
        Profile.objects.get_or_create(user=user)
        
        return user
