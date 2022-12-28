
// has an optional 'label' to override the output
const CRMap = {
    "0": {
        "xp": 10
    },
    "0.13": {
        "label": "1⁄8",
        "xp": 25
    },
    "0.25": {
        "label": "&frac14;",
        "xp": 50
    },
    "0.5": {
        "label": "&frac12;",
        "xp": 100
    },
    "1": {},
}

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
        "key": "Name",
        "attr": {
            "width": "40px"
        }
    }, 
    {
        "key": "CR"
    }, 
    {
        "key": "Type",
        "attr": {
            "width": "40px"
        }
    },
    {
        "key": "Font",
        "label": "Source",
        "attr": {
            "width": "40px"
        }
    }
];

let monsters = [];

let selectedMonsters = [];

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
        monsters = $.csv.toObjects(homebrew);

        let headers = [];
        let headersAttrs = [];
        for (let i = 0; i < Headers.length; i++) {
            let header = Headers[i];
            headers.push({title: header.label ?? header.key, data: header.key});
            if (header.attr) {
                header.attr["targets"] = i;
                headersAttrs.push(header.attr);
            }
        }

        headers.push({title: "", data: "t"});
        headersAttrs.push({targets: headers.length-1, orderable: false, searchable: false})

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

            m["t"] = `<a class="add" title="Add" data-toggle="tooltip"><i class="fas fa-plus-circle"></i></a>`

            data.push(m);
        });

        $("#dataTable").DataTable({
            data: data,
            columns: headers,
            columnDefs: headersAttrs,
            scrollY: "50vh",
            scrollCollapse: true,
            paging: false,
            fixedHeader: {
                header: true
            }
        });
    });
}

function addToSelectedMonsters(monster) {
    monster["id"] = Math.floor(Math.random() * Date.now()).toString(16);
    selectedMonsters.push(monster);

    $("#selectedMonsters").append(`
    <tr>
        <td>${monster.Name}</td>
        <td>CR ${monster.CR}</td>
        <td></td>
        <td></td>
    </tr>
    `)
}

function removeFromSelectedMonsters(monster) {

}

function calculateMonsterXPFromCR(cr) {

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

    $(document).on("click", ".delete", function(){
        $(this).parents("tr").remove();
    });
});
