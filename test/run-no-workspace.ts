import path from 'path'
import runner from './runner'

const runNoWorkspace = () => {
  const testsRoot = path.resolve(__dirname, 'no-workspace')

  runner(testsRoot)
}

export { runNoWorkspace as run }
