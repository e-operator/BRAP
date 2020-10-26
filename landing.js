const {ipcRenderer} = require('electron');
const fs = require('fs');

console.log("Script loaded successfully!");

const renderButton = document.getElementById('render-button');
const fileSelectButton = document.getElementById('file-select-button');

const audioBitrateInput = document.getElementById('bitrate-audio');
const videoBitrateInput = document.getElementById('bitrate-video');

const statusText = document.getElementById('status');
const subStatusText = document.getElementById('extra-status');

var filePath;

fileSelectButton.addEventListener('click', () => {
    ipcRenderer.send('request-file-path');
});

renderButton.addEventListener('click', () => {

    var boostSelectors = document.getElementsByName('boost-opt');
    var boostMode;
    for(var i = 0; i < boostSelectors.length; i++){
        if(boostSelectors[i].checked){
            boostMode = boostSelectors[i].value;
        }
    }          

    console.log(boostMode);
    
    var audioBitrate = parseInt(audioBitrateInput.value);
    var videoBitrate = parseInt(videoBitrateInput.value);

    if(fs.existsSync(filePath)){
        if(audioBitrate < 500 || videoBitrate < 500){
            console.error("Error: bitrate must be >=500");
            statusText.innerHTML = "Error: bitrate must be >=500";
        }else{
            ipcRenderer.send('ffmpeg-render', audioBitrate, videoBitrate, filePath, boostMode);
            statusText.innerHTML = "[1/2] processing your video...";
            renderButton.disabled = true;
        }
    }else{
        statusText.innerHTML = "Error: the file cannot be located.";
    }
})

ipcRenderer.on('file-selected', function (event, path) {
    filePath = path;
});

ipcRenderer.on('progress-report', function (event, progress) {
    console.log(progress);
    subStatusText.innerHTML = "Frame: " + progress["frame"] + " FPS: " + progress["fps"];
});

ipcRenderer.on('ffmpeg-render-done', function () {
    ipcRenderer.send('ffmpeg-convert');
    statusText.innerHTML = "[2/2] converting your video..."
});

ipcRenderer.on('ffmpeg-convert-done', function () {
    ipcRenderer.send('open-processed-video');
    statusText.innerHTML = "your brapsterpiece is ready."
    subStatusText.innerHTML = "";
});

ipcRenderer.on('all-done', function () {
    renderButton.disabled = false;
});