FROM python:3.11-slim

WORKDIR /app

# Installeer systeem-afhankelijkheden voor de database connectie
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Kopieer requirements en installeer python libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopieer de rest van de code
COPY . .

# Start de FastAPI applicatie
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]