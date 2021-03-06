'use-strict';
function SelectHeraldry() {
    const file = document.querySelector('input[type=file]#HeraldryImport').files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        Config.Heraldry = reader.result;
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    }
}
//# sourceMappingURL=heraldry.js.map