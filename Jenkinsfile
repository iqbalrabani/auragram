pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'auragram-backend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh '''
                    if [ -f "package.json" ] && grep -q "test" "package.json"; then
                        npm test
                    else
                        echo "No test script found, skipping tests"
                    fi
                    '''
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                parallel(
                    "OWASP Dependency Check": {
                        dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'OWASP-Dependency-Check'
                    },
                    "SonarQube Analysis": {
                        withSonarQubeEnv('SonarQube') {
                            sh 'sonar-scanner'
                        }
                    }
                )
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh "docker stop ${DOCKER_IMAGE}-staging || true"
                sh "docker rm ${DOCKER_IMAGE}-staging || true"
                sh "docker run -d --name ${DOCKER_IMAGE}-staging -p 5001:5000 ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?'
                sh "docker stop ${DOCKER_IMAGE}-prod || true"
                sh "docker rm ${DOCKER_IMAGE}-prod || true"
                sh "docker run -d --name ${DOCKER_IMAGE}-prod -p 5000:5000 ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
    }

    //ss
    
    post {
        always {
            cleanWs()
        }
    }
}