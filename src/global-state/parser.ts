import {
  FluentParser,
  Visitor,
  Message,
  Expression,
  GroupComment,
  MessageReference,
  VariableReference,
  SelectExpression,
  Junk,
} from '@fluent/syntax'

class VsCodeFluentVisitor extends Visitor {
  idSpan: { [messageIdentifier in string]: { start: number, end: number } }
  valueSpan: { [messageIdentifier in string]: { start: number, end: number } }
  hover: { [messageIdentifier in string]: string }
  groupComments: Array<{ name: string, start: number, end: number }>
  messageReferenceSpan: { [messageIdentifier in string]: Array<{ start: number, end: number }> }
  junksAnnotations: Array<{ code: string, message: string, start: number, end: number }>

  constructor() {
    super()
    this.idSpan = {}
    this.valueSpan = {}
    this.hover = {}
    this.groupComments = []
    this.messageReferenceSpan = {}
    this.junksAnnotations = []
  }

  visitGroupComment(node: GroupComment) {
    if (node.span === undefined) {
      return
    }

    const newGroupComment = {
      name: node.content,
      start: node.span.start,
      end: node.span.end,
    }

    this.groupComments.push(newGroupComment)
  }

  visitMessage(node: Message) {
    if (node.id.span && node.value?.span) {
      this.idSpan[node.id.name] = { start: node.id.span.start, end: node.id.span.end }
      this.valueSpan[node.id.name] = { start: node.value.span.start, end: node.value.span.end }
    }

    const hoverValue = node.value?.elements
      .map((element) => {
        if (element.type === 'TextElement') {
          return element.value
        }

        if (
          element.type === 'Placeable' &&
          (element.expression as Expression).type === 'VariableReference'
        ) {
          return `{ $${(element.expression as VariableReference).id.name} }`
        }

        if (
          element.type === 'Placeable' &&
          (element.expression as Expression).type === 'MessageReference'
        ) {
          return `{ ${(element.expression as MessageReference).id.name} }`
        }

        if (
          element.type === 'Placeable' &&
          (element.expression as Expression).type === 'SelectExpression' &&
          (element.expression as SelectExpression).selector.type === 'VariableReference'
        ) {
          return `{ $${((element.expression as SelectExpression).selector as VariableReference).id.name } -> ... }`
        }

        return '{ unknown }'
      })
      .join(' ')
    this.hover[node.id.name] = hoverValue || '[unknown]'

    this.genericVisit(node)
  }

  visitMessageReference(node: MessageReference) {
    if (node.span && node.id.span) {
      if (this.messageReferenceSpan[node.id.name] === undefined) {
        this.messageReferenceSpan[node.id.name] = []
      }

      this.messageReferenceSpan[node.id.name].push({ start: node.id.span.start, end: node.id.span.end })
    }
  }

  visitJunk(node: Junk) {
    node.annotations.forEach(annotation => {
      if (annotation.span === undefined) {
        return
      }

      this.junksAnnotations.push({
        code: annotation.code,
        message: annotation.message,
        start: annotation.span.start,
        end: annotation.span.end,
      })
    })
  }
}

const fluentParser = new FluentParser()

const parser = (source: string) => {
  const ast = fluentParser.parse(source)

  const visitorMessage = new VsCodeFluentVisitor()
  visitorMessage.visit(ast)

  return {
    hover: visitorMessage.hover,
    idSpan: visitorMessage.idSpan,
    valueSpan: visitorMessage.valueSpan,
    groupComments: visitorMessage.groupComments,
    messageReferenceSpan: visitorMessage.messageReferenceSpan,
    junksAnnotations: visitorMessage.junksAnnotations,
  }
}

export default parser
