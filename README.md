# SummarizeTube

SummarizeTube is a modern web application that generates concise, structured summaries for YouTube videos. Simply paste a YouTube link to preview the video and receive a professional, AI-generated summary of its key points and conclusion.

## Features

- **YouTube Preview**: Instantly displays a video thumbnail preview and lets you play the video directly from the application with an interactive overlay.
- **Point-wise Summaries**: Provides clear, organized summaries, highlighting each major topic covered in the video.
- **AI-Powered**: Uses advanced models to generate accurate and comprehensive summaries from actual video transcripts.
- **Copy to Clipboard**: Easily copy summaries for sharing or note-taking.
- **Professional UI**: Clean, responsive, and user-friendly design for both desktop and mobile platforms.
- **Two-tier Architecture**: Flask frontend for UI/interaction, FastAPI backend for transcript extraction and summary generation.

## How It Works

1. **Enter a YouTube link**  
   Paste any valid YouTube video link into the input field.

2. **Preview & Play**  
   Instantly view a video preview; play the video in a modal window for reference.

3. **Generate Summary**  
   Click "Summarize". The app fetches the transcript, runs AI-powered summarization, and displays the key points and conclusion.

4. **Copy & Share**  
   Use the 'Copy Summary' button to add the summary to your clipboard.

## Installation

### Prerequisites

- Python 3.8+
- Node.js (if you wish to use a package manager for frontend tooling, optional)

### Backend (FastAPI & Summarizer)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/SummarizeTube.git
   cd SummarizeTube/backend
   ```
2. Install requirements:
   ```
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```
   uvicorn app:app --reload --host 0.0.0.0 --port 8080
   ```

### Frontend (Flask)

1. Open a new terminal.
2. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```
3. Install requirements:
   ```
   pip install -r requirements.txt
   ```
4. Start the Flask frontend:
   ```
   python app.py
   ```
5. Visit `http://localhost:5000` in your browser.

## Project Structure

```
SummarizeTube/
├── backend/           # FastAPI summarization service
│   ├── api.py
│   └── requirements.txt
├── frontend/          # Flask, HTML/CSS/JS, templates and static files
│   ├── app.py
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── style.css
│       └── main.js
└── README.md
```

## Configuration

- The Flask frontend communicates with the FastAPI backend at `http://localhost:8080` by default. Adjust the `API_URL` setting in your frontend's `app.py` if your backend runs elsewhere.
- No API keys are needed for public YouTube videos with available transcripts.
- The app can be easily deployed to services like Heroku, Render, or your custom VPS.

## License

This project is released under the MIT License.

## Contributing

Pull requests and suggestions are welcome. Please open an issue to discuss your ideas or bug reports before submitting PRs.

***

SummarizeTube helps you efficiently understand YouTube videos by providing fast, actionable summaries in a modern interface.
