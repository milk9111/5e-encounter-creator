
// only one object can have the 'default' key
const PartyPresets = [
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

// has an optional 'label' to override the header
const Headers = [
    {
        "key": "Name"
    }, 
    {
        "key": "CR"
    }, 
    {
        "key": "AC"
    },
    {
        "key": "HP"
    },
    {
        "key": "Speeds",
        "label": "Speed"
    }
];

const div = document.querySelector("#infinite-table");

let monsters = [];

function dropdownLoader() {
    for (let i = 0; i < PartyPresets.length; i++) {
        let preset = PartyPresets[i]; 

        let selected = "selected"
        if (!preset.default) {
            selected = "";
        }

        $("#partySelect").append(`<option value="${i}" ${selected}>${preset.count} party members of level ${preset.level} each</option>`);
    }
}

function monstersLoader() {
    $.when(
        $.get("data/monsters_official.csv"),
        $.get("data/monsters_homebrew.csv")
    ).done((official, homebrew) => {
        let officialMonsters = $.csv.toObjects(official[0]);
        let homebrewMonsters = $.csv.toObjects(homebrew[0]);

        monsters = officialMonsters.concat(homebrewMonsters);

        Headers.forEach((header) => {
            $("#monsterTableHeader").append(`<th>${header.label ?? header.key}</th>`)
        })
        
        monsters.forEach((monster) => {
            let row = "";
            Headers.forEach((header) => {
                row += `<td>${monster[header.key] ?? ""}</td>`
            })

            $("#monsterTableBody").append(`<tr>${row}</tr>`)
        })
    });
}

$(() => {
    dropdownLoader();
    monstersLoader();
});
