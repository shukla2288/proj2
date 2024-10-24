document.getElementById('commandForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const commandType = document.getElementById('commandType').value;
    const assetDetails = {
        id: document.getElementById('assetId').value,
        owner: document.getElementById('assetOwner').value,
        description: document.getElementById('assetDescription').value,
        value: document.getElementById('assetValue').value,
        newOwner: document.getElementById('newOwner').value,
    };

    try {
        const response = await fetch('/run-command', {
            method: 'POST', // Ensure you are using POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ commandType, assetDetails }),
        });

        const data = await response.json();
        document.getElementById('output').innerText = data.output || data.error || 'No output returned'; // Display output or error
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').innerText = `Error: ${error.message}`;
    }
});
