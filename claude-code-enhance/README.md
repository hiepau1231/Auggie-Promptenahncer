# Context-Aware Prompt Enhancer for Claude Code

Inspired by [Auggie Prompt Enhancer](https://github.com/svsairevanth/Auggie-Promptenahncer), this brings the same **context-aware prompt enhancement** idea to [Claude Code](https://claude.ai/code) as a slash command.

Instead of using the Augment SDK, it leverages Claude Code's built-in file tools (Read, Glob, Grep) to understand your codebase before enhancing your prompt.

## How it works

```
You type:  /enhance add search to my app
               ↓
Claude reads your codebase (package.json, routers, models...)
               ↓
Outputs an enhanced prompt with real file paths, function names, tech stack
               ↓
Copy-paste the enhanced prompt into any AI tool
```

## Installation

**1 step** — copy `enhance.md` to your Claude Code commands folder:

**macOS / Linux:**
```bash
cp enhance.md ~/.claude/commands/enhance.md
```

**Windows:**
```cmd
copy enhance.md %USERPROFILE%\.claude\commands\enhance.md
```

> If the `commands/` folder doesn't exist, create it first:
> ```bash
> mkdir -p ~/.claude/commands
> ```

## Usage

Open any project in Claude Code, then type:

```
/enhance <your rough prompt>
```

### Examples

```
/enhance add pagination to articles list
```
```
/enhance fix the login bug
```
```
/enhance write tests for the auth module
```

Claude will automatically read your project files and output an enhanced, context-aware prompt ready to copy-paste.

## Example output

**Input:**
```
/enhance add search to news_reader
```

**Output:**
```
In the `news_reader` project, extend the existing search route at
`app/routers/home.py:107` to also search `summary` and `content`
fields (currently only searches `title`).

Use the existing LIKE escaping pattern:
  q_escaped = q.replace('\', '\\').replace('%', '\%')...

Add pagination (10/page via ?page=N) and result count display.
Tech stack: FastAPI + SQLAlchemy sync + Jinja2 + Tailwind CSS
```

## Requirements

- [Claude Code](https://claude.ai/code) installed and running
- Any project open in Claude Code

No API keys. No extensions. No login required beyond Claude Code itself.

## Difference vs Auggie Prompt Enhancer

| | Auggie (VS Code) | This (Claude Code) |
|---|---|---|
| Platform | VS Code extension | Claude Code CLI |
| Context source | Augment SDK `FileSystemContext` | Claude's built-in Read/Glob/Grep |
| AI backend | Augment Code API | Claude (current session) |
| Requires login | Yes (Augment account) | No (uses existing Claude session) |
| Installation | Install VS Code extension | Copy 1 file |
