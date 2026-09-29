/**
 * @file Jenkinsfile
 * @description
 * Jenkins Declarative CI/CD Pipeline definition for the AWH Hospital test automation suite.
 * Automates dependency installation, Playwright browser setup, test execution, Allure report generation,
 * and artifact archiving on Windows Jenkins build nodes.
 *
 * Pipeline Stages:
 * 1. Install Dependencies - Installs npm packages and synchronizes local environment credentials.
 * 2. Install Playwright Browsers - Downloads required browser binaries with system dependencies.
 * 3. Run Playwright Tests - Executes test suites with failure trapping (UNSTABLE on failure).
 * 4. Generate Allure Report - Builds historical trend reports via `npm run report:generate`.
 *
 * Post-Execution:
 * - Publishes Allure results to Jenkins Allure plugin.
 * - Archives `allure-report/` directory as build artifacts.
 */

pipeline {
    agent any

    tools {
        allure 'allure'
    }

    environment {
        NODE_OPTIONS = '--max-old-space-size=4096'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                // Copy the local .env file so Jenkins has the email credentials
                bat 'copy "C:\\Users\\gunasekhar.p\\OneDrive - TestPerform\\Desktop\\Aws_Hospital\\.env" .env || echo No .env file found'
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx playwright test'
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'npm run report:generate'
            }
        }
    }

    post {
        always {
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
        }
    }
}
