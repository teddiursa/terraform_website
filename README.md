# terraform_website
Website hosted on AWS, launched by terraform.

www.gregchow.net

Originally created for the cloud resume challenge, this repo hosts files needed to launch and host the relevant files in AWS.
It uses terraform to automatically create, provision, and destroy the necessary services. It utilizes some basic Lambda Functions and DynamoDB to display the visitor count and time since last visit. Has working python tests using moto to Mock dyanmoDB tables. Automatically updates S3 bucket items using Github actions.
