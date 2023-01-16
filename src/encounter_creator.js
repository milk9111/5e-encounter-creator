const PCEncounterDifficulty = {
    1: [25, 50, 75, 100],
    2: [50, 100, 150, 200],
    3: [75, 150, 225, 400],
    4: [125, 250, 375, 500],
    5: [250, 500, 750, 1100],
    6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700],
    8: [450, 900, 1400, 2100],
    9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800],
    11: [800, 1600, 2400, 3600],
    12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100],
    14: [1250, 2500, 3800, 5700],
    15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200],
    17: [2000, 3900, 5900, 8800],
    18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900],
    20: [2800, 5700, 8500, 12700],
}

// has an optional 'label' to override the output
const CRMap = {
    0: {"xp": 10},
    0.13: {
        "xp": 25
    },
    0.25: {
        "xp": 50
    },
    "0.50": {
        "xp": 100
    },
    1: {"xp": 200},
    2: {"xp": 450},
    3: {"xp": 700},
    4: {"xp": 1100},
    5: {"xp": 1800},
    6: {"xp": 2300},
    7: {"xp": 2900},
    8: {"xp": 3900},
    9: {"xp": 5000},
    10: {"xp": 5900},
    11: {"xp": 7200},
    12: {"xp": 8400},
    13: {"xp": 10000},
    14: {"xp": 11500},
    15: {"xp": 13000},
    16: {"xp": 15000},
    17: {"xp": 18000},
    18: {"xp": 20000},
    19: {"xp": 22000},
    20: {"xp": 25000},
    21: {"xp": 33000},
    22: {"xp": 41000},
    23: {"xp": 50000},
    24: {"xp": 62000},
    25: {"xp": 75000},
    26: {"xp": 90000},
    27: {"xp": 105000},
    28: {"xp": 120000},
    29: {"xp": 135000},
    30: {"xp": 155000},
    "VARIES": {
        "label": "Varies",
        "xp": "Varies"
    }
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
            "width": 50
        }
    }, 
    {
        "key": "CR",
        "attr": {
            "width": 5,
            "type": "num"
        }
    }, 
    {
        "key": "Type",
        "attr": {
            "width": 30
        }
    },
    {
        "key": "Font",
        "label": "Source",
        "attr": {
            "width": 60
        }
    },
    {
        "key": "Author",
        "attr": {
            "visible": false
        }
    }
];

let allowAnimations = false;

let monsters = {};

let selectedMonsters = [];

let partyBudgets = [];

function dropdownLoader() {
    let selectedParty = {};
    for (let i = 0; i < PartyPresets.length; i++) {
        let preset = PartyPresets[i]; 

        let selected = "";
        if (preset.default != undefined && preset.default) {
            selected = "selected";
            selectedParty = preset;
        }

        $("#partySelect").append(`<option value="${i}" ${selected}>${preset.count} party members of level ${preset.level} each</option>`);
    }

    if (selectedParty === {}) {
        selectedParty = PartyPresets[0];
    }

    calculatePartyBudgets(selectedParty);
}

let onCoreOnly = () => {
    console.log("clicked");
}

function monstersLoader() {
    $.when(
        $.get("data/monsters_homebrew.csv")
    ).done((homebrew) => {
        let mnstrs = $.csv.toObjects(homebrew);

        let headers = [];
        let headersAttrs = [];
        for (let i = 0; i < Headers.length; i++) {
            let header = Headers[i];
            let col = {title: header.label ?? header.key, data: header.key}
            if (header.attr) {
                header.attr["targets"] = i;
                headersAttrs.push(header.attr);

                if (header.attr.width) {
                    col["width"] = header.attr.width;
                }
            }

            headers.push(col);
        }

        let data = [];
        for (let i = 0; i < mnstrs.length; i++) {
            let monster = mnstrs[i];

            monster.CR = formatCR(monster.CR);

            let m = {};
            Headers.forEach((header) => {
                if (header.key === "Font" && monster[header.key].startsWith("http")) {
                    let re = new RegExp("^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)");
                    let hostname = monster[header.key].match(re);

                    m[header.key] = `<a target="_blank" href="${monster[header.key]}">${hostname[1]} <i style="font-size: x-small;" class="fas fa-external-link-alt"></i></a>`
                } else {
                    m[header.key] = monster[header.key];
                }
            });

            monster["id"] = Math.floor(Math.random() * Date.now()).toString(16);
            m["id"] = monster.id;

            headersAttrs[0].render = function(d, type, row, meta) {
                return `
                <div class="add-holder">
                    <a class="add" title="Add" data-toggle="tooltip" name="${row.id}">
                        <i class="fas fa-plus-circle"></i>
                    </a>
                    <span>${d}</span>
                </div>                
                `;
            }

            monsters[monster.id] = monster;

            data.push(m);
        }

        $("#dataTable").DataTable({
            data: data,
            columns: headers,
            columnDefs: headersAttrs,
            scrollY: "50vh",
            scrollX: true,
            scrollCollapse: true,
            paging: false,
            "dom": "frt",
            initComplete: () => {
                allowAnimations = true;
            }
        });
    });
}

function addToSelectedMonsters(id) {
    let monster = monsters[id];

    selectedMonsters.push(monster.id);

    $("#selectedMonsters").append(`
    <tr>
        <td><a style="text-decoration: none;" class="delete" title="Delete" data-toggle="tooltip" name="${monster.id}">
        <i class="fas fa-minus-circle"></i>
    </a></td>
        <td><div class="row" style="padding-right: 10px;">
        <p style="margin-bottom: 0;">${monster.Name}</p>
    </div></td>
        <td>CR ${monster.CR}</td>
        <td>${CRMap[monster.CR].xp} XP</td>
    </tr>
    `)
}

function removeFromSelectedMonsters(id) {
    let index = -1;
    for (let i = 0; i < selectedMonsters.length; i++) {
        if (selectedMonsters[i] === id) {
            index = i;
            break;
        }
    }

    if (index > -1) {
        selectedMonsters.splice(index, 1);
    }
}

function calculatePartyBudgets(party) {
    let easy = PCEncounterDifficulty[party.level][0] * party.count;
    let medium = PCEncounterDifficulty[party.level][1] * party.count;
    let hard = PCEncounterDifficulty[party.level][2] * party.count;
    let deadly = PCEncounterDifficulty[party.level][3] * party.count;

    partyBudgets = [easy, medium, hard, deadly];
    $("#partyBudget").html(`<span style="color: green;">${easy} XP</span> | <span style="color: gray;">${medium} XP</span> | <span style="color: rgb(201, 151, 15);">${hard} XP</span> | <span style="color: rgb(221, 18, 18);">${deadly} XP</span>`)
    
    if (!allowAnimations) {
        return;
    }

    let difficultyTiers = $("label[for='partyBudget'],#partyBudget span");
    for (let i = 0; i < difficultyTiers.length; i++) {
        $(difficultyTiers[i]).css('font-weight', 'italic');
        let originalColor = $(difficultyTiers[i]).css("color");
        $(difficultyTiers[i]).delay(i * 200).animate({
            color: "#0000FF"
          }, 500 , function() {
            $(difficultyTiers[i]).animate(
                {
                    color: originalColor
                }, 500
            );
        });
    }
}

function calculateDifficultyTotal() {
    if (selectedMonsters.length === 0) {
        $("#difficultyTotal").html("");
        return;
    }

    let difficultyTotal = 0; 
    selectedMonsters.forEach((id) => {
        difficultyTotal += CRMap[monsters[id].CR].xp;
    });

    let multiplier = 1;
    if (selectedMonsters.length === 2) {
        multiplier = 1.5;
    }

    if (selectedMonsters.length >= 3 && selectedMonsters.length <= 6) {
        multiplier = 2;
    }

    if (selectedMonsters.length >= 7 && selectedMonsters.length <= 10) {
        multiplier = 2.5;
    }

    if (selectedMonsters.length >= 11 && selectedMonsters.length <= 14) {
        multiplier = 3;
    }

    if (selectedMonsters.length >= 15) {
        multiplier = 4;
    }

    difficultyTotal = Math.round(difficultyTotal * multiplier);
    let difficultyTotalParsed = parseFloat(difficultyTotal).toFixed(2).replace(/\.00$/, "");

    let diff = `<span style="color: green">Easy (${difficultyTotalParsed} XP Adj.)</span>`;

    if (difficultyTotal >= partyBudgets[1]) {
        diff = `<span style="color: gray">Medium (${difficultyTotalParsed} XP Adj.)</span>`;
    }

    if (difficultyTotal >= partyBudgets[2]) {
        diff = `<span style="color: rgb(201, 151, 15);">Hard (${difficultyTotalParsed} XP Adj.)</span>`;
    }

    if (difficultyTotal >= partyBudgets[3]) {
        diff = `<span style="color: rgb(221, 18, 18);">Deadly (${difficultyTotalParsed} XP Adj.)</span>`;
    }

    $("#difficultyTotal").html(diff);
}

function formatCR(val) {
    if (isNaN(val)) {
        return val;
    }

    return parseFloat(val).toFixed(2).replace(/\.00$/, "");
}

$(() => {
    dropdownLoader();
    monstersLoader();

    $(document).on("click", ".delete", function(){
        let id = $(this).attr("name");
        $(this).parents("tr").remove();
        removeFromSelectedMonsters(id);
        calculateDifficultyTotal();
    });

    $(document).on("click", ".add", function(){
        addToSelectedMonsters($(this).attr("name"));
        calculateDifficultyTotal();
    });

    $('select').on('change', function() {
        calculatePartyBudgets(PartyPresets[this.value]);
        calculateDifficultyTotal();
    });

    $("#wotcOnly").change(() => {
        let search = "";

        let checked = false; 
        if ($("#wotcOnly").is(":checked")) {
            search = "Wizards of the Coast";
            checked = true;
        }

        let i = 0; 
        for (; i < Headers.length; i++) {
            if (Headers[i].key == "Author") {
                break;
            }
        }

        $('#dataTable')
        .DataTable()
        .column(i)
        .search(
            search
        )
        .draw();
    });
});
