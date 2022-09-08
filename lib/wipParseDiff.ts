import { gitcli } from './gitcli.ts'

export async function gitDiff({ ref }: { ref: string }) {
  const diffOutput = await gitcli(['diff', '--no-prefix', `${ref}~1`, ref])
  return parseDiff(diffOutput)
}

export type DiffFile = {
  oldFilename: string
  filename: string
  isNew?: boolean
  isDeleted?: boolean
  lines: string[]
}

function parseDiff(diffOutput: string) {
  const diffFiles: DiffFile[] = []
  let currentFile: DiffFile

  for (const line of diffOutput.split('\n')) {
    const firstToken = line.substring(0, line.indexOf(' '))

    switch (firstToken) {
      case 'diff': {
        const tokens = line.split(' ')
        currentFile = {
          oldFilename: tokens[2],
          filename: tokens[3],
          // hunks: [],
          lines: [],
        }
        diffFiles.push(currentFile)
        break
      }
      case 'new':
        currentFile!.isNew = true
        continue
      case 'deleted':
        currentFile!.isDeleted = true
        currentFile!.filename = currentFile!.oldFilename
        continue
      case 'index':
      case '---':
      case '+++':
        continue
      // case '@@':
      //   console.log('HUNK', line)
      //   break
      default:
        currentFile!.lines.push(line)

      // switch (line.charAt(0)) {
      //   case '+':
      //     console.log('ADD', line)
      //     break
      //   case '-':
      //     console.log('RM', line)
      //     break
      //   case ' ':
      //     console.log('SAME', line)
      //     break
      //   case '':
      //     console.log('EMPTY', line)
      //     break
      //   default:
      //     console.log(line)
      //     throw new Error(`unexpected diff prefix: ${line.charAt(0)}`)
      // }
    }
  }

  return diffFiles
}
