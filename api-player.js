document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const subtitlesContainer = document.getElementById('subtitles-container');
    const playPauseButton = document.getElementById('play-pause');
    const rewindButton = document.getElementById('rewind');
    const forwardButton = document.getElementById('forward');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const fullscreenButton = document.getElementById('fullscreen');
    const fullscreenExitButton = document.getElementById('fullscreen-exit');
    const pipToggleButton = document.getElementById('pip-toggle');
    const pipToggleFullscreenButton = document.getElementById('pip-toggle-fullscreen');
    const timeDisplay = document.getElementById('time');
    const timeDisplayFullscreen = document.getElementById('time-fullscreen');
    const volumeToggleButton = document.getElementById('volume-toggle');
    const volumeToggleFullscreenButton = document.getElementById('volume-toggle-fullscreen');
    const downloadButton = document.getElementById('download');
    const downloadFullscreenButton = document.getElementById('download-fullscreen');
    const subtitlesButton = document.getElementById('subtitles');
    const subtitlesFullscreenButton = document.getElementById('subtitles-fullscreen');
    const videoContainer = document.getElementById('video-container');
    const settingsButton = document.getElementById('settings');
    const settingsFullscreenButton = document.getElementById('settings-fullscreen');
    const settingsMenu = document.getElementById('settings-menu');
    const closeSettingsButton = document.getElementById('close-settings');
    const loadingSpinner = document.getElementById('loading-spinner');
    const centerControls = document.getElementById('center-controls');
    const errorMessage = document.getElementById('error-message');
    const tabButtons = document.querySelectorAll('.settings-header button');
    const tabs = document.querySelectorAll('.settings-tab');
    const preview = document.getElementById('preview');
    const previewTime = document.getElementById('preview-time');

    // Load the video using the token
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

    loadVideo(); // Call the function to load the video

    let subtitles = []; // Subtitles are OFF by default

    // Function to load subtitles
    function loadSubtitles(lang) {
        let subtitleURL = '';
        if (lang === 'english') {
            subtitleURL = '/subtitles/english.vtt';
        } else if (lang === 'spanish') {
            subtitleURL = '/subtitles/spanish.vtt';
        } else if (lang === 'french') {
            subtitleURL = '/subtitles/french.vtt';
        }

        fetch(subtitleURL)
            .then(response => response.text())
            .then(data => {
                subtitles = [];
                const lines = data.split('\n');
                let currentSubtitle = null;

                lines.forEach(line => {
                    if (line.trim() === '') return;
                    if (line.includes('-->')) {
                        if (currentSubtitle) subtitles.push(currentSubtitle);
                        currentSubtitle = { time: line, text: '' };
                    } else {
                        if (currentSubtitle) currentSubtitle.text += line + ' ';
                    }
                });
                if (currentSubtitle) subtitles.push(currentSubtitle);
            });
    }

    // Function to change subtitles
    function changeSubtitles(lang) {
        if (lang === 'off') {
            subtitlesContainer.textContent = '';
            subtitles = []; // Clear subtitles
        } else {
            loadSubtitles(lang);
        }
        settingsMenu.style.display = 'none'; // Close menu after selection
    }

    // Function to display subtitles
    function displaySubtitles() {
        const currentTime = video.currentTime;
        let currentSubtitleText = '';

        for (let subtitle of subtitles) {
            const [start, end] = subtitle.time.split(' --> ').map(time => {
                const [hours, minutes, seconds] = time.split(':');
                return parseFloat(hours) * 3600 + parseFloat(minutes) * 60 + parseFloat(seconds);
            });

            if (currentTime >= start && currentTime <= end) {
                currentSubtitleText = subtitle.text;
            }
        }

        // Use innerHTML instead of textContent to render HTML tags
        subtitlesContainer.innerHTML = currentSubtitleText;
    }

    video.addEventListener('timeupdate', displaySubtitles);

    // Toggle settings menu
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            if (settingsMenu.style.display === 'flex') {
                settingsMenu.style.display = 'none';
            } else {
                settingsMenu.style.display = 'flex';
                const activeTab = document.querySelector('.settings-header button.active');
                if (!activeTab) {
                    document.querySelector('.settings-header button[data-tab="quality-tab"]').click();
                }
            }
        });
    }

    if (settingsFullscreenButton) {
        settingsFullscreenButton.addEventListener('click', () => {
            if (settingsMenu.style.display === 'flex') {
                settingsMenu.style.display = 'none';
            } else {
                settingsMenu.style.display = 'flex';
                const activeTab = document.querySelector('.settings-header button.active');
                if (!activeTab) {
                    document.querySelector('.settings-header button[data-tab="quality-tab"]').click();
                }
            }
        });
    }

    if (subtitlesButton) {
        subtitlesButton.addEventListener('click', () => {
            settingsMenu.style.display = 'flex';
            document.querySelector('.settings-header button[data-tab="captions-tab"]').click();
        });
    }

    if (subtitlesFullscreenButton) {
        subtitlesFullscreenButton.addEventListener('click', () => {
            settingsMenu.style.display = 'flex';
            document.querySelector('.settings-header button[data-tab="captions-tab"]').click();
        });
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            settingsMenu.style.display = 'none';
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active-tab'));
            button.classList.add('active');
            document.getElementById(button.getAttribute('data-tab')).classList.add('active-tab');
        });
    });

    function handleOptionSelection(selector, type) {
        const options = document.querySelectorAll(selector);
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                console.log(`Selected ${type}:`, option.dataset[type]);

                if (type === 'speed') {
                    video.playbackRate = parseFloat(option.dataset.speed);
                } else if (type === 'caption') {
                    changeSubtitles(option.dataset.caption);
                    const subtitlesIcon = document.querySelector('#subtitles use');
                    const subtitlesFullscreenIcon = document.querySelector('#subtitles-fullscreen use');
                    if (option.dataset.caption === 'off') {
                        subtitlesIcon.setAttribute('xlink:href', '/icons-sprite.svg#captions-off');
                        subtitlesFullscreenIcon.setAttribute('xlink:href', '/icons-sprite.svg#captions-off');
                    } else {
                        subtitlesIcon.setAttribute('xlink:href', '/icons-sprite.svg#captions-on');
                        subtitlesFullscreenIcon.setAttribute('xlink:href', '/icons-sprite.svg#captions-on');
                    }
                }
            });
        });
    }

    handleOptionSelection('#quality-tab li', 'quality');
    handleOptionSelection('#captions-tab li', 'caption');
    handleOptionSelection('#speed-tab li', 'speed');

    // Array of preview image URLs
    const previewImages = [
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_001-8mJkdJK8PtAuDyGhXtQIHmBqcPQQ2U.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_002-uzfoIz6nvtKnaYLcKPFO2zkxPwTweX.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_003-iU2jbHJGNMGqtUuujWVTMN2GqepqV8.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_004-eOgZmtE4z3uLrDCd2Sk6atWxLuJZLb.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_005-coZc2ymrOJ7TwfVn6Id4gTEABb2hzI.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_006-dbwJKr2tRDZyucwsBpEkaAOb1XW2Qx.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_007-pn4iNYzzxFdKL5TBYhin0mtpQ8QuWD.png',
        'https://s37o60krxrtmmx77.public.blob.vercel-storage.com/spongebob/thumb_008-n2INvZKGJjlKU5T8ARwVSO5ovnrwTU.png'
    ];

    // Show preview on progress bar hover/move
    progressBar.addEventListener('mousemove', (event) => {
        updatePreview(event.clientX);
        showControls();
        hideCenterControls();
    });

    // Hide preview when not hovering over the progress bar
    progressBar.addEventListener('mouseleave', () => {
        preview.style.display = 'none';
        previewTime.style.display = 'none';
        hideControls();
        showCenterControls();
    });

    // Seek video when clicking on progress bar
    progressBar.addEventListener('click', (event) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (event.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
        preview.style.display = 'none';
        previewTime.style.display = 'none';
        showControls();
    });

    // Variables to track touch interaction
    let isTouching = false;
    let initialTouchX = 0;
    let initialTime = 0;
    let wasPlaying = false;

    // Handle touch start on progress bar
    progressBar.addEventListener('touchstart', (event) => {
        isTouching = true;
        initialTouchX = event.touches[0].clientX;
        initialTime = video.currentTime;
        wasPlaying = !video.paused;
        video.pause();
        updateVideoTime(event.touches[0].clientX);
        showControls();
        hideCenterControls();
        clearTimeout(controlsTimeout); // Prevent hiding controls
    });

    // Handle touch move on progress bar
    progressBar.addEventListener('touchmove', (event) => {
        if (isTouching) {
            updateVideoTime(event.touches[0].clientX);
            showControls();
            hideCenterControls();
        }
    });

    // Handle touch end on progress bar
    progressBar.addEventListener('touchend', (event) => {
        isTouching = false;
        const rect = progressBar.getBoundingClientRect();
        const pos = (event.changedTouches[0].clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
        preview.style.display = 'none';
        previewTime.style.display = 'none';
        if (wasPlaying) {
            video.play();
        }
        controlsTimeout = setTimeout(hideControls, 3000); // Hide controls after timeout
        showCenterControls();
    });

    // Function to update the video time based on touch/mouse position
    function updateVideoTime(clientX) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (clientX - rect.left) / rect.width;
        const newTime = pos * video.duration;

        // Update the progress bar width
        progress.style.width = `${pos * 100}%`;

        // Display and update the preview thumbnail
        updatePreviewThumbnail(newTime, clientX - rect.left);

        // Display and update the preview time
        updatePreviewTime(newTime, clientX - rect.left);
    }

    function updatePreviewThumbnail(time, clientX) {
        const previewIndex = Math.floor((time / video.duration) * previewImages.length);
        const previewImage = previewImages[previewIndex];

        // Display the preview thumbnail
        preview.style.backgroundImage = `url(${previewImage})`;
        preview.style.display = 'block';
        preview.style.left = `${clientX - preview.offsetWidth / 2}px`;
    }

    function updatePreviewTime(time, clientX) {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        const formattedTime = `${minutes}:${seconds}`;

        // Display the preview time
        previewTime.textContent = formattedTime;
        previewTime.style.display = 'block';
        previewTime.style.left = `${clientX - previewTime.offsetWidth / 2}px`;
    }

    // Function to hide the center controls
    function hideCenterControls() {
        centerControls.style.display = 'none';
    }

    // Function to show the center controls
    function showCenterControls() {
        if (!video.seeking && !video.waiting) {
            centerControls.style.display = 'flex';
        }
    }

    let controlsVisible = false;
    let controlsTimeout;
    let firstPlay = true;

    const lazyLoadPoster = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const videoElement = entry.target;
                const posterUrl = videoElement.getAttribute('data-poster');
                videoElement.setAttribute('poster', posterUrl);
                observer.unobserve(videoElement);
            }
        });
    };

    const observer = new IntersectionObserver(lazyLoadPoster, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    observer.observe(video);

    const showControls = () => {
        videoContainer.classList.add('show-controls');
        centerControls.style.opacity = 1;
        controlsVisible = true;
        updateDownloadLink();
        clearTimeout(controlsTimeout);
        if (!video.paused && !isTouching && !video.waiting) {
            controlsTimeout = setTimeout(hideControls, 3000);
        }
    };

    const hideControls = () => {
        if (video.paused || isTouching || video.seeking || video.waiting) return;
        videoContainer.classList.remove('show-controls');
        centerControls.style.opacity = 0;
        controlsVisible = false;
        updateDownloadLink();
    };

    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    // Prevent long-press context menu on touch devices
    document.addEventListener('touchstart', function(event) {
        event.preventDefault();
    });

    // Function to update the download link based on controls visibility
    const updateDownloadLink = () => {
        const downloadUrl = "https://streamtape.com/get_video?id=1O6YJGyDYwIeO2q&expires=1738379488&ip=GxAsDRMTKxSHDN&token=NAfysj8kfDL2&dl=1";
        if (controlsVisible) {
            downloadButton.href = downloadUrl;
            downloadFullscreenButton.href = downloadUrl;
        } else {
            downloadButton.removeAttribute('href');
            downloadFullscreenButton.removeAttribute('href');
        }
    };

    const detectDevTools = () => {
        const devtools = /./;
        devtools.toString = function () {
            debugger;
            return 'devtools';
        };
        console.log('%c', devtools);
    };

    setInterval(detectDevTools, 1000);

    videoContainer.addEventListener('click', (event) => {
        if (event.target.closest('.controls') || event.target.closest('.center-controls') || event.target.closest('.settings-menu')) {
            return;
        }
        if (controlsVisible) {
            hideControls();
        } else {
            showControls();
        }
    });

    if (video) {
        video.addEventListener('pause', () => {
            showControls();
            centerControls.style.opacity = 1;
            rewindButton.style.display = 'block';
            forwardButton.style.display = 'block';
        });

        video.addEventListener('play', () => {
            hideControls();
            rewindButton.style.display = 'block';
            forwardButton.style.display = 'block';
        });

        video.addEventListener('waiting', () => {
            loadingSpinner.style.display = 'block';
            playPauseButton.style.display = 'none';
            centerControls.style.display = 'flex'; // Ensure center controls are visible
            hideControls(); // Hide bottom controls
        });

        video.addEventListener('playing', () => {
            loadingSpinner.style.display = 'none';
            playPauseButton.style.display = 'block';
            centerControls.style.display = 'flex'; // Ensure center controls are visible
            showControls(); // Show bottom controls
        });

        video.addEventListener('timeupdate', () => {
            const currentTime = Math.floor(video.currentTime);
            const duration = Math.floor(video.duration);
            progress.style.width = `${(currentTime / duration) * 100}%`;

            const formatTime = (time) => {
                const minutes = Math.floor(time / 60).toString().padStart(2, '0');
                const seconds = (time % 60).toString().padStart(2, '0');
                return `${minutes}:${seconds}`;
            };
            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            timeDisplayFullscreen.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });

        video.addEventListener('error', () => {
            errorMessage.style.display = 'block';
        });

        video.addEventListener('play', () => {
            errorMessage.style.display = 'none';
        });
    }

    if (playPauseButton) {
        playPauseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (firstPlay) {
                video.play();
                playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#pause"></use></svg>';
                firstPlay = false;
            } else {
                if (!controlsVisible) {
                    showControls();
                } else {
                    if (video.paused) {
                        video.play();
                        playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#pause"></use></svg>';
                    } else {
                        video.pause();
                        playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#play"></use></svg>';
                    }
                }
            }
        });
    }

    if (rewindButton) {
        rewindButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            video.currentTime -= 10;
        });
    }

    if (forwardButton) {
        forwardButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            video.currentTime += 10;
        });
    }

    const toggleMute = () => {
        video.muted = !video.muted;
        const volumeIcon = video.muted ? '<svg class="icon"><use xlink:href="/icons-sprite.svg#mute"></use></svg>' : '<svg class="icon"><use xlink:href="/icons-sprite.svg#volume-on"></use></svg>';
        volumeToggleButton.innerHTML = volumeIcon;
        volumeToggleFullscreenButton.innerHTML = volumeIcon;
    };

    if (volumeToggleButton) {
        volumeToggleButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            toggleMute();
        });
    }

    if (volumeToggleFullscreenButton) {
        volumeToggleFullscreenButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            toggleMute();
        });
    }

    if (pipToggleButton) {
        pipToggleButton.addEventListener('click', async () => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            } catch (error) {
                console.log('Error with Picture-in-Picture:', error);
            }
        });
    }

    if (pipToggleFullscreenButton) {
        pipToggleFullscreenButton.addEventListener('click', async () => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            } catch (error) {
                console.log('Error with Picture-in-Picture:', error);
            }
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            if (!document.fullscreenElement) {
                enterFullscreen();
            } else {
                exitFullscreen();
            }
        });
    }

    if (fullscreenExitButton) {
        fullscreenExitButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                return;
            }
            event.stopPropagation();
            exitFullscreen();
        });
    }

    const enterFullscreen = () => {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }

        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(function (error) {
                console.log('Orientation lock failed: ', error);
            });
        }

        fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#fullscreen-exit"></use></svg>';
        fullscreenExitButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#fullscreen-exit"></use></svg>';
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#fullscreen"></use></svg>';
    };

    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement) {
            fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#fullscreen"></use></svg>';
        } else {
            fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="/icons-sprite.svg#fullscreen"></use></svg>';
        }
    });

    if (centerControls) {
        centerControls.addEventListener('click', showControls);
    }

    if (progressBar) {
        progressBar.addEventListener('click', showControls);
    }

    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('click', showControls);
    });

    document.getElementById('video-container').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    let lastTapTime = 0;
    const DOUBLE_TAP_THRESHOLD = 300;

    if (videoContainer) {
        videoContainer.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const tapPosition = e.changedTouches[0].clientX;
            const containerWidth = videoContainer.offsetWidth;

            // Disable double-tap to skip if settings menu is open
            if (settingsMenu.style.display === 'block') {
                return;
            }

            if (currentTime - lastTapTime < DOUBLE_TAP_THRESHOLD) {
                if (tapPosition < containerWidth / 2) {
                    video.currentTime -= 10;
                } else {
                    video.currentTime += 10;
                }
            }

            lastTapTime = currentTime;
        });
    }

    if (downloadButton) {
        downloadButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                event.preventDefault();
            }
        });
    }

    if (downloadFullscreenButton) {
        downloadFullscreenButton.addEventListener('click', (event) => {
            if (!controlsVisible) {
                showControls();
                event.preventDefault();
            }
        });
    }

    window.addEventListener('keydown', (event) => {
        if ((event.ctrlKey && event.shiftKey && event.key === 'I') ||
            (event.ctrlKey && event.shiftKey && event.key === 'J') ||
            (event.ctrlKey && event.key === 'U') ||
            (event.key === 'F12')) {
            event.preventDefault();
        }
    });

    function updatePreview(clientX) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (clientX - rect.left) / rect.width;
        const previewTimeValue = pos * video.duration;

        // Display the preview thumbnail
        preview.style.display = 'block';
        preview.style.left = `${clientX - rect.left - preview.offsetWidth / 2}px`;

        const previewIndex = Math.floor((previewTimeValue / video.duration) * previewImages.length);
        const previewImage = previewImages[previewIndex];
        preview.style.backgroundImage = `url(${previewImage})`;

        // Display the preview time
        const minutes = Math.floor(previewTimeValue / 60).toString().padStart(2, '0');
        const seconds = Math.floor(previewTimeValue % 60).toString().padStart(2, '0');
        const formattedTime = `${minutes}:${seconds}`;
        previewTime.textContent = formattedTime;
        previewTime.style.display = 'block';
        previewTime.style.left = `${clientX - previewTime.offsetWidth / 2}px`;
    }
});
