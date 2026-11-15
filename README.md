# Gym Log (PWA)
Static site, no build step.

## Deploy on Vercel
Option A (CLI): npm i -g vercel, then run `vercel --prod` inside this folder.
Option B (GitHub): push this folder to a repo, import it in Vercel, Framework Preset = Other, no build command, output directory = ./

## Install
Open the Vercel URL on your phone. Android Chrome: menu > Install app. iPhone Safari: Share > Add to Home Screen.

## Updating
After changing index.html, bump the cache name in sw.js (gymlog-v1 -> gymlog-v2) so installed copies refresh.
