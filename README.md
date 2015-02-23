# V

V is a programming language for web development. Its syntax and constructs are inspired by K. It also draws inspiration from Go, Haskell, and Clojure.

## Usage

The `v` executable can be used from the command line. It will open a browser window that executes the script and displays the result.

```
v '$(`t;"Hello World")$`div'
```

The above example creates a `div` with the text "Hello World". The script can be edited and the result will be updated. Killing the server will print a JSON structure that includes the final state of the edited script.

You can also pass data over stdin:

```
v '$`ul@(`t;{x})$`li$.names' <<< '{"names": ["Alice", "Bob", "Chris"]}'
```

The above will display a list of the given names. The passed data is also available for editing within the browser and will be returned when the server is killed.

In addition to the script and data, a string representing the rendered DOM is included in the result returned from the client, and is printed by the server when it quits.

## Building

```
make
```

## Testing

```
make test
```

## Language

### Nouns

- Integer and decimal values are numbers.
- Consecutive numbers are vectors.
- Expressions wrapped in curly braces are functions.
- Variables are nouns.

### Verbs

- `~` invert, matches
- `!` enumerate/close channel, modulus/put on channel
- `@` atom?, invoke
- `#` length/channel open?, take
- `$` show
- `%` reciprocal, divide
- `^` exponentiate
- `&` where, minimum
- `*` first/take from channel, multiply
- `,` enlist, join
- `.`
- `<` dict keys, less than
- `>` dict values, greater than
- `?`
- `=` equals?
- `+` add
- `|` reverse, maximum
- `-` negate, subtract
- `_` floor, drop
- `:`
- `D` dict from sequence
- `L` lazy sequence
- `Y` fork from function

### Adverbs

- `'` each
- `':` each pair
- `/:` each right
- `\:` each left
- `/` converge, over
- `\` scan
