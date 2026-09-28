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
