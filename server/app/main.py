from fastapi import FastAPI

# De naam van deze variabele MOET 'app' zijn, 
# omdat de Docker-configuratie zoekt naar app.main:app
app = FastAPI(title="Concert Monitor API")

@app.get("/")
async def root():
    return {"message": "Concert Monitor API is up and running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}