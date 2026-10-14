# Power Apps Component Framework 

This repository is a basic **Power Apps Component Framework (PCF)** project built to tinker with the overall component framework architecture and explore the various tools available for creating, building, and packaging code components.

The project serves as a foundational environment for developing custom UI controls for Power Apps (Model-driven and Canvas apps) utilizing TypeScript, ESLint, and Microsoft's PCF tooling orchestration.

This repository contains my practical implementation of the exercises from the Microsoft Learn path, [Building with Power Apps Component Framework](https://learn.microsoft.com/en-us/training/paths/build-basic-code-components-power-apps-component-framework/)

## 📁 Repository Structure

The project includes standard PCF configuration elements and a boilerplate custom control component:

*   **`CustomPCF/`** – The main development folder containing the manifest (`ControlManifest.Input.xml`), TypeScript logic, and styling for the custom control. The control displays and edits its bound `Name` value and supports an optional `accentColor` input for its background.
*   **`ComponentFrameworkProject.pcfproj`** – The MSBuild project file used to package the custom components into a Power Apps solution zip file.
*   **`pcfconfig.json`** – Configuration parameters governing the Power Apps Component Framework build steps.
*   **`package.json` & `package-lock.json`** – Defines project dependencies, packaging configuration, and node scripts used during compilation.
*   **`tsconfig.json`** – Specifies TypeScript compiler choices tailored for compiling the PCF infrastructure.
*   **`eslint.config.mjs`** – Configures modern code linting rules to maintain clean, standardized TypeScript syntax.

## 🚀 Getting Started

### Prerequisites
To build and interact with this project locally, ensure your machine has the following tools installed:
1. [Node.js](https://nodejs.org) (LTS version recommended)
2. [.NET Build Tools](https://dotnet.microsoft.com/en-us/)
3. [Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction?tabs=windows) (pac)

### Installation
Clone the repository and install the project's node dependencies:
```bash
git clone https://github.com/elnatoo/ComponentFramework.git
cd ComponentFramework
npm install
```

### Development Scripts
You can use standard Power Platform CLI (`pac`) or local Node workflows to test the project:

*   **Start the Local Sandbox:** Run the local test harness to debug and observe `CustomPCF` in a simulated browser environment without needing to publish to Dataverse:
    ```bash
    npm start
    ```
*   **Build the Component:** Compile the TypeScript control with the PCF tooling:
    ```bash
    npm run build
    ```
*   **Lint the Component:** Check the TypeScript code with the project's ESLint configuration:
    ```bash
    npm run lint
    ```

## 📦 Packaging and Deployment

To generate a deployable solution artifact that can be directly imported into your Power Apps environment:

1. Open your terminal or a **Developer Command Prompt for VS**.
2. Run MSBuild to package the control into a distributable zip archive:
   ```bash
   msbuild /t:build
   ```
3. Find the generated solution `.zip` file under `out/controls/` (the output path configured in `ComponentFrameworkProject.pcfproj`) and import it into your Power Platform environment through the solutions portal.
