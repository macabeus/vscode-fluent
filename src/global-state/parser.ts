import {
  FluentParser,
  Visitor,
  Message,
  Expression,
  MessageReference,
  VariableReference,
  SelectExpression,
} from '@fluent/syntax'

class VsCodeFluentVisitor extends Visitor {
  hover: { [messageIdentifier in string]: string }

  constructor() {
    super()
    this.hover = {}
  }

  visitMessage(node: Message) {
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
  }
}

const fluentParser = new FluentParser()

const parser = (source: string) => {
  const ast = fluentParser.parse(source)

  const visitorMessage = new VsCodeFluentVisitor()
  visitorMessage.visit(ast)

  return { hover: visitorMessage.hover }
}

export default parser
