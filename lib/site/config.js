'use-strict';
class Config
{
    static OnSettingChange = { 
        // Any triggers on any setting change, and happens BEFORE any specific ones.
        Any: [(property, from, to) => {
            // Update the Settings UI to new values.
            var elem = Config.UIElem[property];
            if (!elem) return;

            if ((to === true || to === false) && elem.checked != to)
                elem.checked = to; // is a checkbox
            else if (elem.value != to)
                elem.value = to; // is a text field OR selection box
        }, (property, from, to) => {
            // Update any award text fields
            if (`AwardText_${property}` in Config.TextFields)
                Config.TextFields[`AwardText_${property}`] = to;
        }],
        Heraldry: [(property, from, to) => {
            document.getElementById('HeraldryPreview').src = to;
            AwardContext.purgeGroup('heraldry');
        }],
        Kingdom: [Ork.KingdomSelectionChanged],
        Park: [Ork.ParkSelectionChanged],
        ShowDeadParks: [(property, from, to) => {
            document.getElementById('Style-HideDeadParks').disabled = to;
        }],
        Animations: [(property, from, to) => { for (let anim of document.querySelectorAll('animate')) (to ? anim.beginElement() : anim.endElement()); }],
        UseThe: [Ork.UpdateParkText],
        UseOf: [Ork.UpdateParkText],
        IssuerTitle: [Ork.UpdateParkText],
        IssuerName: [Ork.UpdateParkText],
        Date: [(property, from, to) => Award._onPreviewUpdate(Award.Preview, {property:property,from:from,to:to})],
        GivenBy: [(property, from, to) => Award._onPreviewUpdate(Award.Preview, {property:property,from:from,to:to})]
    }   

    static UIElem = {};
    static #Park; static #Kingdom; static #UseThe; static #UseOf; static #Heraldry; static #Animations = true;
    static #ShowDeadParks; static #GivenBy; static #Date; static #IssuerTitle; static #IssuerName;
    static async Initialize()
    {
        const props = ['Park', 'Kingdom', 'UseThe', 'UseOf', 'Heraldry', 'ShowDeadParks', 'GivenBy', 'Date', 'IssuerTitle', 'IssuerName', 'Animations'];
        for (let p of props)
        {
            let _p = `#${p}`;

            Object.defineProperty(Config, p, {
                get: () => Config[_p],
                set: async (val) => {
                    let from = Config[_p];
                    Config[_p] = val;
                    for (let listener of Config.OnSettingChange.Any) await listener(p, from, val);
                    if (Config.OnSettingChange[p])
                        for (let listener of Config.OnSettingChange[p]) await listener(p, from, val);
                }
            });

            Config.UIElem[p] = document.getElementById('Setting-' + p);

        }

        await Ork.LoadKingdoms();
        
        // Load Cookies
        let cookieRegex = new RegExp(/([^=;]+)=([^;]+)/,'g');
        let cookies = Array.from(document.cookie.matchAll(cookieRegex));
        for (let [all, key, value] of cookies) { if (key.trim() == 'Kingdom' && value != 'undefined') Config.Kingdom = Number(value.trim()); }
        for (let [all, key, value] of cookies) { if (key.trim() == 'Park' && Config.Kingdom) { await Ork.KingdomLoaded; Config.Park = Number(value.trim()); }; }
        for (let [all, key, value] of cookies)
        {
            key = key.trim();
            value = value.trim();
            if (key == 'Kingdom' || key == 'Park') continue;
            if (value == 'false') value = false;
            else if (value == 'true') value = true;
            else if (Number(value)) value = Number(value);

            Config[key] = value;
        }    

        // Attach Listeners to Update Cookies
        const cookie_props = ['Park', 'Kingdom', 'UseThe', 'UseOf', 'ShowDeadParks', 'GivenBy', 'Date', 'Animations'];
        for (let p of cookie_props)
        {
            if (!(p in Config.OnSettingChange))
                Config.OnSettingChange[p] = [];
            Config.OnSettingChange[p].push((property, from, to) => { document.cookie = `${property}=${to};SameSite=Strict`; })
        }
    }

    static page =  { width: 2550, height: 3300 };
    static JPEG_quality = 0.85;
    static TextFields = { 
        AwardText_IssuerTitle : "",
        AwardText_Issuer : "",
        AwardText_GivenBy : "",
        AwardText_Date : ""
    };

    static state = 'release';

    static UIUpdateEvent(event)
    {
        let property = event.target.id.replace('Setting-','');
        if (event.target.getAttribute('type') == 'checkbox')
            Config[property] = event.target.checked;
        else
            Config[property] = event.target.value;
    }

    static Fonts = {
        'BlackChancery' : {
            'italic' : {  400: "resources/fonts/BlackChancery.ttf",
                          700: "resources/fonts/BlackChancery.ttf" },
            'normal' : {  400: "resources/fonts/BlackChancery.ttf",
                        700: "resources/fonts/BlackChancery.ttf" }},
        'Averia Serif Libre' : {
            'italic' : {  400: "resources/fonts/AveriaSerifLibre-Italic.ttf",
                            700: "resources/fonts/AveriaSerifLibre-BoldItalic.ttf" },
            'normal' : {  400: "resources/fonts/AveriaSerifLibre-Regular.ttf",
                        700: "resources/fonts/AveriaSerifLibre-Bold.ttf" }},
    }

    static HeraldryOverrides = { "17" : true ,"187" : true ,"295" : true ,"309" : true ,"435" : true ,"519" : true ,"638" : true ,"700" : true ,"845" : true ,"917" : true };
    
}
