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

  let subtitles = []; // Subtitles are OFF by default
  let controlsVisible = false;
  let controlsTimeout;
  let firstPlay = true;
  let isTouching = false;
  let initialTouchX = 0;
  let initialTime = 0;
  let wasPlaying = false;

  // Ensure video is PiP-enabled
  if (video) {
    video.removeAttribute('disablePictureInPicture'); // Ensure PiP is not disabled
  }

  // Check if PiP is supported
  const isPiPSupported = 'pictureInPictureEnabled' in document && typeof video.requestPictureInPicture === 'function';

  // Disable PiP buttons if not supported
  if (!isPiPSupported) {
    pipToggleButton.disabled = true;
    pipToggleFullscreenButton.disabled = true;
    pipToggleButton.style.opacity = '0.5';
    pipToggleFullscreenButton.style.opacity = '0.5';
  }

  // Function to load subtitles
  function loadSubtitles(lang) {
    let subtitleURL = '';
    if (lang === 'english') {
      subtitleURL = 'https://customized-player.vercel.app/subtitles/english.vtt';
    } else if (lang === 'spanish') {
      subtitleURL = 'https://customized-player.vercel.app/subtitles/spanish.vtt';
    } else if (lang === 'french') {
      subtitleURL = 'https://customized-player.vercel.app/subtitles/french.vtt';
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
      subtitles = [];
    } else {
      loadSubtitles(lang);
    }
    settingsMenu.style.display = 'none';
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

    subtitlesContainer.innerHTML = currentSubtitleText;
  }

  // Function to show controls
  function showControls() {
    videoContainer.classList.add('show-controls');
    centerControls.style.opacity = 1;
    controlsVisible = true;
    updateDownloadLink();
    clearTimeout(controlsTimeout);
    if (!video.paused && !isTouching && !video.waiting) {
      controlsTimeout = setTimeout(hideControls, 3000);
    }
  }

  // Function to hide controls
  function hideControls() {
    if (video.paused || isTouching || video.seeking || video.waiting) return;
    videoContainer.classList.remove('show-controls');
    centerControls.style.opacity = 0;
    controlsVisible = false;
    updateDownloadLink();
  }

  // Function to update download link
  function updateDownloadLink() {
    const downloadUrl = "https://streamtape.com/get_video?id=1O6YJGyDYwIeO2q&expires=1738379488&ip=GxAsDRMTKxSHDN&token=NAfysj8kfDL2&dl=1";
    if (controlsVisible) {
      downloadButton.href = downloadUrl;
      downloadFullscreenButton.href = downloadUrl;
    } else {
      downloadButton.removeAttribute('href');
      downloadFullscreenButton.removeAttribute('href');
    }
  }

  // Function to update PiP button icons
  function updatePiPIcon(isInPiP) {
    const pipIcon = isInPiP
      ? '<svg class="icon"><use xlink:href="icons-sprite.svg#pip-exit"></use></svg>'
      : '<svg class="icon"><use xlink:href="icons-sprite.svg#pip"></use></svg>';
    pipToggleButton.innerHTML = pipIcon;
    pipToggleFullscreenButton.innerHTML = pipIcon;
  }

  // Video event listeners
  if (video) {
    video.addEventListener('timeupdate', () => {
      displaySubtitles();
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      if (!isNaN(duration)) {
        progress.style.width = `${(currentTime / duration) * 100}%`;
        const formatTime = (time) => {
          const minutes = Math.floor(time / 60).toString().padStart(2, '0');
          const seconds = (time % 60).toString().padStart(2, '0');
          return `${minutes}:${seconds}`;
        };
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        timeDisplayFullscreen.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      }
    });

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
      centerControls.style.display = 'flex';
      hideControls();
    });

    video.addEventListener('playing', () => {
      loadingSpinner.style.display = 'none';
      playPauseButton.style.display = 'block';
      centerControls.style.display = 'flex';
      showControls();
    });

    video.addEventListener('error', () => {
      errorMessage.style.display = 'block';
      errorMessage.innerHTML = `<svg class="icon"><use xlink:href="icons-sprite.svg#playback-error"></use></svg><p>Video playback error occurred.</p>`;
    });

    video.addEventListener('loadedmetadata', () => {
      errorMessage.style.display = 'none';
      // Ensure video is PiP-enabled after metadata is loaded
      video.removeAttribute('disablePictureInPicture');
    });

    video.addEventListener('enterpictureinpicture', () => {
      updatePiPIcon(true);
    });

    video.addEventListener('leavepictureinpicture', () => {
      updatePiPIcon(false);
    });
  }

  // Prevent settings menu interactions from affecting the video
  if (settingsMenu) {
    settingsMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    settingsMenu.addEventListener('touchstart', (event) => {
      event.stopPropagation();
    });
    settingsMenu.addEventListener('touchend', (event) => {
      event.stopPropagation();
    });
    settingsMenu.addEventListener('dblclick', (event) => {
      event.stopPropagation();
    });
  }

  // Toggle settings menu
  if (settingsButton) {
    settingsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      settingsMenu.style.display = settingsMenu.style.display === 'flex' ? 'none' : 'flex';
      if (settingsMenu.style.display === 'flex') {
        const activeTab = document.querySelector('.settings-header button.active');
        if (!activeTab) {
          document.querySelector('.settings-header button[data-tab="quality-tab"]').click();
        }
      }
    });
  }

  if (settingsFullscreenButton) {
    settingsFullscreenButton.addEventListener('click', (event) => {
      event.stopPropagation();
      settingsMenu.style.display = settingsMenu.style.display === 'flex' ? 'none' : 'flex';
      if (settingsMenu.style.display === 'flex') {
        const activeTab = document.querySelector('.settings-header button.active');
        if (!activeTab) {
          document.querySelector('.settings-header button[data-tab="quality-tab"]').click();
        }
      }
    });
  }

  if (subtitlesButton) {
    subtitlesButton.addEventListener('click', (event) => {
      event.stopPropagation();
      settingsMenu.style.display = 'flex';
      document.querySelector('.settings-header button[data-tab="captions-tab"]').click();
    });
  }

  if (subtitlesFullscreenButton) {
    subtitlesFullscreenButton.addEventListener('click', (event) => {
      event.stopPropagation();
      settingsMenu.style.display = 'flex';
      document.querySelector('.settings-header button[data-tab="captions-tab"]').click();
    });
  }

  if (closeSettingsButton) {
    closeSettingsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      settingsMenu.style.display = 'none';
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabs.forEach(tab => tab.classList.remove('active-tab'));
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-tab')).classList.add('active-tab');
    });
  });

  function handleOptionSelection(selector, type) {
    const options = document.querySelectorAll(selector);
    options.forEach(option => {
      option.addEventListener('click', (event) => {
        event.stopPropagation();
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
            subtitlesIcon.setAttribute('xlink:href', 'icons-sprite.svg#captions-off');
            subtitlesFullscreenIcon.setAttribute('xlink:href', 'icons-sprite.svg#captions-off');
          } else {
            subtitlesIcon.setAttribute('xlink:href', 'icons-sprite.svg#captions-on');
            subtitlesFullscreenIcon.setAttribute('xlink:href', 'icons-sprite.svg#captions-on');
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

  // Progress bar event listeners
  progressBar.addEventListener('mousemove', (event) => {
    updatePreview(event.clientX);
    showControls();
    hideCenterControls();
  });

  progressBar.addEventListener('mouseleave', () => {
    preview.style.display = 'none';
    previewTime.style.display = 'none';
    hideControls();
    showCenterControls();
  });

  progressBar.addEventListener('click', (event) => {
    event.stopPropagation();
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
    preview.style.display = 'none';
    previewTime.style.display = 'none';
    showControls();
  });

  progressBar.addEventListener('touchstart', (event) => {
    event.stopPropagation();
    isTouching = true;
    initialTouchX = event.touches[0].clientX;
    initialTime = video.currentTime;
    wasPlaying = !video.paused;
    video.pause();
    updateVideoTime(event.touches[0].clientX);
    showControls();
    hideCenterControls();
    clearTimeout(controlsTimeout);
  });

  progressBar.addEventListener('touchmove', (event) => {
    event.stopPropagation();
    if (isTouching) {
      updateVideoTime(event.touches[0].clientX);
      showControls();
      hideCenterControls();
    }
  });

  progressBar.addEventListener('touchend', (event) => {
    event.stopPropagation();
    isTouching = false;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.changedTouches[0].clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
    preview.style.display = 'none';
    previewTime.style.display = 'none';
    if (wasPlaying) {
      video.play();
    }
    controlsTimeout = setTimeout(hideControls, 3000);
    showCenterControls();
  });

  // Function to update video time for progress bar
  function updateVideoTime(clientX) {
    const rect = progressBar.getBoundingClientRect();
    const pos = (clientX - rect.left) / rect.width;
    const newTime = pos * video.duration;
    progress.style.width = `${pos * 100}%`;
    updatePreviewThumbnail(newTime, clientX - rect.left);
    updatePreviewTime(newTime, clientX - rect.left);
  }

  function updatePreviewThumbnail(time, clientX) {
    const previewIndex = Math.floor((time / video.duration) * previewImages.length);
    const previewImage = previewImages[previewIndex];
    preview.style.backgroundImage = `url(${previewImage})`;
    preview.style.display = 'block';
    preview.style.left = `${clientX - preview.offsetWidth / 2}px`;
  }

  function updatePreviewTime(time, clientX) {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    const formattedTime = `${minutes}:${seconds}`;
    previewTime.textContent = formattedTime;
    previewTime.style.display = 'block';
    previewTime.style.left = `${clientX - previewTime.offsetWidth / 2}px`;
  }

  // Function to hide center controls
  function hideCenterControls() {
    centerControls.style.display = 'none';
  }

  // Function to show center controls
  function showCenterControls() {
    if (!video.seeking && !video.waiting) {
      centerControls.style.display = 'flex';
    }
  }

  // Lazy load poster
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

  // Prevent right-click context menu
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  // Prevent long-press context menu on touch devices
  document.addEventListener('touchstart', (event) => {
    if (!event.target.closest('.settings-menu')) {
      event.preventDefault();
    }
  });

  // Detect dev tools
  const detectDevTools = () => {
    const devtools = /./;
    devtools.toString = function () {
      debugger;
      return 'devtools';
    };
    console.log('%c', devtools);
  };

  setInterval(detectDevTools, 1000);

  // Video container click handler
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

  // Play/pause button
  if (playPauseButton) {
    playPauseButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (firstPlay) {
        video.play().catch(error => {
          errorMessage.style.display = 'block';
          errorMessage.innerHTML = `<svg class="icon"><use xlink:href="icons-sprite.svg#playback-error"></use></svg><p>Playback error: ${error.message}</p>`;
          setTimeout(() => errorMessage.style.display = 'none', 3000);
        });
        playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#pause"></use></svg>';
        firstPlay = false;
      } else {
        if (video.paused) {
          video.play().catch(error => {
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = `<svg class="icon"><use xlink:href="icons-sprite.svg#playback-error"></use></svg><p>Playback error: ${error.message}</p>`;
            setTimeout(() => errorMessage.style.display = 'none', 3000);
          });
          playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#pause"></use></svg>';
        } else {
          video.pause();
          playPauseButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#play"></use></svg>';
        }
        showControls();
      }
    });
  }

  // Rewind button
  if (rewindButton) {
    rewindButton.addEventListener('click', (event) => {
      event.stopPropagation();
      video.currentTime -= 10;
      showControls();
    });
  }

  // Forward button
  if (forwardButton) {
    forwardButton.addEventListener('click', (event) => {
      event.stopPropagation();
      video.currentTime += 10;
      showControls();
    });
  }

  // Mute toggle
  function toggleMute() {
    video.muted = !video.muted;
    const volumeIcon = video.muted
      ? '<svg class="icon"><use xlink:href="icons-sprite.svg#mute"></use></svg>'
      : '<svg class="icon"><use xlink:href="icons-sprite.svg#volume-on"></use></svg>';
    volumeToggleButton.innerHTML = volumeIcon;
    volumeToggleFullscreenButton.innerHTML = volumeIcon;
  }

  if (volumeToggleButton) {
    volumeToggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMute();
      showControls();
    });
  }

  if (volumeToggleFullscreenButton) {
    volumeToggleFullscreenButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMute();
      showControls();
    });
  }

  // PiP toggle
  if (pipToggleButton && isPiPSupported) {
    pipToggleButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          updatePiPIcon(false);
        } else {
          if (video.paused || video.ended || !video.currentTime) {
            await video.play().catch(error => {
              throw new Error(`Cannot play video: ${error.message}`);
            });
          }
          if (video.hasAttribute('disablePictureInPicture')) {
            throw new Error('Picture-in-Picture is disabled on this video');
          }
          await video.requestPictureInPicture();
          updatePiPIcon(true);
        }
        showControls();
      } catch (error) {
        console.error('Picture-in-Picture error:', error.message);
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = `<svg class="icon"><use xlink:href="icons-sprite.svg#playback-error"></use></svg><p>Failed to toggle Picture-in-Picture: ${error.message}</p>`;
        setTimeout(() => errorMessage.style.display = 'none', 3000);
      }
    });
  }

  if (pipToggleFullscreenButton && isPiPSupported) {
    pipToggleFullscreenButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          updatePiPIcon(false);
        } else {
          if (video.paused || video.ended || !video.currentTime) {
            await video.play().catch(error => {
              throw new Error(`Cannot play video: ${error.message}`);
            });
          }
          if (video.hasAttribute('disablePictureInPicture')) {
            throw new Error('Picture-in-Picture is disabled on this video');
          }
          await video.requestPictureInPicture();
          updatePiPIcon(true);
        }
        showControls();
      } catch (error) {
        console.error('Picture-in-Picture error:', error.message);
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = `<svg class="icon"><use xlink:href="icons-sprite.svg#playback-error"></use></svg><p>Failed to toggle Picture-in-Picture: ${error.message}</p>`;
        setTimeout(() => errorMessage.style.display = 'none', 3000);
      }
    });
  }

  // Fullscreen toggle
  function enterFullscreen() {
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
      screen.orientation.lock('landscape').catch(error => {
        console.log('Orientation lock failed: ', error);
      });
    }

    fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#fullscreen-exit"></use></svg>';
    fullscreenExitButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#fullscreen-exit"></use></svg>';
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#fullscreen"></use></svg>';
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!document.fullscreenElement) {
        enterFullscreen();
      } else {
        exitFullscreen();
      }
      showControls();
    });
  }

  if (fullscreenExitButton) {
    fullscreenExitButton.addEventListener('click', (event) => {
      event.stopPropagation();
      exitFullscreen();
      showControls();
    });
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#fullscreen"></use></svg>';
    } else {
      fullscreenButton.innerHTML = '<svg class="icon"><use xlink:href="icons-sprite.svg#fullscreen-exit"></use></svg>';
    }
  });

  // Double-tap handling
  let lastTapTime = 0;
  const DOUBLE_TAP_THRESHOLD = 300;

  if (videoContainer) {
    videoContainer.addEventListener('touchend', (e) => {
      if (settingsMenu.style.display === 'flex' || e.target.closest('.settings-menu')) {
        return;
      }

      const currentTime = Date.now();
      const tapPosition = e.changedTouches[0].clientX;
      const containerWidth = videoContainer.offsetWidth;

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

  // Download buttons
  if (downloadButton) {
    downloadButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!controlsVisible) {
        showControls();
        event.preventDefault();
      }
    });
  }

  if (downloadFullscreenButton) {
    downloadFullscreenButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!controlsVisible) {
        showControls();
        event.preventDefault();
      }
    });
  }

  // Prevent dev tools
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && event.shiftKey && event.key === 'I') ||
        (event.ctrlKey && event.shiftKey && event.key === 'J') ||
        (event.ctrlKey && event.key === 'U') ||
        (event.key === 'F12')) {
      event.preventDefault();
    }
  });

  // Update preview on progress bar hover
  function updatePreview(clientX) {
    const rect = progressBar.getBoundingClientRect();
    const pos = (clientX - rect.left) / rect.width;
    const previewTimeValue = pos * video.duration;

    preview.style.display = 'block';
    preview.style.left = `${clientX - rect.left - preview.offsetWidth / 2}px`;

    const previewIndex = Math.floor((previewTimeValue / video.duration) * previewImages.length);
    const previewImage = previewImages[previewIndex];
    preview.style.backgroundImage = `url(${previewImage})`;

    const minutes = Math.floor(previewTimeValue / 60).toString().padStart(2, '0');
    const seconds = Math.floor(previewTimeValue % 60).toString().padStart(2, '0');
    const formattedTime = `${minutes}:${seconds}`;
    previewTime.textContent = formattedTime;
    previewTime.style.display = 'block';
    previewTime.style.left = `${clientX - previewTime.offsetWidth / 2}px`;
  }

  if (centerControls) {
    centerControls.addEventListener('click', showControls);
  }

  if (progressBar) {
    progressBar.addEventListener('click', showControls);
  }

  document.querySelectorAll('.controls button').forEach(button => {
    button.addEventListener('click', showControls);
  });

  videoContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});
