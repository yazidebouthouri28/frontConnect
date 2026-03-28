pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'farah893/connectcamp-frontend'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
    }

    tools {
        nodejs 'Node 20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build Angular') {
            steps {
                sh 'npx ng build --configuration=production'
            }
        }

        stage('Archive Dist') {
            steps {
                archiveArtifacts artifacts: 'dist/campconnect-angular/browser/**', fingerprint: true
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh "echo ${DOCKER_TOKEN} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                    sh "docker logout"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline frontend réussi — image ${DOCKER_IMAGE}:${BUILD_NUMBER} publiée sur Docker Hub"
        }
        failure {
            echo "Pipeline frontend échoué — vérifier les logs ci-dessus"
        }
        always {
            cleanWs()
        }
    }
}
