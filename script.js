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
    { name: 'carats', type: 'weight', ratio: 0.2 }
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
const allBlocks = [];

//CONTROLS----------------------------------------------------------

//maintain ratios
let maintain = false; 

const toggleSwitch = document.getElementById('toggleSwitch');

toggleSwitch.addEventListener('change', function() {
    maintain = this.checked;
});

//multiplier field
let multiplier = 1;

const multiplierInput = document.getElementById('numberInput');

multiplierInput.addEventListener('change', function() {
    ChangeMultiplier(parseFloat(multiplierInput.value));
})
function ChangeMultiplier(newValue)
{
    if(newValue !== 0)
    {
        multiplier = newValue;
    }
    multiplierInput.value = NumberToString(multiplier);

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


//EDITOR-------------------------------------------------------------
const editor = document.getElementById('editor');


//PAN BLOCK----------------------------------------------------------
function NewPanBlock()
{
    // Create the new block
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('contenteditable', 'false'); // Prevent typing inside the block
    block.blockType = "pan";

    // Create the number input
    const widthInput = NumberInputField();
    widthInput.value = 1;
    const heightInput = NumberInputField();
    heightInput.value = 1;
    const diamaterInput = NumberInputField();
    diamaterInput.value = 1;

    const unitSelect = createAutocompleteField("unit", lengthUnits.map(x=>x.name), true);
    const shapeSelect = createAutocompleteField("shape", ["round", "square"], true);
    const containerSelect = createAutocompleteField("container", false);
    containerSelect.inputField.value = "pan";

    const textForSquare = document.createElement('span');
    textForSquare.appendChild(document.createTextNode("x "));
    textForSquare.style.display = 'none';
    widthInput.style.display = 'none';
    heightInput.style.display = 'none';

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

    
    widthInput.addEventListener('change', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    });
    heightInput.addEventListener('change', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    });    
    diamaterInput.addEventListener('change', (event) => {
        UpdatePanBlockData(event.target.parentElement, 'number');
    }); 

    unitSelect.inputField.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement.parentElement, 'unit');
    })
    shapeSelect.inputField.addEventListener('value-set', (event) => {
        UpdatePanBlockData(event.target.parentElement.parentElement, 'shape');
    })
    UpdatePanBlockData(block, 'number');

    return block;  
}

function UpdatePanBlockData(block, change) {
    // Find the parent block element

    if (change === 'number') {

        if(block.widthInput.value <= 0)
            block.widthInput.value = 1;
        if(block.heightInput.value <= 0)
            block.heightInput.value = 1;
        if(block.diamaterInput.value <= 0)
            block.diamaterInput.value = 1;

        block.exactWidth = block.widthInput.value;
        block.exactHeight = block.heightInput.value;
        block.exactDiameter = block.diamaterInput.value;

        block.widthInput.value = NumberToString(block.exactWidth);
        block.heightInput.value = NumberToString(block.exactHeight);
        block.diamaterInput.value = NumberToString(block.exactDiameter);

        if(maintain)
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
    block.exactWidth = newWidthHeight.width;
    block.exactHeight = newWidthHeight.height;
    block.widthInput.value = NumberToString(block.exactWidth);
    block.heightInput.value = NumberToString(block.exactHeight);

    block.exactDiameter = CalculateDiameterForAmountAndMultiplier(block);
    block.diamaterInput.value = NumberToString(block.exactDiameter);

    console.log("amount is " + block.amount);
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
    const aspectRatio = block.exactWidth / block.exactHeight;
    
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
    console.log("the shape is " + block.shape.value);
    if(block.shape.value == "round"){
        return diameterToArea(toCentimeters(block.exactDiameter, block.unit.value));
    } else
    {
        return toCentimeters(block.exactWidth,block.unit.value)*toCentimeters(block.exactHeight,block.unit.value);
    }}

//TEMP BLOCK--------------------------------------------------------------
function NewTempBlock()
{
    // Create the new block
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('contenteditable', 'false'); // Prevent typing inside the block
    block.blockType = "temp";


    // Create the number input
    const numberInput = NumberInputField()
    numberInput.value = '180'; // Default value

    // Create the unit select menu
    //const unitSelect = createAutocompleteField("choose", ["Apple", "Banana", "Orange", "Grapes", "Pineapple"]);/*document.createElement('select');
    const unitSelect = createAutocompleteField("unit", ["ºC", "ºF"], true);

    block.appendChild(numberInput);
    block.appendChild(unitSelect);

    block.number = numberInput; //number input field - sometimes is rounded
    block.unit = unitSelect.inputField; //unit input field
    
    numberInput.addEventListener('change', (event) => {
        console.log("number changed");
        UpdateTempBlockData(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {
        console.log("unit changed!");
        console.log("value of input field is" + unitSelect.inputField.value);
        UpdateTempBlockData(event.target.parentElement.parentElement, 'unit');
    });
    UpdateTempBlockData(block, 'number');

    return block;  
}

function UpdateTempBlockData(block, change) {
    // Find the parent block element

    if (change === 'unit') {
        //console.log(block.amount);
        if(maintain)
        {
            block.exactNumber = TemperatureConvert("ºC", block.unit.value, block.amount);
            block.number.value = NumberToString(block.exactNumber);
        }
        else
        {
            block.amount = TemperatureConvert(block.unit.value, "ºC", block.exactNumber);
        }

    } else if (change === 'number') {

        block.exactNumber = block.number.value;
        block.number.value = NumberToString(block.exactNumber);

        block.amount = TemperatureConvert(block.unit.value, "ºC", block.exactNumber);
    }

    console.log("amount is " + block.amount);

}


//INGREDIENT BLOCK--------------------------------------------------------------
function NewIngredientBlock()
{
    // Create the new block
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('contenteditable', 'false'); // Prevent typing inside the block
    block.blockType = "ingredient";

    // Create the number input
    const numberInput = NumberInputField();
    numberInput.value = '1'; // Default value

    // Create the unit select menu
    //const unitSelect = createAutocompleteField("choose", ["Apple", "Banana", "Orange", "Grapes", "Pineapple"]);/*document.createElement('select');
    const unitSelect = createAutocompleteField("unit", ingredientUnits.map(unit => unit.name), true);

    // Create the material select menu
    const materialSelect = createAutocompleteField("ingredient", materials.map(material => material.name), false);
    
    block.appendChild(numberInput);
    block.appendChild(unitSelect);
    block.appendChild(materialSelect);

    block.number = numberInput; //number input field - sometimes is rounded
    block.exactNumber = numberInput.value; //exact number, not always displayed accurately
    block.unit = unitSelect.inputField; //unit input field
    block.material = materialSelect.inputField; //material input field
    block.unitLastValue = block.unit.value;

    UpdateIngredientBlockData(block, 'number');

    
    numberInput.addEventListener('change', (event) => {
        console.log("number changed");
        UpdateIngredientBlockData(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {
        console.log("unit changed!");
        console.log("value of input field is" + unitSelect.inputField.value);
        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'unit');
    });
    materialSelect.inputField.addEventListener('value-set', (event) => {
        console.log("!value of input field is" + materialSelect.inputField.value);
        console.log("mterial changed!");
        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'material');
    });
    unitSelect.inputField.addEventListener('options-update', (event) => {
        UpdateIngredientBlockData(event.target.parentElement.parentElement, 'optionsUpdate');
    });

    return block;  
}

function UpdateIngredientBlockData(block, change) {
    // Find the parent block element

    console.log(`${block.number.value} ${block.unit.value} ${block.material.value}`);
    if (change === 'unit') {
        //console.log(block.amount);
        block.unitLastValue = block.unit.value;
        if(maintain)
        {
            block.exactNumber = CalculateIngredientBlockNumber(block)
            block.number.value = NumberToString(block.exactNumber);
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block); //how many grams when multiplier = 1
        }

    } else if (change === 'number') {

        if(block.number.value <= 0)
        {
            block.number.value = 1;
        }
        block.exactNumber = block.number.value;
        block.number.value = NumberToString(block.exactNumber);

        if(maintain && block.amount != null)
        {           
            var newAmount = ToGrams(block.unit.value, block.exactNumber, block.material.value);
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
            block.exactNumber = CalculateIngredientBlockNumber(block);
            block.number.value = NumberToString(block.exactNumber);
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block);
        }
    } else if (change === 'optionsUpdate') {

        const thisUnitType = ingredientUnits.find(u => u.name === block.unitLastValue).type;
        const unitAutoComplete = block.unit.parentElement;

        console.log("last unit value = " + block.unitLastValue);

        const thisMaterial = materials.find(u => u.name === block.material.value);

        //console.log("this material = " + thisMaterial.name);

        unitAutoComplete.suggestionsList = ingredientUnits
        .filter(
            currentUnit => !maintain || (thisUnitType == currentUnit.type) ||
            (((thisMaterial != null) && (thisMaterial.ratios[thisUnitType] != null) && (thisMaterial.ratios[currentUnit.type] != null)))
        ).map(x=> x.name);
    }

    console.log("amount is " + block.amount);

}
function CalculateIngredientBlockAmount(block)
{
    return ToGrams(block.unit.value, block.exactNumber ,block.material.value)/multiplier;;
}
function CalculateIngredientBlockNumber(block)
{
    return FromGrams(block.unit.value, block.amount, block.material.value)*multiplier;
}

//MISC SHARED USAGE-----------------------------------------

function NumberToString(number)
{
    let result = ((Math.round(number * 100)) / 100).toString().replace(/,/g, '');
    if(number !== 0 && result === "0")
    {
        return "0.00"
    }
    else
    {
        return result;
    }
}

function InsertBlock(newBlock) {
    // Check if the cursor is inside the editor
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        //console.log('Please click inside the text editor before adding a block.');
        return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer)) {
        //console.log('Please click inside the text editor before adding a block.');
        return;
    }

    /*if(document.activeElement !== editor)
    {
        return;
    }*/

    // replace text selection with the new block
    range.deleteContents();
    range.insertNode(newBlock);

    //set cursor after block
    range.setStartAfter(newBlock); 
    range.collapse(true); 
    selection.removeAllRanges(); 
    selection.addRange(range); 

    allBlocks.push(newBlock);
    console.log(allBlocks.length)
}

function NumberInputField()
{
    // Create the number input
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.className = 'number';

    return numberInput;
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

    inputField.addEventListener('focus', function(){
        inputField.select();
        handleInputSuggestions.call(inputField);
    })

    // Add the same JavaScript logic to handle suggestions
    inputField.addEventListener('input', handleInputSuggestions);

    inputField.addEventListener('blur', function() {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
            if(forceDefault && !autocomplete.suggestionsList.includes(inputField.value))
            {
                inputField.value = autocomplete.nearestOption;
            }
            autocomplete.nearestOption = autocomplete.suggestionsList[0];
            inputField.dispatchEvent(new CustomEvent('value-set', event));

        }, 100);  // Delay to allow click event to register
    });

    console.log("fart " + autocomplete.inputField.value);
    return autocomplete;
}
function handleInputSuggestions() {

    this.dispatchEvent(new CustomEvent('options-update', event));

    const inputField = this;
    const parent = inputField.parentElement;
    const suggestionsContainer = parent.suggestionsContainer;
    const suggestionsList = parent.suggestionsList;
    console.log(suggestionsList[0]);
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
            suggestionsContainer.innerHTML = '';
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
    console.log("to grams called");
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
   // console.log("conversoin!");
    if(fromType === toType)
    {
       // console.log("nope");
        return amount;
    }
    //console.log(materialName);

    const material = materials.find(u => u.name === materialName);
    console.log("conversion tinme");

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
    console.log(result);
    return result
}

