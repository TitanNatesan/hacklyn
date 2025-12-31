/**
 * Calculate profile completion percentage based on essential data only
 * @param {Object} user - User object from auth context
 * @param {Object} profile - Profile object from API
 * @returns {number} Percentage from 0-100
 */
export function calculateProfileStrength(user, profile) {
    let score = 0;

    // Essential Basic Info (50 points total)
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
    if (fullName && fullName.length > 2) score += 10;

    if (profile?.tagline) score += 15;
    if (profile?.bio && profile.bio.length > 20) score += 15;
    if (profile?.location) score += 10;

    // Essential Skills (20 points total)
    if (profile?.skills?.length > 0) score += 20;

    // Essential Education (15 points total)
    if (profile?.education?.length > 0) score += 15;

    // Essential Projects (15 points total)
    if (profile?.projects?.length > 0) score += 15;

    // Optional Fields (0 points)
    // Work Experience and Social Links are skipped for percentage calculation

    return Math.min(100, score);
}

/**
 * Get the next required action to complete the profile
 * @param {Object} user - User object
 * @param {Object} profile - Profile object
 * @returns {Object|null} { label: string, step: number } or null if complete
 */
export function getNextRequiredAction(user, profile) {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

    if (!fullName || fullName.length <= 2) return { label: "Add your full name", step: 1 };
    if (!profile?.tagline) return { label: "Add a catchy tagline", step: 1 };
    if (!profile?.bio || profile.bio.length < 20) return { label: "Tell us about yourself in bio", step: 1 };
    if (!profile?.location) return { label: "Add your location", step: 1 };
    if (!profile?.skills?.length) return { label: "Add your top skills", step: 1 };

    if (!profile?.education?.length) return { label: "Add your education background", step: 2 };

    if (!profile?.projects?.length) return { label: "Showcase one of your projects", step: 3 };

    // If all essential are filled, return null (card will be hidden)
    return null;
}
