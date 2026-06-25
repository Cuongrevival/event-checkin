/**
 * CHECK-IN CONTROLLER
 * Handles URL parsing, form binding, inline validations, double-submit prevention,
 * and hidden iframe submission capture.
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const loadingState = document.getElementById("loadingState");
    const notFoundState = document.getElementById("notFoundState");
    const successState = document.getElementById("successState");
    const mainCheckinCard = document.getElementById("mainCheckinCard");
    
    const eventImage = document.getElementById("eventImage");
    const eventTitle = document.getElementById("eventTitle");
    const eventDate = document.getElementById("eventDate");
    const eventTime = document.getElementById("eventTime");
    const eventLocationText = document.getElementById("eventLocationText");
    const eventAddress = document.getElementById("eventAddress");

    const checkInForm = document.getElementById("checkInForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const eventIdInput = document.getElementById("eventId");
    const eventNameInput = document.getElementById("eventName");
    const eventLocationInput = document.getElementById("eventLocation");
    
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const submitButton = document.getElementById("submitButton");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const submitErrorAlert = document.getElementById("submitErrorAlert");
    const submitErrorMsg = document.getElementById("submitErrorMsg");
    
    const iframeResponse = document.getElementById("googleFormResponse");
    const submittedDetails = document.getElementById("submittedDetails");
    const anotherCheckinBtn = document.getElementById("anotherCheckinBtn");
    
    // Success "Event Found" notification banner elements
    const eventFoundAlert = document.getElementById("eventFoundAlert");
    const foundEventName = document.getElementById("foundEventName");

    // Submission State Flags
    let isSubmitting = false;
    let formSubmitted = false;
    let submissionTimeoutId = null;

    // Simulate database lookup/render flow
    setTimeout(() => {
        initializeCheckin();
    }, 450);

    /**
     * Initializes checking and validates event ID
     */
    function initializeCheckin() {
        // Read URL query parameters
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get("eventId");

        if (!eventId) {
            showNotFound();
            return;
        }

        // Validate EVENTS and find the matching entry
        if (typeof EVENTS === "undefined" || !Array.isArray(EVENTS)) {
            console.error("EVENTS array is not defined.");
            showNotFound();
            return;
        }

        const event = EVENTS.find(e => e.id === eventId);
        if (!event) {
            showNotFound();
            return;
        }

        // Populate Event Details Visuals
        eventImage.src = event.image;
        eventImage.alt = `${event.name} Cover Image`;
        eventTitle.textContent = event.name;
        eventDate.textContent = event.date;
        eventTime.textContent = event.time;
        eventLocationText.textContent = event.location;
        eventAddress.textContent = event.address;

        // Set browser page title to include event details
        document.title = `Check-in - ${event.name}`;

        // Bind Google Form configuration properties
        if (typeof APP_CONFIG === "undefined" || !APP_CONFIG.googleForm) {
            console.error("APP_CONFIG configuration is missing.");
            showNotFound();
            return;
        }

        checkInForm.action = APP_CONFIG.googleForm.actionUrl;
        
        // Dynamically assign names based on Config Entry IDs
        fullNameInput.name = APP_CONFIG.googleForm.entries.name;
        emailInput.name = APP_CONFIG.googleForm.entries.email;
        eventIdInput.name = APP_CONFIG.googleForm.entries.eventId;
        eventNameInput.name = APP_CONFIG.googleForm.entries.eventName;
        eventLocationInput.name = APP_CONFIG.googleForm.entries.eventLocation;

        // Load hidden fields
        eventIdInput.value = event.id;
        eventNameInput.value = event.name;
        eventLocationInput.value = event.location;

        // Populate "Event Found" notification banner details
        if (eventFoundAlert && foundEventName) {
            foundEventName.textContent = event.name;
            eventFoundAlert.removeAttribute("hidden");
        }

        // Render card
        loadingState.setAttribute("hidden", "true");
        mainCheckinCard.removeAttribute("hidden");

        // Scroll smoothly to form area and focus Name input
        mainCheckinCard.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
            fullNameInput.focus();
        }, 600);
    }

    /**
     * Shows error state when event is missing or incorrect
     */
    function showNotFound() {
        loadingState.setAttribute("hidden", "true");
        mainCheckinCard.setAttribute("hidden", "true");
        notFoundState.removeAttribute("hidden");
    }

    // Inline field validation triggers
    fullNameInput.addEventListener("input", () => validateFieldName(false));
    emailInput.addEventListener("input", () => validateFieldEmail(false));

    /**
     * Field validator: Name
     */
    function validateFieldName(focusOnError = false) {
        const val = fullNameInput.value.trim();
        if (val.length === 0) {
            showInputError(fullNameInput, nameError, "Please enter your full name.");
            if (focusOnError) fullNameInput.focus();
            return false;
        }
        if (val.length < 2) {
            showInputError(fullNameInput, nameError, "Name must contain at least 2 characters.");
            if (focusOnError) fullNameInput.focus();
            return false;
        }
        if (val.length > 100) {
            showInputError(fullNameInput, nameError, "Name must not exceed 100 characters.");
            if (focusOnError) fullNameInput.focus();
            return false;
        }
        clearInputError(fullNameInput, nameError);
        return true;
    }

    /**
     * Field validator: Email
     */
    function validateFieldEmail(focusOnError = false) {
        const val = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (val.length === 0) {
            showInputError(emailInput, emailError, "Please enter your email address.");
            if (focusOnError) emailInput.focus();
            return false;
        }
        if (!emailPattern.test(val)) {
            showInputError(emailInput, emailError, "Please enter a valid email address.");
            if (focusOnError) emailInput.focus();
            return false;
        }
        if (val.length > 150) {
            showInputError(emailInput, emailError, "Email must not exceed 150 characters.");
            if (focusOnError) emailInput.focus();
            return false;
        }
        clearInputError(emailInput, emailError);
        return true;
    }

    // Helper functions for UI styling updates
    function showInputError(inputEl, errorEl, message) {
        inputEl.classList.add("input-error");
        inputEl.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
    }

    function clearInputError(inputEl, errorEl) {
        inputEl.classList.remove("input-error");
        inputEl.removeAttribute("aria-invalid");
        errorEl.textContent = "";
    }

    // Form Submit Event Handler
    checkInForm.addEventListener("submit", (e) => {
        // Prevent submission if busy
        if (isSubmitting) {
            e.preventDefault();
            return;
        }

        // Run full validation suite
        const isEmailValid = validateFieldEmail(true);
        const isNameValid = validateFieldName(true); // validates name last so focus lands there if both fail

        if (!isNameValid || !isEmailValid) {
            e.preventDefault();
            return;
        }

        // Start Submit Flow
        isSubmitting = true;
        formSubmitted = true;
        
        // Disable interactive elements
        submitButton.disabled = true;
        fullNameInput.disabled = true;
        emailInput.disabled = true;
        btnText.textContent = "Submitting check-in...";
        btnSpinner.removeAttribute("hidden");
        submitErrorAlert.setAttribute("hidden", "true");

        // Trim input values before form sends
        fullNameInput.value = fullNameInput.value.trim();
        emailInput.value = emailInput.value.trim();

        // 15-Second Timeout fallback
        submissionTimeoutId = setTimeout(() => {
            if (isSubmitting && formSubmitted) {
                // Restore interactivity
                isSubmitting = false;
                formSubmitted = false;
                submitButton.disabled = false;
                fullNameInput.disabled = false;
                emailInput.disabled = false;
                btnText.textContent = "Confirm Check-in";
                btnSpinner.setAttribute("hidden", "true");
                
                // Show timeout error message
                submitErrorMsg.textContent = "The submission is taking longer than expected. Please check your connection and try again.";
                submitErrorAlert.removeAttribute("hidden");
            }
        }, 15000);

        // Submit naturally triggers target hidden iframe post.
    });

    // Hidden iframe load handler catches completed Google Form submissions
    iframeResponse.addEventListener("load", () => {
        // Only trigger if a submit was intentional from our client
        if (formSubmitted) {
            // Cancel timeout
            if (submissionTimeoutId) {
                clearTimeout(submissionTimeoutId);
                submissionTimeoutId = null;
            }

            // Save details for summary (will be reset for UI safety)
            const enteredName = fullNameInput.value;
            const enteredEmail = emailInput.value;
            const eventName = eventTitle.textContent;
            const eventLoc = eventLocationText.textContent;

            // Hide form card and display success card
            mainCheckinCard.setAttribute("hidden", "true");
            
            // Build and insert confirmation details summary
            submittedDetails.innerHTML = `
                <div class="summary-title">Check-in Details</div>
                <div class="summary-row">
                    <span class="summary-label">Name</span>
                    <span class="summary-val">${escapeHtml(enteredName)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Email</span>
                    <span class="summary-val">${escapeHtml(enteredEmail)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Event</span>
                    <span class="summary-val">${escapeHtml(eventName)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Location</span>
                    <span class="summary-val">${escapeHtml(eventLoc)}</span>
                </div>
            `;
            
            successState.removeAttribute("hidden");

            // Reset Submission Flow Flags
            isSubmitting = false;
            formSubmitted = false;
        }
    });

    // Button to register another attendee for same event
    anotherCheckinBtn.addEventListener("click", () => {
        // Clear input values
        fullNameInput.value = "";
        emailInput.value = "";
        
        // Re-enable input states
        fullNameInput.disabled = false;
        emailInput.disabled = false;
        submitButton.disabled = false;
        btnText.textContent = "Confirm Check-in";
        btnSpinner.setAttribute("hidden", "true");
        submitErrorAlert.setAttribute("hidden", "true");

        // Clear error classes
        clearInputError(fullNameInput, nameError);
        clearInputError(emailInput, emailError);

        // Toggle UI panels
        successState.setAttribute("hidden", "true");
        mainCheckinCard.removeAttribute("hidden");
    });

    /**
     * Utility function to escape dangerous HTML tags
     */
    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
