// Function to add a new ingredient input field dynamically
function addIngredientInput() {
    const container = document.getElementById('ingredientInputs');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'ingredient-input'; // Use this class to find all inputs later
    newInput.placeholder = 'Another ingredient...';
    newInput.style.marginBottom = '5px';
    container.appendChild(newInput);
}

// Function to call the Flask API
async function getRecipe() {
    const restriction = document.getElementById('restriction').value;
    
    // --- START NEW DYNAMIC INPUT COLLECTION ---
    const ingredientInputs = document.querySelectorAll('.ingredient-input');
    const ingredients = [];
    
    // 1. Collect values from all input fields with the class 'ingredient-input'
    ingredientInputs.forEach(input => {
        if (input.value.trim()) {
            ingredients.push(input.value.trim());
        }
    });

    // 2. Join the list of ingredients into a single comma-separated string
    // Example: "prawn, onion, tomato"
    const ingredient_list = ingredients.join(', ');
    // --- END NEW DYNAMIC INPUT COLLECTION ---

    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loading');
    
    // Client-Side Input Validation (Now checks for at least ONE ingredient)
    if (ingredients.length === 0 || !restriction) {
        outputDiv.innerHTML = "🚨 *Error:* Please enter at least one ingredient and a dietary restriction.";
        return;
    }

    // Show loading spinner
    outputDiv.innerHTML = "";
    loadingSpinner.style.display = 'block';

    // The API URL points to the Flask route defined in app.py
    const API_URL = '/api/suggest_meal'; 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                // --- Use the new combined list here ---
                ingredient: ingredient_list, 
                restriction: restriction 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success: Display the recipe (formatted with Markdown)
            outputDiv.innerHTML = data.recipe;
        } else {
            // API Error: Display the error message from the Flask app
            outputDiv.innerHTML = ⚠️ API Call Failed (${response.status}): ${data.error || 'Unknown error'};
        }
    } catch (error) {
        outputDiv.innerHTML = ❌ Connection Error: Could not reach the server. ${error.message};
    } finally {
        // Hide spinner when request is complete
        loadingSpinner.style.display = 'none';
    }
}
