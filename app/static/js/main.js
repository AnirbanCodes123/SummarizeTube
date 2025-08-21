class YouTubeSummarizer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.player = null;
        this.currentVideoData = null;
        this.loadingSteps = [];
        this.currentStep = 0;
    }

    initializeElements() {
        // Input elements
        this.youtubeInput = document.getElementById('youtube-url');
        this.clearBtn = document.getElementById('clear-btn');
        this.summarizeBtn = document.getElementById('summarize-btn');
        this.errorMessage = document.getElementById('error-message');

        // Video preview elements
        this.videoPreviewSection = document.getElementById('video-preview-section');
        this.videoThumbnail = document.getElementById('video-thumbnail');
        this.previewTitle = document.getElementById('preview-title');
        this.channelName = document.getElementById('channel-name');
        this.viewCount = document.getElementById('view-count');
        this.uploadDate = document.getElementById('upload-date');
        this.videoDuration = document.getElementById('video-duration');
        this.playOverlay = document.getElementById('play-overlay');
        this.youtubePlayerContainer = document.getElementById('youtube-player-container');
        this.closePlayerBtn = document.getElementById('close-player-btn');

        // Loading elements
        this.loadingContainer = document.getElementById('loading-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');

        // Results elements
        this.resultsContainer = document.getElementById('results-container');
        this.summaryVideoTitle = document.getElementById('summary-video-title');
        this.summaryThumbnail = document.getElementById('summary-thumbnail');
        this.summaryChannel = document.getElementById('summary-channel');
        this.summaryDuration = document.getElementById('summary-duration');
        this.keyPoints = document.getElementById('key-points');
        this.keyPointsCount = document.getElementById('key-points-count');
        this.conclusion = document.getElementById('conclusion');
        this.topicTags = document.getElementById('topic-tags');

        // Action buttons
        this.copyBtn = document.getElementById('copy-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.downloadBtn = document.getElementById('download-btn');

        // Toast
        this.toast = document.getElementById('toast');
        this.toastIcon = this.toast.querySelector('.toast-icon');
        this.toastMessage = this.toast.querySelector('.toast-message');

        // Loading steps
        this.loadingSteps = document.querySelectorAll('.step');
    }

    bindEvents() {
        this.youtubeInput.addEventListener('input', this.handleInputChange.bind(this));
        this.youtubeInput.addEventListener('keypress', this.handleKeyPress.bind(this));
        this.clearBtn.addEventListener('click', this.clearInput.bind(this));
        this.summarizeBtn.addEventListener('click', this.handleSummarize.bind(this));
        
        this.playOverlay.addEventListener('click', this.playVideo.bind(this));
        this.closePlayerBtn.addEventListener('click', this.closePlayer.bind(this));
        
        this.copyBtn.addEventListener('click', this.copySummary.bind(this));
        this.shareBtn.addEventListener('click', this.shareSummary.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadSummary.bind(this));

        // Listen for YouTube API ready
        window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
    }

    handleInputChange() {
        const url = this.youtubeInput.value.trim();
        if (url && this.isValidYouTubeUrl(url)) {
            this.fetchVideoPreview(url);
        } else if (!url) {
            this.hideVideoPreview();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSummarize();
        }
    }

    clearInput() {
        this.youtubeInput.value = '';
        this.hideVideoPreview();
        this.hideError();
    }

    isValidYouTubeUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    async fetchVideoPreview(url) {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) return;

            // In a real implementation, you would fetch from YouTube API
            // For now, we'll simulate with the thumbnail and basic info
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            
            this.videoThumbnail.src = thumbnailUrl;
            this.videoThumbnail.dataset.videoId = videoId;
            
            // Show preview section
            this.videoPreviewSection.style.display = 'block';
            this.videoPreviewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // You would typically fetch video metadata here
            this.previewTitle.textContent = 'Video Title (Preview)';
            this.channelName.textContent = 'Channel Name';
            this.viewCount.textContent = '1M views';
            this.uploadDate.textContent = '1 day ago';
            this.videoDuration.textContent = '10:30';

        } catch (error) {
            console.error('Error fetching video preview:', error);
        }
    }

    hideVideoPreview() {
        this.videoPreviewSection.style.display = 'none';
        if (this.player) {
            this.closePlayer();
        }
    }

    onYouTubeIframeAPIReady() {
        // YouTube API is ready
    }

    playVideo() {
        const videoId = this.videoThumbnail.dataset.videoId;
        if (!videoId) return;

        this.youtubePlayerContainer.style.display = 'block';
        
        if (!this.player) {
            this.player = new YT.Player('youtube-player', {
                height: '400',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0
                }
            });
        } else {
            this.player.loadVideoById(videoId);
        }

        this.youtubePlayerContainer.scrollIntoView({ behavior: 'smooth' });
    }

    closePlayer() {
        if (this.player) {
            this.player.stopVideo();
        }
        this.youtubePlayerContainer.style.display = 'none';
    }

    async handleSummarize() {
        const url = this.youtubeInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a YouTube URL');
            return;
        }

        if (!this.isValidYouTubeUrl(url)) {
            this.showError('Please enter a valid YouTube URL');
            return;
        }

        try {
            this.startLoading();
            
            const response = await fetch('/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            this.displayResults(data);
            this.stopLoading();
            this.showToast('Summary generated successfully!', 'success');
            
        } catch (error) {
            this.stopLoading();
            this.showError(error.message || 'Failed to generate summary');
            this.showToast('Failed to generate summary', 'error');
        }
    }

    startLoading() {
        this.loadingContainer.style.display = 'block';
        this.resultsContainer.style.display = 'none';
        this.hideError();
        
        this.currentStep = 0;
        this.animateLoadingSteps();
        this.animateProgress();
        
        this.loadingContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    stopLoading() {
        this.loadingContainer.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    animateLoadingSteps() {
        this.loadingSteps.forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });

        if (this.currentStep < this.loadingSteps.length - 1) {
            setTimeout(() => {
                this.currentStep++;
                this.animateLoadingSteps();
            }, 2000);
        }
    }

    animateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `${Math.round(progress)}%`;
        }, 300);
    }

    displayResults(data) {
        // Set video info
        this.summaryVideoTitle.textContent = data.video_title || 'Video Title';
        this.summaryChannel.textContent = data.channel || 'Channel Name';
        this.summaryDuration.textContent = data.duration || '10:30';
        
        // Set thumbnail
        if (this.videoThumbnail.src) {
            this.summaryThumbnail.src = this.videoThumbnail.src;
        }

        // Display key points
        if (data.summary && data.summary.key_points) {
            const keyPointsHtml = data.summary.key_points
                .map(point => `<li>${point}</li>`)
                .join('');
            this.keyPoints.innerHTML = keyPointsHtml;
            this.keyPointsCount.textContent = `${data.summary.key_points.length} points`;
        }

        // Display conclusion
        if (data.summary && data.summary.conclusion) {
            this.conclusion.textContent = data.summary.conclusion;
        }

        // Generate and display topic tags
        this.generateTopicTags(data);

        // Store current data for sharing/copying
        this.currentVideoData = data;
    }

    generateTopicTags(data) {
        // Generate topic tags based on summary content
        const topics = [
            'Education', 'Technology', 'Tutorial', 'Review', 'Analysis'
        ];
        
        const tagsHtml = topics.map(topic => 
            `<span class="topic-tag">${topic}</span>`
        ).join('');
        
        this.topicTags.innerHTML = tagsHtml;
    }

    async copySummary() {
        if (!this.currentVideoData) return;

        const summaryText = this.formatSummaryText();
        
        try {
            await navigator.clipboard.writeText(summaryText);
            this.showButtonSuccess(this.copyBtn, 'Copied!');
            this.showToast('Summary copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy summary', 'error');
        }
    }

    shareSummary() {
        if (!this.currentVideoData) return;

        const summaryText = this.formatSummaryText();
        
        if (navigator.share) {
            navigator.share({
                title: this.currentVideoData.video_title,
                text: summaryText,
                url: this.youtubeInput.value
            });
        } else {
            // Fallback: copy to clipboard
            this.copySummary();
        }
    }

    downloadSummary() {
        if (!this.currentVideoData) return;

        const summaryText = this.formatSummaryText();
        const blob = new Blob([summaryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-summary-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showButtonSuccess(this.downloadBtn, 'Downloaded!');
        this.showToast('Summary downloaded successfully!', 'success');
    }

    formatSummaryText() {
        const keyPointsList = Array.from(this.keyPoints.children)
            .map(li => `• ${li.textContent}`)
            .join('\n');

        return `
YouTube Video Summary
====================

Video: ${this.summaryVideoTitle.textContent}
Channel: ${this.summaryChannel.textContent}
Duration: ${this.summaryDuration.textContent}
URL: ${this.youtubeInput.value}

Key Points:
${keyPointsList}

Summary & Insights:
${this.conclusion.textContent}

Generated by SummarizeTube
        `.trim();
    }

    showButtonSuccess(button, text) {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showToast(message, type = 'info') {
        // Set toast content
        this.toastMessage.textContent = message;
        
        // Set toast type and icon
        this.toast.className = `toast ${type}`;
        
        switch (type) {
            case 'success':
                this.toastIcon.className = 'toast-icon fas fa-check-circle';
                break;
            case 'error':
                this.toastIcon.className = 'toast-icon fas fa-exclamation-circle';
                break;
            case 'info':
            default:
                this.toastIcon.className = 'toast-icon fas fa-info-circle';
                break;
        }
        
        // Show toast
        this.toast.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeSummarizer();
});

// Handle page visibility change to pause video
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.youtubePlayer) {
        window.youtubePlayer.pauseVideo();
    }
});

// Add some smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.input-card, .video-preview-card, .summary-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});