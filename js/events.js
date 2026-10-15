// Timeline of the game: day 1 to 36 ("36 July" = 5 August).
// Key = day number (1..36), value = event name shown big under the date.
// Edit or add entries freely.
const EVENTS = {
  1:  '3 Days Program',
  5:  'Road Block',
  6:  'Bangla Blocked',
  14: '24 Hour Timeline',
  16: 'One Student Died',
  19: 'Complete Shutdown',
  20: 'Curfew',
  26: 'Block Raid',
  28: 'Internet Restore',
  30: 'March for Justice',
  31: 'Remembering Our Heroes',
  33: 'Mass Protest',
  34: 'One Point',
  35: 'March for Dhaka',
  36: 'The End',
};

// How many real seconds one in-game day lasts (36 days x 8s = about 4.8 minutes).
const DAY_SECONDS = 8;
