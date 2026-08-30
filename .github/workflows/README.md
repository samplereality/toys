# Deploying to Reclaim Hosting

`deploy.yml` mirrors `code-invaders/` to a folder on the Reclaim server
over SSH + rsync on every push to `main` (and on manual runs from the
Actions tab).

## One-time setup

### 1. Make an SSH key for the deploy

On your machine:

```bash
ssh-keygen -t ed25519 -f reclaim_deploy -C "github-actions deploy" -N ""
```

This writes `reclaim_deploy` (private) and `reclaim_deploy.pub` (public).

### 2. Authorize the key on Reclaim

- cPanel → **SSH Access** → **Manage SSH Keys** → **Import Key**.
- Paste the contents of `reclaim_deploy.pub` as the public key (leave
  the private field blank), then **Manage** → **Authorize** it.
- If your account doesn't show SSH Access, open a Reclaim support
  ticket to have SSH enabled — it's free.

### 3. Add the secrets and variables in GitHub

Repo → **Settings** → **Secrets and variables** → **Actions**.

**Secrets** (encrypted):

| Name              | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| `RECLAIM_SSH_KEY` | The full contents of the **private** `reclaim_deploy` file |
| `RECLAIM_HOST`    | Your server hostname (e.g. `boyle.reclaimhosting.com`)   |
| `RECLAIM_USER`    | Your cPanel username                                     |

**Variables** (plain):

| Name           | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| `RECLAIM_PATH` | Target folder, e.g. `public_html/code-invaders` (no trailing slash) |
| `RECLAIM_PORT` | Optional. SSH port; defaults to `22` if unset               |

> Find `RECLAIM_HOST` under cPanel → **SSH Access**, or in your Reclaim
> welcome email. `RECLAIM_PATH` is relative to your account's home
> directory; `public_html/code-invaders` publishes the game at
> `https://yourdomain/code-invaders/`.

### 4. Ship it

The workflow only runs once it's on the **default branch**, so merge this
branch into `main`. After that, any push touching `code-invaders/`
redeploys automatically. To deploy on demand, use **Run workflow** on the
**Deploy Code Invaders to Reclaim Hosting** action.

## Notes

- rsync runs with `--delete`, so the target folder is an exact mirror of
  `code-invaders/`. Point `RECLAIM_PATH` at a **dedicated** folder — never
  at `public_html` itself, or `--delete` will remove everything else there.
