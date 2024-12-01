pipeline {
    agent any
    
    environment {
        PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_CREDENTIALS = 'gcp-service-account-key'
        SONNAR_SCANNER = 'SonarQube'
        SONAR_PROJECT_KEY = 'auragram'
        SONAR_PROJECT_NAME = 'auragram'
    }
    
    stages {
        stage('Run Sonarqube') {
            environment {
                scannerHome = tool "${SONNAR_SCANNER}";
            }
            steps {
              withSonarQubeEnv("${SONNAR_SCANNER}") {
                sh '''${SONNAR_SCANNER}/bin/sonar-scanner
                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                -Dsonar.sources=. \
                echo 'SonarQube Analysis Completed'
                '''
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
