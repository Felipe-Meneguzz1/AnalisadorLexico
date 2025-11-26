let words = [];
let states = [[]];
let statesGlobal = 0;
let Tabela = [];

function testWord(word){
    return /^[a-zA-Z]+$/.test(word);
}

function registerStates() {
    states = [[]];
    statesGlobal = 0;

    for (let word of words) {
        let currentState = 0;
        word = word.toLowerCase();

        for (let i = 0; i < word.length; i++) {
            let char = word[i];
            
            if (typeof states[currentState][char] === "undefined") {
                let nextState = statesGlobal + 1;
                states[currentState][char] = nextState;
                states[nextState] = [];
                statesGlobal = nextState;
                currentState = nextState;
            } else {
                currentState = states[currentState][char];
            }

            if (i === word.length - 1) {
                states[currentState]["final"] = true;
            }
        }
    }
}
function generateTable() {
    let tableData = [];
    
    for (let i = 0; i < states.length; i++) {
        let row = { state: i };
        
        for (let j = 97; j <= 122; j++) { // a-z
            let letter = String.fromCharCode(j);
            row[letter] = states[i][letter] !== undefined ? states[i][letter] : "-";
        }
        
        if (states[i]["final"]) {
            row["final"] = true;
        }
        
        tableData.push(row);
    }
    
    return tableData;
}

function renderTable(tableData) {
    const table = document.getElementById("automato");
    const container = document.getElementById("tableContainer");
    
    if (tableData.length === 0) {
        table.style.display = "none";
        container.querySelector(".empty-state").style.display = "block";
        return;
    }

    container.querySelector(".empty-state").style.display = "none";
    table.style.display = "table";
    table.innerHTML = "";
    
    let headerRow = document.createElement("tr");
    let stateHeader = document.createElement("th");
    stateHeader.textContent = "Estado";
    headerRow.appendChild(stateHeader);

    for (let j = 97; j <= 122; j++) {
        let th = document.createElement("th");
        th.textContent = String.fromCharCode(j);
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    for (let row of tableData) {
        let tr = document.createElement("tr");
        tr.className = `states_${row.state}`;
        
        let stateTd = document.createElement("td");
        stateTd.textContent = row.final ? `q${row.state}*` : `q${row.state}`;
        tr.appendChild(stateTd);

        for (let j = 97; j <= 122; j++) {
            let letter = String.fromCharCode(j);
            let td = document.createElement("td");
            td.className = `letra_${letter}`;
            
            if (row[letter] !== "-") {
                td.textContent = `q${row[letter]}`;
                td.style.background = "#69a4cc";
                td.style.color = "#fff";
            } else {
                td.textContent = "--";
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
function validateWord() {
    const input = document.getElementById("getWords");
    const word = input.value.toLowerCase();
    
    document.querySelectorAll(".states_selecionado").forEach(el => el.classList.remove("states_selecionado"));
    document.querySelectorAll(".letra_selecionada").forEach(el => el.classList.remove("letra_selecionada"));

    if (word.length === 0) {
        input.classList.remove("acerto", "erro");
        return;
    }

    let currentState = 0;
    let valid = true;

    for (let i = 0; i < word.length; i++) {
        let char = word[i];

        if (char === " ") {
            break;
        }
        if (!/[a-z]/.test(char)) {
            valid = false;
            break;
        }
        highlightCell(currentState, char);
        if (Tabela[currentState][char] !== "-") {
            currentState = Tabela[currentState][char];
        } else {
            valid = false;
            break;
        }
    }
    if (valid && Tabela[currentState]["final"]) {
        input.classList.remove("erro");
        input.classList.add("acerto");
    } else {
        input.classList.remove("acerto");
        input.classList.add("erro");
    }
}

function highlightCell(state, letter) {
    document.querySelector(`.states_${state}`)?.classList.add("states_selecionado");
    document.querySelectorAll(`.letra_${letter}`).forEach(el => el.classList.add("letra_selecionada"));
}

// Event Listeners
document.getElementById("addWords").addEventListener("click", function() {
    const input = document.getElementById("register_words");
    const newWords = input.value.toLowerCase().split(" ").filter(w => w.length > 0);
    
    let invalidWords = [];
    let addedWords = [];

    for (let word of newWords) {
        if (!testWord(word)) {
            invalidWords.push(word);
        } else if (!words.includes(word)) {
            words.push(word);
            addedWords.push(word);
        }
    }

    if (invalidWords.length > 0) {
        alert(`Palavras inválidas (apenas letras são permitidas): ${invalidWords.join(", ")}`);
    }

    if (addedWords.length > 0) {
        const wordsList = document.querySelector("#save-words ul");
        document.getElementById("save-words").style.display = "block";
        
        for (let word of addedWords) {
            let li = document.createElement("li");
            li.textContent = word;
            wordsList.appendChild(li);
        }
        registerStates();
        Tabela = generateTable();
        renderTable(Tabela);
        
        input.value = "";
    }
});

document.getElementById("getWords").addEventListener("input", validateWord);

document.getElementById("reset").addEventListener("click", function() {
    if (confirm("Tem certeza que deseja limpar tudo?")) {
        location.reload();
    }
});
document.getElementById("register_words").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("addWords").click();
    }
});