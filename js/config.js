/**
 * CONFIGURATION FILE
 * Update these settings to match your public URL and Google Form fields.
 */
const APP_CONFIG = {
    // Public Base URL of your deployed application
    // Replace with your actual GitHub Pages, Netlify, or Vercel URL
    baseUrl: "https://cuongrevival.github.io/event-checkin",

    googleForm: {
        // Form Action URL for submission. Replace the Form ID as needed.
        // Format: https://docs.google.com/forms/d/e/[FORM_ID]/formResponse
        actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfY39rCrC-nzsQgui7sfC0i12nQ1Tvu8FYwRtC0CimPQa7qFQ/viewform?usp=publish-editor",

        // entry IDs from your Google Form pre-filled link
        entries: {
            name: "entry.1908979897",           // Form field for Participant Name
            email: "entry.1872761607",          // Form field for Participant Email
            eventId: "entry.1017091537",        // Form field for Event ID
            eventName: "entry.2118289221",      // Form field for Event Name
            eventLocation: "entry.524089912"    // Form field for Event Location
        }
    }
};
