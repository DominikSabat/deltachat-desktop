pipeline {
	agent any
	tools {nodejs "node"}

	stages {
		stage('Build') { 
			steps {
				echo 'Build'
				checkout scm
				sh 'npm install'
				sh 'npm run build'
			}
		}
		stage('Test') { 
			steps {
				echo 'Test'
				sh 'npm run test'
			}
		}
		stage('Deploy') {
			steps {
				echo 'Deploy'
				sh 'docker build -t deltachat-deploy -f Dockerfile-deploy .'
			}
			post {
				success {
				    echo 'Success'
				    emailext attachLog: true,
					body: "Deploy Success",
					to: 'domin008.5ds@gmail.com',
					subject: "Successful deploy"
				}
				failure {
				    echo 'Fail'
				    emailext attachLog: true,
				    	body: "Deploy Fail",
				       	to: 'domin008.5ds@gmail.com',
					subject: "Failed deploy"
			     	}
		    	}
		}
	}
	post {
		always {
			echo 'Finished'
		}
		success {
			echo 'Success'
			emailext attachLog: true, 
			body: "Success",
			subject: "Pipeline Test Passed",
			to: 'domin008.5ds@gmail.com'
		}
		failure {
			echo 'Failure'
			emailext attachLog: true, 
			body: "Error:  ${env.BUILD_URL}",
			subject: "Pipeline Test Failed",
			to: 'domin008.5ds@gmail.com'
		}
	}
}
