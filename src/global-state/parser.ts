import {
  FluentParser,
  Visitor,
  Message,
  GroupComment,
  MessageReference,
  TermReference,
  Junk,
} from '@fluent/syntax'
import buildHoverValue from './build-hover-value'

class VsCodeFluentVisitor extends Visitor {
  idSpan: { [messageIdentifier in string]: { start: number, end: number } }
  valueSpan: { [messageIdentifier in string]: { start: number, end: number } }
  termSpan: { [messageIdentifier in string]: { start: number, end: number } }
  hover: { [messageIdentifier in string]: string }
  groupComments: Array<{ name: string, start: number, end: number }>
  referenceSpan: { [messageIdentifier in string]: Array<{ start: number, end: number }> }
  junksAnnotations: Array<{ code: string, message: string, start: number, end: number }>

  constructor() {
    super()
    this.idSpan = {}
    this.valueSpan = {}
    this.termSpan = {}
    this.hover = {}
    this.groupComments = []
    this.referenceSpan = {}
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

  visitTerm(node: Message) {
    if (node.id.span && node.value?.span) {
      this.termSpan[`-${node.id.name}`] = { start: node.id.span.start, end: node.id.span.end }
      this.valueSpan[`-${node.id.name}`] = { start: node.value.span.start, end: node.value.span.end }
    }

    this.hover[`-${node.id.name}`] = node.value?.elements
      ? buildHoverValue(node.value.elements)
      : '[unknown]'

    this.genericVisit(node)
  }

  visitMessage(node: Message) {
    if (node.id.span && node.value?.span) {
      this.idSpan[node.id.name] = { start: node.id.span.start, end: node.id.span.end }
      this.valueSpan[node.id.name] = { start: node.value.span.start, end: node.value.span.end }
    }

    this.hover[node.id.name] = node.value?.elements
      ? buildHoverValue(node.value.elements)
      : '[unknown]'

    this.genericVisit(node)
  }

  visitTermReference(node: TermReference) {
    if (node.span && node.id.span) {
      if (this.referenceSpan[`-${node.id.name}`] === undefined) {
        this.referenceSpan[`-${node.id.name}`] = []
      }

      this.referenceSpan[`-${node.id.name}`].push({ start: node.id.span.start, end: node.id.span.end })
    }
  }

  visitMessageReference(node: MessageReference) {
    if (node.span && node.id.span) {
      if (this.referenceSpan[node.id.name] === undefined) {
        this.referenceSpan[node.id.name] = []
      }

      this.referenceSpan[node.id.name].push({ start: node.id.span.start, end: node.id.span.end })
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
    termSpan: visitorMessage.termSpan,
    groupComments: visitorMessage.groupComments,
    referenceSpan: visitorMessage.referenceSpan,
    junksAnnotations: visitorMessage.junksAnnotations,
  }
}

export default parser
