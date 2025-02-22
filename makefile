include .env

# Variables for deployment
PROJECT_ID ?= notion-neat-dev
IMAGE_NAME ?= notion-data-neat-image
REGION ?= us-central1
SERVICE_NAME ?= notion-data-neat


.PHONY: deploy gcp-enable-services build-push deploy-service

# Main deploy target that runs all necessary steps
deploy: build-push deploy-service

# Enable required Google Cloud services
gcp-enable-services:
	@echo "Enabling required services for $(PROJECT_ID)..."
	gcloud config set project $(PROJECT_ID)
	gcloud services enable run.googleapis.com
	gcloud services enable cloudbuild.googleapis.com
	gcloud services enable artifactregistry.googleapis.com

# Build the Docker image and push to Google Container Registry Note gcr.io is the default artifact registry for docker now. can be expensive. better creaet a local one.
build-push:
	@echo " -> Building gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) image and pushing to Google Container Registry..."
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) .

# Deploy to Cloud Run, use .env variables except GOOGLE_APPLICATION_CREDENTIALS
deploy-service:
	@echo "Deploying to Cloud Run..."
	@ENV_VARS=$$(node scripts/env_parser.js); \
	echo "Environment Variables to be deployed:"; \
	echo "$${ENV_VARS}" | tr ',' '\n'; \
	gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--set-env-vars "$${ENV_VARS}"
	@echo "Deployment complete! You can check the status using:"
	@echo "gcloud run services describe $(SERVICE_NAME) --region $(REGION)"

publish-notion:
	npm run publish:notion


update-dc:
	npm run update:dc

update-all:
	ncu -u

start:
	npm run start:dev