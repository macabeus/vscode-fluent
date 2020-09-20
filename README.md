# vscode-fluent

> 💬 VS Code extension to work with Fluent, the correct-by-design l10n programming language

<p align="center">
  <img height="350px" src="https://user-images.githubusercontent.com/9501115/89740608-25066080-da82-11ea-97b7-c5e54f3023c4.png">
</p>

**Fluent** is a Mozilla's programming language for natural-sounding translations. And **vscode-fluent** is a VisualCode Studio extension to improve developer experience while working with this language.

- [Official Fluent's website](https://projectfluent.org/)
- [Fluent Syntax Guide](https://www.projectfluent.org/fluent/guide/)
- [Fluent's Playground](https://projectfluent.org/play/)

## Feature

- Syntax highlight
- Show syntax errors
- Code Action to extract a string to Fluent files
- Hover support on messages
- Go to message definition from a reference

## Code Action

### Extract string to FTL

<p align="center">
  <img height="350px" src="./docs/extract-to-fluent.gif">
</p>

Using the code action "Extract to Fluent files" you can easly extract a string to from source code to all FTL files on your project.<br />
To open the code action menu, you should select a string (including its quotes) and then type `⌘ + .` (or `Ctrl + .`).

You can change the replacement template using the configuration `vscodeFluent.replacementTemplate`.

## How to develop vscode-fluent

### Syntax

The syntax is written on a [YML file](./syntaxes/fluent.tmLanguage.yml). Before to run the extension on vscode, you should compile it to JSON.

```
> npm run build-syntaxes
```

### Extension

You can run the extension using the vscode debugger out-of-the-box.
