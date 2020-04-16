var INPUT_ELEMENTS = [];
var GLOBAL = 'g';

const NEGATION = "!";
const CONJUNCTION = "&";
const DISJUNCTION = "|";
const IMPLICATION = "->";
const EQUIVALENCE = "~";
const FORMULA_REGEXP = new RegExp('([(]([A-Z]|[0-1])((->)|(&)|(\\|)|(~))([A-Z]|[0-1])[)])|([(][!]([A-Z]|[0-1])[)])|([A-Z])|([0-1])','g');


let countAnswer = 0;
let n = 1;

function checkInconsistency() {
    var input = document.getElementById("inputText").value;
    let obj = calculateTableTruth(input);
   
    if (!checkWithRegularExpressionFormula(input)) {
        alert('не формула')
    } else if (obj.containsOnes === false) {
        alert('противоречивая');
    } else {
        alert('непротиворечивая');
    }

    if (obj instanceof Object && obj.table !== undefined && checkWithRegularExpressionFormula(input)) {
        printTableTruth(obj.table, obj.symbolSize);
        document.getElementById("container").hidden = false;
    } else {
        document.getElementById("container").hidden = true;
    }
}

function checkWithRegularExpressionFormula(formula) {
    let form = formula;
    if (form.length == 1 && form.match(/[A-Z]|[0-1]/)) {
        return true;
    } else {
        while (true) {
            let initLength = form.length;
            form = form.replace(FORMULA_REGEXP, '1')
            if (form.length === initLength) {
                break;
            }
        }
        if ((form.length === 1) && (form.match(/1/))) {
            return true;
        } else {
            return false;
        }
    }
}

function calculateTableTruth(formula) {
    countAnswer = 0;
    n = 1;

    if(formula == '0') {
        countAnswer = 1;
        return {containsOnes: false};
    }

    if(formula == '1') {
        return {containsOnes: true};
    }

    if (formula == '') {
        return null;
    }

    if (formula.match(/[A-Z]/g) !== null) {
        let answer = formula;
        let symbolInFormula = calculateFormulaSymbols(formula).sort();
        let sizeSymbolInFormula = symbolInFormula.length;
        n = Math.pow(2, sizeSymbolInFormula);

        let table = {};
        for (let index = 0; index < n; index++) {
            let inputParameters = calculateInputFormulaParameters(index, sizeSymbolInFormula);
            let obj = createFormulaWithParameters(symbolInFormula, inputParameters);

            obj[answer] = getAnswer(formula, obj);
            table[index] = obj;

            if (obj[answer] == 0) {
                countAnswer++;
            }
        }
        var vals = Object.keys(table).map(function(key) {
            return table[key][Object.keys(table[key])[Object.keys(table[key]).length - 1]];
        });
        let containsOnes = false;
        if (vals.includes('1')) {
            containsOnes = true;
        }
        return  {
            table: table,
            symbolSize: sizeSymbolInFormula,
            containsOnes: containsOnes
        };
    } else {
        containsOnes = (calculateFormula(formula) === '1' ? true : false);
        return {containsOnes: containsOnes};
    }
}

function calculateFormulaSymbols(formula) {
    const SYMBOL_REGEXP = new RegExp('([A-Z])', "g");
    let results = formula.match(SYMBOL_REGEXP);

    //удаляет повторяющиеся символы

    for(let i = 0; i < results.length; i++) {
        for(let j = i + 1; j < results.length; j++) {
            if (results[i] == results[j]) {
                results.splice(j, 1);
                j--;
            }
        }
    }
    return results;
}

//Функция расчета входных параметров для формулы
function calculateInputFormulaParameters(index, symbolSize) {
    let res = index.toString(2);
    //дописывает 0, если не хватает разрядов
    for (let index = res.length; index < symbolSize; index++) {
        res = "0" + res;
    }

    return res;
}

//Создания объекта формулы со входными параметрами
function createFormulaWithParameters(symbolInFormula, inputParameters) {
    let object = {};
    for (let index = 0; index < symbolInFormula.length; index++) {
        let symbol = symbolInFormula[index];
        //связь входного символа формулы с его входным значением
        object[symbol] = inputParameters[index];
    }

    return object;
}

function getAnswer(formula, obj){
    let constFormula = formula;
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        //заменяем буквы значениями
        constFormula = constFormula.replace(new RegExp(key, 'g'), value);
    }
    return calculateFormula(constFormula);
}

function calculateFormula(formula) {
    const REGEXP = new RegExp("([(][" + NEGATION + "][0-1][)])|" + "([(][0-1]((" + CONJUNCTION + ")|("+ "\\" + DISJUNCTION + ")|(" + IMPLICATION + ")|(" + EQUIVALENCE + "))[0-1][)])");
    var array;
    while ((array = REGEXP.exec(formula)) !== null) {
        let subFormula = array[0];
        let result = calculateSimpleFormula(subFormula);
        formula = formula.replace(subFormula, result);
    }

    return formula;
}

function calculateSimpleFormula(subFormula) {
    if (subFormula.indexOf(NEGATION) > -1) {
        return calculateNegation(subFormula);
    }

    if (subFormula.indexOf(CONJUNCTION) > -1) {
        return calculateConjunction(subFormula);
    }

    if (subFormula.indexOf(DISJUNCTION) > -1) {
        return calculateDisjunction(subFormula);
    }

    if (subFormula.indexOf(IMPLICATION) > -1) {
        return calculateImplication(subFormula);
    }

    if (subFormula.indexOf(EQUIVALENCE) > -1) {
        return calculateEquivalence(subFormula);
    }
}

function calculateNegation(subFormula) {
    if (parseInt(subFormula[2]) == 1) {
        return 0;
    }
    return 1;
}

//Функция высчитывания конъюнкции
function calculateConjunction(subFormula) {
    if (parseInt(subFormula[1]) && parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания дизъюнкции
function calculateDisjunction(subFormula) {
    if (parseInt(subFormula[1]) || parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания импликации
function calculateImplication(subFormula) {
    if ((!parseInt(subFormula[1])) || parseInt(subFormula[4])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания эквиваленции
function calculateEquivalence(subFormula) {
    if (parseInt(subFormula[1]) == parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

function printTableTruth(table, symbolSize) {
    let tableSize = Math.pow(2, symbolSize);
    let html = "";

    //построение шапки таблицы

    html += "<tr>";

    for (let key of Object.keys(table[0])) {
        html += "<td>" + key + "</td>"
    }

    html += "</tr>";

    //непосредственное заполнение

    for (let index = 0; index < tableSize; index++) {
        let object = table[index];
        html += "<tr>";

        for (let key of Object.keys(object)) {
            html += "<td>" + object[key] + "</td>"
        }
        html += "</tr>";
    }

    let tableElement = document.getElementById('table');
    tableElement.innerHTML = html;
}
