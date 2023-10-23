import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { createFileUploadStructure } from "./js/fileUploadStructure";
import { arrayBufferToBase64, updateFileUploadText, getTotalSizeInKB } from "./js/utils";

export class DragDropSelector implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;
  private container: HTMLDivElement;
  private inputFile: HTMLInputElement = document.createElement("input");
  private fileUploadText: HTMLElement = document.createElement("span");
  private fileContentsArray: { [key: string]: string } = {};
  private context: ComponentFramework.Context<IInputs>;
  constructor() { }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
    this.context = context
    createFileUploadStructure(this.container, this.inputFile, this.fileUploadText, this.handleDrop.bind(this));
    this.inputFile.onchange = this.handleFileUpload.bind(this);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {

    if (context.updatedProperties.includes("InputEvent") && context.parameters.InputEvent.raw !== undefined) {
      const inputEvents = String(context.parameters.InputEvent.raw);

      // ClearValue event
      if (inputEvents.indexOf("ClearValue") > -1) {
        this.fileContentsArray = {}; // Clear the fileContentsArray object
        this.fileUploadText.innerHTML = 'Drag & Drop<br><span id="browse">or browse</span>'; // Reset the fileUploadText element
        this.inputFile.value = "";
        this.notifyOutputChanged();
      }
    }

    this.container.style.width = `${context.mode.allocatedWidth}px`;
    this.container.style.height = `${context.mode.allocatedHeight}px`;
  }

  public getOutputs(): IOutputs {
    const files: { Name: string; Content: string }[] = [];

    for (const key in this.fileContentsArray) {
      if (Object.prototype.hasOwnProperty.call(this.fileContentsArray, key)) {
        files.push({ Name: key, Content: this.fileContentsArray[key] });
      }
    }

    return {
      Files: JSON.stringify(files),
    };
  }

  public destroy(): void { }

  public removeFile(fileName: string): void {
    if (Object.prototype.hasOwnProperty.call(this.fileContentsArray, fileName)) {
      delete this.fileContentsArray[fileName];
      const fileNames = Object.keys(this.fileContentsArray);

      if (fileNames.length === 0) {
        this.fileUploadText.innerHTML = 'Drag & Drop<br><span id="browse">or browse</span>';
      } else {
        updateFileUploadText(fileNames.length, fileNames, this.fileUploadText, this.removeFile.bind(this));
      }
      this.inputFile.value = "";
      this.notifyOutputChanged();
    }
  }

  public handleFiles(files: FileList | null, event?: Event): void {  
    if (event) {  
      const inputElement = event.target as HTMLInputElement;  
      if (!inputElement || !inputElement.files || inputElement.files.length === 0) {  
        return;  
      }  
      files = inputElement.files;  
    }  
    
    const maxFiles = this.context.parameters.MaxFiles.raw || -1;  
    if (!files || maxFiles !== -1 && (Object.keys(this.fileContentsArray).length + files.length) > maxFiles) {  
      // Show error message and return  
      alert(`You have exceeded the maximum number of files allowed. You can upload up to ${maxFiles} files.`);  
      return;  
    }  


    const fileNames: string[] = [];  
    let filesRead = 0;  
    const reader = new FileReader();  
    
    const processFile = (file: File) => {  
      const allowedTypes = this.context.parameters.AllowedTypes.raw || "*/*";  
      if (!allowedTypes.split(',').includes(file.type) && allowedTypes !== "*/*") {  
        // Show error message and return  
        alert(`The file type of ${file.type} is not allowed.`);  
        return;  
      }  
    
            
    const maxFileSize = this.context.parameters.MaxFileSize.raw || 40960;  
    const fileSize = Math.ceil(file.size / 1024);  


    if (maxFileSize !== -1 && fileSize > maxFileSize) {  
      alert(`The file size exeeds maximum allowed of ${(maxFileSize / 1024).toFixed(2)} MB. The file ${file.name} size is ${(fileSize / 1024).toFixed(2)} MB`);  
      return;  
    }  


    const maxFileBatchSize = this.context.parameters.MaxFileBatchSize.raw || 256000;  
    const totalFilesSize = getTotalSizeInKB(this.fileContentsArray) + fileSize;  

    if (maxFileBatchSize !== -1  && totalFilesSize > maxFileBatchSize) {  
      alert(`Total file size exeeds maximum allowed of ${(maxFileBatchSize / 1024).toFixed(2)} MB. By adding the ${file.name} file, total size would be ${(totalFilesSize / 1024).toFixed(2)} MB`);  
      return;  
    }  
    

      fileNames.push(file.name);  
      reader.onload = (e) => {  
        if (e.target && e.target.result) {  
          let fileContent: string;  
          console.log('encoding type ' + this.context.parameters.EncodingType.raw)
        if (Number(this.context.parameters.EncodingType.raw)) {  
          // Return file content as plain text  
          const decoder = new TextDecoder();  
          fileContent = decoder.decode(e.target.result as ArrayBuffer);  
        } else {  
          // Return file content as base64 encoded string  
          fileContent = arrayBufferToBase64(e.target.result as ArrayBuffer);  
        }  
        this.fileContentsArray[file.name] = fileContent;  
          filesRead++;  
    
          if (filesRead < files!.length) {  
            processFile(files![filesRead]);  
          } else {  
            const allFileNames = Object.keys(this.fileContentsArray);  
            updateFileUploadText(allFileNames.length, allFileNames, this.fileUploadText, this.removeFile.bind(this));  
            this.notifyOutputChanged();  
          }  
        }  
      };  
      reader.readAsArrayBuffer(file);  
    };  
    
    if (files && files.length > 0) {  
      processFile(files[0]);  
    }  
  }  
    
  public handleDrop(files: FileList): void {  
    this.handleFiles(files);  
  }  
    
  public handleFileUpload(event: Event): void {  
    this.handleFiles(null, event);  
  }  
  
}