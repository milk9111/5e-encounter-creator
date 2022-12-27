
const partyPresets = [
    {
        "count": 4,
        "level": 6,
        "default": true
    },
    {
        "count": 4,
        "level": 7
    },
    {
        "count": 4,
        "level": 8
    }
];

let monsters = [];

function dropdownLoader() {
    
    for (let i = 0; i < partyPresets.length; i++) {
        preset = partyPresets[i]; 

        let selected = "selected"
        if (!preset.default) {
            selected = "";
        }

        $("#partySelect").append(`<option value="${i}" ${selected}>${preset.count} party members of level ${preset.level} each</option>`);
    }
}

function monstersLoader() {

}

$(() => {
    dropdownLoader();

    $.get("data/monsters_official.csv", function( CSVdata) {
        console.log(CSVdata);
        // CSVdata is populated with the file contents...
        // ...ready to be converted into an Array
         data = $.csv.toObjects(CSVdata);
         console.log(data)
     });
});
