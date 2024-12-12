pipeline {
    agent any
    
    environment {
        GCP_PROJECT_ID = 'devsecops-kel4'
        REGION = 'us-central1'
        GCP_CREDENTIAL = 'gcp-service-account-key'
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
                        """
                        echo 'SonarQube Analysis Completed'
                    }
                }
            }
        }
        
        stage('Deploy to Cloud Run') {
            steps {
                withCredentials([
                    file(credentialsId: "${GCP_CREDENTIAL}", variable: 'GCP_CREDENTIAL'),
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GCP_BUCKET', variable: 'GCP_BUCKET'),
                    string(credentialsId: 'SECURE_API', variable: 'SECURE_API'),
                    string(credentialsId: 'DEFAULT_PP', variable: 'DEFAULT_PP'),
                    string(credentialsId: 'GCP_KEYFILE', variable: 'GCP_KEYFILE'),
                    string(credentialsId: 'GCP_SERVICE_ACCOUNT', variable: 'GCP_SERVICE_ACCOUNT')
                ]) {
                    sh """
                        gcloud auth activate-service-account --key-file=$GCP_CREDENTIAL
                        gcloud auth configure-docker gcr.io -q
                        
                        # Build and Deploy Backend
                        gcloud run deploy auragram-backend \
                            --source backend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${GCP_PROJECT_ID} \
                            --set-env-vars="MONGODB_URI=${MONGODB_URI},JWT_SECRET=${JWT_SECRET},GCP_PROJECT_ID=${GCP_PROJECT_ID},GCP_BUCKET=${GCP_BUCKET},GCP_KEYFILE=${GCP_KEYFILE}" \
                            --service-account=${GCP_SERVICE_ACCOUNT} \
                            --port=8080 \
                            --allow-unauthenticated
                        
                        # Build and Deploy Frontend
                        gcloud run deploy auragram \
                            --source frontend \
                            --platform managed \
                            --region ${REGION} \
                            --project ${GCP_PROJECT_ID} \
                            --set-env-vars="REACT_APP_API_URL=${SECURE_API},REACT_APP_DEFAULT_PP=${DEFAULT_PP}"
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