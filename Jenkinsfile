pipeline {
    agent {
        label 'node'
    }

    environment {
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_DEFAULT_REGION = credentials('aws-region')
        S3_BUCKET = credentials('aws-s3-bucket')
        CLOUDFRONT_DISTRIBUTION_ID = credentials('cloudfront-distribution-id')
        APP_ENDPOINT_MAIN = credentials('app-endpoint-main') //env 파일 설정
        VITE_REACT_APP_REST_API_KEY = credentials('VITE_REACT_APP_REST_API_KEY')
        VITE_REACT_APP_REDIRECT_URL = credentials('VITE_REACT_APP_REDIRECT_URL')
        VITE_API_BASE_URL = credentials('VITE_API_BASE_URL')
        IMAGE_ACCESS_KEY_ID = credentials('image-access-key-id')
        IMAGE_SECRET_ACCESS_KEY = credentials('image-secret-access-key')
        
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                    sh 'npm install -D sass-embedded'
                }
            }
        }

        stage('Set Environment Variable') {
            steps {
                script {
                    sh 'echo "APP_ENDPOINT=${APP_ENDPOINT_MAIN}" >> .env'
                    sh 'echo "VITE_REACT_APP_REST_API_KEY=${VITE_REACT_APP_REST_API_KEY}" >> .env'
                    sh 'echo "VITE_REACT_APP_REDIRECT_URL=${VITE_REACT_APP_REDIRECT_URL}" >> .env'
                    sh 'echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" >> .env'
                    sh 'echo "VITE_REACT_APP_CLOUDFRONT_URL=${VITE_REACT_APP_CLOUDFRONT_URL}" >> .env'
                    sh 'echo "cloud.aws.credentials.accessKey=${IMAGE_ACCESS_KEY_ID}" >> .env'
                    sh 'echo "cloud.aws.credentials.secretKey=${IMAGE_SECRET_ACCESS_KEY}" >> .env'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }
        
        stage('List Build Directory') {
            steps {
                script {
                    sh 'ls -la' // 디렉토리 내용 출력
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    sh "aws s3 sync dist/ s3://${S3_BUCKET} --delete"
                }
            }
        }
        
         stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    sh "aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths '/*'"
                }
            }
        }
    }
    
    //jenkins 빌드 slack 알람
    post  {
        success {
            slackSend (
                channel: 'jenkins-알람',
                color: '#2C953C',
                message: "SUCCESSFUL: Job ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.BUILD_URL})"
            )
        }
        failure {
            slackSend (
                channel: 'jenkins-알람',
                color: '#FF3232',
                message: "FAIL: Job ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.BUILD_URL})"
            )
        }
    }
}
