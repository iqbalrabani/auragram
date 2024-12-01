pipeline {
    agent any
    
    environment {
        PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_KEY = 'gcp-service-account-key'
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
                            -Dsonar.sources=. \
                            echo 'SonarQube Analysis Completed'
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Cloud Run') {
            steps {
                withCredentials([
                    file(credentialsId: "${GCP_KEY}", variable: 'GCP_KEY'),
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                ]) {
                    sh """
                        gcloud auth activate-service-account --key-file=$GCP_KEY
                        gcloud auth configure-docker gcr.io -q
                        
                        # Build and Deploy Backend
                        gcloud run deploy visiongram-backend \
                            --source backend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${PROJECT_ID} \
                            --allow-unauthenticated \
                            --set-env-vars="MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET}" \
                            --port=8080
                        
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