pipeline {
    agent {
        docker { image 'node:latest' }
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building.......'
		checkout scm
		sh 'npm install'
		sh 'npm run build'
            }
	      post {
        failure {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Build failed in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
        success {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Successful build in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
    }
        }
        stage('Test') {
	   when {
              	expression {currentBuild.result == null || currentBuild.result == 'SUCCESS'}
            }
            steps {
                echo 'Testing..........'
		sh 'npm test'
            }
	     post {
        failure {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Test failed in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
        success {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Successful test in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
    }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying......'
		sh 'docker build -t delta-chat -f Dockerfile-deploy .'
            }
	  post {
        failure {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Deploy failed in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
        success {
            emailext attachLog: true,
                body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                recipientProviders: [developers(), requestor()],
                to: 'domin008.5ds@gmail.com',
                subject: "Successful deploy in Jenkins ${currentBuild.currentResult}: Job ${env.JOB_NAME}"
        }
       }
      }
    }
}
