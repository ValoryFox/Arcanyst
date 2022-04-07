const Version = {
    Version: '1.2.0',
    Subtitle: `Ash's Amtgard Award Sorcery<br/><small>By Valory Fox</small>`,
    PatchNotes: {
        'Version 1.2.0' : [
            "Here there be typescript.",
            "<a href='https://www.youtube.com/watch?v=Uo3cL4nrGOk' target='_blank'>Rewrote the codebase again.</a>",
            "Preloads all parks to cut down on glitchiness."
        ],
        'Version 1.1.2' : [
            "Cleaned up a lot of unused assets/code.",
            "Now loads patch notes, about, issues instead of having them in-line. Pretty meta, right?",
            "Fixed issue with pages not having proper breaks in-between.",
            "Adjusted spacing & dynamic size for text."
        ],
        'Version 1.1.1' : [
            "Fixed multi-line recipient names, added text scaling to issuer name and player names.",
            "Added an embed image when posted on other websites.",
            "Owl heraldry filter now works the first time it's loaded",
            "Various other minor fixes"
        ],
        'Version 1.1.0' : [
            "This is the first real version, so uhh, not writing patch notes from the unreleased 1.0 prototype, sorry."
        ]
    },
    KnownIssues: {
        'Awards' : [
            "No generic symbol for Rose & Owl.",
            "Flavour text sits too low on some awards at some ranks.",
            "Multiline on date/award giver not working properly."
        ],
        'Rendering' : [
        ]
    },
    About: `
        <h2>About the project</h2>
        <p>I've not been in Amtgard for long, but in that time I've seen awards be the main form of progression and recognition within the community. While it seems we may rely a little too heavily on awards to show appreciation, they are still of critical importance.</p>
        <p>For 15 years, people have used the same award templates made by Alona Twotrees, which were never intended for long-term use, and thus aren't polished final products, and use questionably sourced assets copyright wise. This is <b>not at all</b> to begrudge Alona, it's clear from the absense of alternatives that she stepped up in a way no one else has since, and has asked people since to stop using them.</p>
        <p>Regardless, I took it upon myself to make new templates, built to provide not just a better alternative design-wise, but with a website that makes issuing awards easier, and trivialises things such as adding heraldry.</p>
        <p>My hope is that everyone can have an award certificate they can be proud of, and help a little bit to close the gap in quality between templates and custom made scrolls.</p>
        <p>This effort has taken me hundreds of hours of work, I tried to keep a rough estimate but gave up about 200 hours in on doing so. I only hope that you use these and that they enrich the game wherever you are. If you wish to donate, the button is there to help justify the absurd amount of intensive design and programming time I put into this, as well as pay for any hosting fees.</p>
        <h2>Contact me</h2>
        <p>If you have issues, want to help out in some way, or have a feature request, you can reach out to me on <a href="https://www.facebook.com/valory.fox">Facebook</a>, or Discord at <code>them fatale#0001</code></p>
        <h3>Info for Monarchs</h3>
        <p>Monarchs of Amtgard! I'm willing to develop features or add award templates if wanted. In the future, I'd like to support adding entirely different sets of templates. If you have a line of templates for your kingdom and want them added in some form, please reach out to me!</p>
        <h2>Credits</h2>
        <ul>
            <li>Massive help with flavour text by Kisa (Shelly Alexandra).</li>
            <li>Icons (for website) used from <a href="https://icons8.com/">icons8.com</a>.</li>
        </ul>
    `,
    Load: function() {
        document.getElementById('Version_Number').innerHTML = `V${Version.Version}`;   
        document.getElementById('Version_Subtitle').innerHTML = Version.Subtitle;
        document.getElementById('InfoSection_About').innerHTML = Version.About;

        const createContent = function(tag, content, parent) { 
            let elem = document.createElement(tag);
            if (content) elem.innerHTML = content;
            parent.appendChild(elem);
            return elem;
        }

        const populateInfo = function(info, parent, heading)
        {
            const fragment = new DocumentFragment();
            createContent('h2', heading, fragment);
            for (const [header, lines] of Object.entries(info))
            {
                createContent('h3', header, fragment)
                const list = createContent('ul', null, fragment)
                for (const line of lines)
                    createContent('li', line, list);
    
            }
            parent.appendChild(fragment);
        }
        populateInfo(Version.PatchNotes, document.getElementById('InfoSection_Patch'), 'Patch Notes')
        populateInfo(Version.KnownIssues, document.getElementById('InfoSection_Issues'), 'Known Issues')
    }
}