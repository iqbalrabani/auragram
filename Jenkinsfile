pipeline {
    agent any
    
    environment {
        GCP_PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_CREDENTIALS = 'gcp-service-account-key'
        SONAR_PROJECT_KEY = 'auragram-vulnerable'
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
                        """
                        echo 'SonarQube Analysis Completed'
                    }
                }
            }
        }
        
        stage('Deploy to Cloud Run') {
            steps {
                withCredentials([
                    file(credentialsId: "${GCP_CREDENTIALS}", variable: 'GCP_KEY'),
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GCP_BUCKET', variable: 'GCP_BUCKET'),
                    string(credentialsId: 'VULNER_API', variable: 'VULNER_API'),
                    string(credentialsId: 'DEFAULT_PP', variable: 'DEFAULT_PP'),
                    string(credentialsId: 'GCP_SERVICE_ACCOUNT', variable: 'GCP_SERVICE_ACCOUNT')
                ]) {
                    sh """
                        gcloud auth activate-service-account --key-file=$GCP_KEY
                        gcloud auth configure-docker gcr.io -q
                        
                        # Build and Deploy Backend
                        gcloud run deploy vulnerable-backend \
                            --source backend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${GCP_PROJECT_ID} \
                            --allow-unauthenticated \
                            --set-env-vars="MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET},GCP_PROJECT_ID=${GCP_PROJECT_ID},GCP_BUCKET=${GCP_BUCKET}" \
                            --service-account=${GCP_SERVICE_ACCOUNT} \
                            --port=8080
                        
                        # Build and Deploy Frontend
                        gcloud run deploy vulnerable \
                            --source frontend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${GCP_PROJECT_ID} \
                            --allow-unauthenticated \
                            --set-env-vars="REACT_APP_API_URL=${VULNER_API}, REACT_APP_DEFAULT_PP=${DEFAULT_PP}"
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