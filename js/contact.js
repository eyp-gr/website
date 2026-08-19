function copyToClipboard(text) {

    navigator.clipboard.writeText(text);

    const message = document.createElement("div");

    message.textContent = "Αντιγράφηκε!";

    message.className = "copy-message";

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 2000);
}