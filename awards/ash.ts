'use-strict';


(function() {
    let common = "awards/common/" 

    OrderOfTheBattle : {
        let awd = "battle"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`
        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].variants = ["martial", "arcane"]
        Award.Orders[awd].flavour = [
            "To reflect your exceptional abilities on the battlefield", // Generic
            "May you continue to impress on the battlefield.",
            "You never hesitate to enter the fray.",
            "May your blade ever sing.",
            "To reflect your tireless energy within the fray.",
            "Not with a whisper, but with a roar.",
            "Your prowess in battle is admirable.",
            "Songs will be written of your talents in battle.",
            "You answer the call to battle with unparalleled dominance.",
            "You claim the respect of opponents and applause of the world.",
            "Tales of your valorous battles echo through the ages."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award: Award)
        {
            let path = Award.Orders[awd].path;
            let theme = { primary: "hsl(0, 57%, 61%)", secondary: "hsl(30, 55%, 80%)" };
            let symbolPosition = { x : 275, y : 2137.5, width : 2000, height: 1200 };
            
            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await Award.Components.Border(context, theme);
                    await context.AddImage(`${path}/border_symbols.png`, { mode: 'multiply' }, new Position(-5, -40, 2291, 291), Origin.Centre);
                    // Other stuff that applies to all ranks

                }, `${awd}-border_heraldry_parchment`);

                // Rank Specific stuff
                if (award.variant == "martial")
                    await context.AddImage(`${path}/${award.variant}/symbol_${award.rank == 0 ? 4 : award.rank}.png`, { mode: 'multiply' }, symbolPosition);
                else if (award.variant == "arcane")
                    await context.AddImage(`${path}/${award.variant}/hand.png`, { mode: 'multiply' }, symbolPosition);
                

                if (award.variant == "martial" && award.rank >= 6)
                    await context.AddImage(`${path}/${award.variant}/over_${award.rank}.png`, symbolPosition);
                else if (award.variant == "arcane")
                    await context.AddImage(`${path}/${award.variant}/symbol_${award.rank == 0 ? 6 : award.rank}.png`, symbolPosition);
                if (award.rank != 0)
                    await context.AddImage(`${common}/rank_${award.rank}.png`, { x : 1132, y : (award.rank < 9 ? 3032 : 3045), width : 292, height: 171 }); 
                
                
            }, null, { draw_type: 'jpeg' });

            await Award.Components.Text(context, award, { 'section.SignAndDate' : 'min-height:550px;' });
            return context;
        });
    }
    
    OrderOfTheCrown: {
        let awd = "crown"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "To reflect your passion and commitment for Amtgard and the community",
            "To reflect your honorable service to the community.",
            "This reflects your initiative and achievements as a leader.",
            "Your leadership is an inspiration to others.",
            "To reflect your authentic leadership and dedicated service",
            "To reflect your ability to motivate and inspire others through service to the crown.",
            "Your service to the crown is exemplary.",
            "You've proven yourself a reliable and dedicated leader within our community.",
            "To reflect your engagement and effort in leading our community",
            "You've earned the eternal respect and admiration of your subjects.",
            "Your dedication is unwavering and service exemplary, your leadership makes Amtgard the community it is."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award) 
        {   
            let path = Award.Orders[awd].path;
            let theme = { primary: "hsl(41, 93%, 55%)", secondary: "hsl(0, 7%, 35%)" };
      
            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await Award.Components.Border(context, theme);
                    // Other stuff that applies to all ranks
                    await context.AddImage("resources/elements/border-primary.svg", { mode: "color-dodge", opacity: 0.7,
                    _svg: { style: `filter:blur(13px);fill:${theme.primary};`} });

                }, `${awd}-border_heraldry_parchment`);

                // Rank Specific stuff
                await context.AddImage(`${path}/symbol_${award.rank}.png`);
                
            },null, { draw_type: 'jpeg' });

            await Award.Components.Text(context, award, { 'section.SignAndDate' : 'min-height:400px;' });

            return context;
        });
    }
    OrderOfTheDragon : {
        let awd = "dragon"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "To reflect your impressive and continued artistic accomplishments.",
            "To reflect your entry into the Amtgard arts, we hope this is only the beginning of your journey.",
            "To reflect your further accomplishments in the arts of Amtgard.",
            "To reflect your continuing and developing accomplishments in the arts.",
            "To reflect your persistent and outstanding artistic creations.",
            "To reflect your impressive and continued artistic accomplishments.",
            "Your dedication and hard work has shone through in all of your creations.",
            "Your skills in the arts are unquestionable, we can only hope to see more in the future.",
            "Your expertise and artistry is truly extraordinary.",
            "The arts are your domain.",
            "May your zeal continue weaving beauty into the world."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;
            let theme = { primary: "hsl(114, 57%, 37%)", secondary: "hsl(41, 93%, 55%)" };

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await Award.Components.Border(context, theme);
    
                    await context.AddImage(`${path}/dragons.png`, { mode: 'multiply' });
                    await context.AddImage("resources/elements/border-secondary.svg", { mode: "color-dodge", opacity: 0.7,
                    _svg: { style: "filter:blur(13px);" + `fill:${theme.secondary};`} });

                }, `${awd}-border_heraldry_parchment`);

                let symbol_location = new Position(0, -55, 1264, 867);
                await context.AddImage(`${path}/under_${award.rank}.png`, { mode: 'multiply' }, symbol_location, Origin.CentreBottom);
                
                if (award.rank >= 6)  
                    await context.AddImage(`${path}/over_${award.rank}.png`, symbol_location, Origin.CentreBottom);    
                if (award.rank != 0) await context.AddImage(`${common}/rank_${award.rank}.png`, new Position(0, -105, 292, 171), Origin.CentreBottom );
                
            },null, { draw_type: 'jpeg' });
            
            await Award.Components.Text(context, award, { 'section.SignAndDate': 'min-height:650px;' });

            return context;
        });
    }


    OrderOfTheFlame: {
        let awd = "flame"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture.",
            "Your collective accomplishments set a standard for Amtgard culture."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await context.AddImage(`${path}/bg.jpg`);
                    await Award.Components.Heraldry(context);
                }, "border_heraldry_flameParchment");
                

                // Rank Specific stuff
                if (award.rank != 0) await context.AddImage(`${path}/rank_${award.rank}.png`);
                
            }, null, { draw_type: 'jpeg' });

            await Award.Components.Text(context, award);

            return context;
        });
    }

    OrderOfTheSmith: {
        let awd = "smith"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy.",
            "Reflecting your creation of the amazing and fantastical for others to enjoy."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            
            let path = Award.Orders[awd].path;

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await context.AddImage(`${path}/bg.jpg`);
                    await Award.Components.Heraldry(context);
                }, "border_heraldry_smithParchment");
                
                // Rank Specific stuff
                await context.AddImage(`${path}/symbol.png`, { mode: 'multiply'}, new Position(0, -50, 868, 440), Origin.CentreBottom);
                await context.AddImage(`${path}/symbol.png`, { opacity: 0.3 }, new Position(0, -50, 868, 440), Origin.CentreBottom);
                
            }, 'symbol_border_heraldry_smithParchment', { draw_type: 'jpeg' });

            await Award.Components.Text(context, award);

            return context;
        });
    }
    OrderOfTheGarber: {
        let awd = "garber"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "To reflect your extraordinary abilities in the art of making garb",
            "This reflects your entry into the art of garbing, we hope this is only the beginning of your journey.",
            "To reflect your further accomplishments in the art of garbing.",
            "The path of creation is fraught with setbacks, but you persevere.",
            "May you continue to delight others with your talents.",
            "You transmute fabric to garb with skill and tireless effort.",
            "Each stitch with your needle brings joy to others.",
            "To reflect your sincere and renowned craft.",
            "Your needle carries not just thread, but wonder and joy.",
            "You bring a spark of magic to each and every bolt of cloth you touch.",
            "Your unique and magical creations come from countless hours of work and practice."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;
           
            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await context.AddImage(`${path}/linen.jpg`);
                    await Award.Components.Heraldry(context, new Position(0, 35, 380, 380));
                    await context.AddImage(`${path}/overlay.png`);
                }, `${awd}-border_heraldry_fabric`);

                // Rank Specific stuff
                await context.AddImage(`${path}/rank_${award.rank}.png`);
            }, null, { draw_type: 'jpeg' });
                       
            await Award.Components.Text(context, award, { 'section.SignAndDate': 'min-height:500px;' });
            
            return context;
        });
    }

    OrderOfTheGriffon : {
        let awd = "griffon"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "To reflect your unwavering honor upon the battlefield",
            "This reflects your integrity as a combatant.",
            "Even in battle, you take care of those around you.",
            "You've shown great honour as a fighter and friend.",
            "This reflect your magnanimity and uprightness upon the field of battle.",
            "This reflects your consistent and exemplary conduct.",
            "You conduct yourself with dignity and honor on the battlefield",
            "To pay tribute to your resolute honor in battle.",
            "You're an exceptional fighter, both in skill and in compassion.",
            "You're an examplar in honour, respect, and care for your fellow players.",
            "In victory or defeat, to enemy or ally, your honour on the field of battle is second to none."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;
    
            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await context.AddImage(`${path}/griffons.svg`, { mode: 'multiply' },
                     { _svg: { style: "--primary-color:hsl(35, 29%, 55%); --secondary-color:hsl(34, 72%, 78%);" } });
    
                }, "griffon-border_heraldry_parchment");

                let symbolPosition = new Position(0, 0, 1100, 850);
                await context.AddImage(`${path}/symbol_${award.rank == 0 ? 5 : award.rank}.png`, { mode: 'soft-light' }, symbolPosition, Origin.CentreBottom);
                await context.AddImage(`${path}/symbol_${award.rank == 0 ? 5 : award.rank}.png`, { mode: 'soft-light' }, symbolPosition, Origin.CentreBottom);
                let rankSymbolPosition = [2980, 3020, 3020, 3020, 3020, 2670, 2670, 2670, 2910, 2910];

                if (award.rank != 0)
                    await context.AddImage(common + "rank_" + award.rank + ".png", new Position(0, rankSymbolPosition[award.rank - 1], 292, 171), Origin.CentreTop);
            }, null, { draw_type: 'jpeg' });
            
            
            await Award.Components.Text(context, award, { 'section.SignAndDate': 'min-height:500px;' });

            return context;
        });
    }
    OrderOfTheJovious: {
        let awd = "jovious"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title, theme: { primary: "#ffffff", secondary: "#555555" }};
        Award.Orders[awd].flavour = [
            "Your presence lifts the spirits of those around you.",
            "This award represents your commendable kindness and positivity.",
            "May you continue to bring joy and positivity to our community.",
            "May you continue to bring smiles to all those around you.",
            "The compassionate and selfless will outlast the bitter and cold.",
            "Your power to lift others up is stronger than the mightiest blade.",
            "You go above and beyond in making sure all feel welcome and appreciated.",
            "Your continual kindness has helped cultivate a positive environment for all those in Amtgard.",
            "Your presence is synonymous with happiness and comfort, and has helped countless in our community.",
            "Your kindness, passion and positivity all have a profound impact on all those around you.",
            "You are a shining beacon of compassion and kindness, igniting a flame of joy even in the darkest nights. You represent the best of Amtgard."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;            
            
            await context.Group(async function(context) {
                await context.Group(async function(context) {
                    await context.AddImage(`${path}/bg.jpg`);
                    await Award.Components.Heraldry(context);
                }, `${awd}-border_heraldry_fabric`);

                
                await context.AddImage(`${path}/symbol_${award.rank}.png`, { width: 550, height: 625, x: 1000, y: 2675});
            }, null, { draw_type: 'jpeg' });

            await Award.Components.Text(context, award);

            return context;
        });
    }
    OrderOfTheLion : {
        let awd = "lion"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "To bring recognition to your willingness to serve.",
            "To put others before oneself is the true show of a leader.",
            "To reflect your service and generosity to those around you.",
            "Your selflessness and dedication are reflections of your character.",
            "Your actions inspire and guide others through your actions to serve.",
            "May you continue to lead by example through service.",
            "To reflect on your consistent and continued service to Amtgard.",
            "To reflect your exemplary leadership beyond the call of duty.",
            "You lead by example and show service through your actions. No matter where you are, you strive to help.",
            "The faith others have in your decisions and ability speaks to your astounding dedication and capability as a leader.",
            "Day or night, rain or shine; through your tireless dedication, you are the tip of the spear in moving Amtgard into its future."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;
    
            await context.Group(async function(context) {
                await context.Group(async function(context) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await context.AddImage(`${path}/border.png`, { mode: 'multiply' });
                    await context.AddImage(`${path}/border.png`, { mode: 'soft-light', opacity:0.3 });
    
                }, "lion-border_heraldry_parchment");

                let symbolPosition = new Position(0, -25, 650, 725);
                await context.AddImage(`${path}/symbol_${award.rank}.png`, { mode: 'multiply' }, symbolPosition, Origin.CentreBottom);
                await context.AddImage(`${path}/symbol_${award.rank}.png`, { mode: 'screen', opacity:0.3 }, symbolPosition, Origin.CentreBottom);
            },null, { draw_type: 'jpeg' });
            
            await Award.Components.Text(context, award, { 'section.SignAndDate': 'min-height:500px;' });

            return context;
        });
    }
    OrderOfTheMask : {
        let awd = "mask"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "You embody your character with enrapturing grace.",
            "To reflect on your dedication and enjoyment of roleplay.",
            "You are a shining example of roleplay at its finest.",
            "For your genuine talent in roleplay.",
            "To reflect on your exceptional roleplay and genuine dedication to Amtgard.",
            "To recognize your dedication to the craft of roleplay.",
            "The mundane disappears when you walk into the game.",
            "The mask is your friend and you wear it well.",
            "You bring the spark of wonder and fantasy to the stories you weave with others.",
            "You carry the heart of story and wonder wherever you go, and bring a magnetic believability to all you embody.",
            "Tales follow wherever you go."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);
                    
                    await context.AddImage(`${path}/border.png`, { mode: 'screen', opacity: 0.6 });
                    await context.AddImage(`${path}/border.png`, { mode: 'multiply', opacity: 1 });
                    
                    // Other stuff that applies to all ranks
                    
                }, `${awd}-border_heraldry_parchment`);

                // Rank Specific stuff
                if (award.rank != 0) await context.AddImage(`${common}/rank_${award.rank}.png`, new Position(0, (award.rank < 9 ? -437 : -424), 292, 171), Origin.CentreBottom);
                await context.AddImage(`${path}/symbol.png`, new Position(0, 0, 540, 685), Origin.CentreBottom);
                if (award.rank != 0) await context.AddImage(`${common}/rank_${award.rank}.png`, { opacity: 0.6 }, new Position(0, (award.rank < 9 ? -437 : -424), 292, 171), Origin.CentreBottom);
                
            }, null, { draw_type: 'jpeg' });
            
            await Award.Components.Text(context, award, { 'section.SignAndDate': 'min-height:400px;' });
               
            return context;
        });
    }

    OrderOfTheOwl: {
        let awd = "owl"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "The practice and effort of your craft is commendable.",
            "To reflect your valuable contributions as a craftsman",
            "To reflect your talents as a craftsman, may you continue your journey in the crafts",
            "To reflect your continued effort in honing your craft.",
            "To reflect your outstanding examples of craftsmanship",
            "You are a shining example of dedicated practice and craftsmanship.",
            "May you continue to grace us with your talents",
            "To reflect your sterling talents as a craftsman",
            "Your crafts are an magnificent example of your talents",
            "Your craftsmanship is consistently immaculate and an honour to have within Amtgard.",
            "You are a industrious and talented artisan, having honed your craft and set new standards of quality."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;
            let cyanotypeFilter = "#OWL_edge-detect";
    
            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await context.Group(async function(context : AwardContext) {  
                        await context.AddImage(`${path}/cyanotype.jpg`);
                        await context.AddImage(`${path}/award_overlay.svg`, { style: "pointer-events:none;"});
                    }, "border_cyanotype");
                    if (Config.Heraldry)
                    {
                        for (let i=0;i<=1;i++)
                        await context.AddImage(Config.Heraldry, { mode: "screen" }, Origin.CentreTop, new Position(0, 5, 370, 460),
                            { _canvas: { _constrain: true, filter: `url("${cyanotypeFilter}")` }}); 
                    }
                    // Other stuff that applies to all ranks

                }, `${awd}-border_heraldry_cyanotype`);

                // Rank Specific stuff
                if (award.rank != 0)
                    await context.AddImage(`${path}/rank_${award.rank}.png`, new Position(0, -75, 650, 450), Origin.CentreBottom);
                
            }, null, { draw_type: 'jpeg' });
            await Award.Components.Text(context, award, {'.Award': 'color:#dddde4;', 'img': 'filter:invert();' }); 
            
            return context;
        });
    }

    OrderOfTheRose: {
        let awd = "rose"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            "Acts of service reflect the heart of the giver", // Generic
            "Even the smallest acts can cause the biggest change",
            "To perform an act of service helps another, to continue those acts helps a community.",
            "It is the actions of others that serve their community which inspire us to serve ourselves.",
            "The strong stand up for themselves. The stronger stand up for others.",
            "It is only through dedication to others where see the greatest change in ourselves",
            "To bring others together and build a community takes the acts of a compassionate soul.",
            "You honor others through your selflessness",
            "You help build a better community through every act of service",
            "Through continued acts of service. You inspire others to better a community they love.",
            "Your dedication and willingness to help the community must never be forgotten."
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path;

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    await Award.Components.HeraldryParchment(context);                   

                    await context.AddImage(`${path}/border.png`, { mode: 'multiply' });
                    await context.AddImage(`${path}/border.png`, { opacity: 0.85 });
                    // Other stuff that applies to all ranks

                }, `${awd}-border_heraldry_parchment`);

                // Rank Specific stuff
                if (award.rank != 0)
                    await context.AddImage(`${path}/rank_${award.rank}.png`, new Position(965, 2870, 620, 400));
                
            },null, { draw_type: 'jpeg' });
            
            await Award.Components.Text(context, award, {'.Award': 'padding:20% 17% 15% 17%;'});

            return context;
        });
    }

    OrderOfTheWarrior: {
        let awd = "warrior"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`
        
        Award.Orders[awd] = { ranks : { from: 1, to: 10}, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = {
            1  : "This only represents the start of your journey in becoming a truly feared combatant.",
            2  : "Your drive to improve and embody a warrior's spirit is admirable.",
            3  : "With practice your blade has found ever increasing alacrity.",
            4  : "You've proven your might and strength versus your foes.",
            5  : "Your eyes seek the slightest opening, and your weapon shortly follows.",
            6  : "Your relentless courage and ferocity leave your foes little time to regroup.",
            7  : "You fight with celerity and valor, a deadly opponent even against the best.",
            8  : "Woe be to those who let their guard down against you on the battlefield.",
            9  : "Your unparalleled martial prowess evokes awe and fear across the lands.",
            10 : "Neither the flame of your fighting spirit, nor the tales of your martial feats shall ever be extinguished.<br/><br/>To say you've reached the apex of your ability would be to drastically underestimate you."
        };
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path; 
            let style = {
                2: { 'section.SignAndDate': 'min-height:500px;' },
                3: { 'section.SignAndDate': 'min-height:600px;' },
                4: { 'section.SignAndDate': 'min-height:500px;' },
                5: { 'section.SignAndDate': 'min-height:650px;' },
                6: { 'section.SignAndDate': 'min-height:500px;' },
                8: { 'section.SignAndDate': 'min-height:800px;' },
                9: { 'section.SignAndDate': 'flex-direction:column;row-gap:1em;justify-content:flex-end;min-height:750px;', '.Award': 'padding-bottom: 18%;' }
            }
            await context.Group(async function(context : AwardContext) {
                switch (award.rank)
                {
                    case 10:
                        await context.AddImage(`${path}/bg_${award.rank}.jpg`)
                        await Award.Components.Heraldry(context);
                        break;
                    default:
                        await Award.Components.HeraldryParchment(context);
                        await context.AddImage(`${path}/border_${award.rank}.jpg`, { mode: 'multiply' });
                        break;
                }
                
            },null, { draw_type: 'jpeg' });

            switch (award.rank)
            {
                case 9:
                    await context.AddImage(`${path}/symbol_${award.rank}.png`, { height: 1100 }, Origin.CentreBottom );
            }
            
            await Award.Components.Text(context, award, style[award.rank] || {});
        
            return context;
        });
    }

    OrderOfTheZodiac: {
        let awd = "zodiac"
        let awd_title = `Order of the ${awd.capitalizeFirstLetter()}`

        Award.Orders[awd] = { ranks : { from: 0, to: 10 }, path : `awards/${awd}`, title : awd_title};
        Award.Orders[awd].flavour = [
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`,
            `To reflect your exemplary contributions<<MONTH>>.`
        ];
        Award.Orders[awd].LoadAward = (async function(context : AwardContext, award : Award)
        {
            let path = Award.Orders[awd].path; 

            await context.Group(async function(context : AwardContext) {
                await context.Group(async function(context : AwardContext) {
                    if (award.rank != 0)
                        await context.AddImage(`${path}/bg_rank.jpg`);
                    else
                        await context.AddImage(`${path}/bg_generic.jpg`);
                    await Award.Components.Heraldry(context, { x: -5, y: 100, width: 360, height: 360 });
                }, `border_heraldry_zodiacParchment${award.rank != 0 ? "ranked" : "unranked"}`);
                

                // Rank Specific stuff
                if (award.rank != 0) await context.AddImage(`${path}/rank_${award.rank}.png`);
                
            },null, { draw_type: 'jpeg' });


            let style = {'.SignAndDate' : 'width:130%;', '.Award': 'padding:21% 20% 12% 20%;'};
            //nodes['.ZodiacElem'] = { 'style': 'display:inline;'}
            if (award.rank == 0) style['section.SignAndDate'] = 'width:90%;flex-basis:500px;min-height:500px';
            if (award.rank != 0) style['section.SignAndDate>div:first-child'] = 'margin-left:0.6em;';

            await Award.Components.Text(context, award, style);
        
            return context;
        });
    }


    Award.List.sort();
}());