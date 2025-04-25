async function loadVideo() {
    try {
        const response = await fetch('/api/get-token');
        const data = await response.json();
        const apiUrl = `/api/video?token=${data.token}`;
        video.src = apiUrl;
        video.load();
    } catch (error) {
        console.error('Error loading video:', error);
        errorMessage.style.display = 'block';
    }
}
