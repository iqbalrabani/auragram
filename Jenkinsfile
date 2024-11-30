pipeline {
    agent any
    
    environment {
        GOOGLE_PROJECT_ID = 'your-project-id'
        FRONTEND_IMAGE = 'gcr.io/${GOOGLE_PROJECT_ID}/frontend'
        PROJECT_ID = 'devsecops-kel4'
        CREDENTIALS_ID = 'gcp-service-account-key'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        cd frontend
                        sonar-scanner \
                            -Dsonar.projectKey=frontend \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://35.208.65.107:9000/
                    '''
                }
            }
        }
        
        stage('Build & Push Docker Image') {
            steps {
                script {
                    docker.build("${FRONTEND_IMAGE}", "./frontend")
                    docker.withRegistry('https://gcr.io', 'gcr:credentials') {
                        docker.image("${FRONTEND_IMAGE}").push()
                    }
                }
            }
        }
        
        stage('Deploy to Cloud Run') {
            steps {
                sh """
                    gcloud run deploy frontend \
                        --image ${FRONTEND_IMAGE} \
                        --platform managed \
                        --region us-central1 \
                        --project ${GOOGLE_PROJECT_ID}
                """
            }
        }
        
        stage('Authenticate with GCP') {
            steps {
                script {
                    withCredentials([file(credentialsId: CREDENTIALS_ID, variable: 'GCP_KEY_FILE')]) {
                        sh '''
                            # Export service account key path for Google Cloud SDK
                            export GOOGLE_APPLICATION_CREDENTIALS="$GCP_KEY_FILE"
                            
                            # Activate service account
                            gcloud auth activate-service-account --key-file="$GCP_KEY_FILE"
                            
                            # Set project
                            gcloud config set project ${PROJECT_ID}
                        '''
                    }
                }
            }
        }
    }
}
