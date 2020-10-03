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
  getGroupComments,
  getAssociatedFluentFilesByFilePath,
} from '../global-state'

const commandNameExtractStringToFluent = 'extractStringToFluent'

const codeActionProvider: CodeActionProvider = {
  provideCodeActions: (document, range) => {
    const selectedText = document
      .getText(range)
      .replace(/^['"]/, '')
      .replace(/['"]$/, '')

    const codeAction = new CodeAction('Extract to Fluent files', CodeActionKind.QuickFix)

    codeAction.command = {
      command: commandNameExtractStringToFluent,
      title: 'Extract string to Fluent files',
      arguments: [selectedText, document, range],
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

    const groupComments = getGroupComments()
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

        let insertCode = `\n${id} = ${selectedText}`

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
