pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_DEFAULT_REGION = credentials('aws-region')
        S3_BUCKET = credentials('aws-s3-bucket')
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = credentials('docker-image')
        CLOUDFRONT_DISTRIBUTION_ID = credentials('cloudfront-distribution-id')
    }

    stages {
        stage('Build') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    sh '''
                    docker run --rm -v $(pwd):/app $DOCKER_IMAGE sh -c "aws s3 sync /app/dist s3://$S3_BUCKET/ --delete"
                    '''
                }
            }
        }
    }
}
