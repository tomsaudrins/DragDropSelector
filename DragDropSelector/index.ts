import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { createFileUploadStructure } from "./js/fileUploadStructure";
import { arrayBufferToBase64, updateFileUploadText } from "./js/utils";

export class DragDropSelector implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;
  private container: HTMLDivElement;
  private inputFile: HTMLInputElement = document.createElement("input");
  private fileUploadText: HTMLElement = document.createElement("span");
  private fileContentsArray: { [key: string]: string } = {};

  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;

    createFileUploadStructure(this.container, this.inputFile, this.fileUploadText);
    this.inputFile.onchange = this.handleFileUpload.bind(this);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {}

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
  
    if (!inputElement || !inputElement.files) {
      return;
    }
  
    this.fileContentsArray = {};
    const fileNames: string[] = [];
    let filesRead = 0;
    const reader = new FileReader();
  
    const processFile = (file: File) => {
      fileNames.push(file.name);
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const base64Content = arrayBufferToBase64(e.target.result as ArrayBuffer);
          this.fileContentsArray[file.name] = base64Content;
          filesRead++;
  
          if (inputElement.files && filesRead < inputElement.files.length) {
            processFile(inputElement.files[filesRead]);
          } else {
            updateFileUploadText(inputElement.files?.length || 0, fileNames, this.fileUploadText, this.removeFile.bind(this));
            this.notifyOutputChanged();
          }
        }
      };
      reader.readAsArrayBuffer(file);
    };
  
    if (inputElement.files.length > 0) {
      processFile(inputElement.files[0]);
    }
  }
}