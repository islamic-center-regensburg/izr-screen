# ===== configurable variables =====
VITE_IZR_SERVER ?= http://localhost:8000
IMAGE_NAME      ?= izr-screen
IMAGE_TAG       ?= local-2

# ===== targets =====
.PHONY: build docker clean

build:
	@echo "▶ Building React app with VITE_IZR_SERVER=$(VITE_IZR_SERVER)"
	rm -rf dist deploy
	VITE_IZR_SERVER=$(VITE_IZR_SERVER) npm run build
	mkdir -p deploy
	cp -r dist/* deploy/
	cp -r .nginx/* deploy/

docker: build
	@echo "▶ Building Docker image $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) ./deploy

clean:
	rm -rf dist deploy
