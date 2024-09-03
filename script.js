//DATA--------------------------------------------------------------
const ingredientUnits = [ //ratio = how many times bigger it is than the 'basic unit' of the same type
    { name: 'grams', type: 'weight', ratio: 1 }, //basic unit of type weight
    { name: 'milliliters', type: 'volume', ratio: 1 }, //basic unit of type volume
    { name: 'x', type: 'countable', ratio: 1 }, //basic unit of type countable (things u can count like 1 egg)
    { name: 'cups', type: 'volume', ratio: 236.588 },
    { name: 'teaspoons', type: 'volume', ratio: 0.202884 },
    { name: 'tablespoons', type: 'volume', ratio: 0.067628 },
    { name: 'ounces', type: 'weight', ratio: 28.3495 },
    { name: 'pints', type: 'volume', ratio: 473.176 },
    { name: 'fluid ounces', type: 'volume', ratio: 29.5735 }, // US fluid ounce
    { name: 'pounds', type: 'weight', ratio: 453.592 },
    { name: 'kilograms', type: 'weight', ratio: 1000 },
    { name: 'liters', type: 'volume', ratio: 1000 },
    { name: 'quarts', type: 'volume', ratio: 946.353 }, // US quart
    { name: 'gallons', type: 'volume', ratio: 3785.41 }, // US gallon
    { name: 'milligrams', type: 'weight', ratio: 0.001 },
];
const lengthUnits = [
    { name: "centimeter", ratio: 1 },
    { name: "inch", ratio: 2.54 },
    { name: "millimeter", ratio: 0.1 },
];

const materials = [ //ratios = how many of basic units of type X is in 1 ml. for weight its equal to density (gr/ml)
    //(a material can have volume undefined if it cant be converted to ml)
    { name: 'water', ratios: {volume: 1, weight: 1} },
    { name: 'large eggs', ratios: { volume: 1, weight: 1.075, countable: 1/45} }, //an egg is 45 ml
    { name: 'all purpose flour', ratios: { volume: 1, weight: 0.53 } },
    { name: 'milk', ratios: { volume: 1, weight: 1.04 } },
    { name: 'brown sugar', ratios: { volume: 1, weight: 0.93 } },
    { name: 'vanilla extract', ratios: { volume: 1, weight: 0.88 } },
    { name: 'baking powder', ratios: { volume: 1, weight: 0.9 } },
    { name: 'butter', ratios: { volume: 1, weight: 0.91 } }
];
// Array to store block data
let allBlocks = [];

//CONTROLS----------------------------------------------------------

//maintain ratios
let maintain = false; 

const toggleSwitch = document.getElementById('lockToggle');

toggleSwitch.addEventListener('change', function() {
    maintain = this.checked;
});

//multiplier field
let multiplier = 1;

const multiplierInput = NumberInputField(true);
multiplierInput.id = 'multiplier'; // Set ID
multiplierInput.value = '1'; // Set value
document.getElementById('multiplierContainer').appendChild(multiplierInput);

multiplierInput.addEventListener('value-set', function() {
    ChangeMultiplier(multiplierInput.exactValue);
})
function ChangeMultiplier(newValue)
{
    if(newValue !== 0)
    {
        multiplier = newValue;
    }
    multiplierInput.SetNumber(newValue);

    allBlocks.forEach(block => {
        if(block.blockType === "ingredient")
        {
            UpdateIngredientBlockData(block, 'multiplier');
        } else if(block.blockType === "pan")
        {
            UpdatePanBlockData(block, 'multiplier');
        }
    });
}

//ingredient block button
const addIngredientBlockButton = document.getElementById('addIngredientBlock');
addIngredientBlockButton.addEventListener('click', () => {
    InsertBlock(NewIngredientBlock());
});

//temp block button
const addTempBlockButton = document.getElementById('addTempBlock');
addTempBlockButton.addEventListener('click', () => {
    InsertBlock(NewTempBlock());
});

//temp block button
const addPanBlockButton = document.getElementById('addPanBlock');
addPanBlockButton.addEventListener('click', () => {
    InsertBlock(NewPanBlock());
});

//TO CODE--------------------------------------------------------
const toCodeButton = document.getElementById('toCode');
toCodeButton.addEventListener('click', () => {
    ReplaceBlocksWithText();
});

function ReplaceBlocksWithText() {
    allBlocks.forEach(block => {
        // Create the text node "[block]"

        if(block == null || block.parentNode == null) {
        }else{
            const textNode = document.createTextNode(block.AsCode());

            block.parentNode.replaceChild(textNode, block);
        }

    });
    // Clear the allBlocks array since all blocks have been replaced
    allBlocks = [];
}

//TO BLOCKS-----------------------------------------------------------
const toBlocksButton = document.getElementById('toBlocks');
toBlocksButton.addEventListener('click', () => {
    ReplaceTextWithBlocks();
});
function ReplaceTextWithBlocks() {
    const editor = document.getElementById('editor');
    const pattern = /<([^<]+?)>/g; // Regular expression to match the pattern

    traverseNodes(editor);

    function traverseNodes(node) {

        if (node.nodeType === Node.TEXT_NODE) {

            if(processTextNode(node))
                {
                    traverseNodes(editor);
                    return;
                };

        } else if (node.nodeType === Node.ELEMENT_NODE) {

            for (let childNode of node.childNodes) {
                traverseNodes(childNode) 
            }
        }
    }

    function processTextNode(textNode) {
        const textContent = textNode.nodeValue;
        let match;
        let lastIndex = 0;
        let change = false;
        
        if ((match = pattern.exec(textContent)) !== null) {
            const [fullMatch, innerContent] = match;
            const start = match.index;
            const end = pattern.lastIndex;

            // Extract parameters from the pattern
            const params = innerContent.split('/');

            // Create a new block element with parameters
            const newBlock = BlockFromPars(params);
            
            // Insert the new block
            const range = document.createRange();
            range.setStart(textNode, start);
            range.setEnd(textNode, end);
            range.deleteContents();
            range.insertNode(newBlock);
            allBlocks.push(newBlock);

            change = true;
        }

        // Remove the original text node if it's empty
        if (textNode.nodeValue.length === 0) {
            textNode.parentNode.removeChild(textNode);
        }

        return change;
    }
}


function BlockFromPars(parms)
{
    if(parms[0] === "ingredient"){
        return NewIngredientBlock(parms);
    } else if (parms[0] === "temp"){
        return NewTempBlock(parms);
    } else if (parms[0] === "pan"){
        return NewPanBlock(parms);
    }
}

//EDITOR-------------------------------------------------------------
const editor = document.getElementById('editor');


//PAN BLOCK----------------------------------------------------------
function NewPanBlock(parms)
{
    // Create the new block
    const block = NewEmptyBlock();
    block.blockType = "pan";

    // Create the number input
    const widthInput = NumberInputField(false);
    const heightInput = NumberInputField(false);
    const diamaterInput = NumberInputField(false);

    const unitSelect = createAutocompleteField("unit", lengthUnits.map(x=>x.name), true);
    const shapeSelect = createAutocompleteField("shape", ["round", "square"], true);
    const containerSelect = createAutocompleteField("container", false);
    containerSelect.inputField.value = "pan";

    const textForSquare = document.createElement('span');
    textForSquare.appendChild(document.createTextNode("x "));

    block.appendChild(widthInput);
    block.appendChild(textForSquare);
    block.appendChild(heightInput);
    block.appendChild(diamaterInput);
    block.appendChild(unitSelect);
    block.appendChild(shapeSelect);
    block.appendChild(containerSelect);

    block.widthInput = widthInput;
    block.heightInput = heightInput;
    block.textForSquare = textForSquare;
    block.diamaterInput = diamaterInput;
    block.unit = unitSelect.inputField; //unit input field
    block.shape = shapeSelect.inputField;
    block.container = containerSelect.inputField;



    if(parms != null)
        {
            widthInput.SetNumber(parms[1]);
            heightInput.SetNumber(parms[2]);
            diamaterInput.SetNumber(parms[3]);
            unitSelect.SetOption(parms[4]);
            shapeSelect.SetOption(parms[5]);
            containerSelect.SetOption(parms[6]);

        }
        else
        {
            widthInput.SetNumber(1);
            heightInput.SetNumber(1);
            diamaterInput.SetNumber(1);
        }
    UpdatePanBlockData(block, 'number');
    UpdatePanBlockData(block, 'shape');

    
    widthInput.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    });
    heightInput.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    });    
    diamaterInput.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    }); 

    unitSelect.inputField.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement.parentElement, 'unit');
    })
    shapeSelect.inputField.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement.parentElement, 'shape');
    })


    block.AsCode = () => {
        return `<${block.blockType}/${block.widthInput.exactValue}/${block.heightInput.exactValue}/${block.diamaterInput.exactValue}/${block.unit.value}/${block.shape.value}/${block.container.value}>`;
    }

    return block;  
}

function UpdatePanBlockData(block, change) {
    // Find the parent block element

    if (change === 'number') {

        if(block.widthInput.exactValue <= 0)
            block.widthInput.SetNumber(1);
        if(block.heightInput.exactValue <= 0)
            block.heightInput.SetNumber(1);
        if(block.diamaterInput.exactValue <= 0)
            block.diamaterInput.SetNumber(1);

        if(maintain && block.amount != null)
        {
            let newTheoreticAmount = CalculatePanAmountBeforeMultiplier(block)
            ChangeMultiplier(newTheoreticAmount/block.amount);
        }
        else
        {
            block.amount = CalculatePanAmountBeforeMultiplier(block)/multiplier;
        }
    } else if (change === "unit" || change === "multiplier")
    {
        if(!maintain)
        {
            block.amount = CalculatePanAmountBeforeMultiplier(block)/multiplier;
        }
    } else if (change === "shape")
    {
        if(block.shape.value === "round")
        {
            block.textForSquare.style.display = 'none';
            block.widthInput.style.display = 'none';
            block.heightInput.style.display = 'none';
            block.diamaterInput.style.display = 'block';
        }
        else
        {
            block.textForSquare.style.display = 'block'
            block.widthInput.style.display = 'block';
            block.heightInput.style.display = 'block';
            block.diamaterInput.style.display = 'none';

        }
    }

    //keep square and round values updated to result in the correct amount even when one is hidden.
    //takes multiplier and unit into account
    let newWidthHeight = CalculateWidthHeightForAmountAndMultiplier(block);
    block.widthInput.SetNumber(newWidthHeight.width);
    block.heightInput.SetNumber(newWidthHeight.height);
    
    block.diamaterInput.SetNumber(CalculateDiameterForAmountAndMultiplier(block));

}
function CalculateDiameterForAmountAndMultiplier(block) {
    // Calculate the radius using the area (amount) provided
    const radius = Math.sqrt((block.amount*multiplier) / Math.PI);
    
    // Calculate the diameter (twice the radius)
    const diameter = 2 * radius;
    
    return fromCentimeters(diameter, block.unit.value);
}
function CalculateWidthHeightForAmountAndMultiplier(block) {
    // Calculate the aspect ratio
    const aspectRatio = block.widthInput.exactValue / block.heightInput.exactValue;
    
    // Calculate the new height
    const newHeight = Math.sqrt((block.amount*multiplier) / aspectRatio);
    
    // Calculate the new width
    const newWidth = newHeight * aspectRatio;
    
    return {
        width: fromCentimeters(newWidth, block.unit.value),
        height: fromCentimeters(newHeight, block.unit.value)
    };
}
function CalculatePanAmountBeforeMultiplier(block)
{
    if(block.shape.value == "round"){
        return diameterToArea(toCentimeters(block.diamaterInput.exactValue, block.unit.value));
    } else
    {
        return toCentimeters(block.widthInput.exactValue,block.unit.value)
            *toCentimeters(block.heightInput.exactValue,block.unit.value);
    }}

//TEMP BLOCK--------------------------------------------------------------
function NewTempBlock(parms)
{
    // Create the new block
    const block = NewEmptyBlock();
    block.blockType = "temp";

    // Create the number input
    const numberInput = NumberInputField(false)

    // Create the unit select menu
    const unitSelect = createAutocompleteField("unit", ["ºC", "ºF"], true);

    block.appendChild(numberInput);
    block.appendChild(unitSelect);

    block.number = numberInput; 
    block.unit = unitSelect.inputField; 
    
    if(parms != null)
    {
        block.number.SetNumber(parms[1]);
        unitSelect.SetOption(parms[2]);
    }
    else
    {
        block.number.SetNumber(180);
    }
    UpdateTempBlockData(block, 'number');

    numberInput.addEventListener('value-set', (event) => {
        UpdateTempBlockData(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {

        UpdateTempBlockData(event.target.parentElement.parentElement, 'unit');
    });

    block.AsCode = () => {
        return `<${block.blockType}/${block.number.exactValue}/${block.unit.value}>`;
    }

    return block;  
}

function UpdateTempBlockData(block, change) {
    // Find the parent block element

    if (change === 'unit') {
        if(maintain)
        {
            block.number.SetNumber(TemperatureConvert("ºC", block.unit.value, block.amount));
        }
        else
        {
            block.amount = TemperatureConvert(block.unit.value, "ºC", block.number.exactValue);
        }

    } else if (change === 'number') {

        block.amount = TemperatureConvert(block.unit.value, "ºC", block.number.exactValue);
    }


}


//INGREDIENT BLOCK--------------------------------------------------------------
function NewIngredientBlock(parms)
{
    // Create the new block
    const block = NewEmptyBlock();
    block.blockType = "ingredient";

    // Create the number input
    const numberInput = NumberInputField(true);

    // Create the unit select menu
    //const unitSelect = createAutocompleteField("choose", ["Apple", "Banana", "Orange", "Grapes", "Pineapple"]);/*document.createElement('select');
    const unitSelect = createAutocompleteField("unit", ingredientUnits.map(unit => unit.name), true);

    // Create the material select menu
    const materialSelect = createAutocompleteField("ingredient", materials.map(material => material.name), false);
    
    block.appendChild(numberInput);
    block.appendChild(unitSelect);
    block.appendChild(materialSelect);

    block.number = numberInput; 
    block.unit = unitSelect.inputField; //unit input field
    block.material = materialSelect.inputField; //material input field

    if(parms != null)
        {
            block.number.SetNumber(parms[1]);
            unitSelect.SetOption(parms[2]);
            materialSelect.SetOption(parms[3]);
        }
        else
        {
            block.number.SetNumber(1);
        }
    UpdateIngredientBlockData(block, 'number');
    UpdateIngredientBlockData(block, 'unit');

    
    numberInput.addEventListener('value-set', (event) => {
        UpdateIngredientBlockData(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {

        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'unit');
    });
    materialSelect.inputField.addEventListener('value-set', (event) => {

        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'material');
    });
    unitSelect.inputField.addEventListener('options-update', (event) => {
        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'optionsUpdate');
    });
    
    block.AsCode = () => {
        return `<${block.blockType}/${block.number.exactValue}/${block.unit.value}/${block.material.value}>`;
    }

    return block;  
}

function UpdateIngredientBlockData(block, change) {
    // Find the parent block element

    if (change === 'unit') {
        block.unitLastValue = block.unit.value;
        if(maintain)
        {
            block.number.SetNumber(CalculateIngredientBlockNumber(block));
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block); //how many grams when multiplier = 1
        }

    } else if (change === 'number') {

        if(block.number.exactValue <= 0)
        {
            block.number.SetNumber(1);
        }

        if(maintain && block.amount != null)
        {           
            var newAmount = ToGrams(block.unit.value, block.number.exactValue, block.material.value);
            var newMultiplier = newAmount/block.amount;
            ChangeMultiplier(newMultiplier);
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block);
        }

    } else if (change === 'material') {
        block.amount = CalculateIngredientBlockAmount(block);
        
    } else if (change === 'multiplier') {
        if(maintain)
        {
            block.number.SetNumber(CalculateIngredientBlockNumber(block));
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block);
        }
    } else if (change === 'optionsUpdate') {

        const thisUnitType = ingredientUnits.find(u => u.name === block.unitLastValue).type;
        const unitAutoComplete = block.unit.parentElement;


        const thisMaterial = materials.find(u => u.name === block.material.value);

        unitAutoComplete.suggestionsList = ingredientUnits
        .filter(
            currentUnit => !maintain || (thisUnitType == currentUnit.type) ||
            (((thisMaterial != null) && (thisMaterial.ratios[thisUnitType] != null) && (thisMaterial.ratios[currentUnit.type] != null)))
        ).map(x=> x.name);
    }


}
function CalculateIngredientBlockAmount(block)
{
    return ToGrams(block.unit.value, block.number.exactValue ,block.material.value)/multiplier;;
}
function CalculateIngredientBlockNumber(block)
{
    return FromGrams(block.unit.value, block.amount, block.material.value)*multiplier;
}

//MISC SHARED USAGE-----------------------------------------
function getCursorElement() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;

        // If the node is a text node, get its parent element
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        return node;
    }
    return null;
}

function NumberInputField(fractionDisplay)
{
    // Create the number input
    const numberInput = document.createElement('input');
    numberInput.type = 'text';
    numberInput.className = 'number';
    numberInput.fractionDisplay = fractionDisplay == null? true : fractionDisplay;

    numberInput.addEventListener('blur', function() { //MAKE THIS 'CHANGE' TO FIX BUGS
        // Use SetNumber to handle the input value
        numberInput.SetNumber(numberInput.value);
        numberInput.dispatchEvent(new CustomEvent('value-set', event));
    });

    numberInput.addEventListener('focus', function(){
        if((numberInput.exactValue != null)&&(StringToNumber(numberInput.value) != numberInput.exactValue))
        {
            numberInput.value = numberInput.exactValue;
        }
        numberInput.select();
    })

    numberInput.SetNumber = function(newValue) {
        if (typeof newValue === 'number') {
            // If newValue is a number, set exactValue directly
            this.exactValue = newValue;
        } else if (typeof newValue === 'string') {
            // If newValue is a string, convert it to a number using the custom function
            this.exactValue = StringToNumber(newValue);
        }

        // Update the input's value using the custom number-to-string function
        this.value = NumberToString(this.exactValue, this.fractionDisplay);
    };

    return numberInput;
}

function NumberToString(number, fractionDisplay) {

    // Round the number to 2 decimal places
    let rounded = Math.round(number * 100) / 100;

    //handle 0's and near 0's
    if(rounded === 0)
    {
        if(number === 0)
        {
            return "0";
        }
        else
        {
            return "<0.01";
        }
    }

    // Extract the integer and fractional parts of the number
    let integerPart = Math.floor(number);
    let fractionalPart = number - integerPart;

    // Find the closest fraction if possible
    let closest = findClosestFraction(fractionalPart);
    function findClosestFraction(num) {
        const dividers = [1, 2, 3, 4, 8];
        const tolerance = 0.005;
        for (let divider of dividers) {
            let multiple = Math.round(num / (1/divider));
            let fractionValue = multiple * (1/divider);

            if (Math.abs(num - fractionValue) < tolerance) {
                return { divider: divider, multiple: multiple };
            }
        }
        return null;
    }

    if (fractionDisplay && closest !== null && closest.divider != 1) {
        //if a fraction is found, use that
        if(integerPart === 0)
        {
            return `${closest.multiple}/${closest.divider}`;
        }
        else if(closest.multiple == 0)
        {
            return `${integerPart}`;
        }
        else
        {
            return `${integerPart} ${closest.multiple}/${closest.divider}`;
        }
    } else {
        // If no fraction is close enough, return the decimal number
        let result = rounded.toString();
        return result;
    }
}
function StringToNumber(str) {
    try {
        // Trim leading and trailing whitespace
        str = str.trim();

        // Check if the string contains a space, indicating it might be a mixed fraction
        if (str.includes(' ')) {
            // Split into integer and fraction parts
            let [integerPart, fractionPart] = str.split(' ');

            // Convert the integer part to a number
            let integerNum = parseFloat(integerPart);

            // Handle cases where the integer part is not present (i.e., " 3/4")
            if (isNaN(integerNum)) {
                integerNum = 0;
            }

            // Handle the fractional part
            if (fractionPart.includes('/')) {
                let [numerator, denominator] = fractionPart.split('/').map(Number);
                if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
                    return 1; // Invalid fraction
                }
                return integerNum + (numerator / denominator);
            } else {
                // Handle cases where the fraction part is not in the format of "numerator/denominator"
                return integerNum;
            }
        } else if (str.includes('/')) {
            // Handle simple fractions like "3/4"
            let [numerator, denominator] = str.split('/').map(Number);
            if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
                return 1; // Invalid fraction
            }
            return numerator / denominator;
        } else {
            // Handle plain decimal numbers
            let number = parseFloat(str);
            if (isNaN(number)) {
                return 1; // Invalid number
            }
            return number;
        }
    } catch {
        // Catch any unexpected errors and return 1
        return 1;
    }
}


function NewEmptyBlock()
{
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('contenteditable', 'false'); // Prevent typing inside the block
    block.style.fontSize = 'initial';
    block.style.fontFamily = 'initial';
    block.style.fontWeight = 'initial';
    block.style.color = 'initial';
    return block;
}

function InsertBlock(newBlock) {
    const selection = window.getSelection();
    let range;


    if (!selection.rangeCount) {
        // No selection range available
        range = document.createRange();
        range.selectNodeContents(editor); // Select the entire content of the editor
        range.collapse(false); // Move to the end of the content
    } else {
        range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer) || (range.startContainer.nodeType != Node.TEXT_NODE)) {
            // Cursor not inside the editor, move range to the end of the editor

            range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false); // Move to the end of the content
        }
    }



    // Replace text selection with the new block
    range.deleteContents();
    range.insertNode(newBlock);

    // Set cursor after block
    range.setStartAfter(newBlock); 
    range.collapse(true); 
    selection.removeAllRanges(); 
    selection.addRange(range); 

    allBlocks.push(newBlock);
}



//AUTO COMPLETE FIELDS--------------------------------------------------

function createAutocompleteField(placeholderText, suggestionsList, forceDefault) {
    // Create the autocomplete container
    const autocomplete = document.createElement('div');
    autocomplete.className = 'autocomplete';
    autocomplete.forceDefault = forceDefault;
    autocomplete.suggestionsList = suggestionsList;

    // Create the input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = "inputField"
    inputField.placeholder = placeholderText;

    // Create the suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions';

    // Append input field and suggestions container to the autocomplete div
    autocomplete.appendChild(inputField);
    autocomplete.appendChild(suggestionsContainer);
    autocomplete.suggestionsContainer = suggestionsContainer;
    autocomplete.inputField = inputField;

    autocomplete.nearestOption = autocomplete.suggestionsList[0];
    if(autocomplete.forceDefault)
    {
        inputField.value = autocomplete.nearestOption;
    }

    autocomplete.SetOption = function(option) {
        if (!forceDefault || autocomplete.suggestionsList.includes(option)) {
            autocomplete.inputField.value = option;
        }
    };


    inputField.addEventListener('focus', function(){
        inputField.select();
        handleInputSuggestions.call(inputField);
    })

    inputField.addEventListener('input', handleInputSuggestions);

    autocomplete.setAttribute('tabindex', '-1'); //element can technically be be focused but not using the tab key
    autocomplete.addEventListener('focusout', function() { //element or one of it's children lost focus
        if(!autocomplete.contains(event.relatedTarget)) //the element that stole the focus isnt part of the autocomplete
        {
            autocomplete.Close();
        }

    });

    autocomplete.Close = () =>
    {
        suggestionsContainer.style.display = 'none';
        if(autocomplete.forceDefault && !autocomplete.suggestionsList.includes(inputField.value))
        {  
            if(autocomplete.nearestOption != null && autocomplete.suggestionsList.includes(autocomplete.nearestOption))
            {
                inputField.value = autocomplete.nearestOption;
            }
            else
            {
                inputField.value = autocomplete.suggestionsList[0];
            }
        }
        autocomplete.nearestOption = inputField.value;
        inputField.dispatchEvent(new CustomEvent('value-set', event));

    }

    return autocomplete;
}


function handleInputSuggestions() {

    this.dispatchEvent(new CustomEvent('options-update', event));

    const inputField = this;
    const parent = inputField.parentElement;
    const suggestionsContainer = parent.suggestionsContainer;
    const suggestionsList = parent.suggestionsList;
    const autocomplete = parent;

    function categorizeSuggestion(suggestion) {
        const suggestionText = suggestion.toLowerCase();
        if (suggestionText.startsWith(inputValue)) {
            return 1; // High priority
        } else if (suggestionText.includes(inputValue)) {
            return 2; // Medium priority
        } else {
            return 3; // Low priority
        }
    }

    const inputValue = inputField.value.toLowerCase();

    const orderedSuggestions = suggestionsList.sort((a, b) => {
        return categorizeSuggestion(a) - categorizeSuggestion(b);
    });

    suggestionsContainer.innerHTML = '';
    orderedSuggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.textContent = suggestion;
        suggestionDiv.addEventListener('click', function() {
            inputField.value = suggestion;
            suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(suggestionDiv);
    });

    suggestionsContainer.style.display = orderedSuggestions.length ? 'block' : 'none';
    autocomplete.nearestOption = orderedSuggestions.length ? orderedSuggestions[0] : '';
}


// LENGTH AREA CONVERSIONS ----------------------------------------------------
function toCentimeters(value, fromUnit) {
    const unit = lengthUnits.find(unit => unit.name === fromUnit);
    if (!unit) {
        throw new Error(`Unit ${fromUnit} not found.`);
    }
    return value * unit.ratio;
}

function fromCentimeters(value, toUnit) {
    const unit = lengthUnits.find(unit => unit.name === toUnit);
    if (!unit) {
        throw new Error(`Unit ${toUnit} not found.`);
    }
    return value / unit.ratio;
}

function diameterToArea(diameter) {
    const radius = diameter / 2;
    return Math.PI * Math.pow(radius, 2);
}

// Function to calculate the diameter from the area of a circle
function areaToDiameter(area) {
    const radius = Math.sqrt(area / Math.PI);
    return 2 * radius;
}

//TEMP CONVERSION------------------------------------------------------
function TemperatureConvert(fromUnit, toUnit, number) {
    if (fromUnit === "ºC" && toUnit === "ºF") {
        return (number * 9/5) + 32;
    } else if (fromUnit === "ºF" && toUnit === "ºC") {
        return (number - 32) * 5/9;
    } else {
        // If the units are the same, return the original number
        return number;
    }
}


//MATERIAL UNIT CONVERSIONS---------------------------------------------

function ToGrams(unitName, amount, materialName)
{
    const unit = ingredientUnits.find(u => u.name === unitName);
    const fromType = unit.type;
    return BasicUnitToBasicUnitOfType(fromType, "weight", ToBasicUnitOfSameType(unitName, amount), materialName);
}

function FromGrams(unitName, amount, materialName)
{
    const unit = ingredientUnits.find(u => u.name === unitName);
    const toType = unit.type;
    return ToComplexUnitOfSameType(unitName, BasicUnitToBasicUnitOfType("weight", toType, amount, materialName ));
}

function ToBasicUnitOfSameType(unitName, amount)
{
    const unit = ingredientUnits.find(u => u.name === unitName);
    return amount*unit.ratio;
}

function ToComplexUnitOfSameType(unitName, amount)
{
    const unit = ingredientUnits.find(u => u.name === unitName);
    return amount/unit.ratio;
}

function BasicUnitToBasicUnitOfType(fromType, toType, amount, materialName)
{  
    if(fromType === toType)
    {
        return amount;
    }

    const material = materials.find(u => u.name === materialName);

    //if the material doesnt exist or doesnt have the ratio for a unit, use 1
    let fromTypeRatio = 1;
    let toTypeRatio = 1;
    if(material != null)
    {
        if(material.ratios[fromType] != null)
        {
            fromTypeRatio = material.ratios[fromType];
        }
        if(material.ratios[toType] != null)
        {
            toTypeRatio = material.ratios[toType];
        }
    }

    const result = (amount / fromTypeRatio) * toTypeRatio;
    return result
}

