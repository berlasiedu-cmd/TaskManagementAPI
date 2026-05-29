pipeline {
    agent any
    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        STAGING_PORT = "3000"
        PROD_PORT = "3001"
    }
    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/berlasiedu-cmd/TaskManagementAPI.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Stage 1: Build'
                sh 'npm install'
                sh 'docker build -t todo-api:latest .'
            }
        }

        stage('Test') {
            steps {
                echo 'Stage 2: Test'
                sh 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Stage 3: Code Quality Analysis'
                sh '''
                    curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-macosx-x64.zip
                    unzip -o sonar-scanner.zip
                    ./sonar-scanner-6.2.1.4610-macosx-x64/bin/sonar-scanner \
                        -Dsonar.projectKey=YOUR_ACTUAL_PROJECT_KEY \
                        -Dsonar.organization=berlasiedu-cmd \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Security') {
            steps {
                echo 'Stage 4: Security Scan'
                sh 'npm audit || true'
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo 'Stage 5: Deploy to Staging'
                sh '''
                    docker stop todo-api-staging || true
                    docker rm todo-api-staging || true
                    docker run -d --name todo-api-staging -p ${STAGING_PORT}:3000 todo-api:latest
                    echo "App deployed to staging on port ${STAGING_PORT}"
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Stage 6: Release to Production'
                sh '''
                    docker stop todo-api-prod || true
                    docker rm todo-api-prod || true
                    docker run -d --name todo-api-prod -p ${PROD_PORT}:3000 todo-api:latest
                    echo "App released to production on port ${PROD_PORT}"
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Stage 7: Monitoring and Alerting'
                sh '''
                    sleep 3
                    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PROD_PORT}/health)
                    if [ "$RESPONSE" = "200" ]; then
                        echo "Health check PASSED - Application is UP"
                        curl -s http://localhost:${PROD_PORT}/health
                    else
                        echo "Health check FAILED - Response code: ${RESPONSE}"
                        exit 1
                    fi
                '''
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully - All stages passed!'
        }
        failure {
            echo 'Pipeline failed - Check logs above for details.'
        }
    }
}
