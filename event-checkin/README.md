# Festival Event Check-in System

A lightweight, modern, static frontend website for registering and checking in participants at festival events. It dynamically renders a selection of 6 events, generates individual QR codes for mobile check-in, and logs responses securely to a Google Form using a seamless, custom backdrop frame.

---

## Folder Structure

```text
event-checkin/
├── index.html          # Main event selection gallery page (with QR modals)
├── check-in.html       # Mobile-first form check-in submission page
├── README.md           # Documentation & guides
├── css/
│   ├── style.css       # Visual styles for index.html gallery
│   └── check-in.css    # Responsive styles for check-in.html form
├── js/
│   ├── config.js       # App parameters (Form IDs, Entry mappings, Public URL)
│   ├── events-data.js  # Main event details array (6 events)
│   ├── events.js       # Core logic for rendering list & QR generation
│   └── check-in.js     # Form input validation and post handler
└── images/
    ├── event-1.jpg     # Summer Music Festival Banner
    ├── event-2.jpg     # Vietnamese Cultural Festival Banner
    ├── event-3.jpg     # Street Food Festival Banner
    ├── event-4.jpg     # Festival of Lights Banner
    ├── event-5.jpg     # Book and Creativity Festival Banner
    └── event-6.jpg     # Youth Technology Festival Banner
```

---

## 1. Running Locally

To run the application locally on your computer:
1. Open the project folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey) if you haven't already.
3. Right-click on `index.html` and select **Open with Live Server**.
4. The site will launch at `http://127.0.5500/` or a similar local IP port.

> [!NOTE]
> When testing QR code scanning using an external mobile phone, **do not** use `http://localhost` inside `config.js`. Instead, deploy the website to a public URL (see section 3) so your phone's camera can access the check-in form.

---

## 2. Google Form Integration Setup

To link check-in forms to your Google Sheet response page:

### Step 2.1: Create a Google Form
1. Go to [Google Forms](https://docs.google.com/forms/) and create a blank form.
2. Add exactly **5 questions** using the **Short answer** answer type:
   - **Name** (Set as *Required*)
   - **Email** (Set as *Required*, click `Response validation` -> `Text` -> `Email address`)
   - **Event ID** (Set as *Required*)
   - **Event Name** (Set as *Required*)
   - **Event Location** (Set as *Required*)

### Step 2.2: Extract Form Action URL
1. Click the **Send** button at the top right of your Google Form editor.
2. Click the **Link** tab and copy the shortened link (e.g., `https://docs.google.com/forms/d/e/1FAIpQLSfY39rCrC-nzsQgui7sfC0i12nQ1Tvu8FYwRtC0CimPQa7qFQ/viewform`).
3. Take the **Form ID** from that URL (the long string between `/d/e/` and `/viewform`). In this case:
   `1FAIpQLSfY39rCrC-nzsQgui7sfC0i12nQ1Tvu8FYwRtC0CimPQa7qFQ`
4. Change the URL ending from `/viewform` to `/formResponse` to construct the submit endpoint:
   `https://docs.google.com/forms/d/e/1FAIpQLSfY39rCrC-nzsQgui7sfC0i12nQ1Tvu8FYwRtC0CimPQa7qFQ/formResponse`
5. Open `js/config.js` and paste this URL into the `actionUrl` field.

### Step 2.3: Extract Entry field IDs
To map our frontend text fields to the correct Google Form inputs, we need their internal `entry.xxxxxx` parameters:
1. Inside your Google Form editor, click the **Three Dots (More)** icon next to Send in the top right.
2. Click **Get pre-filled link**.
3. Fill in mock data for all questions (e.g., Name: `Test`, Email: `test@gmail.com`, Event ID: `0123456789`, Event Name: `VietNam Festival`, Event Location: `Viet Nam`).
4. Click **Get link** at the bottom, and copy the link from the pop-up notification.
5. Paste the link into a text editor. It will look like this:
   `https://docs.google.com/forms/d/e/.../viewform?usp=pp_url&entry.1908979897=Test&entry.1872761607=test@gmail.com&entry.1017091537=0123456789&entry.2118289221=VietNam+Festival&entry.524089912=Viet+Nam`
6. Identify the numbers attached to each field:
   - `entry.1908979897` -> Name
   - `entry.1872761607` -> Email
   - `entry.1017091537` -> Event ID
   - `entry.2118289221` -> Event Name
   - `entry.524089912` -> Event Location
7. Open `js/config.js` and replace the placeholder keys in `entries` with your extracted values:
   ```javascript
   googleForm: {
       actionUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
       entries: {
           name: "entry.1908979897",
           email: "entry.1872761607",
           eventId: "entry.1017091537",
           eventName: "entry.2118289221",
           eventLocation: "entry.524089912"
       }
   }
   ```

---

## 3. Public Deployment

Once your local site is linked with Google Form entry IDs, deploy it to a static host so users can access it on mobile.

### Deployment on GitHub Pages
1. Push this project folder to a repository on GitHub (e.g., `github.com/your-username/event-checkin`).
2. Go to **Settings** -> **Pages** in the repo menu.
3. Select the deployment source as the **main/master branch** and root directory, then click **Save**.
4. GitHub will deploy the site shortly, giving you a public URL (e.g., `https://your-username.github.io/event-checkin`).
5. **CRITICAL STEP**: Open `js/config.js` and set the `baseUrl` parameter to match this public URL. Push the change to GitHub:
   ```javascript
   baseUrl: "https://your-username.github.io/event-checkin"
   ```

### Deployment on Netlify / Vercel
- Simply drag-and-drop the root project directory `event-checkin` into the Netlify manual deploy dashboard or import your repository to Netlify/Vercel.
- Update `baseUrl` in `js/config.js` to match the newly generated domain name (e.g. `https://your-project.netlify.app`).

---

## 4. Verification Check

To verify that the system functions correctly:
1. Open the public URL in your browser.
2. Verify that **6 events** are rendered with descriptive cards.
3. Click the **Check-in** button of any event (e.g., *Summer Music Festival*).
4. Verify that the QR code pop-up displays.
5. Scan the QR code using your mobile phone camera.
6. Verify that it opens the check-in form, showing the matching event details, date, time, and location banner.
7. Fill in your **Name** and **Email** and submit.
8. Verify that the form validation warns you of invalid entries, disables double-click submission, displays a progress spinner, and successfully captures feedback inside a success card without page redirection.
9. Open the Responses tab in your Google Form editor. Verify that your submitted details are logged properly.
