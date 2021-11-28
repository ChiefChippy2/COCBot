# Commands

`<arg>` Means the argument is necessary for the command to work

`[arg]` means the argument is not necessary

`<args1> [args2] ... [argsN]` means you can provide as many arguments as you want, separated by space, with a minimal of 1 argument.

## Clash of Code commands : 

All commands for Clash Of Code, except `link`, is under `coc`.

Syntax : `coc [subcommand] [arg1] [arg2] ... [argN]`.

If no subcommand is provided, the bot will automatically do `coc start` or `coc new`, but this will be deprecated in V2.0.

### Subcommands : 

### new (MOD ONLY)
Creates a new clash (and the bot will be warped out of the old one).

Syntax : `coc new [keyword] [lang1] [lang2] ... [langN]`

Aliases : `create`, `n`, `new`, `setup`, `init`, `+`

Keyword can be, if provided, "only" or "ban". The former will make a clash with ONLY the languages given (and ignores the ban list), while the latter will DISABLE the languages given (in addition to the ban list). You can also put modes (or their aliases) in `[langN]` if you want to only allow certain modes. For a list of valid languages and modes, see bottom.

### start (MOD ONLY)
Starts the newly created clash, if possible.

Syntax : `coc start`

Aliases : `s`, `begin`, `clash`

Can only start if there are at least one player other than the bot in the lobby and if the bot owns the clash.

### cancel (MOD ONLY)
Cancels the current lobby and removes it from database.

Syntax : `coc cancel`

Aliases : `delete`, `c`

### ban (MOD ONLY)
Bans the given language[s]. The ban is only effective for the bot session and will clear after a restart. For a list of valid languages, see bottom.

Syntax : `coc ban <lang1> [lang2] ... [langN]`

Aliases : `blacklist`, `disallow`

If you ban every language, something bad might happen.

### unban (MOD ONLY)
Unbans the given language[s]. For a list of valid languages, see bottom.

Syntax : `coc unban <lang1> [lang2] ... [langN]`

Aliases : `unblacklist`, `allow`

You can unban all languages by putting an `*` as [langN].

### banlist
Shows the list of currently banned languages.

Syntax : `coc banlist`

Aliases : `blist`, `bl`

### link
Shows the current or past clash link.

Syntax : `link [keyword] [arg]`

Aliases : `l`

Keyword can be : 
- nothing or `current` : Shows the current link
- `last` : `[arg]` will become a mandatory argument. Shows you the link to the last N clash.
- `add` : **MOD ONLY** Sets current clash link to `[arg]` (which will also become a mandatory argument)

## Misc commands : 

### help
Shows a link to this page

Syntax : `help`

### add (MOD ONLY)
Adds a custom command that can be evoked later using `!name` if your bot prefix is `!` and the command name is `name`

Syntax : `add <name> <value>`

Aliases : `set`

Value can be anything and can contain spaces.

### remove (MOD ONLY)
Removes a custom command added previusly.

Syntax : `remove <name>`

Aliases : `delete`

## List of valid languages & modes

### Languages (case insensitive): 
```json
[
  "Bash",
  "VB.NET",
  "C++",
  "C#",
  "C",
  "Clojure",
  "D",
  "Dart",
  "F#",
  "Go",
  "Groovy",
  "Haskell",
  "Java",
  "Javascript",
  "Kotlin",
  "Lua",
  "ObjectiveC",
  "OCaml",
  "Pascal",
  "Perl",
  "PHP",
  "Python3",
  "Ruby",
  "Rust",
  "Scala",
  "Swift",
  "TypeScript",
]
```

### Modes (case insensitive):

- For `FASTEST` : `f`, `fast`, `fastest`
- For `SHORTEST` : `s`, `sh`, `short`, `shortest`
- For `REVERSE` : `r`, `rev`, `reverse`