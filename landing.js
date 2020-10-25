const {ipcRenderer} = require('electron');
const fs = require('fs');

console.log("Script loaded successfully!");

const renderButton = document.getElementById('render-button');
const locationInput = document.getElementById('video-address');
const bitrateInput = document.getElementById('bitrate');

const statusText = document.getElementById('status');

renderButton.addEventListener('click', () => {
    var bitrate = parseInt(bitrateInput.value);
    if(fs.existsSync(locationInput.value)){
        if(bitrate < 500){
            console.error("Error: bitrate must be >=500");
            statusText.innerHTML = "Error: bitrate must be >=500";
        }else{
            ipcRenderer.send('ffmpeg-render', bitrate, locationInput.value);
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