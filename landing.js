const {ipcRenderer} = require('electron');
const fs = require('fs');

console.log("Script loaded successfully!");

const renderButton = document.getElementById('render-button');
const locationInput = document.getElementById('video-address');
const audioBitrateInput = document.getElementById('bitrate-audio');
const videoBitrateInput = document.getElementById('bitrate-video');

const statusText = document.getElementById('status');

renderButton.addEventListener('click', () => {
    var audioBitrate = parseInt(audioBitrateInput.value);
    var videoBitrate = parseInt(videoBitrateInput.value);

    if(fs.existsSync(locationInput.value)){
        if(audioBitrate < 500 || videoBitrate < 500){
            console.error("Error: bitrate must be >=500");
            statusText.innerHTML = "Error: bitrate must be >=500";
        }else{
            ipcRenderer.send('ffmpeg-render', audioBitrate, videoBitrate, locationInput.value);
            statusText.innerHTML = "brap is raping your video...";
            renderButton.disabled = true;
        }
    }else{
        statusText.innerHTML = "Error: the file cannot be located.";
    }
    
})

ipcRenderer.on('ffmpeg-render-done', function () {
    ipcRenderer.send('ffmpeg-convert');
    statusText.innerHTML = "brap is finalizing your video..."
});

ipcRenderer.on('ffmpeg-convert-done', function () {
    ipcRenderer.send('open-processed-video');
    statusText.innerHTML = "your brapsterpiece is ready."
});

ipcRenderer.on('all-done', function () {
    renderButton.disabled = false;
});