/**
 * GOOGLE FORM CONFIGURATION
 * Setup base URL and entry ID mappings for direct pre-filled registration.
 */

// Base Google Form URL for visitors
const GOOGLE_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfY39rCrC-nzsQgui7sfC0i12nQ1Tvu8FYwRtC0CimPQa7qFQ/viewform";

// Exact pre-filled field entry IDs
const GOOGLE_FORM_ENTRIES = {
    name: "entry.1908979897",           // Visitor Full Name (remains empty in QR)
    email: "entry.1872761607",          // Visitor Email (remains empty in QR)
    phoneNumber: "entry.1017091537",    // Visitor Phone Number (remains empty in QR)
    eventName: "entry.2118289221",      // Pre-filled Event Name
    eventLocation: "entry.524089912"    // Pre-filled Event Location
};

// Global App config keeping backwards compatibility
const APP_CONFIG = {
    baseUrl: "https://cuongrevival.github.io/event-checkin",
    googleForm: {
        actionUrl: GOOGLE_FORM_BASE_URL,
        entries: GOOGLE_FORM_ENTRIES
    }
};
