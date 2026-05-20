# josh2106.github.io

Personal portfolio for Joshua — 2nd-year B.Tech AI/ML student.

Live: https://josh2106.github.io/

## Adding a new project

Edit `projects.json` and append a new entry:

```json
{
  "title": "Cool New Project",
  "tagline": "What it does in one sentence.",
  "emoji": "🚀",
  "image": null,
  "tags": ["Python", "PyTorch"],
  "links": {
    "demo": "https://example.com",
    "code": "https://github.com/Josh2106/cool-new-project"
  },
  "featured": false,
  "highlights": [
    "Key bullet 1",
    "Key bullet 2"
  ]
}
```

Then `git add . && git commit && git push` — the site auto-rebuilds.

## Adding a project screenshot

Drop a PNG into `assets/` (create the folder if it doesn't exist) and reference it:

```json
"image": "assets/my-screenshot.png"
```

## Local preview

```bash
python -m http.server 8000
```

Open http://localhost:8000

## Stack

Pure HTML/CSS/JS — no build step. Hosted on GitHub Pages.
