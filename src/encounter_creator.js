
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
        "key": "Type"
    },
    {
        "key": "Font",
        "label": "Source"
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
        $.get("data/monsters_homebrew.csv")
    ).done((homebrew) => {
        let monsters = $.csv.toObjects(homebrew);

        let headers = [];
        Headers.forEach((header) => {
            headers.push({title: header.label ?? header.key, data: header.key});
        });

        let data = [];
        monsters.forEach((monster) => {
            if (isNaN(monster["CR"])) {
                return;
            }

            let m = {};
            Headers.forEach((header) => {
                if (header.key === "Font" && monster[header.key].startsWith("http")) {
                    let re = new RegExp("^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)");
                    let hostname = monster[header.key].match(re);

                    m[header.key] = `<a target="_blank" href="${monster[header.key]}">${hostname[1]} <i style="font-size: x-small;" class="fas fa-external-link-alt"></i></a>`
                } else {
                    m[header.key] = formatNumber(monster[header.key] ?? "");
                }
                
            });

            data.push(m);
        });

        $("#dataTable").DataTable({
            data: data,
            columns: headers,
            scrollY: "50vh",
            scrollCollapse: true,
            paging: false
        });
    });
}

function formatNumber(val) {
    if (isNaN(val)) {
        return val;
    }

    return parseFloat(val).toFixed(2).replace(/\.00$/, "");
}

$(() => {
    dropdownLoader();
    monstersLoader();
});
