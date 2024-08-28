//DATA--------------------------------------------------------------
const units = [ //ratio = how many times bigger it is than the 'basic unit' of the same type
    { name: 'grams', type: 'weight', ratio: 1 }, //basic unit of type weight
    { name: 'milliliters', type: 'volume', ratio: 1 }, //basic unit of type volume
    { name: 'units', type: 'countable', ratio: 1 }, //basic unit of type countable (things u can count like 1 egg)
    { name: 'kilograms', type: 'weight', ratio: 1000 },
    { name: 'liters', type: 'volume', ratio: 1000 },
    { name: 'ounces', type: 'weight', ratio: 28.3495 },
    { name: 'pints', type: 'volume', ratio: 473.176 },
    { name: 'cups', type: 'volume', ratio: 236.588 },
    { name: 'teaspoons', type: 'volume', ratio: 0.202884 },
    { name: 'tablespoons', type: 'volume', ratio: 0.067628 }
];
const materials = [ //ratios = how many of basic units of type X is in 1 ml
    { name: 'water', ratios: {volume: 1, weight: 1} },
    { name: 'mashed bananas', ratios: {volume: 1, weight: 1.27, countable: 0.01074113856} }, //a banana is 118 gram or 93.1ml when mashed, so 1ml contains ~0.01 mashed banana 
    { name: 'large eggs', ratios: { volume: 1, weight: 1.033 } },
    { name: 'all purpose flour', ratios: { volume: 1, weight: 0.53 } },
    { name: 'milk', ratios: { volume: 1, weight: 1.04 } },
    { name: 'brown sugar', ratios: { volume: 1, weight: 0.93 } },
    { name: 'vanilla extract', ratios: { volume: 1, weight: 0.88 } },
    { name: 'baking powder', ratios: { volume: 1, weight: 0.9 } },
    { name: 'butter', ratios: { volume: 1, weight: 0.91 } }
];
// Array to store block data
const blocksData = [];

//CONTROLS----------------------------------------------------------

//mainting ratios toggle
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
    //console.log("multiplier changed4");

    multiplier = newValue;
    //console.log("multiplier changed7");

    multiplierInput.value = newValue;

    //console.log("multiplier changed2");

    blocksData.forEach(block => {
        UpdateIngredientBlockData(block, 'multiplier');
    });
}

//ingredient button
const addBlockButton = document.getElementById('addBlockButton');
addBlockButton.addEventListener('click', () => {
    InsertBlock(NewIngredientBlock());
});


//EDITOR-------------------------------------------------------------
const editor = document.getElementById('editor');

//INGREDIENT BLOCK--------------------------------------------------------------
function NewIngredientBlock()
{
    // Create the new block
    const newBlock = document.createElement('div');
    newBlock.className = 'block';
    newBlock.setAttribute('contenteditable', 'false'); // Prevent typing inside the block

    // Create the number input
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.className = 'number';
    numberInput.value = '1'; // Default value

    // Apply styles to remove arrows
    numberInput.style.webkitAppearance = 'none'; // Remove spinner in WebKit-based browsers
    numberInput.style.mozAppearance = 'textfield'; // Remove spinner in Firefox
    numberInput.style.appearance = 'textfield'; // Remove spinner in modern browsers

    // Create the unit select menu
    //const unitSelect = createAutocompleteField("choose", ["Apple", "Banana", "Orange", "Grapes", "Pineapple"]);/*document.createElement('select');
    const unitSelect = createAutocompleteField("unit", units.map(unit => unit.name), true);
    /*const unitSelect = document.createElement('select');
    unitSelect.className = 'unit';
        units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.name;
        option.textContent = unit.name;
        unitSelect.appendChild(option);
    });*/

    // Create the material select menu
    const materialSelect = createAutocompleteField("ingredient", materials.map(material => material.name), false);
    /*const materialSelect = document.createElement('select');
    materialSelect.className = 'material';
    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material.name;
        option.textContent = material.name;
        materialSelect.appendChild(option);
    });*/
    
    newBlock.appendChild(numberInput);
    newBlock.appendChild(unitSelect);
    newBlock.appendChild(materialSelect);

    // Store block data
    const newBlockData = {
        blockElement: newBlock,
        number: numberInput,
        unit: unitSelect.inputField,
        material: materialSelect.inputField,
    };
    
    numberInput.addEventListener('change', (event) => {
        console.log("number changed");
        IngredientBlockInteracted(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {
        console.log("unit changed!");
        console.log("value of input field is" + unitSelect.inputField.value);
        IngredientBlockInteracted(event.target.parentElement.parentElement, 'unit');
    });
    materialSelect.inputField.addEventListener('value-set', (event) => {
        console.log("!value of input field is" + materialSelect.inputField.value);
        console.log("mterial changed!");
        IngredientBlockInteracted(event.target.parentElement.parentElement, 'material');
    });

    UpdateIngredientBlockData(newBlockData, 'number');

    return newBlockData;
    
}



function IngredientBlockInteracted(blockElement, type){
    const blockIndex = blocksData.findIndex(block => block.blockElement === blockElement);
    if (blockIndex !== -1) {
        const block = blocksData[blockIndex];
        UpdateIngredientBlockData(block, type);
    }
}
// Function to update block data in blocksData array
function UpdateIngredientBlockData(block, change) {
    // Find the parent block element

    console.log(`${block.number.value} ${block.unit.value} ${block.material.value}`);
    if (change === 'unit') {
        //console.log(block.amount);
        if(maintain)
        {
            block.number.value = CalculateIngredientBlockNumberString(block)
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block);
        }

    } else if (change === 'number') {

        if(block.number.value <= 0)
        {
            block.number.value = 1;
        }

        if(maintain && block.amount != null)
        {           
            var newAmount = ToGrams(block.unit.value, block.number.value,block.material.value);
            var newMultiplier = newAmount/block.amount;
            //console.log(`new multupokuer is ${newMultiplier}`)
            ChangeMultiplier(newMultiplier);
        }
        else
        {
            block.amount = CalculateIngredientBlockAmount(block);
            //console.log(`amount = ${block.amount}`)
        }

    } else if (change === 'material') {
        block.amount = ToGrams(block.unit.value, block.number.value,block.material.value)/multiplier;
        
    } else if (change === 'multiplier') {
        if(maintain)
        {
            block.number.value = CalculateIngredientBlockNumberString(block)
        }
        else
        {
            block.amount = ToGrams(block.unit.value, block.number.value,block.material.value)/multiplier;
        }
    }

    console.log("amount is " + block.amount);

}
function CalculateIngredientBlockAmount(block)
{
    return ToGrams(block.unit.value, block.number.value,block.material.value)/multiplier;;
}
function CalculateIngredientBlockNumberString(block)
{
    const number = FromGrams(block.unit.value, block.amount, block.material.value)*multiplier;
    const string = number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 }).replace(/,/g, '');
    console.log(`calculated number is ` + number + ` pretty: ` + string);
    return string;
}

//SHARED USAGE-----------------------------------------
function InsertBlock(newBlockData) {
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

    const newBlock = newBlockData.blockElement;

    // Delete the selected content
    range.deleteContents();

    // Insert the block at the cursor position with spaces before and after
    //const spaceBefore = document.createTextNode(' '); // Space before the block
    //const spaceAfter = document.createTextNode(' ');  // Space after the block

    // Insert space before the block
    //range.insertNode(spaceBefore);
    //range.setStartAfter(spaceBefore); // Move range to right after the space

    // Insert the block
    range.insertNode(newBlock);

    // Insert space after the block
    range.setStartAfter(newBlock); // Move range to right after the block
    //range.insertNode(spaceAfter);

    // Move cursor to after the space
    //range.setStartAfter(spaceAfter); // Place cursor after the space
    range.collapse(true); // Collapse the range to the start point
    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Add the new range to the selection

    blocksData.push(newBlockData);
    console.log(blocksData.length)
}

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

    autocomplete.nearestOption = suggestionsList[0];
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

    showOptions = function()
    {
        const inputValue = this.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        let filteredSuggestions = 0;
        if(inputValue)
        {
            filteredSuggestions = suggestionsList.filter(suggestion =>
                suggestion.toLowerCase().includes(inputValue)
            )
        }else
        {
            filteredSuggestions = suggestionsList;             
        }

        filteredSuggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.addEventListener('click', function() {
                inputField.value = suggestion;
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
        suggestionsContainer.style.display = filteredSuggestions.length ? 'block' : 'none';
        autocomplete.nearestOption = filteredSuggestions.length ? filteredSuggestions[0] : suggestionsList[0];
    }

    inputField.addEventListener('blur', function() {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
            if(forceDefault && !suggestionsList.includes(inputField.value))
            {
                inputField.value = autocomplete.nearestOption;
            }
            autocomplete.nearestOption = suggestionsList[0];
            inputField.dispatchEvent(new CustomEvent('value-set', event));

        }, 100);  // Delay to allow click event to register
    });

    console.log("fart " + autocomplete.inputField.value);
    return autocomplete;
}
// Function to handle input and suggestions
function handleInputSuggestions() {
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




//CONVERSIONS---------------------------------------------

function ToGrams(unitName, amount, materialName)
{
    console.log("to grams called");
    const unit = units.find(u => u.name === unitName);
    const fromType = unit.type;
    return BasicUnitToBasicUnitOfType(fromType, "weight", ToBasicUnitOfSameType(unitName, amount), materialName);
}

function FromGrams(unitName, amount, materialName)
{
    const unit = units.find(u => u.name === unitName);
    const toType = unit.type;
    return ToComplexUnitOfSameType(unitName, BasicUnitToBasicUnitOfType("weight", toType, amount, materialName ));
}

function ToBasicUnitOfSameType(unitName, amount)
{
    const unit = units.find(u => u.name === unitName);
    return amount*unit.ratio;
}

function ToComplexUnitOfSameType(unitName, amount)
{
    const unit = units.find(u => u.name === unitName);
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

