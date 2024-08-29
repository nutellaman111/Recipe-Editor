//DATA--------------------------------------------------------------
const ingredientUnits = [ //ratio = how many times bigger it is than the 'basic unit' of the same type
    { name: 'grams', type: 'weight', ratio: 1 }, //basic unit of type weight
    { name: 'milliliters', type: 'volume', ratio: 1 }, //basic unit of type volume
    { name: 'x', type: 'countable', ratio: 1 }, //basic unit of type countable (things u can count like 1 egg)
    { name: 'kilograms', type: 'weight', ratio: 1000 },
    { name: 'liters', type: 'volume', ratio: 1000 },
    { name: 'ounces', type: 'weight', ratio: 28.3495 },
    { name: 'pints', type: 'volume', ratio: 473.176 },
    { name: 'cups', type: 'volume', ratio: 236.588 },
    { name: 'teaspoons', type: 'volume', ratio: 0.202884 },
    { name: 'tablespoons', type: 'volume', ratio: 0.067628 }
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
    multiplier = newValue;
    multiplierInput.value = NumberToString(multiplier);

    allBlocks.forEach(block => {
        UpdateIngredientBlockData(block, 'multiplier');
    });
}

//ingredient block button
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
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('contenteditable', 'false'); // Prevent typing inside the block

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
    
    numberInput.addEventListener('change', (event) => {
        console.log("number changed");
        IngredientBlockInteracted(event.target.parentElement, 'number');
    });    
    unitSelect.inputField.addEventListener('value-set', (event) => {
        console.log("unit changed!");
        console.log("value of input field is" + unitSelect.inputField.value);
        IngredientBlockInteracted(event.target.parentElement.parentElement, 'unit');
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
    unitSelect.inputField.addEventListener('options-update', (event) => {
        IngredientBlockInteracted(event.target.parentElement.parentElement, 'optionsUpdate');
    });
    UpdateIngredientBlockData(block, 'number');

    return block;
    
}
function IngredientBlockInteracted(block, type){
    UpdateIngredientBlockData(block, type);
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
    return ((Math.ceil(number * 100))/100).toString().replace(/,/g, '')
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

