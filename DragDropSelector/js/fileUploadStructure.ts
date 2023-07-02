export function createFileUploadStructure(container: HTMLDivElement, inputFile: HTMLInputElement, fileUploadText: HTMLElement, handleDrop: (files: FileList) => void): void {  const fileUploadContainer = document.createElement("div");
  fileUploadContainer.className = "file-upload";
  fileUploadContainer.onclick = () => inputFile.click();

  // Add drag and drop event listeners
  fileUploadContainer.ondragover = fileUploadContainer.ondragenter = function(evt) {
    evt.preventDefault();
  };

  fileUploadContainer.ondragleave = function(evt) {
    evt.preventDefault();
  };

  fileUploadContainer.ondrop = function(evt) {
    evt.preventDefault();
    // Check if dataTransfer is not null
    if (evt.dataTransfer) {
      // Get the files from the event
      const files = evt.dataTransfer.files;
      // Handle the dropped files
      handleDrop(files);
    }
  };

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