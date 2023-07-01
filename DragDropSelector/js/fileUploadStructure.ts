export function createFileUploadStructure(container: HTMLDivElement, inputFile: HTMLInputElement, fileUploadText: HTMLElement): void {
    const fileUploadContainer = document.createElement("div");
    fileUploadContainer.className = "file-upload";
    fileUploadContainer.onclick = () => inputFile.click();
  
    inputFile.type = "file";
    inputFile.multiple = true;
  
    const fileUploadIcon = document.createElement("i");
    fileUploadIcon.className = "fa fa-files-o file-upload-icon";
    fileUploadIcon.setAttribute("aria-hidden", "true");
  
    fileUploadText.className = "file-upload-text";
    fileUploadText.innerHTML = 'Drag & Drop<br><span id="browse">or browse</span>';
  
    fileUploadContainer.appendChild(inputFile);
    fileUploadContainer.appendChild(fileUploadIcon);
    fileUploadContainer.appendChild(fileUploadText);
  
    container.appendChild(fileUploadContainer);
  }