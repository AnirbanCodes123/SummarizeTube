from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl, Field
from typing import Dict, List, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from langchain_community.llms import Ollama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
import requests
import uvicorn
from datetime import datetime
import json
import re


# Pydantic models
class Summary(BaseModel):
    title: str
    key_points: List[str]
    conclusion: str


class SummaryResponse(BaseModel):
    success: bool
    video_title: Optional[str] = None
    summary: Optional[Summary] = None
    error: Optional[str] = None


class YouTubeURL(BaseModel):
    url: HttpUrl


# Initialize FastAPI app
app = FastAPI(
    title="YouTube Video Summarizer API",
    description="API for generating point-wise summaries with conclusions from YouTube videos",
    version="1.0.0"
)


def get_video_id(url: str) -> str:
    """Extract the video ID from a YouTube URL."""
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        if parsed_url.path[:7] == '/embed/':
            return parsed_url.path.split('/')[2]
        if parsed_url.path[:3] == '/v/':
            return parsed_url.path.split('/')[2]
    return None


def get_video_info(url: str) -> Dict:
    """Get video ID and title from YouTube URL."""
    video_id = get_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")
    
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url)
        response.raise_for_status()
        video_data = response.json()
        return {
            "id": video_id,
            "title": video_data['title']
        }
    except Exception as e:
        raise Exception(f"Failed to fetch video info: {str(e)}")


def get_transcript(video_id: str) -> str:
    """Fetch the transcript of a YouTube video using the new API."""
    try:
        # Use the new API - create an instance and call fetch method
        ytt_api = YouTubeTranscriptApi()
        fetched_transcript = ytt_api.fetch(video_id)
        
        # Convert to raw data format (list of dictionaries)
        transcript_data = fetched_transcript.to_raw_data()
        
        # Extract text from transcript
        transcript_text = ' '.join([entry['text'] for entry in transcript_data])
        return transcript_text
    except Exception as e:
        raise Exception(f"Failed to fetch transcript: {str(e)}")


def parse_summary_response(response_text: str) -> tuple[List[str], str]:
    """Parse the summary text into key points and conclusion."""
    # Split into points and conclusion sections
    sections = response_text.split("Conclusion:", maxsplit=1)
    
    if len(sections) != 2:
        raise ValueError("Invalid summary format: Missing conclusion section")
    
    points_text, conclusion_text = sections
    
    # Parse key points
    points = [
        point.strip().lstrip('- ') 
        for point in points_text.strip().split('\n') 
        if point.strip() and not point.startswith('Key Points:')
    ]
    
    # Clean up conclusion
    conclusion = conclusion_text.strip()
    
    return points, conclusion


def create_summary_chain(model_name: str, transcript: str):
    """Creates a summary chain using the YouTube transcript."""
    llm = Ollama(model=model_name)
    
    prompt_template = """You are a professional content summarizer. Based on the following transcript from a YouTube video, 
    create a comprehensive point-wise summary of the main topics and key takeaways, followed by a brief conclusion.
    
    Transcript:
    {transcript}
    
    Requirements for the summary:
    - Extract 8-10 main points from the content
    - Each point should be clear and concise
    - Capture the essential information and key takeaways
    - Use professional language
    - Start each point with a bullet point (-)
    - Focus on the most important concepts and ideas
    
    After the points, provide a brief conclusion that:
    - Synthesizes the main themes
    - Highlights the overall significance
    - Connects the key ideas together
    
    Format your response exactly like this:
    - First key point
    - Second key point
    [continue with remaining points]


    Conclusion:
    [4-5 sentences summarizing the overall message and significance]"""
    
    prompt = PromptTemplate.from_template(prompt_template)
    
    summary_chain = (
        prompt
        | llm
        | StrOutputParser()
    )
    
    return summary_chain


async def generate_summary(url: str, model_name: str = "llama3.2:3b") -> Dict:
    """Generate summary from YouTube video."""
    try:
        # Get video information
        video_info = get_video_info(str(url))
        
        # Get transcript using the new API
        transcript = get_transcript(video_info['id'])
        
        # Create and execute chain
        summary_chain = create_summary_chain(model_name, transcript)
        summary_text = summary_chain.invoke({"transcript": transcript})
        
        # Parse the summary text into structured format
        key_points, conclusion = parse_summary_response(summary_text)
        
        summary = Summary(
            title=video_info['title'],
            key_points=key_points,
            conclusion=conclusion
        )
        
        return {
            "success": True,
            "video_title": video_info['title'],
            "summary": summary,
            "error": None
        }
    
    except Exception as e:
        return {
            "success": False,
            "video_title": None,
            "summary": None,
            "error": str(e)
        }


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "YouTube Video Summarizer API",
        "model": "Llama3.1:8b",
        "version": "1.1",
        "description": "Generate point-wise summaries with conclusions from YouTube videos",
        "developer": "Your Organization Name"
    }


@app.post("/generate-summary", response_model=SummaryResponse)
async def create_summary(video: YouTubeURL):
    """Generate a summary from a YouTube video URL"""
    result = await generate_summary(video.url)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
