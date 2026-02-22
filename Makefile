# ===== configurable variables =====
VITE_API_BASE_URL ?= http://localhost:8000
IMAGE_NAME      ?= izr-screen
IMAGE_TAG       ?= local

# ===== targets =====
.PHONY: build docker clean

build:
	@echo "▶ Building React app with VITE_API_BASE_URL=$(VITE_API_BASE_URL)"
	rm -rf dist deploy
	VITE_API_BASE_URL=$(VITE_API_BASE_URL) npm run build
	mkdir -p deploy
	cp -r dist/* deploy/
	cp -r docker/* deploy/

docker: build
	@echo "▶ Building Docker image $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) ./deploy

clean:
	rm -rf dist deploy