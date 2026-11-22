# ===== configurable variables =====
IMAGE_NAME      ?= izr-screen
IMAGE_TAG       ?= local

# ===== targets =====
.PHONY: build docker clean

build:
	npm run build

docker:
	@echo "▶ Building Docker image $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

clean:
	rm -rf dist