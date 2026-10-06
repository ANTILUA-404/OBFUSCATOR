document.addEventListener('DOMContentLoaded', () => {
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const levelSelect = document.getElementById('level-select');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const toast = document.getElementById('toast');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Obfuscate Button Click
    obfuscateBtn.addEventListener('click', async () => {
        const code = inputCode.value.trim();
        
        if (!code) {
            showToast('Please enter some Lua code first.', '#ef4444');
            return;
        }

        // Set Loading State
        obfuscateBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        outputCode.textContent = 'Obfuscating...';
        outputCode.style.color = '#94a3b8';

        try {
            const response = await fetch('/api/obfuscate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    level: levelSelect.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to obfuscate code');
            }

            outputCode.textContent = data.result;
            outputCode.style.color = '#86efac';
            showToast('Obfuscation complete!', '#8b5cf6');

        } catch (error) {
            outputCode.textContent = `Error: ${error.message}`;
            outputCode.style.color = '#ef4444';
            showToast('Error occurred.', '#ef4444');
        } finally {
            // Reset Loading State
            obfuscateBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = outputCode.textContent;
        
        if (!textToCopy || textToCopy.startsWith('Error:') || textToCopy === 'Output will appear here...' || textToCopy === 'Obfuscating...') {
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Copied to clipboard!', '#10b981');
        }).catch(() => {
            showToast('Failed to copy', '#ef4444');
        });
    });

    // Clear Input
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputCode.value = '';
            showToast('Input cleared!', '#10b981');
        });
    }

    // Download Output
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const textToDownload = outputCode.textContent;
            if (!textToDownload || textToDownload.startsWith('Error:') || textToDownload === 'Obfuscating...' || textToDownload === '-- Obfuscated output will appear here...') return;
            
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'protected.lua';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Download started!', '#8b5cf6');
        });
    }

    // Toast Notification Helper
    let toastTimeout;
    function showToast(message, bgColor) {
        toast.textContent = message;
        toast.style.background = bgColor;
        toast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
