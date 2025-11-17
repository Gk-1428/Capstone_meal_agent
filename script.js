// Function to call the Flask API
async function getRecipe() {
    const ingredient = document.getElementById('ingredient').value;
    const restriction = document.getElementById('restriction').value;
    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loading');
    
    // Client-Side Input Validation
    if (!ingredient || !restriction) {
        outputDiv.innerHTML = "🚨 *Error:* Please enter both a main ingredient and a dietary restriction.";
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
                ingredient: ingredient, 
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
