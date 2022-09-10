# fresh project

### Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

### TODO

- handle errors, like no branch no file etc...
- list branches... suggest branch if BranchNotFoundError... branch switcher
  component type of thing
- tree / blob should show head commit info (based on ref param)
- ui design / nav stuff
- commit screen: parse diff, list changed files, etc.

## Bugs

- viewing initial commit breaks because of `diff sha~1 sha` has no parent maybe
  should just do `git show`

## Fresh Bugs

- tailwind classes used in components that are dynamically rendered in browser
  only go missing
- return null from an island causes Uncaught TypeError: Cannot read properties
  of undefined (reading 'nextSibling')
