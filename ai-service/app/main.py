from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="YouTube Shorts AI Service",
    description="FastAPI service for AI-powered YouTube Shorts script generation",
    version="1.0.0"
)

# Pydantic models
class ScriptRequest(BaseModel):
    topic: str
    style: str = "entertainment"
    max_length: int = 60
    tone: str = "casual"

class ScriptResponse(BaseModel):
    script: str
    tokens_used: int
    model: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

# Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return HealthResponse(
        status="ok",
        service="youtube-shorts-ai",
        version="1.0.0"
    )

@app.post("/generate-script", response_model=ScriptResponse)
async def generate_script(request: ScriptRequest):
    """Generate AI script for YouTube Shorts"""
    logger.info(f"Script generation requested for topic: {request.topic}")
    
    try:
        # Validate input
        if not request.topic or len(request.topic) < 3:
            raise HTTPException(status_code=400, detail="Topic must be at least 3 characters")
        
        if request.max_length < 30 or request.max_length > 120:
            raise HTTPException(status_code=400, detail="Max length must be between 30-120 seconds")
        
        # Simulate script generation (in production, integrate with OpenAI)
        mock_script = f"""
        Title: {request.topic}
        
        [0-5s] Hook
        Did you know? {request.topic} can change your life!
        
        [5-35s] Main Content
        Here's what you need to know about {request.topic}:
        1. It's incredibly important
        2. Everyone should try it
        3. You'll see results immediately
        
        [35-60s] Call to Action
        Try this today and let us know your results in the comments!
        """
        
        logger.info(f"Script generated successfully for topic: {request.topic}")
        
        return ScriptResponse(
            script=mock_script.strip(),
            tokens_used=150,
            model="gpt-4"
        )
    
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error generating script: {str(error)}")
        raise HTTPException(status_code=500, detail="Failed to generate script")

@app.post("/validate-script")
async def validate_script(request: dict):
    """Validate a script for length and content"""
    logger.info("Script validation requested")
    
    try:
        script = request.get('script', '')
        if not script:
            raise HTTPException(status_code=400, detail="Script content required")
        
        # Basic validation
        word_count = len(script.split())
        
        return JSONResponse({
            "valid": word_count > 10,
            "word_count": word_count,
            "estimated_duration": word_count // 2.5,  # Rough estimate
            "warnings": []
        })
    
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Validation error: {str(error)}")
        raise HTTPException(status_code=500, detail="Validation failed")

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv('PORT', 8000)),
        reload=os.getenv('ENVIRONMENT') == 'development'
    )
