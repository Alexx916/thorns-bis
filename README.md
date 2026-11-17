# Thorns BiS

A React site that shows the levelling BiS gear for a thorns Paladin on a WoW-style character sheet. Move the slider (20–60) to switch levels.

**Live site:** https://alexx916.github.io/thorns-bis/

## Data
Items load live from the **Levelling BiS** tab of the "Thorns Gear" Google Sheet each time the page opens, so sheet edits show up on reload without a redeploy.

The sheet must be shared as **Anyone with the link: Viewer**, or the site can't read it.

The sheet ID and tab are set in `src/config.js`. The parser expects these columns:
`Level, Slot, BiS, BiS stats, BiS source, Binding / BS skill, Thorns (BiS), Best alternative, Alt source, Confidence, Got`.
Any non-numeric text below the data rows in column A shows up as notes.

## Route plans
`public/routes.json` holds a route for each level bracket: steps, where to go, and which items each step gives. AI agents wrote them, one per bracket, and they were checked against Wowhead's drop data. A step ticks off once every BiS item in it is marked Got. Alternative items are always optional.

The routes are static: if you change an item in the sheet, its route needs updating too.

## Local dev
```sh
npm install
npm run dev
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.
