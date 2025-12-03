# Dockerfile para TopiBot STT con Python 3.11
FROM python:3.11-slim-bookworm

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    portaudio19-dev \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements-stt.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements-stt.txt

# Copiar servidor y modelo
COPY stt_server.py .
COPY model ./model

# Puerto para el servidor Flask
EXPOSE 5005

# Comando por defecto
CMD ["python3", "stt_server.py"]
