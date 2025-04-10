# main.py
from fastapi import FastAPI
from routers import advocates, clients, cases, documents, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Legal Document Management System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(advocates.router, prefix="/advocates", tags=["Advocates"])
app.include_router(clients.router, prefix="/clients", tags=["Clients"])
app.include_router(cases.router, prefix="/cases", tags=["Cases"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)