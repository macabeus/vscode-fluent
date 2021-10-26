import {
  CodeAction,
  CodeActionKind,
  CodeActionProvider,
  commands,
  languages,
  TextDocument,
  Range,
  window,
  workspace,
  WorkspaceEdit,
} from 'vscode'
import {
  getMessageIdSpan,
  getAllGroupComments,
  getAssociatedFluentFilesByFilePath,
} from '../global-state'
import { workspaceHasFtlFiles } from '../utils'

const commandNameExtractStringToFluent = 'extractStringToFluent'

const shouldDisplayCodeAction = async (selectedText: string) => {
  const thereAreFtlFiles = await workspaceHasFtlFiles()
  if (thereAreFtlFiles === false) {
    return false
  }

  const hasQuotesBordering = selectedText.match(/^(['"`]).*\1$/s)
  if (hasQuotesBordering === null) {
    return false
  }

  return true
}

const codeActionProvider: CodeActionProvider = {
  provideCodeActions: async (document, range) => {
    const selectedText = document.getText(range)

    if (await shouldDisplayCodeAction(selectedText) === false) {
      return []
    }

    const escapedText = selectedText
      .replace(/^['"`]/, '')
      .replace(/['"`]$/, '')

    const codeAction = new CodeAction('Extract to Fluent files', CodeActionKind.QuickFix)

    codeAction.command = {
      command: commandNameExtractStringToFluent,
      title: 'Extract string to Fluent files',
      arguments: [escapedText, document, range],
    }

    return [codeAction]
  },
}

const commandExtractStringToFluent = {
  name: commandNameExtractStringToFluent,
  handle: async (selectedText: string, originDocument: TextDocument, originRange: Range) => {
    const ftlPaths = getAssociatedFluentFilesByFilePath(originDocument.uri.path)
    if ('error' in ftlPaths) {
      window.showErrorMessage(ftlPaths.error)
      return
    }

    const groupComments = getAllGroupComments()
      .filter(groupComment => ftlPaths.some(path => path === groupComment.path))

    const askGroupAndId = async () => {
      const groupsNames = new Set(
        groupComments
          .flatMap(ftl => ftl.groupComments.map(group => group.name))
      )

      let groupName = await window.showQuickPick(['* Add new group', ...groupsNames])
      if (groupName === '* Add new group') {
        groupName = await window.showInputBox()
      }
      if (groupName === undefined) {
        return
      }

      const idPlaceholder = selectedText
        .replace(/\s/g, '-')

      const id = await window.showInputBox({
        value: idPlaceholder,
        valueSelection: [0, idPlaceholder.length],
        placeHolder: idPlaceholder,
      })

      if (id === undefined) {
        return
      }
      if (id === '') {
        window.showErrorMessage(`Invalid message id "${id}"`)
        return
      }

      return { groupName, id }
    }

    const addToFluentFiles = async (groupName: string, id: string) =>
      Promise.all(ftlPaths.map(async (ftlPath) => {
        const textDocument = await workspace.openTextDocument(ftlPath)

        let groupOffsetEnd = groupComments
          .find(groupComment => groupComment.path === ftlPath)
          ?.groupComments
          .find(group => group.name === groupName)
          ?.end

        const paddedText = selectedText
          .split('\n')
          .map((line, index) => index === 0
            ? line
            : `    ${line}`)
          .join('\n')
        let insertCode = `\n${id} = ${paddedText}`

        if (groupOffsetEnd === undefined) {
          const positionEndFile = textDocument.lineAt(textDocument.lineCount - 1).range.end
          groupOffsetEnd = textDocument.offsetAt(positionEndFile)

          const groupSectionCode = (
            textDocument.getText().length > 0
              ? `\n## ${groupName}\n`
              : `## ${groupName}\n`
          )
          insertCode = `${groupSectionCode}${insertCode}`
        }

        const isNewId = (getMessageIdSpan(ftlPath, id) === undefined)
        if (isNewId === false) {
          window.showWarningMessage(`Duplicated id on "${ftlPath}"`)
        }

        const insertPosition = textDocument.positionAt(groupOffsetEnd + 1)

        const workspaceEdit = new WorkspaceEdit()
        workspaceEdit.insert(textDocument.uri, insertPosition, insertCode)
        const applySucces = await workspace.applyEdit(workspaceEdit)
        if (applySucces === false) {
          window.showErrorMessage(`Error when tried to insert the message on "${ftlPath}"`)
          throw new Error()
        }

        textDocument.save()
      }))

    const replaceSelectedString = (id: string) => {
      const template = workspace.getConfiguration('vscodeFluent').get('replacementTemplate') as string
      const replacementCode = template.replace('$1', id)

      const workspaceEdit = new WorkspaceEdit()
      workspaceEdit.replace(originDocument.uri, originRange, replacementCode)
      workspace
        .applyEdit(workspaceEdit)
        .then((success) => {
          if (success === false) {
            window.showErrorMessage('Error when tried to replace selection')
            return
          }

          originDocument.save()
        })
    }

    const askResult = await askGroupAndId()
    if (askResult === undefined) {
      return
    }

    const { groupName, id } = askResult
    await addToFluentFiles(groupName, id)
    if (id !== undefined) {
      replaceSelectedString(id)
    }
  },
}

const registerCodeActionExtractStringToFluent = () => {
  languages.registerCodeActionsProvider({ pattern: '**/*[!.ftl]' }, codeActionProvider)

  commands.registerCommand(
    commandExtractStringToFluent.name,
    commandExtractStringToFluent.handle
  )
}

export default registerCodeActionExtractStringToFluent
