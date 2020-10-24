const { ipcMain, app, BrowserWindow } = require('electron');

function start_main (){
    let mainWin = new BrowserWindow({
        width: 400,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWin.loadFile('landing.html');

ipcMain.on('ffmpeg-render', (event, bitrate, path) => {
    let opts = {
        "cwd":"./ffmpeg/bin"
    };
    var child_ffmpeg_render = require('child_process').exec("ffmpeg.exe -y -i \"" + path + "\" -b:a " + bitrate + " -b:v " + bitrate + " -minrate " + bitrate + " -maxrate " + bitrate + " -bufsize " + bitrate + " output.webm", opts);
    child_ffmpeg_render.stdout.pipe(process.stdout);
    child_ffmpeg_render.stderr.pipe(process.stdout);
    child_ffmpeg_render.on('exit', function() {
        event.sender.send('ffmpeg-render-done');
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