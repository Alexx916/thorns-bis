# Thorns BiS

A React site that shows the levelling BiS gear for a thorns Paladin on a WoW-style character sheet. Move the slider (20–60) to switch levels.

**Live site:** https://alexx916.github.io/thorns-bis/

## Data
Items load live from the **Levelling BiS** tab of the "Thorns Gear" Google Sheet each time the page opens, so sheet edits show up on reload without a redeploy.

The sheet must be shared as **Anyone with the link: Viewer**, or the site can't read it.

The sheet ID and tab are set in `src/config.js`. The parser expects these columns:
`Level, Slot, BiS, BiS stats, BiS source, Binding / BS skill, Thorns (BiS), Best alternative, Alt source, Confidence, Got`.
Any non-numeric text below the data rows in column A shows up as notes.

## Local dev
```sh
npm install
npm run dev
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.
