import { tw } from 'twind'
import { DiffData } from '../lib/types.ts'

export function DiffUI({ diff, commit }: DiffData) {
  return (
    <div>
      {diff.map((diffFile) => (
        <div
          class={tw`bg-white mx-2 mb-8 border-2 border-blue-400 shadow-xl`}
          style={{ marginBottom: 20 }}
        >
          <div class="p-3 bg-blue-50 flex justify-between">
            <div class="font-bold">{diffFile.filename}</div>
            <div>
              {!diffFile.isNew && (
                <a href={`/blob/${commit.parent}/${diffFile.filename}`}>
                  before
                </a>
              )}
              {!diffFile.isNew && !diffFile.isDeleted && <span> / </span>}
              {!diffFile.isDeleted && (
                <a href={`/blob/${commit.sha}/${diffFile.filename}`}>after</a>
              )}
            </div>
          </div>
          <div>
            {diffFile.lines.map((line) => (
              <pre class={`${diffLineClass(line)}`}>
                <span class="select-none text-gray-500">{line.charAt(0)}</span>
                {line.substring(1)}
              </pre>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function diffLineClass(line: string) {
  switch (line.charAt(0)) {
    case '+':
      return 'bg-green-50'
    case '-':
      return 'bg-red-50'
    case '@':
      return 'bg-blue-200 select-none'
  }
  return ''
}
