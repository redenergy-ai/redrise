#!/bin/bash
set -e

echo "⏳ Waiting for Ollama server..."
until ollama list >/dev/null 2>&1; do
  sleep 2
done

if ollama list | grep -q "deepseek-med-8b:q4_K_M"; then
  echo "✅ Model deepseek-med-8b:q4_K_M already exists. Skipping creation."
  exit 0
fi

echo "📦 Model not found. Creating from Modelfile..."
# The Modelfile is mounted at /app/Modelfile (we'll copy it via Makefile)
ollama create deepseek-med-8b:q4_K_M -f /app/Modelfile

echo "✅ Model created successfully."
ollama list
