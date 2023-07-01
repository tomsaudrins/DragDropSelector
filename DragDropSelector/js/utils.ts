export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  export function updateFileUploadText(fileCount: number, fileNames: string[], fileUploadText: HTMLElement, removeFileCallback: (fileName: string) => void): void {
    const selectedText = fileCount > 1 ? "Selected Files:" : "Selected:";
    fileUploadText.innerHTML = `<span class="selected-text">${selectedText}</span><br>${fileNames.map((name) => `<span class='file-name'>${name}<span class='remove-icon' data-filename='${name}'>🗑</span></span>`).join("<br>")}`;
  
    const removeIcons = fileUploadText.querySelectorAll(".remove-icon");
    removeIcons.forEach((icon) => {
      icon.addEventListener("click", (event) => {
        event.stopPropagation(); 
        const target = event.target as HTMLElement;
        const fileName = target.getAttribute("data-filename");
        if (fileName) {
          removeFileCallback(fileName);
        }
      });
    });
  }