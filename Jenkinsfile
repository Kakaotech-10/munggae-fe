pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_DEFAULT_REGION = credentials('aws-region')
        S3_BUCKET = credentials('aws-s3-bucket')
        CLOUDFRONT_DISTRIBUTION_ID = credentials('cloudfront-distribution-id')
        APP_ENDPOINT_MAIN = credentials('app-endpoint-main') //env 파일 설정
    }

    stages {
        stage('Install Dependencies') {
            steps {
                dir('frontend') {
                    script {
                        sh 'npm ci'
                    }
                }
            }
        }
        stage('Set Environment Variable') {
            steps {
                dir('frontend') {
                    script {
                        sh 'echo "APP_ENDPOINT=${APP_ENDPOINT_MAIN}" >> .env'
                    }
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh 'CI=false npm run build'
                    }
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    sh "aws s3 sync build/ s3://${S3_BUCKET} --delete"
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
}
