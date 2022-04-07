declare const jsork : any;

interface OrkKingdom {
    Abbreviation: string;
    KingdomId : string;
    KingdomName : string;
    KingdomColor : string;
    Active: 'Active' | 'Retired';
    Parks : OrkPark[];
}

interface OrkPark {
    Abbreviation: string;
    ParkId : string;
    Name : string;
    ParkTitleId : string;
    Title : string;
    Active: 'Active' | 'Retired';
}

class Ork {
    static Kingdoms : OrkKingdom[] = [];
    static Parks : OrkPark[] = [];

    static OrkURL = 'https://ork.amtgard.com/orkservice/Json/index.php';
  
    static async LoadKingdoms() : Promise<void> {
        const kingdoms : OrkKingdom[] = await jsork.kingdom.getKingdoms().then(kingdoms => {
            console.info("Got Kingdoms from Ork");
            return kingdoms;
        }, reason => {
            console.warn(`Unable to get Kingdoms from ORK for: ${reason}. Attempting to use CORS proxy.`)
            Ork.OrkURL = 'https://us-central1-ash-amtgard-awards.cloudfunctions.net/ork';
            return jsork.kingdom.getKingdoms();
        }).then(k => k, console.error);

        if (!kingdoms) return;
        
        console.info(kingdoms);

        let _p : Progress = new Progress("Loading Kingdoms", kingdoms.length);
        const sorted : OrkKingdom[] = kingdoms.sort(Ork.CompareKingdom);
        for (let kingdom of sorted) {
            Ork.Kingdoms[kingdom.KingdomId] = kingdom;
            // Create new selection option, add it.
            var NewKingdomOption = document.createElement("option");
            NewKingdomOption.textContent = kingdom.KingdomName;
            NewKingdomOption.value = kingdom.KingdomId;
            document.getElementById('Setting-Kingdom').appendChild(NewKingdomOption);
   
            let parks : OrkPark[] = await jsork.kingdom.getParks(kingdom.KingdomId).then(parks => parks, error => console.error(`Error retrieving Parks: ${error}`));
            Ork.Kingdoms[kingdom.KingdomId].Parks = parks;
            for (const Park of parks) {
                Ork.Parks[Number(Park.ParkId)] = Park;
            }
            _p.current++;
        }
        (document.getElementById('Setting-Kingdom') as HTMLSelectElement).disabled = false;
        _p.End();
    }

    static async LoadParks(KingdomId : string) : Promise<void> {
        let parkElem = document.getElementById('Setting-Park') as any;
        let kingdomElem = document.getElementById('Setting-Kingdom') as any;
        parkElem.disabled = true;
        parkElem.removeAllChildNodes();

        if (!KingdomId || KingdomId == 'Custom') return;

        parkElem.disabled = true;

        let parks : OrkPark[] = Ork.Kingdoms[KingdomId].Parks;
    
        var elNone = document.createElement("option");
        elNone.textContent = "None (Kingdom Level)";
        elNone.value = 'None';
        parkElem.appendChild(elNone);

        var sorted = parks.sort(Ork.ComparePark);
        for (const Park of sorted) {            
            // IDK WHY BUT A PARK HAS THIS ISSUE
            if (Park.Name.includes('\\\\\\')) Park.Name = Park.Name.replace('\\\\\\','');
            
            let NewParkOption = document.createElement("option");
            NewParkOption.textContent = Park.Name;
            NewParkOption.value = Park.ParkId;
            NewParkOption.classList.toggle('InactivePark', Park.Active != "Active");

            parkElem.appendChild(NewParkOption);
        }
        parkElem.disabled = false;
        kingdomElem.disabled = false;
    }
    

    static ProcessKingdomName(Kingdom : OrkKingdom) {
        /* Oh boy let's try and explain this clusterfuck. Basically kingdoms in the Ork have the their title rolled into one,
           rather than parks where something like 'Duchy' is seperate.

           So we have to use some regex wizardry to splice it up into the same format on the award templates that the parks use.
        */
        const result : any = {};
        const kingdomTitleSearch = /(?<UsesThe>The )?(?<RegionType>Kingdom |Empire )?(of )?(?<RegionName>.+)/;
        if (!kingdomTitleSearch.test(Kingdom.KingdomName)) {
            console.warn(`Can't parse Kingdom name for: ${Kingdom.KingdomName}, please contact reach out to the dev to fix this.`);
        }
        else if (Kingdom.KingdomName === "The Freeholds of Amtgard")
        {
            // Special snowflake case for something that will never be used, but it looks ugly when you first select it as the kingdom
            result.IssuerName = "its Freeholds"
            result.UseThe = false;
            result.UseOf = false;
            result.IssuerTitle = "";
        }
        else
        {
            let match = Kingdom.KingdomName.match(kingdomTitleSearch);
            result.IssuerName = match.groups.RegionName;
            result.UseThe = ((match.groups.RegionType !== undefined || match.groups.UsesThe !== undefined) ? true : false);
            result.UseOf = ((match.groups.RegionType !== undefined) ? true : false);
            result.IssuerTitle = (match.groups.RegionType === undefined ? "" : match.groups.RegionType);
        }
        return result;
    }

    static GetParkText() : { AwardText_IssuerTitle : string, AwardText_Issuer : string }
    {
        let result : { AwardText_IssuerTitle : string, AwardText_Issuer: string };
        let _name : string, _title : string;
        
        if (Ork.Kingdoms[Config.Kingdom])
        {
            _name = Ork.Kingdoms[Config.Kingdom].KingdomName;
        }

        if (!Config.IssuerName) return { AwardText_IssuerTitle: undefined, AwardText_Issuer: undefined };
        /*
            The below converts issuer description info into the actual text fields that the award template uses.
            I currently have a hard-coded thing to reformat the text that I might change in the future if I'm feeling warm and fuzzy.
        */

        if (Config.IssuerName.length <= 7)
        {
            result.AwardText_IssuerTitle = `${Config.UseThe ? 'the ' : ''}${Config.IssuerTitle}${Config.UseOf ? " of" : ""}`;
            result.AwardText_Issuer = `${Config.IssuerName}`;
        }
        else
        {
            result.AwardText_IssuerTitle = `${Config.UseThe ? 'the ' : ''}`;
            result.AwardText_Issuer = `${Config.IssuerTitle}${Config.UseOf ? " of" : ""} ${Config.IssuerName}`;
        }
        

        /*if (Award.Preview)
        {
            for (let [field, text] of Object.entries(Config.TextFields))
            {
                let elem = document.getElementById("AwardPreviewSVG").querySelector(`[name=${field}]`);
                if (elem && elem.innerHTML != text) elem.innerHTML = text;
            }
        }*/
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