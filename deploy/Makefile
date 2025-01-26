all:
	docker build -t test_izr_screen .
	docker rm -f izr_screen || true
	docker run -d -p 80:80 --name izr_screen test_izr_screen

