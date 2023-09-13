
function setup_camera(){
    let media_dev = navigator.mediaDevices;
    nophoto = document.getElementById("nophoto");
    vdo_cam = document.getElementById("vdo-cam");

    if (!media_dev || !media_dev.getUserMedia) {
        nophoto.innerHTML = 'It seems your browser does not support/allow to use camera<br><br>Select Images from Gallery';
        return;
    }
    vdo_cam.style.display = 'block';
    nophoto.style.display = 'none';

    media_dev.getUserMedia({
       video: {
          width: 400,
          height: 400,
       }
    }).then(function(vidStream) {
       var video = document.getElementById('vdo-cam');
       if ("srcObject" in video) {
          video.srcObject = vidStream;
       } else {
          video.src = window.URL.createObjectURL(vidStream);
       }
       video.onloadedmetadata = function(e) {
          video.play();
       };
    })
    .catch(function(e) {
       console.log(e.name + ": " + e.message);
       vdo_cam.style.display = 'none';
       nophoto.innerHTML = 'It seems your browser does not support/allow to use camera<br><br>Select Images from Gallery';
       nophoto.style.display = 'table-cell';
    });
}

function show_log(msg){
    log = document.getElementById("log");
    log.innerHTML = msg;
}

function register(){
    vdo_cam = document.getElementById("vdo-cam");
    gal_cam = document.getElementById("gal-cam");
    name_inp = document.getElementById("name");
    reg_but = document.getElementById("reg-but");

    if (name_inp.value.trim() == "") {
        show_log("");
        name_inp.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--red_400');
        name_inp.value = "";
        return;
    }
    name_inp.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent1_200');
    reg_but.disabled = true;
    show_log("");

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    ctx = canvas.getContext('2d');

    if (vdo_cam.style.display == 'block'){
        vdo_cam.pause();
        ctx.drawImage(vdo_cam, 0, 0, canvas.width, canvas.height);
    } else if (gal_cam.style.display == 'block') {
        ctx.drawImage(gal_cam, 0, 0, canvas.width, canvas.height);
    } else {
        return;
    }

    const dataURL = canvas.toDataURL();
    let formData = new FormData();
    formData.append('image', dataURL);
    formData.append('name', name_inp.value.trim());

    const request = new XMLHttpRequest();

    request.open("POST", "/api/register", true);
    request.onload = (progress) => {
        if (request.status != 200) {
            show_log("<span class='log-err'>Fatal Error</span>");
            return;
        }
        else {
            show_log(request.responseText);
        }
    };
    request.send(formData);
    if (vdo_cam.style.display == 'block'){
        vdo_cam.play();
    } else if (gal_cam.style.display == 'block'){
        gal_cam.style.display = 'none';
        nophoto.style.display = 'table-cell';
    }
    reg_but.disabled = false;
}


function recognise(){
    vdo_cam = document.getElementById("vdo-cam");
    gal_cam = document.getElementById("gal-cam");
    rec_but = document.getElementById("rec-but");
    if (rec_but.innerText == "OK") {
        show_log("");
        rec_but.innerText = "Recognise";

        if (vdo_cam.style.display == 'block'){
            vdo_cam.play();
        } else if (gal_cam.style.display == 'block'){
            gal_cam.style.display = 'none';
            nophoto.style.display = 'table-cell';
        }
        return;
    }
    rec_but.disabled = true;
    show_log("Recognising...");

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    ctx = canvas.getContext('2d');

    if (vdo_cam.style.display == 'block'){
        vdo_cam.pause();
        ctx.drawImage(vdo_cam, 0, 0, canvas.width, canvas.height);
    } else if (gal_cam.style.display == 'block') {
        ctx.drawImage(gal_cam, 0, 0, canvas.width, canvas.height);
    } else {
        return;
    }

    const dataURL = canvas.toDataURL();
    let formData = new FormData();
    formData.append('image', dataURL);

    const request = new XMLHttpRequest();

    request.open("POST", "/api/recognise", true);
    request.onload = (progress) => {
        if (request.status != 200) {
            show_log("<span class='log-err'>Fatal Error</span>");
            return;
        }
        else {
            show_log(request.responseText);
        }
    };
    request.send(formData);
    rec_but.innerText = "OK"

    rec_but.disabled = false;
}

function open_file_select(){
    gal_file = document.getElementById("gal-file");
    gal_file.click();
}

function setup_gallery(){
    nophoto = document.getElementById("nophoto");
    vdo_cam = document.getElementById("vdo-cam");

    gal_file = document.getElementById("gal-file");
    gal_file.onchange = () => {
        var selectedFile = gal_file.files[0];
        var reader = new FileReader();
      
        var gal_cam = document.getElementById("gal-cam");
        gal_cam.style.display = 'block';
        vdo_cam.style.display = 'none';
        nophoto.style.display = 'none';
      
        reader.onload = function(event) {
            gal_cam.src = event.target.result;
        };
      
        reader.readAsDataURL(selectedFile);
    }
}

window.onload = () => {
    setup_camera();
    setup_gallery();
}