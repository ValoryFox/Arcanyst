const Version = {
    Version: '1.1',
    Subtitle: `Ash's Amtgard Award Sorcery<br/><small>By Valory Fox</small>`,
    KnownIssues: `<h2>Bugs</h2>
    <ul>
        <li>Glitches printing owl awards directly from the browser.</li>
        <li>HUGE memory usage when exporting all award blanks to a .zip, particularly on Firefox.</li>
    </ul> 
    `,
    Load: function() {
        document.getElementById('Version_Number').innerHTML = `V${Version.Version}`;   
        document.getElementById('Version_Subtitle').innerHTML = `${Version.Subtitle}`;   
    }
}