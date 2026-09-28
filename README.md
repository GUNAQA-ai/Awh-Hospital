# AWH Hospital Playwright Automation Framework

Welcome to the **AWH Hospital Automation Framework**. This is a senior-level, enterprise-grade Playwright framework built with TypeScript. It features Page Object Models (POM), dynamic API testing, Allure trend reporting, and adaptive CI/CD email notifications.

This document is your **Pin-to-Pin Master Guide**. It explains exactly what the framework is, why it is built this way, where to find things, how to configure credentials, and how to run it anywhere.

---

## 1. What, Why, and Where (Architecture)

This framework is designed for scale, stability, and crystal-clear reporting.

### Where things are located:
* **`src/tests/`**: Contains all your `.spec.ts` files (e.g., `e2e/02-new-patient-booking.spec.ts`).
* **`src/pages/`**: Contains your Page Object Models (e.g., `AwhBookingPage.ts`).
* **`src/utils/`**: Contains your custom assertions, validations, and the `ConsoleStepReporter.ts`.
* **`playwright.config.ts`**: The global configuration (timeouts, browsers, reporters).

### Why it is built this way (The Master Flow):
1. **Spec Files (The "What"):** Spec files only contain test data inputs (e.g., `await bookingPage.selectPatientType(patient.patientType)`). They **do not** contain locators or complex logic.
2. **Page Objects (The "Where"):** Page objects declare exactly where elements are located on the screen (`private usernameInput: Locator`) and hold human-readable log strings (`"Entering email address"`).
3. **BasePage (The "How"):** All page objects extend `BasePage.ts`. It handles the low-level Playwright interactions (clicks, fills, waits), logs the human strings to the terminal, and catches errors to throw custom exceptions.
4. **ConsoleStepReporter (The "Proof"):** Formats the console logs and generates a **Client Proof Report** when a test fails, clearly distinguishing between a [SCRIPT TIMEOUT] vs a [CONFIRMED APPLICATION BUG].

---

## 2. Core Setup & Credentials (The `.env` File)

Your framework dynamically adapts to where it is running, but for Local Execution, you must configure your `.env` file.

1. Find the `.env.example` file in the root directory.
2. Copy it and rename the new file to exactly **`.env`**.
3. Open `.env` and fill in the following credentials:

### A. Email Reporting Credentials
* **Why:** The framework sends an HTML summary email the exact second the Allure report finishes generating.
* **How to get the password:** Google blocked regular passwords for automation. You **cannot** use your normal password.
   1. Go to your Google Account -> Security -> 2-Step Verification -> **App Passwords**.
   2. Generate a 16-letter App Password (e.g. `abcd efgh ijkl mnop`).
   3. Paste it into `.env` under `SMTP_PASS` (remove the spaces).
* **Where:** Put your email in `SMTP_USER` and the recipient(s) in `EMAIL_TO`.

### B. GitHub Personal Access Token (PAT)
* **Why:** You need this token to push code to GitHub securely from the command line.
* **How to get it:**
   1. Go to https://github.com/settings/tokens
   2. Click **Generate new token (classic)**. Name it `automation-push`.
   3. **CRITICAL:** Check the **`repo`** checkbox (Full control of private repositories).
   4. Click Generate and copy the token (`ghp_...`).
* **Where:** Paste it into `.env` under `GITHUB_PAT`.

### C. Jenkins Credentials
* **Why:** To run Jenkins locally on your machine.
* **How to get it:** The initial admin password is automatically saved on your computer when Jenkins first starts. Open `C:\Users\<your_username>\.jenkins\secrets\initialAdminPassword` to find it.
* **Where:** Paste it into `.env` under `JENKINS_INITIAL_ADMIN_PASSWORD`.

---

## 3. Local Execution & Validation

### Installation
Open a terminal in this folder and run:
```bash
npm install
npx playwright install --with-deps
```

### Running Tests
To run all tests (UI & API) in **Headed Mode** (browser pops open):
```bash
npm run test
```

### Generating the Report & Sending Email
Once tests finish, generate the beautiful Allure HTML report and automatically send the email:
```bash
npm run report:allure
```
*(When done, click the terminal and press `Ctrl+C` to stop the server).*

---

## 4. GitHub Actions (Cloud CI/CD)

The framework is perfectly configured for GitHub Actions (`.github/workflows/playwright.yml`). It runs **Headless** to avoid crashing the cloud container.

### How to configure it:
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Add these exact secrets so the cloud runner can send emails:
   - `SMTP_USER` (Your Gmail address)
   - `SMTP_PASS` (Your 16-letter App Password)
   - `EMAIL_TO` (Destination email address)

### How to run it:
Push your code to GitHub. The pipeline will automatically trigger on pushes and pull requests to the `main` branch, and every night at 2:00 AM!

---

## 5. Jenkins Pipeline (Local or Enterprise)

The framework contains a production-ready `Jenkinsfile`.

### How to set it up:
1. Start Jenkins locally: `java -jar jenkins.war --enable-future-java`
2. Open `http://localhost:8080` and log in.
3. Go to Manage Jenkins -> Plugins -> Available plugins -> Search and install **Allure**.
4. Go to Manage Jenkins -> Tools -> Scroll to **Allure Commandline** -> Click Add Allure Commandline -> Name it `allure` -> Check "Install automatically" -> Click Save.

### How to run it:
1. Click **New Item** -> Name it `Hospital Booking Pipeline` -> Select **Pipeline** -> Click OK.
2. Under Pipeline Definition, select **Pipeline script from SCM**.
3. SCM: **Git** -> URL: `https://github.com/GUNAQA-ai/Awh-Hospital.git`.
4. Branch Specifier: `*/main` -> Script Path: `Jenkinsfile` -> Save.
5. Click **Build Now**!

---

## 6. GitLab CI

If your company uses GitLab, the framework is ready to go via `.gitlab-ci.yml`.

### How to configure it:
1. Push your code to GitLab. 
2. Go to Settings -> **CI/CD** -> **Variables**.
3. Add your `SMTP_USER`, `SMTP_PASS`, and `EMAIL_TO` as variables (Mask the password).

### How to run it:
The pipeline will automatically run in 2 stages (Test & Report) upon code push, and will send the email report when finished.