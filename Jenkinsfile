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
                script {
                    def SCANNER_HOME = tool 'SonarQube Scanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=.
                            echo 'SonarQube Analysis Completed'
                        """
                    }
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
                        gcloud run deploy  visiongram-backend \
                            --source backend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${PROJECT_ID} \
                            --allow-unauthenticated
                        
                        # Build and Deploy Frontend
                        gcloud run deploy visiongram-frontend \
                            --source frontend \
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
