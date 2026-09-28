# 🚀 The Ultimate Playwright Automation Guide: Architecture, Setup & Execution

Welcome to the **AWH Hospital Automation Master Guide**. 

This document is built for absolute beginners and senior architects alike. It will first explain exactly **what** technologies are powering this framework and **why** they were chosen. Then, it will walk you through a pin-to-pin, from-scratch setup guide to get everything running on a brand new computer.

---

## 🧠 Part 1: The Technology Stack Explained

Before installing anything, it is critical to understand the powerful tools that make this framework work.

### 1. Playwright (The Automation Engine)
> [!NOTE]
> **What is it?** Playwright is a modern, open-source automation library built by Microsoft. 
> **Why do we use it?** Unlike older tools like Selenium, Playwright is incredibly fast. It automatically waits for elements to be visible before clicking them (no more `Thread.sleep()`), it can intercept backend network API calls, and it can run tests in parallel across Chrome, Firefox, and Safari simultaneously.

### 2. TypeScript & Node.js (The Programming Language)
> [!NOTE]
> **What is it?** Node.js is the runtime environment, and TypeScript is a strict, enterprise-grade version of JavaScript.
> **Why do we use it?** TypeScript catches coding errors *before* you run the code. By using Page Object Models (POM) with TypeScript, we ensure that if a developer types the wrong variable name, the code simply won't compile, saving hours of debugging.

### 3. Allure Reporter (The Visual Dashboard)
> [!NOTE]
> **What is it?** Allure is a lightweight, multi-language test reporting tool.
> **Why do we use it?** When tests fail, looking at a terminal error is confusing for managers. Allure generates a beautiful, interactive HTML website that shows exactly which tests passed, graphs of historical trends, and attaches **screenshots and video recordings** of the exact moment a test failed.

### 4. CI/CD: Jenkins, GitHub Actions & GitLab
> [!NOTE]
> **What is it?** Continuous Integration / Continuous Deployment (CI/CD) means running your tests automatically without a human touching a keyboard.
> **Why do we use it?** We have integrated 3 different CI/CD platforms into this framework:
> * **Jenkins:** A local server that runs tests in the background on your company's private network.
> * **GitHub Actions:** Microsoft's cloud servers that automatically run your tests the second a developer pushes new code.
> * **GitLab CI:** An enterprise cloud alternative for companies that don't use GitHub.

---

## 💻 Part 2: Install Required Software (Prerequisites)

If you are on a brand new computer, you must install the following foundation tools first.

### Step 1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org/).
2. Download the **LTS (Long Term Support)** version for Windows.
3. Open the downloaded file and keep clicking "Next". The default settings are perfect.

### Step 2: Install Git
1. Go to [git-scm.com/download/win](https://git-scm.com/download/win).
2. Download the **"64-bit Git for Windows Setup"**.
3. Install it using the default settings. Git is what allows your computer to securely download code from the cloud.

### Step 3: Install VS Code (Visual Studio Code)
1. Go to [code.visualstudio.com](https://code.visualstudio.com/).
2. Download and install the Windows version. This is the professional Code Editor we will use to write tests and run commands.

### Step 4: Install Jenkins (For Local Automated Pipelines)
1. Jenkins requires Java. If you don't have Java, download and install [Java JDK 17](https://adoptium.net/).
2. Go to [jenkins.io/download](https://www.jenkins.io/download/) and download the generic Java package (`jenkins.war`).
3. Save it to a dedicated folder on your computer (for example, create a folder called `C:\Jenkins`).

---

## 🔐 Part 3: Create Required Accounts & Passwords

To use the cloud pipelines and send HTML email reports, you need specific security tokens.

### Step 1: GitHub Account & Personal Access Token (PAT)
> [!IMPORTANT]
> A PAT acts as a secure password that allows your terminal to push code into the GitHub cloud.
1. Go to [github.com](https://github.com/) and create a free account.
2. Log in, click your profile picture in the top right corner, and select **Settings**.
3. Scroll down the left menu and click **Developer settings** -> **Personal access tokens** -> **Tokens (classic)**.
4. Click **Generate new token (classic)**.
5. Name the token `Hospital Automation`.
6. **CRITICAL:** Check the box that says **`repo`** (This gives the token permission to read and write code).
7. Click Generate, and **copy the long password** (it starts with `ghp_...`). Save this somewhere safe!

### Step 2: Google App Password (For Automated Emails)
> [!IMPORTANT]
> The framework automatically emails the test results to managers. Google blocks regular passwords for security reasons, so you must create a special "App Password".
1. Go to [myaccount.google.com](https://myaccount.google.com/) and log in with your Gmail.
2. Go to **Security** on the left menu.
3. Turn on **2-Step Verification** (if it isn't already).
4. Once on, search for **App Passwords** in the Google search bar.
5. Create a new App Password named `Playwright Automation`.
6. Google will give you a 16-letter password (e.g., `abcd efgh ijkl mnop`). 
7. **Copy it, but remove the spaces** (e.g., `abcdefghijklmnop`).

---

## ⚙️ Part 4: Project Setup & Configuration

Now that the software and passwords are ready, let's configure the actual project.

### Step 1: Download the Code
Open your VS Code terminal (Click `Terminal` -> `New Terminal` at the top of the screen) and run:
```bash
git clone https://github.com/GUNAQA-ai/Awh-Hospital.git
cd Awh-Hospital
```

### Step 2: Configure the `.env` Secrets File
> [!WARNING]
> Do not skip this! The framework uses this file to read your passwords. Without it, emails will fail.
1. In the `Awh-Hospital` folder, you will see a file named `.env.example`.
2. Copy it and rename the copy to exactly **`.env`**.
3. Open `.env` and fill it in:
   - `SMTP_USER`: Your Gmail address.
   - `SMTP_PASS`: Your 16-letter Google App Password (no spaces).
   - `GITHUB_PAT`: Your GitHub Personal Access Token.

### Step 3: Install the Framework Dependencies
In your VS Code terminal, run these exact commands:
```bash
npm install
npx playwright install --with-deps
```
*What this does: It reads the `package.json` file and downloads Playwright, Allure Reporter, and the exact versions of Google Chrome required to run the tests.*

---

## 🚀 Part 5: Execution Guide (How to Run the Framework)

You can now run the framework in 3 different environments!

### Method A: Run Locally in VS Code (For Development)
Runs directly on your computer. A physical Chrome window will pop open so you can see the tests executing in real-time.

**NPM Scripts (The Easy Way):**
* To run the tests: 
  ```bash
  npm run test
  ```
* To view the HTML report & send the email: 
  ```bash
  npm run report:allure
  ```

**Raw Playwright Commands (The Advanced Way):**
* `npx playwright test` (Runs all tests in the background)
* `npx playwright test --headed` (Runs tests and physically watches the browser open)
* `npx playwright test --ui` (Opens the interactive Playwright UI Runner)
* `npx playwright test src/tests/e2e/login.spec.ts` (Runs one specific test file)


### Method B: Run via Local Jenkins Pipeline
Jenkins runs the tests silently in the background and generates a permanent history of past test runs.

**Setup & Execution:**
1. Open a terminal where you downloaded `jenkins.war` and start the server:
   ```bash
   java -jar jenkins.war --enable-future-java
   ```
2. Open your web browser to `http://localhost:8080`.
3. Find the initial password located inside `C:\Users\<username>\.jenkins\secrets\initialAdminPassword`.
4. Go to **Manage Jenkins -> Plugins -> Available**, search for **Allure**, and install it.
5. Create a new Pipeline job, point it to your GitHub URL, and specify `*/main` as the branch.
6. Click **Build Now** in Jenkins. It will read the `Jenkinsfile` in your code, run the tests, attach screenshots to the Allure report, and email you the final summary.


### Method C: Run via GitHub Actions (Cloud Pipeline)
Microsoft's cloud servers run your tests automatically every time you push code. You don't even need your computer turned on!

**Setup & Execution:**
1. Go to your repository on GitHub.
2. Click **Settings** -> **Secrets and variables** -> **Actions**.
3. Add your `SMTP_USER`, `SMTP_PASS`, and `EMAIL_TO` secrets here so the cloud can securely send emails.
4. Make a change to your code in VS Code.
5. Push the code to the cloud: 
   ```bash
   git add -A
   git commit -m "triggering cloud pipeline"
   git push origin main
   ```
6. The pipeline will instantly start running under the **Actions** tab on your GitHub repository!
