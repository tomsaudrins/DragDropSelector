import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { createFileUploadStructure } from "./js/fileUploadStructure";
import { arrayBufferToBase64, updateFileUploadText } from "./js/utils";

export class DragDropSelector implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;
  private container: HTMLDivElement;
  private inputFile: HTMLInputElement = document.createElement("input");
  private fileUploadText: HTMLElement = document.createElement("span");
  private fileContentsArray: { [key: string]: string } = {};
  private context: ComponentFramework.Context<IInputs>;
  constructor() {}
  
  public handleDrop(files: FileList): void {
    const maxFiles = this.context.parameters.MaxFiles.raw || -1;
    if (maxFiles !== -1 && (Object.keys(this.fileContentsArray).length + files.length) > maxFiles) {
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
  
      fileNames.push(file.name);
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const base64Content = arrayBufferToBase64(e.target.result as ArrayBuffer);
          this.fileContentsArray[file.name] = base64Content;
          filesRead++;
  
          if (filesRead < files.length) {
            processFile(files[filesRead]);
          } else {
            const allFileNames = Object.keys(this.fileContentsArray);
            updateFileUploadText(allFileNames.length, allFileNames, this.fileUploadText, this.removeFile.bind(this));
            this.notifyOutputChanged();
          }
        }
      };
      reader.readAsArrayBuffer(file);
    };
  
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

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

  public destroy(): void {}

  public removeFile(fileName: string): void {
    if (Object.prototype.hasOwnProperty.call(this.fileContentsArray, fileName)) {
      delete this.fileContentsArray[fileName];
      const fileNames = Object.keys(this.fileContentsArray);
  
      if (fileNames.length === 0) {
        this.fileUploadText.innerHTML = 'Drag & Drop<br><span id="browse">or browse</span>';
      } else {
        updateFileUploadText(fileNames.length, fileNames, this.fileUploadText, this.removeFile.bind(this));
      }
  
      this.notifyOutputChanged();
    }
  }

  public handleFileUpload(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const maxFiles = this.context.parameters.MaxFiles.raw || -1;
    if (!inputElement || !inputElement.files || inputElement.files.length === 0) {
      return;
    }
    if (maxFiles !== -1 && (Object.keys(this.fileContentsArray).length + inputElement.files.length) > maxFiles) {
      // Show error message and return
      alert(`You have exceeded the maximum number of files allowed. You can upload up to ${maxFiles} files.`);
      return;
    }
  
    const files = inputElement.files;
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
  
      fileNames.push(file.name);
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const base64Content = arrayBufferToBase64(e.target.result as ArrayBuffer);
          this.fileContentsArray[file.name] = base64Content;
          filesRead++;
  
          if (filesRead < files.length) {
            processFile(files[filesRead]);
          } else {
            const allFileNames = Object.keys(this.fileContentsArray);
            updateFileUploadText(allFileNames.length, allFileNames, this.fileUploadText, this.removeFile.bind(this));
            this.notifyOutputChanged();
          }
        }
      };
      reader.readAsArrayBuffer(file);
    };
  
    processFile(files[0]);
  }
}