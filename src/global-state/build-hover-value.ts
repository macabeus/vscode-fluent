import {
  PatternElement,
  Expression,
  MessageReference,
  TermReference,
  VariableReference,
  SelectExpression,
} from '@fluent/syntax'

const buildHoverValue = (patternElements: PatternElement[]) =>
  patternElements
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
        (element.expression as Expression).type === 'TermReference'
      ) {
        return `{ -${(element.expression as TermReference).id.name} }`
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
    .join('')

export default buildHoverValue
