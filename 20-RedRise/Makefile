.PHONY: up down build logs ingest health shell clean create-model

up:
	docker compose up --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ingest:
	docker compose run --rm redrise-api python ingest_knowledge.py

health:
	curl -f http://localhost:8000/health

shell:
	docker compose run --rm redrise-api /bin/sh

clean:
	docker compose down -v

# --- Automation target for Ollama model creation ---
create-model:
	@echo "🚀 Starting Ollama container..."
	docker compose up -d ollama
	@echo "⏳ Waiting for Ollama to be ready..."
	until docker compose exec -T ollama ollama list >/dev/null 2>&1; do sleep 2; done
	@echo "📄 Copying Modelfile into container..."
	docker compose cp Modelfile redrise-ollama:/app/Modelfile
	@echo "🔧 Creating model (this will download ~4.7GB, please be patient)..."
	docker compose exec -T ollama /bin/sh -c "ollama create deepseek-med-8b:q4_K_M -f /app/Modelfile"
	@echo "✅ Model creation complete. Listing available models:"
	docker compose exec -T ollama ollama list
	@echo "🎉 You can now start the full stack with: make up"
