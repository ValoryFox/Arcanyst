'use-strict';
const heraldryUrl=  

function DownloadAllHeraldries()
{
    
}

function RetrieveHeraldry(type, id) {
    var newHeraldryUrl;

    if (Config.HeraldryOverrides[id])
    {
        document.getElementById('Style-HideOrkHeraldryWarning').disabled = false;
        newHeraldryUrl = `heraldries/${id}.png`;
    }
    else
        newHeraldryUrl = `https://us-central1-ash-amtgard-awards.cloudfunctions.net/heraldry?type=${type}&id=${id}`;

    if (Config.HeraldrySource == newHeraldryUrl) return;

    Config.HeraldrySource = newHeraldryUrl;
    return getBase64FromImageUrl(Config.HeraldrySource).then(url => {
        Config.Heraldry = url;
    });
}

function SelectHeraldry() {
    const file = document.querySelector('input[type=file]#HeraldryImport').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        Config.Heraldry = reader.result;
        document.getElementById('Style-HideOrkHeraldryWarning').disabled = false;
        if (Award.Preview) Award.draw.html(Award.Preview, document.getElementById("AwardPreviewSVG"));
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}

function getBase64FromImageUrl(url) {
    return new Promise(resolve => {
        var img = new Image();
    
        img.setAttribute('crossOrigin', 'anonymous');
    
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width =this.width;
            canvas.height =this.height;
    
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
    
            var dataURL = canvas.toDataURL("image/png");
    
            resolve(dataURL);
        };

        img.onerror = function () {
            resolve("");
        }
    
        img.src = url;
    });
}


function ConstructHeraldryURL(type, id) {
    return String(id).padStart(type == "kingdom" ? 4 : 5, '0');
}