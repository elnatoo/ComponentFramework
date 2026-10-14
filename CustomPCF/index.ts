import { IInputs, IOutputs } from "./generated/ManifestTypes";

// DEV NOTE: When working in Visual Studio Code, you may see errors like "Cannot find namespace 'ComponentFramework'" or "Cannot find name 'ComponentFramework'".
// To resolve this, run Ctrl + Shift + P, select "TypeScript: Select TypeScript Version", and choose "Use Workspace Version" to ensure that the correct TypeScript version is used for the project.

// This was used to handle error pcf-1022, but it is not needed anymore since we are using the latest version of pcf-scripts.

// The Power Apps Component Framework (PCF) compiler uses modern ES Modules (export statements) to handle boundaries. 
// It strictly prohibits you from writing namespace MyNamespace { ... } or module MyModule { ... } inside your custom control files.

// declare namespace ComponentFramework {
//     interface Dictionary {
//         [key: string]: any;
//     }

//     interface Context<TInputs> {
//         [key: string]: any;
//         parameters: TInputs;
//     }

//     interface StandardControl<TInputs, TOutputs> {
//         init(context: Context<TInputs>, notifyOutputChanged: () => void, state: Dictionary, container: HTMLDivElement): void;
//         updateView(context: Context<TInputs>): void;
//         getOutputs(): TOutputs;
//         destroy(): void;
//     }
// }

export class CustomPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    // DEV NOTE: The following properties were commented out because it was not needed for the current implementation of the control.
    // private label: HTMLInputElement;
    // private labelContainer: HTMLDivElement;

    // The PCF context object
    private context: ComponentFramework.Context<IInputs>;
    // The wrapper div element for the component
    private container: HTMLDivElement;
    // The callback function to call whenever your code has made a change to a bound or output property
    private notifyOutputChanged: () => void;
    // Flag to track if the component is in edit mode or not
    private isEditMode: boolean;
    // Tracking variable for the name property
    private name: string | null;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {

        // DEV NOTE: The following code was commented out because it was not needed for the current implementation of the control. 
        // It was originally intended to create a label input element and append it to the container, but the current implementation uses a span and input element instead.
        // Decided to keep the code since the scope of this project is to learn how to use the PCF framework and this code may be useful for future reference.

        // this.label = document.createElement("input");
        // this.label.setAttribute("type", "label");
        // this.label.value = "My First PCF Control";
        // // This is an example of using the context object to access parameters defined in the manifest
        // // this.label.value = context.parameters.sampleProperty.raw || "";
        // this.labelContainer = document.createElement("div");
        // this.labelContainer.appendChild(this.label);
        // container.appendChild(this.labelContainer);

        // Track all the parameters and elements needed for the control
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this.container = container;
        this.isEditMode = false;

        // Overriding the default blank value for width and heigh of container
        this.container.style.width = "1280px";
        this.container.style.height = "720px";
        this.container.style.overflow = "hidden"; // Prevents unwanted scrollbars if needed

        // Create the span element to hold the project name
        const message = document.createElement("span");
        message.innerText = `Project Name: ${this.isEditMode ? "" : context.parameters.Name.raw}`;

        // Create the textbox to edit the name
        const text = document.createElement("input");
        text.type = "text";
        text.style.display = this.isEditMode ? "block" : "none";

        if (context.parameters.Name.raw) {
            text.value = context.parameters.Name.raw;
            // Wrap the two above elements in a div to box out the content
            const messageContainer = document.createElement("div");
            messageContainer.appendChild(message);
            messageContainer.appendChild(text);

            // Create the button element to switch between edit and read modes

            const button = document.createElement("button");
            button.textContent = this.isEditMode ? "Save" : "Edit";
            button.addEventListener("click", () => { this.buttonClick(); });

            // Add the message container and button to the overall control container
            this.container.appendChild(messageContainer);
            this.container.appendChild(button);
        }
    }

    public buttonClick() {
        // Get our controls via DOM queries
        const text = this.container.querySelector("input")!;
        const message = this.container.querySelector("span")!;
        const button = this.container.querySelector("button")!;

        // If not in edit mode, copy the current name value to the textbox
        if (!this.isEditMode) {
            text.value = this.name ?? "";
        }
        else if (text.value != this.name) {
            // if in edit mode, copy the textbox value to name and call the notify callback
            this.name = text.value;
            this.notifyOutputChanged();
        }

        // Flip the mode flag
        this.isEditMode = !this.isEditMode;

        // Set up the new output based on changes
        message.innerText = `Project name ${this.isEditMode ? "" : this.name}`;
        text.style.display = this.isEditMode ? "inline" : "none";
        text.value = this.name ?? "";
        button.textContent = this.isEditMode ? "Save" : "Edit";
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {

        // Checks for updates coming in from outside
        this.name = context.parameters.Name.raw;
        const message = this.container.querySelector("span")!;
        message.innerText = `Project Name: ${this.name}`;
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            // If our name variable is null, return undefined instead
            Name: this.name ?? undefined
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy() {
        // Remove the event listener we created in init
        this.container.querySelector("button")!.removeEventListener("click", this.buttonClick);
    }
}
