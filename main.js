const { ipcMain, app, dialog, BrowserWindow } = require('electron');

function start_main (){
    let mainWin = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWin.loadFile('landing.html');

ipcMain.on('request-file-path', (event) => {
    dialog.showOpenDialog({properties: ['openFile']}).then(result => {
        console.log(result.filePaths[0]);
        event.sender.send('file-selected', result.filePaths[0]);
    });
});

ipcMain.on('ffmpeg-render', (event, audioBitrate, videoBitrate, path, boostMode) => {
    let opts = {
        "cwd":"./ffmpeg/bin"
    };

    console.log("!!!!BOOSTMODE: " + boostMode);

    switch(boostMode){
        case "no boost":{
            console.log("Using no boost");
            var child_ffmpeg_render = require('child_process').exec("ffmpeg.exe -y -progress pipe:1 -i \"" + path + "\" -b:a " + audioBitrate + " -b:v " + videoBitrate + " -minrate " + videoBitrate + " -maxrate " + videoBitrate + " -bufsize " + videoBitrate + " output.webm", opts);
            break;
        }
        case "bass boost":{
            console.log("Using bass boost");
            var child_ffmpeg_render = require('child_process').exec("ffmpeg.exe -y -progress pipe:1 -i \"" + path + "\" -b:a " + audioBitrate + " -b:v " + videoBitrate + " -minrate " + videoBitrate + " -maxrate " + videoBitrate + " -bufsize " + videoBitrate + " -af \"firequalizer=gain_entry='entry(0,50);entry(250,25);entry(1000,0);entry(4000,-25);entry(16000,-50)'\" output.webm", opts);
            break;
        }
        case "treble boost":{
            console.log("Using treble boost");
            var child_ffmpeg_render = require('child_process').exec("ffmpeg.exe -y -progress pipe:1 -i \"" + path + "\" -b:a " + audioBitrate + " -b:v " + videoBitrate + " -minrate " + videoBitrate + " -maxrate " + videoBitrate + " -bufsize " + videoBitrate + " -af \"firequalizer=gain_entry='entry(0,-50);entry(250,-25);entry(1000,0);entry(4000,25);entry(16000,50)'\" output.webm", opts);
            break;
        }
        default:{
            console.log("Using no boost: default");
            var child_ffmpeg_render = require('child_process').exec("ffmpeg.exe -y -progress pipe:1 -i \"" + path + "\" -b:a " + audioBitrate + " -b:v " + videoBitrate + " -minrate " + videoBitrate + " -maxrate " + videoBitrate + " -bufsize " + videoBitrate + " output.webm", opts);
            break;
        }
    }

    child_ffmpeg_render.stdout.pipe(process.stdout);
    child_ffmpeg_render.stderr.pipe(process.stdout);

    child_ffmpeg_render.on('exit', function() {
        event.sender.send('ffmpeg-render-done');
    });

    child_ffmpeg_render.stdout.on('data', function(data) {
        var outLines = data.toString().split('\n');
        var progress = {};
        for (var i = 0; i < outLines.length; i++) {
            var key = outLines[i].split('=');
            if (typeof key[0] != 'undefined' && typeof key[1] != 'undefined') {
                progress[key[0]] = key[1];
            }
        }
        event.sender.send('progress-report', progress);
    });
});

ipcMain.on('ffmpeg-convert', (event) => {
    let opts = {
        "cwd":"./ffmpeg/bin"
    };

    var child_ffmpeg_convert = require('child_process').exec("ffmpeg.exe -y -i output.webm output.mp4", opts);

    child_ffmpeg_convert.stdout.pipe(process.stdout);
    child_ffmpeg_convert.stderr.pipe(process.stdout);

    child_ffmpeg_convert.on('exit', function() {
        event.sender.send('ffmpeg-convert-done');
    });
});

ipcMain.on('open-processed-video', (event) => {
    let opts = {
        "cwd":"./ffmpeg/bin"
    };

    var child_ffmpeg_convert = require('child_process').exec("output.mp4", opts);

    child_ffmpeg_convert.stdout.pipe(process.stdout);
    child_ffmpeg_convert.stderr.pipe(process.stdout);
    
    child_ffmpeg_convert.on('exit', function() {
        event.sender.send('all-done');
    });
});

}

app.whenReady().then(start_main);