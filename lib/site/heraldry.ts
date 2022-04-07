'use-strict';

function SelectHeraldry() {
    const file = (document.querySelector('input[type=file]#HeraldryImport') as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        Config.Heraldry = reader.result as string;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}
