.PHONY: build up down restart logs test migrate seed install frontend

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f

test:
	python manage.py test

migrate:
	python manage.py migrate

seed:
	python manage.py seed_demo

install:
	pip install -r requirements.txt

frontend:
	cd frontend && npm install && npm run dev
