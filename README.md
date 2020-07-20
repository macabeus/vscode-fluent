# vscode-fluent

> 💬 VS Code extension to work with Fluent, the correct-by-design l10n programming language

<p align="center">
  <img height="350px" src="https://user-images.githubusercontent.com/9501115/79078504-ba762b80-7d00-11ea-93d4-c2ee6806856b.png">
</p>

**Fluent** is a Mozilla's programming language for natural-sounding translations. And **vscode-fluent** is a VisualCode Studio extension to improve developer experience while working with this language.

- [Official Fluent's website](https://projectfluent.org/)
- [Fluent Syntax Guide](https://www.projectfluent.org/fluent/guide/)
- [Fluent's Playground](https://projectfluent.org/play/)

## How to develop this extension

### Syntax

The syntax is written on a [YML file](./syntaxes/fluent.tmLanguage.yml). Before to run the extension on vscode, you should build it to JSON.

```
> npm run build-syntaxes
```
