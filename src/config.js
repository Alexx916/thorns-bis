export const SHEET_ID = '1vhf20Nu7NB5FuIIa3cDMybkpkRkAPyhviULr-QwNlzU';
export const SHEET_TAB = 'Levelling BiS';
export const SHEET_GID = '1001';
// Tried in order. /export keeps mixed-type columns intact; gviz is the CORS-friendly fallback.
export const SHEET_URLS = [
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`,
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`,
];
export const SHEET_VIEW_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${SHEET_GID}`;
export const LEVELS = [20, 25, 30, 35, 40, 45, 50, 55, 60];

export const LEFT_SLOTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Wrist'];
export const RIGHT_SLOTS = ['Hands', 'Waist', 'Legs', 'Feet', 'Finger 1', 'Finger 2', 'Trinket 1', 'Trinket 2'];
export const BOTTOM_SLOTS = ['Main hand', 'Off hand', 'Relic'];
