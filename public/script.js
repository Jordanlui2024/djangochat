function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('File upload failed.');
        }
        return response.text();
    })
    .then(data => {
        console.log('File uploaded successfully:', data);
        const chatWindow = document.querySelector('.chat-window');
        
        const imgElement = document.createElement('img');
        imgElement.src = `/uploads/${file.name}`;
        imgElement.style.width = '100px';

        const downloadLink = document.createElement('a');
        downloadLink.href = `/uploads/${file.name}`;
        downloadLink.download = file.name;
        downloadLink.textContent = '下載';

        chatWindow.appendChild(imgElement);
        chatWindow.appendChild(downloadLink);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
        alert('文件上傳失敗: ' + error.message);
    });
} 