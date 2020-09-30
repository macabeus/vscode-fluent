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
import { getMessageIdSpan, getGroupComments } from '../global-state'

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
    const groupComments = getGroupComments()

    const askGroupAndId = async () => {
      const groupsNames = new Set(
        groupComments
          .flatMap(ftl => ftl.groupComments.map(group => group.name))
      )

      const groupName = await window.showQuickPick([...groupsNames])
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
      Promise.all(groupComments.map(async (ftl) => {
        const selectedGroup = ftl.groupComments.find(group => group.name === groupName)

        if (selectedGroup === undefined) {
          window.showWarningMessage(`Can't found the message group "${groupName}" on "${ftl.path}"`)
          return
        }

        const isNewId = (getMessageIdSpan(ftl.path, id) === undefined)
        if (isNewId === false) {
          window.showWarningMessage(`Duplicated id on "${ftl.path}"`)
        }

        const textDocument = await workspace.openTextDocument(ftl.path)
        const position = textDocument.positionAt(selectedGroup.end + 1)

        const workspaceEdit = new WorkspaceEdit()
        workspaceEdit.insert(textDocument.uri, position, `\n${id} = ${selectedText}`)
        const applySucces = await workspace.applyEdit(workspaceEdit)
        if (applySucces === false) {
          window.showErrorMessage(`Error when tried to insert the message on "${ftl.path}"`)
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
