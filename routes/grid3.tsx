import { JSX } from 'preact/jsx-runtime'

const stuff: JSX.Element[] = []
for (let i = 0; i < 100; i++) {
  stuff.push(<div>stuff {i}</div>)
}

export default function () {
  return (
    <div class=" bg-pink-100 h-screen">
      <div class="bg-green-500 h-12 flex items-center p-4 space-x-4">
        <span>super cool topbar</span>
        <span>two two</span>
        <span>333</span>
      </div>
      <div class="flex absolute top-12 bottom-24 w-full">
        <div class="bg-green-100 ">
          <div class="max-h-full overflow-scroll py-4 px-12">{stuff}</div>
        </div>
        <div class="bg-blue-100 flex-grow">
          <div class="max-h-full overflow-scroll p-2">{stuff}</div>
        </div>
      </div>
    </div>
  )
}
