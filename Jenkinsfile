pipeline {
    agent any
    
    environment {
        PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_CREDENTIALS = 'gcp-service-account-key'
        SONAR_PROJECT_KEY = 'auragram'
    }
    
    stages {
        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            // Run tests with coverage
                            sh 'npm test -- --coverage'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            // Run tests with coverage
                            sh 'npm test -- --coverage --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=. \
                            -Dsonar.javascript.lcov.reportPaths=auragram/backend/coverage/lcov.info,auragram/frontend/coverage/lcov.info
                    """
                }
            }
        }
        
        stage('Deploy to Cloud Run') {
            steps {
                withCredentials([file(credentialsId: "${GCP_CREDENTIALS}", variable: 'GCP_KEY')]) {
                    sh """
                        gcloud auth activate-service-account --key-file=$GCP_KEY
                        gcloud auth configure-docker gcr.io -q
                        
                        # Build and Deploy Backend
                        gcloud run deploy auragram-backend \
                            --source auragram/backend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${PROJECT_ID} \
                            --allow-unauthenticated \
                            --set-env-vars="NODE_ENV=production"
                        
                        # Build and Deploy Frontend
                        gcloud run deploy auragram-frontend \
                            --source auragram/frontend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${PROJECT_ID} \
                            --allow-unauthenticated
                    """
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
