/**
 * EVENTS CONTROLLER
 * Manages rendering of 6 festival events, QR generation with pre-filled Google Form URLs,
 * and accessible Modal popups.
 */

// Track the trigger button to restore focus later
let lastActiveElement = null;

document.addEventListener("DOMContentLoaded", () => {
    const eventGrid = document.getElementById("eventGrid");
    const qrModal = document.getElementById("qrModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const closeQrModalBtn = document.getElementById("closeQrModal");
    const closeModalBottomBtn = document.getElementById("closeModalBottomBtn");

    // Initialize CSS styles for toasts
    initializeToastStyles();

    // Render events list after a short delay to showcase loading state
    setTimeout(() => {
        try {
            renderEvents();
        } catch (error) {
            console.error("Failed to render events:", error);
            showErrorState("Unable to load events. Please refresh the page.");
        }
    }, 400);

    /**
     * Renders the event list dynamically
     */
    function renderEvents() {
        eventGrid.innerHTML = "";

        if (typeof EVENTS === "undefined" || !Array.isArray(EVENTS) || EVENTS.length === 0) {
            showEmptyState();
            return;
        }

        EVENTS.forEach(event => {
            const card = document.createElement("article");
            card.className = "event-card";
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img class="event-card-img" src="${escapeHtml(event.image)}" alt="${escapeHtml(event.name)} Cover Image" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="event-card-title">${escapeHtml(event.name)}</h3>
                    <div class="event-meta-info">
                        <div class="meta-item">
                            <span class="meta-icon" aria-hidden="true">📅</span>
                            <span>${escapeHtml(event.date)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon" aria-hidden="true">🕒</span>
                            <span>${escapeHtml(event.time)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon" aria-hidden="true">📍</span>
                            <span>${escapeHtml(event.location)}</span>
                        </div>
                    </div>
                    <p class="event-card-desc">${escapeHtml(event.description)}</p>
                    <button type="button" class="btn btn-primary check-in-btn" data-event-id="${escapeHtml(event.id)}">
                        Check-in
                    </button>
                </div>
            `;
            eventGrid.appendChild(card);
        });

        // Attach listeners to Check-in buttons
        const checkinButtons = eventGrid.querySelectorAll(".check-in-btn");
        checkinButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const eventId = e.currentTarget.getAttribute("data-event-id");
                lastActiveElement = e.currentTarget;
                handleCheckIn(eventId);
            });
        });
    }

    /**
     * Shows empty state when events list is empty
     */
    function showEmptyState() {
        eventGrid.innerHTML = `
            <div class="status-msg-box">
                <span class="status-icon" aria-hidden="true">📭</span>
                <h3 class="status-title">No events available</h3>
                <p class="status-text">No events are currently available. Please check back later.</p>
            </div>
        `;
    }

    /**
     * Shows error state when rendering fails
     */
    function showErrorState(message) {
        eventGrid.innerHTML = `
            <div class="status-msg-box">
                <span class="status-icon" aria-hidden="true">⚠️</span>
                <h3 class="status-title">Load Error</h3>
                <p class="status-text">${escapeHtml(message)}</p>
                <button type="button" class="btn btn-primary" onclick="window.location.reload()" style="max-width: 180px; margin: 0 auto;">Refresh Page</button>
            </div>
        `;
    }

    // Modal Close Event Bindings
    if (closeQrModalBtn) closeQrModalBtn.addEventListener("click", closeQrModal);
    if (closeModalBottomBtn) closeModalBottomBtn.addEventListener("click", closeQrModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeQrModal);

    // Escape Key to Close modal
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && qrModal && !qrModal.hidden) {
            closeQrModal();
        }
    });
});

/**
 * Validates if the event has all the required properties to generate a QR code.
 */
function isValidEvent(event) {
    return Boolean(
        event &&
        event.id &&
        event.name &&
        event.location
    );
}

/**
 * Builds the pre-filled Google Form URL containing Event Name and Location.
 */
function buildGoogleFormUrl(event) {
    if (!event) {
        throw new Error("Event is required.");
    }

    if (!event.name || !event.location) {
        throw new Error(
            "Event Name and Event Location are required."
        );
    }

    const url = new URL(GOOGLE_FORM_BASE_URL);

    url.searchParams.set("usp", "pp_url");

    url.searchParams.set(
        GOOGLE_FORM_ENTRIES.eventName,
        event.name
    );

    url.searchParams.set(
        GOOGLE_FORM_ENTRIES.eventLocation,
        event.location
    );

    return url.toString();
}

/**
 * Handles check-in button clicks: Validates, constructs URL, and opens the QR modal.
 */
function handleCheckIn(eventId) {
    const selectedEvent = EVENTS.find(
        event => event.id === eventId
    );

    if (!selectedEvent) {
        console.error("Event not found for ID:", eventId);
        showToast(
            "Event not found. Please refresh the page.",
            "error"
        );
        return;
    }

    if (!isValidEvent(selectedEvent)) {
        console.error("Invalid event data for ID:", eventId);
        showToast(
            "Event not found. Please refresh the page.",
            "error"
        );
        return;
    }

    try {
        const googleFormUrl =
            buildGoogleFormUrl(selectedEvent);

        openQrModal(selectedEvent, googleFormUrl);
    } catch (error) {
        console.error("Unable to create QR link:", error);

        showToast(
            "Unable to create the check-in QR code.",
            "error"
        );
    }
}

/**
 * Renders the QRCode in the modal container.
 */
function renderQrCode(googleFormUrl) {
    const qrContainer =
        document.getElementById("qrCode");

    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: googleFormUrl,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.H
    });
}

/**
 * Populates and displays the QR modal.
 */
function openQrModal(event, googleFormUrl) {
    const modal = document.getElementById("qrModal");

    document.getElementById(
        "qrEventName"
    ).textContent = event.name;

    document.getElementById(
        "qrEventLocation"
    ).textContent = event.location;

    const openFormButton = document.getElementById(
        "openGoogleFormButton"
    );

    openFormButton.href = googleFormUrl;

    renderQrCode(googleFormUrl);

    modal.hidden = false;
    document.body.classList.add("modal-open");
}

/**
 * Closes the QR modal dialog.
 */
function closeQrModal() {
    const modal = document.getElementById("qrModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");

    // Restore focus to button that triggered modal opening for accessibility
    if (lastActiveElement) {
        lastActiveElement.focus();
    }
}

/**
 * Displays premium custom toast notification alert.
 */
function showToast(message, type = "error") {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.style.position = "fixed";
        toastContainer.style.bottom = "24px";
        toastContainer.style.right = "24px";
        toastContainer.style.zIndex = "9999";
        toastContainer.style.display = "flex";
        toastContainer.style.flexDirection = "column";
        toastContainer.style.gap = "10px";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.padding = "14px 24px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#ffffff";
    toast.style.fontWeight = "600";
    toast.style.fontSize = "0.95rem";
    toast.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    toast.style.backgroundColor = type === "error" ? "#ef4444" : "#10b981";
    toast.style.animation = "slideIn 0.3s forwards";

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Injects CSS rules for animated Toasts.
 */
function initializeToastStyles() {
    if (!document.getElementById("toastAnimationStyles")) {
        const style = document.createElement("style");
        style.id = "toastAnimationStyles";
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(20px); opacity: 0; }
            }
            .modal-open {
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Escapes characters for HTML output safety.
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
