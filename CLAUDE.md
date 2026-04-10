# Derelict Dawn — project guidance for Claude

## Git discipline (IMPORTANT)

**Commit periodically.** This project frequently has long sessions of in-progress work spread across many untracked and modified files. If you go off the rails, the only way to recover safely is if there's a recent commit to anchor against.

Rules:
- After completing any meaningful unit of work (a feature, a refactor, a passing test suite, a bug fix), **prompt the user to commit** if they haven't already in a while. Don't silently keep stacking changes for an hour.
- If the user asks you to do exploratory or risky work, suggest committing the current state first as a safety checkpoint.
- If you notice the working tree has many uncommitted changes (say, >20 modified/untracked files) and the last commit is days old, **flag it** before doing more destructive work.
- Never commit on your own initiative, only after the user asks or agrees.

## Plan files

There are stale plan files in `~/.claude/plans/`. **Do not blindly resume a plan from a file unless the user explicitly references it in the current conversation.** Plans grow stale fast in this project. When in doubt, ask.
