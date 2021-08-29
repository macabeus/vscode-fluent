import path from 'path'
import runner from './runner'

const runWithWorkspace = () => {
  const testsRoot = path.resolve(__dirname, 'with-workspace')

  runner(testsRoot)
}

export { runWithWorkspace as run }
