pipeline {
    agent any
    
    environment {
        PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_CREDENTIALS = 'gcp-service-account-key'
        SONAR_PROJECT_KEY = 'auragram'
    }

    
    
    stages {
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''mvn clean verify sonar:sonar -Dsonar.projectKey=auragram -Dsonar.projectName='auragram' -Dsonar.host.url=http://35.208.65.107:9000/'''
                    echo 'SonarQube Analysis Completed'
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
