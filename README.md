# Cloud Website
<h2 align="center">
www.GregChow.net
</h2>
  <p align="center">
  <img src="./website/CloudDiagram.svg" alt="Diagram of Cloud Infrastructure" width="738">
</p>
<h3 align="center">Website hosted on AWS, managed by Terraform.
</h3>
<p>Originally created for the cloud resume challenge, this repo hosts files needed to launch and host the relevant files in AWS.
It uses Terraform to automatically create, provision, and destroy the necessary services. It utilizes Lambda Functions and DynamoDB to display the visitor count and time since last visit. Has python tests using moto to Mock dynamoDB tables and other AWS resources. Automatically updates S3 bucket items and invalidates CloudFront Cache using Github actions.</p>

## Terraform Automation
Terraform code automates creating and destroying AWS infrastructure for streamlined configuration.
Uses [Environmental Variables](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#environment-variables) to securely store credentials.
Code is organized into several separate files based on infrastructure type: [S3 buckets](https://github.com/teddiursa/terraform_website/blob/main/buckets.tf), [CloudFront Distributions](https://github.com/teddiursa/terraform_website/blob/main/cdn.tf), [DynamoDB](https://github.com/teddiursa/terraform_website/blob/main/dynamoDB.tf), [Route 53 Certificates](https://github.com/teddiursa/terraform_website/blob/main/certs.tf), [IAM Roles](https://github.com/teddiursa/terraform_website/blob/main/iam.tf), [Lambda Functions](https://github.com/teddiursa/terraform_website/blob/main/lambda.tf), and [Route 53 DNS Records](https://github.com/teddiursa/terraform_website/blob/main/records.tf).

Terraform automatically upload/update files on `terraform apply`, ensuring cloud infrastructure stays up to date.

## Website Files
The Website files are stored under the [website](/website) and [errors](/errors) folders.

Which include the ***Home*** website files and the ***404*** error page files respectively.

Main website files are: [html](/website/home.html), [css](/website/home.css), and [Javascript](/website/home.js) files

## Lambda  Functions
The Lambda Python functions are stored under the [src/lambdaFunctions](/src/lambdaFunctions) folder.

Uses DynamoDB to store values and are referenced using AWS's API Gateway.
API Gateway Invoke URLs are store as a json file in an S3 bucket, allowing javascript to invoke the correct URL between different Terraform deployments.

## Python Unit Tests
Their respective tests are stored under the [tests](/tests) folder.

Uses [Moto](https://docs.getmoto.org/en/latest/) to mock AWS services and [python-lamdba-local](https://pypi.org/project/python-lambda-local/) to locally run lambda functions for testing.
Uses [pytest](https://docs.pytest.org/en/7.4.x/) to help scale testing and uses dummy information set in [conftest.py](https://github.com/teddiursa/terraform_website/blob/main/tests/conftest.py)

## Github Actions
Github actions workflows are stored in the [.gitHub/workflows](/.github/workflows) directory.

Automates [Python tests](/.github/workflows/python-app.yml) and [S3 Bucket changes](/.github/workflows/workflow.yml) on `git push`, ensuring deployed website files stay current and non-functional python functions get flagged.

Also automates invalidating CloudFront's Cache, using a LambdaFunction via an API Gateway URL, also stored in an S3 bucket.

## Caching and Compression
Includes a 1 day Cache header to prevent repeat calls for duplicate resources on website files. Also compresses text-based files and SVG using gzip while image files are either small or use a [.webp](https://web.dev/articles/serve-images-webp) file format. Main [map.webp](./website/map.webp) image has a **preload** tag while others have a **prefetch** tag, since they are on a separate page. Includes Google Font's [Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans) inline to decrease loading times.
