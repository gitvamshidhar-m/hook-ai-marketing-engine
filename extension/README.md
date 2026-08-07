# Hook AI Chrome Extension (beta)

Right-click any selected text and generate a CTR-predicted marketing hook for it.

## What it does

- Selects text on any page, right-clicks → **"Write a marketing hook for it"**
- Opens Hook AI with your topic prefilled, so you get scored ad, email,
  YouTube title, and blog H1 hooks in one run.

## Install (unpacked)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Pin the Hook AI icon if you want the popup handy

## How it's wired

- `manifest.json` — MV3, context menu + tabs permissions
- `background.js` — registers the context menu and opens the deep link
- `popup.html` — quick instructions + link to the full tool
- `icons/` — 16/48/128 PNG icons

The deep link uses `https://hook-ai-marketing-engine.vercel.app/?topic=<text>`;
the homepage reads the `?topic=` param and prefills the generator.

## Note

This is a free, non-commercial helper — the generation happens on the Hook AI
web app (your daily free runs apply). No data leaves your selection beyond the
topic you choose to generate.
