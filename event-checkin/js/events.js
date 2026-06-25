/**
 * EVENTS CONTROLLER
 * Manages the dynamic rendering of event cards and QR code modal interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
    const eventGrid = document.getElementById("eventGrid");
    const qrModal = document.getElementById("qrModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const closeModalBottomBtn = document.getElementById("closeModalBottomBtn");
    const modalTitle = document.getElementById("modalTitle");
    const qrcodeContainer = document.getElementById("qrcode");
    const directCheckinLink = document.getElementById("directCheckinLink");
    
    // Track the trigger button to restore focus later
    let lastActiveElement = null;
    let qrCodeInstance = null;

    // Simulate loading state to showcase skeletons
    setTimeout(() => {
        try {
            renderEvents();
        } catch (error) {
            console.error("Failed to render events:", error);
            showErrorState("Unable to load events. Please refresh the page.");
        }
    }, 400); // 400ms delay to make skeleton animation visible

    /**
     * Renders the event list dynamically
     */
    function renderEvents() {
        // Clear skeleton indicators
        eventGrid.innerHTML = "";

        // Check for undefined or empty list (Empty State)
        if (typeof EVENTS === "undefined" || !Array.isArray(EVENTS) || EVENTS.length === 0) {
            showEmptyState();
            return;
        }

        // Generate card layout for each event (Normal State)
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
                lastActiveElement = e.currentTarget; // save focus reference
                openQRModal(eventId);
            });
        });
    }

    /**
     * Displays empty state when events list is empty
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
     * Displays error state when rendering fails
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

    /**
     * Generates QR Code and opens the dialog modal
     */
    function openQRModal(eventId) {
        // Validate configuration variables
        if (typeof APP_CONFIG === "undefined" || !APP_CONFIG.baseUrl) {
            console.error("Configuration APP_CONFIG or baseUrl is missing.");
            return;
        }

        // Find the event
        const selectedEvent = EVENTS.find(e => e.id === eventId);
        if (!selectedEvent) {
            console.error(`Event with ID ${eventId} not found.`);
            return;
        }

        // Update modal title
        modalTitle.textContent = selectedEvent.name;

        // Build path URL
        const checkinUrl = `${APP_CONFIG.baseUrl}/check-in.html?eventId=${encodeURIComponent(selectedEvent.id)}`;
        
        // Update helper direct link for developer testing on desktop
        directCheckinLink.href = checkinUrl;

        // Clear any old QR canvas/images
        qrcodeContainer.innerHTML = "";

        // Render QR Code using the qrcode.min.js CDN library
        try {
            qrCodeInstance = new QRCode(qrcodeContainer, {
                text: checkinUrl,
                width: 180,
                height: 180,
                colorDark: "#1f2937",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            console.error("QR Code library failed to initialize:", err);
            qrcodeContainer.innerHTML = `<p class="status-text">Error generating QR Code.</p>`;
        }

        // Display Modal
        qrModal.removeAttribute("hidden");
        document.body.style.overflow = "hidden"; // Prevent scrolling
        
        // Trap focus to Close button for accessibility
        closeModalBtn.focus();
    }

    /**
     * Closes the dialog modal and cleans resources
     */
    function closeQRModal() {
        qrModal.setAttribute("hidden", "true");
        document.body.style.overflow = ""; // Restore body scrolling
        
        // Clear QR code to free memory
        qrcodeContainer.innerHTML = "";
        qrCodeInstance = null;

        // Restore focus to button that opened it
        if (lastActiveElement) {
            lastActiveElement.focus();
        }
    }

    // Modal Close Event Bindings
    closeModalBtn.addEventListener("click", closeQRModal);
    closeModalBottomBtn.addEventListener("click", closeQRModal);
    modalBackdrop.addEventListener("click", closeQRModal);

    // Escape Key to Close modal
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !qrModal.hasAttribute("hidden")) {
            closeQRModal();
        }
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
