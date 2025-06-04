document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        
        // Show loading state
        submitButton.disabled = true;
        loadingDiv.style.display = 'block';
        resultDiv.innerHTML = '';
        
        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display success result
            resultDiv.innerHTML = createSuccessHTML(result);
            
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = createErrorHTML(error.message);
        } finally {
            // Reset loading state
            submitButton.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });
});

function createSuccessHTML(result) {
    return `
        <div class="result">
            <h3>Registration Processed Successfully</h3>
            <div class="result-item">
                <span class="result-label">Name:</span>
                <span class="result-value">${escapeHtml(result.firstName)} ${escapeHtml(result.lastName)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Email:</span>
                <span class="result-value">${escapeHtml(result.email)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Company:</span>
                <span class="result-value">${escapeHtml(result.company)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Department:</span>
                <span class="result-value">${escapeHtml(result.department)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Phone:</span>
                <span class="result-value">${escapeHtml(result.phoneNumber)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Processing ID:</span>
                <span class="result-value">${escapeHtml(result.processingId)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Processed At:</span>
                <span class="result-value">${escapeHtml(result.processedAt)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Server Version:</span>
                <span class="result-value">${escapeHtml(result.serverVersion)}</span>
            </div>
        </div>
    `;
}

function createErrorHTML(message) {
    return `
        <div class="error">
            <strong>Error:</strong> ${escapeHtml(message)}
            <br>Please check if both servers are running and try again.
        </div>
    `;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
