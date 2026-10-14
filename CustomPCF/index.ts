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

    // Framework-provided infrastructure
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;

    // Component internal state
    private isEditMode = false;
    private name: string | null = null;
    private accentColor = "#0078d4"; // Fallback color

    // Persistent DOM element references to prevent querySelector leakage
    private messageElement: HTMLSpanElement;
    private inputElement: HTMLInputElement;
    private actionButton: HTMLButtonElement;
    private mainWrapper: HTMLDivElement;

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

        // Extract properties and cache initial state
        this.updateStateProperties(context);

        // Build and anchor DOM structure
        this.mainWrapper = document.createElement("div");
        this.mainWrapper.className = "pcf-navbar-container";

        this.messageElement = document.createElement("span");
        this.inputElement = document.createElement("input");
        this.inputElement.type = "text";

        this.actionButton = document.createElement("button");
        // Bind the handler explicitly so context is maintained
        this.actionButton.addEventListener("click", this.handleButtonClick.bind(this));

        // Assemble the UI tree
        this.mainWrapper.appendChild(this.messageElement);
        this.mainWrapper.appendChild(this.inputElement);
        this.container.appendChild(this.mainWrapper);
        this.container.appendChild(this.actionButton);

        // Synchronize DOM with the current state values
        this.renderUI();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {

        this.context = context;
        
        // Only override state from outside if the user is not actively editing it locally
        if (!this.isEditMode) {
            this.updateStateProperties(context);
        }
        
        this.renderUI();
    }

    /**
     * Extracts and maps both incoming parameter fields and native context utilities.
     */
    private updateStateProperties(context: ComponentFramework.Context<IInputs>): void {
        this.name = context.parameters.Name.raw || null;

        // Safely extract property using record lookups instead of using 'any' bypasses
        const rawParameters = context.parameters as unknown as Record<string, ComponentFramework.PropertyTypes.Property>;
        if (rawParameters.accentColor && rawParameters.accentColor.raw) {
            this.accentColor = rawParameters.accentColor.raw as string;
        } else {
            this.accentColor = "#0078d4";
        }
    }

    /**
     * Renders UI display changes based entirely on current component states.
     */
    private renderUI(): void {
        const structuralNameValue = this.name ?? "";

        // Stylize elements dynamically using context configuration parameters
        this.mainWrapper.style.backgroundColor = this.accentColor;

        if (this.isEditMode) {
            this.messageElement.innerText = "Project Name: ";
            this.inputElement.style.display = "inline-block";
            this.inputElement.value = structuralNameValue;
            this.actionButton.textContent = "Save";
        } else {
            this.messageElement.innerText = `Project Name: ${structuralNameValue}`;
            this.inputElement.style.display = "none";
            this.actionButton.textContent = "Edit";
        }
    }

    /**
     * Handles the button click event to toggle between edit and view modes, updating the name property and notifying the framework of output changes as necessary.
     * Updates underlying data mutations and handles framework callbacks.
     */
    private handleButtonClick(): void {
        if (this.isEditMode) {
            const changedValue = this.inputElement.value.trim();
            
            if (changedValue !== this.name) {
                this.name = changedValue || null;
                this.notifyOutputChanged();
            }
        }

        // Toggle visibility state and push re-render update
        this.isEditMode = !this.isEditMode;
        this.renderUI();
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
        // Clean up event listeners using exact references to avoid DOM leaks
        if (this.actionButton) {
            this.actionButton.removeEventListener("click", this.handleButtonClick);
        }
    }

}
