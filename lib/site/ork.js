class Ork {
    static Cache = { _Order: [] };
    static KingdomLoaded;
    static OrkURL = 'https://ork.amtgard.com/orkservice/Json/index.php';
  
    static async LoadKingdoms() {
        let kingdoms = await jsork.kingdom.getKingdoms().then(kingdoms => {
            console.info("Got Kingdoms from Ork");
            return kingdoms;
        }, reason => {
            console.warn(`Unable to get Kingdoms from ORK for: ${reason}. Attempting to use CORS proxy.`)
            Ork.OrkURL = 'https://us-central1-ash-amtgard-awards.cloudfunctions.net/ork';
            return jsork.kingdom.getKingdoms();
        }).then(k => k, console.error);

        if (!kingdoms) return;
        
        console.info(kingdoms);
        var sorted = kingdoms.sort(Ork.CompareKingdom);

        for (let kingdom of sorted) {
            // Create new selection option, add it.
            var NewKingdomOption = document.createElement("option");
            NewKingdomOption.textContent = kingdom.KingdomName;
            NewKingdomOption.value = Number(kingdom.KingdomId);
            Config.UIElem.Kingdom.appendChild(NewKingdomOption);

            Ork.Cache[Number(kingdom.KingdomId)] = kingdom;
            Ork.Cache._Order.push(Number(kingdom.KingdomId));
        }
        Config.UIElem.Kingdom.disabled = false;

    }
    
    static async KingdomSelectionChanged() {
        Ork.KingdomLoaded = new Promise(async(done) => {
            Config.UIElem.Park.removeAllChildNodes();
            Config.UIElem.Park.disabled = true;
            
            if (Config.Kingdom == "Custom") {
                Config.UIElem.IssuerTitle.disabled = false;
            }
            else {
                var elNone = document.createElement("option");
                elNone.textContent = "None (Kingdom Level)";
                elNone.value = '';
                Config.UIElem.Park.appendChild(elNone);
        
                if (!Ork.Cache[Config.Kingdom].Parks)
                {
                    Ork.Cache[Config.Kingdom].Parks = new Promise(async (resolve) =>
                    {
                        const result = { _Order: []};
                        const parks = await jsork.kingdom.getParks(Config.Kingdom).then(parks => parks, error => console.error(`Error retrieving Parks: ${error}`));
                        console.info("Got Parks from Ork");
                        console.log(parks);
                        
                        var sorted = parks.sort(Ork.ComparePark);
                        for (const park of sorted) {
                            result[Number(park.ParkId)] = park;
                            result._Order.push(Number(park.ParkId));
                        }
                        resolve(result);
                    });
                }
                
                for (const Id of (await Ork.Cache[Config.Kingdom].Parks)._Order)
                {
                    const Park = (await Ork.Cache[Config.Kingdom].Parks)[Id];
                    if (Park.Name.includes('\\\\\\')) Park.Name = Park.Name.replace('\\\\\\','');
                    let NewParkOption = document.createElement("option");
                    NewParkOption.textContent = Park.Name;
                    NewParkOption.value = Park.ParkId;

                    NewParkOption.classList.toggle('InactivePark', Park.Active != "Active");

                    await Config.UIElem.Park.appendChild(NewParkOption);
                }

                Config.UIElem.Park.disabled = false;
                Config.UIElem.Park.selectedIndex = 0;
                await RetrieveHeraldry('kingdom', Config.Kingdom);
                Config.Park = null;

            }
            done();
        });
        return await Config.KingdomLoaded;
    }
    static async ParkSelectionChanged() {
        await Ork.KingdomLoaded;
        if (!Config.Park) {
            Ork.ProcessKingdomName(Ork.Cache[Config.Kingdom].Name)
            await RetrieveHeraldry('kingdom', Config.Kingdom);
        }
        else {
            Config.UIElem.IssuerTitle.disabled = false;
            Config.IssuerTitle = (await Ork.Cache[Config.Kingdom].Parks)[Config.Park].Title;
            Config.IssuerName = (await Ork.Cache[Config.Kingdom].Parks)[Config.Park].Name;
            Config.UseThe = true; Config.UseOf = true;
            await RetrieveHeraldry('park', Config.Park);
        }
        
        Ork.UpdateParkText();
        if (Award.Preview) Award.draw.html(Award.Preview, document.getElementById("AwardPreviewSVG"));
    }

    static ProcessKingdomName() {
        let name = Ork.Cache[Config.Kingdom].KingdomName;
        /* Oh boy let's try and explain this clusterfuck. Basically kingdoms in the Ork have the their title rolled into one,
           rather than parks where something like 'Duchy' is seperate.

           So we have to use some regex wizardry to splice it up into the same format on the award templates that the parks use.
        */
        const kingdomTitleSearch = /(?<UsesThe>The )?(?<RegionType>Kingdom |Empire )?(of )?(?<RegionName>.+)/;
        if (!kingdomTitleSearch.test(name)) {
            return console.warn(`Can't parse Kingdom name for: ${name}, please contact reach out to the dev to fix this.`);
        }
        else if (name === "The Freeholds of Amtgard")
        {
            // Special snowflake case for something that will never be used, but it looks ugly when you first select it as the kingdom
            Config.IssuerName = "its Freeholds"
            Config.UseThe = false;
            Config.UseOf = false;
            Config.IssuerTitle = "";
        }
        else
        {
            let match = name.match(kingdomTitleSearch);
            Config.IssuerName = match.groups.RegionName;
            Config.UseThe = ((match.groups.RegionType !== undefined || match.groups.UsesThe !== undefined) ? true : false);
            Config.UseOf = ((match.groups.RegionType !== undefined) ? true : false);
            Config.IssuerTitle = (match.groups.RegionType === undefined ? "" : match.groups.RegionType);
        }

        Ork.UpdateParkText();
    }

    static UpdateParkText()
    { 
        if (!Config.IssuerName) return;
        /*
            The below converts issuer description info into the actual text fields that the award template uses.
            I currently have a hard-coded thing to reformat the text that I might change in the future if I'm feeling warm and fuzzy.
        */
        let _IssuerOf = (Config.UseOf ? " of" : "");
        let _IssuerTitle = Config.IssuerTitle;
        let _IssuerName = Config.IssuerName;
        if (Config.IssuerName.length <= 7)
        {
            _IssuerName = Config.IssuerTitle + (Config.UseOf ? " of" : "") + " " + Config.IssuerName;
            _IssuerOf = "";
            _IssuerTitle = "";
        }
        
        Config.TextFields.AwardText_IssuerTitle = `${Config.UseThe ? 'the ' : ''}${_IssuerTitle}${_IssuerOf}`;
        Config.TextFields.AwardText_Issuer = _IssuerName;

        if (Award.Preview)
        {
            for (let [field, text] of Object.entries(Config.TextFields))
            {
                let elem = document.getElementById("AwardPreviewSVG").querySelector(`[name=${field}]`);
                if (elem && elem.innerHTML != text) elem.innerHTML = text;
            }
        }
    }

    static CompareName(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    static CompareKingdom(a, b) {
        return Ork.CompareName(a.KingdomName, b.KingdomName)
    }
    static ComparePark(a, b) {
        return Ork.CompareName(a.ParkName, b.ParkName)
    }
}