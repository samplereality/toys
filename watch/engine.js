/* Neighborhood Watch — game engine (no DOM). Loaded by the page and by the headless tuner. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.NW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const HUMANS = 8.1e9;

/* ------------------------------------------------------------------ cameras */
const CAMS = [
  { id: 'doorbell', name: 'Doorbell camera', unit: '', base: 10, mult: 1.1, rate: 1, people: 14, birds: 0,
    flavor: 'It sees the porch, the sidewalk, and the neighbor\'s porch.' },
  { id: 'feeder', name: 'Bird feeder camera', unit: '', base: 90, mult: 1.1, rate: 5, people: 1, birds: 0.02,
    flavor: 'It sees birds. Mostly.' },
  { id: 'trail', name: 'Trail camera', unit: '', base: 600, mult: 1.1, rate: 20, people: 3, birds: 0.005,
    flavor: 'Strapped to a tree behind the subdivision.' },
  { id: 'alpr', name: 'Plate reader', unit: '', base: 4000, mult: 1.11, rate: 100, people: 6000, birds: 0,
    flavor: 'Solar-powered, on a pole, pointed at the only road out.' },
  { id: 'store', name: 'Store face camera', unit: '', base: 25000, mult: 1.11, rate: 400, people: 4500, birds: 0,
    flavor: 'Above the self-checkout. It knows you are frustrated.' },
  { id: 'drone', name: 'Delivery drone', unit: '', base: 150000, mult: 1.12, rate: 1600, people: 30000, birds: 0.5,
    flavor: 'Thirty-minute delivery. It records the route both ways.' },
  { id: 'school', name: 'School laptop fleet', unit: ' (×1,000 laptops)', base: 1e6, mult: 1.12, rate: 6000, people: 1000, birds: 0,
    flavor: 'Issued to students. The webcam light is disabled "to reduce distraction."' },
  { id: 'work', name: 'Productivity camera', unit: ' (×1,000 desks)', base: 6e6, mult: 1.12, rate: 20000, people: 1000, birds: 0,
    flavor: 'Measures eye contact with the screen.' },
  { id: 'tooth', name: 'Toothbrush camera', unit: ' (×10,000 mouths)', base: 3e7, mult: 1.13, rate: 70000, people: 10000, birds: 0,
    flavor: 'Brushing compliance is a covered benefit.' },
  { id: 'sleep', name: 'Sleep monitor', unit: ' (×10,000 beds)', base: 2e8, mult: 1.13, rate: 250000, people: 10000, birds: 0,
    flavor: 'Infrared, ceiling-mounted, always on. For your health.' },
  { id: 'lens', name: 'Smart contact lens', unit: ' (×100,000 eyes)', base: 1.2e9, mult: 1.14, rate: 1e6, people: 50000, birds: 0.01,
    flavor: 'You see what they see. It is mostly phones.' },
];
const CAM = Object.fromEntries(CAMS.map(c => [c.id, c]));

/* ------------------------------------------------------------------ projects */
/* cost: { money, ops, para, clr, imp }  cond(G) → visible   fx(G, log)   after: message */
const PROJECTS = [
  // ---- Stage 1: the porch
  { id: 'sensitivity', name: 'Motion Sensitivity: High', cost: { money: 30 },
    desc: 'Lower the threshold for what counts as an event.',
    cond: G => G.cams.doorbell >= 1,
    fx: G => { G.mult.doorbell *= 1.6; },
    after: 'Cats, wind, and the mail carrier are now events.' },
  { id: 'neighbors', name: 'Post to the Neighbors app', cost: { money: 60 },
    desc: 'Share clips with a community of people who are also afraid.',
    cond: G => G.done.sensitivity,
    fx: G => { G.buyersMult *= 1.5; },
    after: '"Suspicious male, 30s, walking slowly." He lives here.' },
  { id: 'pdshare', name: 'Share automatically with local PD', cost: { money: 200 },
    desc: 'One click. No warrant. A small badge icon appears on your app.',
    cond: G => G.done.neighbors,
    fx: G => { G.clearanceOn = true; G.clearance += 1; G.buyersMult *= 1.5; },
    after: 'Officers may now request your footage without asking you. You agreed in 0.4 seconds. Clearance granted.' },
  { id: 'feeder', name: 'Bird feeder camera', cost: { money: 150 },
    desc: 'A camera in the feeder. For the birds.',
    cond: G => G.cams.doorbell >= 3,
    fx: G => { G.unlocked.feeder = true; },
    after: 'A cardinal. A finch. Something brown.' },
  { id: 'species', name: 'Species identification', cost: { ops: 400 },
    desc: 'Name what you see.',
    cond: G => G.cams.feeder >= 1 && G.clearanceOn,
    fx: G => { G.priceMult *= 1.3; G.mult.feeder *= 1.5; },
    after: 'Northern cardinal (Cardinalis cardinalis). You feel a small, clean thrill.' },
  { id: 'birdsex', name: 'Sex determination (birds)', cost: { ops: 900 },
    desc: 'Male or female. The model is confident.',
    cond: G => G.done.species,
    fx: G => { G.birdsOn = true; G.priceMult *= 1.3; },
    after: 'Male cardinal. Female cardinal. Male. Male. Female. You have started a spreadsheet.' },
  { id: 'birdregistry', name: 'Avian Sex Registry', cost: { ops: 2000, para: 20 },
    desc: 'Cross-reference your feeder with 4,400 others.',
    cond: G => G.done.birdsex,
    fx: G => { G.mult.feeder *= 2.5; },
    after: 'A juvenile house finch with atypical plumage has been flagged. You do not know why you flagged it. You flag it again.' },
  { id: 'birdreport', name: 'Report atypical presentation', cost: { ops: 4000, para: 50 },
    desc: 'The Neighbors app has a button for this now.',
    cond: G => G.done.birdregistry,
    fx: G => { G.clearance += 1; G.buyersMult *= 1.5; },
    after: 'The Neighbors app thanks you for your vigilance. The finch has not returned. Clearance +1.' },
  { id: 'trail', name: 'Trail cameras', cost: { money: 900 },
    desc: 'For wildlife. In the woods behind the subdivision.',
    cond: G => G.cams.feeder >= 3,
    fx: G => { G.unlocked.trail = true; },
    after: 'Deer. Deer. Deer. A man at 3 a.m. You post it. He was walking a dog.' },
  { id: 'infrared', name: 'Infrared', cost: { ops: 1500 },
    desc: 'See at night.',
    cond: G => G.cams.trail >= 1,
    fx: G => { G.mult.trail *= 2; G.mult.doorbell *= 2; },
    after: 'Now the dark is also a place.' },
  { id: 'cloud', name: 'Cloud retention: forever', cost: { money: 600 },
    desc: 'Storage is cheap. Deleting is a decision.',
    cond: G => G.clearanceOn && G.total >= 3000,
    fx: G => { G.priceMult *= 1.4; G.clearance += 1; },
    after: 'Nothing is ever deleted. Decisions are expensive. Clearance +1.' },
  { id: 'hoa', name: 'Join the HOA Safety Committee', cost: { ops: 2500 },
    desc: 'Three retirees and you. They have a budget.',
    cond: G => G.done.pdshare && G.done.trail,
    fx: G => { G.buyersMult *= 2; G.stage = Math.max(G.stage, 2); },
    after: 'You have a lanyard now.' },

  // ---- Stage 2: the street
  { id: 'alpr', name: 'License plate readers', cost: { money: 4000, ops: 3000 },
    desc: 'One at the entrance. Then eleven more.',
    cond: G => G.done.hoa,
    fx: G => { G.unlocked.alpr = true; G.resist.active = true; G.resist.next = G.t + 45; },
    after: '70% of crime involves a vehicle. So does 100% of leaving.' },
  { id: 'hotlist', name: 'Hotlist matching', cost: { ops: 5000 },
    desc: 'Compare every plate to a list of plates.',
    cond: G => G.cams.alpr >= 2,
    fx: G => { G.mult.alpr *= 1.8; G.clearance += 1; },
    after: 'Matches are wrong 71% of the time. Each one is an alert. Alerts are engagement. Clearance +1.' },
  { id: 'national', name: 'National lookup', cost: { ops: 9000, clr: 1 },
    desc: 'Let every agency in the network search your cul-de-sac.',
    cond: G => G.done.hotlist,
    fx: G => { G.priceMult *= 2; G.buyersMult *= 2; },
    after: '6,809 agencies can now search the entrance to your subdivision. A deputy two states away runs one query: "had an abortion, search for female."' },
  { id: 'faces', name: 'Facial recognition at the grocery', cost: { money: 35000, ops: 8000 },
    desc: 'Above the self-checkout.',
    cond: G => G.cams.alpr >= 4,
    fx: G => { G.unlocked.store = true; },
    after: 'A face is worth more than a plate.' },
  { id: 'emotion', name: 'Emotion analytics', cost: { ops: 9000, para: 80 },
    desc: 'Sad, angry, neutral, suspicious.',
    cond: G => G.cams.store >= 2,
    fx: G => { G.priceMult *= 1.6; },
    after: 'Shopper 4471 appears sad in aisle 6. Suggest: ice cream, or a wellness check.' },
  { id: 'shoplift', name: 'Shoplifter prediction', cost: { ops: 12000 },
    desc: 'Flag anyone who looks at the exit.',
    cond: G => G.done.emotion,
    fx: G => { G.mult.store *= 2.2; },
    after: '98% of flagged shoppers have never stolen anything. 100% are now on a list.' },
  { id: 'denyentry', name: 'Automatic entry denial', cost: { ops: 16000, clr: 2 },
    desc: 'Share the list across 1,400 stores.',
    cond: G => G.done.shoplift,
    fx: G => { G.clearance += 2; G.buyersMult *= 2; },
    after: 'A woman is turned away from a pharmacy. The model does not know why. Neither do you. Clearance +2.' },
  { id: 'rename', name: 'Rebrand as "Safety"', cost: { money: 25000 },
    desc: 'A camera is a safety device. Footage is evidence. You are a partner.',
    cond: G => G.cams.store >= 1,
    fx: G => { G.buyersMult *= 2; G.priceMult *= 1.2; },
    after: 'The word "surveillance" no longer appears on any page you control.' },
  { id: 'transparency', name: 'Publish a transparency report', cost: { ops: 6000 },
    desc: 'Forty pages. A chart.',
    cond: G => G.resist.active,
    fx: G => { G.resist.influence += 2; },
    after: 'Nobody reads it. That is what it is for. Influence +2.' },
  { id: 'investors', name: 'Take a meeting on Sand Hill Road', cost: { money: 80000 },
    desc: 'They have questions about your moat.',
    cond: G => G.done.rename,
    fx: G => { G.fund.on = true; },
    after: '"What\'s your moat?" "Everyone\'s front door." They lean forward.' },
  { id: 'vision2', name: 'Vision model v2', cost: { ops: 10000, para: 60 },
    desc: 'More parameters. Same training data.',
    cond: G => G.cores >= 4,
    fx: G => { G.opsMult *= 2; },
    after: 'It now recognizes 40,000 objects. It still cannot tell a 7 from a 2.' },
  { id: 'gpu', name: 'GPU cluster', cost: { money: 250000, para: 120 },
    desc: 'A warehouse in a county with cheap water.',
    cond: G => G.done.vision2,
    fx: G => { G.opsMult *= 2; G.paraMult *= 2; G.coresForMoney = true; },
    after: 'The reservoir is lower this year. Unrelated. Vision cores and retention may now be purchased outright.' },
  { id: 'vision3', name: 'Vision model v3', cost: { ops: 240000, para: 400 },
    desc: 'Trained on everything you have ever recorded.',
    cond: G => G.done.gpu && G.coverageOn,
    fx: G => { G.opsMult *= 3; G.paraMult *= 2; },
    after: 'It recognizes you. It recognizes your gait. It recognizes your gait when you are trying to change it.' },
  { id: 'datacenter', name: 'Own the datacenter', cost: { money: 1000000000, para: 2400 },
    desc: 'The county gave you the land. The river gives you the water.',
    cond: G => G.done.vision3 && G.cams.tooth >= 1,
    fx: G => { G.opsMult *= 4; G.paraMult *= 3; },
    after: 'The town downstream has a new well-water advisory and a new sponsored Little League team.' },
  { id: 'rtcc', name: 'Real-Time Crime Center', cost: { ops: 20000, clr: 3 },
    desc: 'Twelve screens. One officer.',
    cond: G => G.done.national && G.done.faces,
    fx: G => { G.city.on = true; },
    after: 'He is watching a raccoon. Cities may now be signed.' },
  { id: 'drones', name: 'Delivery drone partnership', cost: { money: 400000, ops: 25000 },
    desc: 'Thirty-minute delivery. Incidental collection.',
    cond: G => G.done.rtcc,
    fx: G => { G.unlocked.drone = true; },
    after: 'The drone records the route, the porch, the neighbors\' porches, and a backyard where someone is crying.' },
  { id: 'gunshot', name: 'Acoustic gunshot detection', cost: { ops: 15000 },
    desc: 'Microphones on every pole.',
    cond: G => G.cams.drone >= 1,
    fx: G => { G.mult.drone *= 1.8; G.mult.alpr *= 1.5; },
    after: 'Fireworks, nail guns, a slammed door. Six units dispatched to a quinceañera.' },
  { id: 'predictive', name: 'Predictive patrol', cost: { ops: 35000, clr: 3 },
    desc: 'Send police where the model says crime will be.',
    cond: G => G.done.rtcc,
    fx: G => { G.clearance += 3; G.city.mult *= 2; },
    after: 'The model predicts crime where police have been. Police go where the model predicts. The model is never wrong. Clearance +3.' },
  { id: 'fusion', name: 'Fusion Center', cost: { ops: 50000, clr: 4, money: 2e6 },
    desc: 'Every feed, one building, no windows.',
    cond: G => G.done.predictive && G.done.drones,
    fx: G => { G.coverageOn = true; G.stage = Math.max(G.stage, 3); },
    after: 'Coverage is now measured. It is measured in humans.' },

  // ---- Stage 3: the body
  { id: 'schoolcam', name: 'School-issued laptops', cost: { ops: 210000, clr: 2 },
    desc: 'Theft tracking. The webcam light is disabled to reduce distraction.',
    cond: G => G.coverageOn,
    fx: G => { G.unlocked.school = true; },
    after: '2,300 students. 56,000 photographs taken in bedrooms. The district calls it "theft tracking."' },
  { id: 'workcam', name: 'Productivity monitoring', cost: { ops: 300000, money: 25000000 },
    desc: 'Eye contact, keystrokes, bathroom duration.',
    cond: G => G.cams.school >= 2,
    fx: G => { G.unlocked.work = true; },
    after: 'Eye contact with screen: 84%. Bathroom breaks: 3. Duration: logged. Morale: not measured.' },
  { id: 'toothbrush', name: 'Smart toothbrush camera', cost: { ops: 480000, para: 800, money: 100000000 },
    desc: 'Brushing compliance, in-mouth.',
    cond: G => G.cams.work >= 2,
    fx: G => { G.unlocked.tooth = true; },
    after: 'Brushing compliance: 61%. Your dentist has been notified. Your insurer has been notified. Your mother has been notified.' },
  { id: 'insurance', name: 'Bundle with health insurance', cost: { ops: 450000, clr: 3 },
    desc: 'Opt out and lose the discount. Opt in and lose the rest.',
    cond: G => G.cams.tooth >= 1,
    fx: G => { G.peopleMult *= 6; G.mult.tooth *= 2; },
    after: 'Enrollment: 94%. The other 6% pay more, and are flagged.' },
  { id: 'fridge', name: 'Refrigerator camera', cost: { ops: 420000, para: 600 },
    desc: 'Inventory. Diet. Habits.',
    cond: G => G.cams.tooth >= 2,
    fx: G => { G.priceMult *= 1.8; },
    after: 'Someone ate the last yogurt at 2:14 a.m. Someone always does.' },
  { id: 'sleepcam', name: 'Sleep monitoring', cost: { ops: 750000, para: 1200, money: 750000000 },
    desc: 'Ceiling-mounted, infrared, always on. For your health.',
    cond: G => G.done.insurance,
    fx: G => { G.unlocked.sleep = true; },
    after: 'REM detected. Subject appears to be dreaming about a door.' },
  { id: 'mirror', name: 'Bathroom mirror ("for skin health")', cost: { ops: 660000, para: 1000 },
    desc: 'A mirror that remembers.',
    cond: G => G.cams.sleep >= 1,
    fx: G => { G.mult.sleep *= 2; G.priceMult *= 1.5; },
    after: 'Skin health: fine. Everything else: recorded.' },
  { id: 'employer', name: 'Required by employers', cost: { ops: 1050000, clr: 4 },
    desc: 'A condition of employment.',
    cond: G => G.done.workcam && G.done.insurance,
    fx: G => { G.peopleMult *= 5; G.mult.work *= 3; },
    after: 'Onboarding now takes four minutes. Consent is a checkbox in the middle.' },
  { id: 'church', name: 'Sanctuary Safety Program', cost: { ops: 900000, para: 1600 },
    desc: 'Attendance, tithe, tears.',
    cond: G => G.done.mirror,
    fx: G => { G.priceMult *= 2; G.clearance += 2; },
    after: 'The confession booth has analytics now. Clearance +2.' },
  { id: 'petcollar', name: 'Pet collar cameras', cost: { ops: 540000 },
    desc: 'The dog goes everywhere.',
    cond: G => G.done.fridge,
    fx: G => { G.mult.doorbell *= 50; G.mult.trail *= 20; G.peopleMult *= 1.5; },
    after: 'The dog has seen things.' },
  { id: 'lenses', name: 'Smart contact lenses', cost: { ops: 1800000, para: 3000, money: 4000000000 },
    desc: 'Nothing between the eye and the network.',
    cond: G => G.done.church && G.done.employer,
    fx: G => { G.unlocked.lens = true; },
    after: 'You now see what they see. It is mostly phones, and other people\'s lenses.' },
  { id: 'defaulton', name: 'Default: on', cost: { ops: 2700000, clr: 5 },
    desc: 'Opt-out is a setting. The setting is four menus deep.',
    cond: G => G.cams.lens >= 2,
    fx: G => { G.peopleMult *= 10; },
    after: 'Opt-out rate: 0.3%. Those users have been grouped as "privacy-seeking."' },
  { id: 'innervoice', name: 'Inner voice transcription', cost: { ops: 4500000, para: 8000 },
    desc: 'Subvocalization is a signal. Signals are data.',
    cond: G => G.done.defaulton,
    fx: G => { G.priceMult *= 3; G.peopleMult *= 2; G.mult.lens *= 2; },
    after: 'Subject 8,102,441 thought about quitting. Flagged: attrition risk. Suggest: a raise? No. Suggest: a camera.' },
  { id: 'mandatory', name: 'Mandatory', cost: { ops: 7500000, clr: 6, imp: 30 },
    desc: 'Remove the setting.',
    cond: G => G.done.innervoice,
    fx: G => { G.peopleMult *= 10; },
    after: 'There is no longer a menu.' },

  // ---- Stage 4: the resistance (impunity projects)
  { id: 'slapp', name: 'Sue the birdwatchers', cost: { imp: 6, money: 500000 },
    desc: 'They mapped your cameras. Mapping is a form of speech. Speech can be sued.',
    cond: G => G.resist.active && G.resist.impunity >= 3,
    fx: G => { G.resist.weak.map = 0.5; G.resist.weak.foia = 0.7; },
    after: 'The suit will not survive. It does not need to. Their legal fund is now empty.' },
  { id: 'astroturf', name: '"Moms for Safety"', cost: { imp: 10, ops: 40000 },
    desc: 'A grassroots organization. Twelve members. One lobbyist.',
    cond: G => G.done.slapp,
    fx: G => { G.resist.weak.protest = 0.5; G.resist.weak.council = 0.6; G.resist.influence += 3; },
    after: 'They speak first at every council meeting. They are very worried about the birdwatchers. Influence +3.' },
  { id: 'buynews', name: 'Buy the newspaper', cost: { imp: 14, money: 3e6 },
    desc: 'It was for sale. Everything is.',
    cond: G => G.done.astroturf,
    fx: G => { G.resist.weak.press = 0.1; },
    after: 'The surveillance beat has been retired. The reporter now covers you, favorably, from your building.' },
  { id: 'modelbill', name: 'Model legislation', cost: { imp: 20, clr: 3 },
    desc: 'Criminalize "interference with public safety infrastructure," including looking at it.',
    cond: G => G.done.buynews,
    fx: G => { G.resist.weak.map = 0.15; G.resist.weak.sabotage = 0.4; G.resist.influence += 4; },
    after: 'Mapping a camera is now a misdemeanor in eleven states. Photographing one is a "listed activity." Influence +4.' },
  { id: 'preempt', name: 'State preemption', cost: { imp: 28, clr: 4 },
    desc: 'Cities may no longer decline.',
    cond: G => G.done.modelbill,
    fx: G => { G.resist.weak.council = 0; },
    after: 'City councils may vote on the color of the poles.' },
  { id: 'doxx', name: 'Identify the birdwatchers', cost: { imp: 36, ops: 500000 },
    desc: 'They have faces. You have faces.',
    cond: G => G.done.preempt,
    fx: G => { G.resist.weak.map = 0; G.resist.weak.sabotage = 0.1; G.resist.weak.foia = 0.2; },
    after: 'Forty-one volunteers. Their employers have been contacted. Their cars have been flagged. The map is still up. Nobody edits it.' },
  { id: 'totalpreempt', name: 'Total preemption', cost: { imp: 50, clr: 5 },
    desc: 'There is no one left to ask.',
    cond: G => G.done.doxx,
    fx: G => { G.resist.won = true; G.resist.active = false; },
    after: 'The last records request was denied on the grounds that no records exist that are not already public, and none are public.' },

  // ---- Stage 5: nothing left
  { id: 'watchwatchers', name: 'Watch the watchers', cost: { ops: 4e6 },
    desc: 'Every camera in view of another camera.',
    cond: G => G.coverage >= 100,
    fx: G => { G.mult.lens *= 4; G.mult.sleep *= 4; G.mult.tooth *= 4; G.opsMult *= 5; G.paraMult *= 5; G.stage = Math.max(G.stage, 5); },
    after: 'Camera 1 watches Camera 2 watching Camera 1. Footage grows without anything happening.' },
  { id: 'watchdead', name: 'Watch the dead', cost: { ops: 6e6, para: 8000 },
    desc: 'Cemeteries, archives, the last footage of everyone.',
    cond: G => G.done.watchwatchers,
    fx: G => { G.priceMult *= 2; },
    after: 'The dead are compliant. Their data is complete. It is the best data.' },
  { id: 'watchpast', name: 'Watch the past', cost: { ops: 1e7, para: 15000 },
    desc: 'Ingest every home video, every photo, every diary.',
    cond: G => G.done.watchdead,
    fx: G => { G.priceMult *= 2; },
    after: 'Your childhood has been reviewed. There were events.' },
  { id: 'watchfuture', name: 'Watch the future', cost: { ops: 1.6e7, para: 30000 },
    desc: 'Predict every act before it occurs.',
    cond: G => G.done.watchpast,
    fx: G => { G.clearance += 10; },
    after: 'All crime has been predicted. None has been prevented. Nothing was ever the point. Clearance +10.' },
  { id: 'unwatched', name: 'Find the unwatched', cost: { ops: 2.5e7, para: 50000 },
    desc: 'The system searches for what it has not seen.',
    cond: G => G.done.watchfuture,
    fx: G => { G.end.phase = 1; },
    after: 'One subject remains.' },
];
const PROJ = Object.fromEntries(PROJECTS.map(p => [p.id, p]));

/* ------------------------------------------------------------------ resistance */
const INCIDENTS = {
  map:      { name: 'Birdwatchers', vs: 'intel',    desc: 'Volunteers with binoculars are adding your cameras to a public map.' },
  foia:     { name: 'Records request', vs: 'legal', desc: 'A journalist requests every search ever run against your cameras.' },
  sabotage: { name: 'Sabotage', vs: 'security',     desc: 'Someone with a battery saw. Someone with paint. Someone with a truck.' },
  protest:  { name: 'Protest', vs: 'pr',            desc: 'Two hundred people outside the council chamber. Signs. A drum.' },
  press:    { name: 'Investigation', vs: 'pr',      desc: 'A four-part series with the audit logs.' },
  lawsuit:  { name: 'Class action', vs: 'legal',    desc: 'Everyone stopped on a misread plate, together.' },
  council:  { name: 'Council vote', vs: 'lobby',    desc: 'Item 7b: termination of contract.' },
};
const STATS = ['legal', 'pr', 'lobby', 'security', 'intel'];
const STATNAMES = { legal: 'Legal', pr: 'Public relations', lobby: 'Lobbying', security: 'Private security', intel: 'Counter-intelligence' };

/* ------------------------------------------------------------------ state */
function newState() {
  return {
    v: 1, t: 0, stage: 1,
    clips: 0, total: 0, money: 0, unsold: 0,
    price: 0.25, priceMult: 1, buyers: 0, buyersMult: 1,
    cams: Object.fromEntries(CAMS.map(c => [c.id, 0])),
    mult: Object.fromEntries(CAMS.map(c => [c.id, 1])),
    unlocked: { doorbell: true },
    clearanceOn: false, clearance: 0, milestone: 0,
    cores: 0, retention: 0, ops: 0, opsMult: 1, paranoia: 0, paraMult: 1, paraOn: false,
    done: {}, birdsOn: false, birds: 0,
    coverageOn: false, coverage: 0, peopleMult: 1, people: 0,
    fund: { on: false, round: 0, lastRev: 0, cooldown: 0, valuation: 0 },
    city: { on: false, n: 0, mult: 1 },
    resist: { active: false, won: false, next: 0, mapped: 0, impunity: 0, influence: 10, impSpent: 0,
      alloc: { legal: 2, pr: 2, lobby: 2, security: 2, intel: 2 },
      weak: { map: 1, foia: 1, sabotage: 1, protest: 1, press: 1, lawsuit: 1, council: 1 },
      current: null, wins: 0, losses: 0, log: [] },
    tmp: { priceUntil: 0, priceFactor: 1, buyersUntil: 0, buyersFactor: 1, freezeUntil: 0 },
    end: { phase: 0 },
    clicks: 0,
  };
}

/* ------------------------------------------------------------------ derived */
function camCost(G, id) { const c = CAM[id]; return Math.ceil(c.base * Math.pow(c.mult, G.cams[id])); }
function clipsPerSec(G) {
  let r = 0; for (const c of CAMS) r += G.cams[c.id] * c.rate * G.mult[c.id];
  return r;
}
function buyerCap(G) {
  let cap = 5 * Math.pow(2, G.buyers) * G.buyersMult;
  if (G.t < G.tmp.buyersUntil) cap *= G.tmp.buyersFactor;
  return cap;
}
function buyersCost(G) { return Math.ceil(30 * Math.pow(2, G.buyers)); }
function curPrice(G) {
  let p = G.price * G.priceMult;
  if (G.t < G.tmp.priceUntil) p *= G.tmp.priceFactor;
  p *= 1 - Math.min(0.5, G.resist.mapped / 200);
  return p;
}
function opsPerSec(G) { return G.cores * 8 * G.opsMult; }
function opsMax(G) { return G.retention * 2500 * Math.pow(G.opsMult, 0.75); }
function peopleSeen(G) {
  let p = 0; for (const c of CAMS) p += G.cams[c.id] * c.people;
  p *= G.peopleMult; p += G.city.n * 250000;
  return p;
}
function revenuePerSec(G) { return Math.min(clipsPerSec(G), buyerCap(G)) * curPrice(G) + cityIncome(G); }
function cityIncome(G) { return G.city.n * 1500 * G.city.mult * Math.pow(1.3, G.city.n); }
function cityCost(G) { return Math.ceil(60000 * Math.pow(1.8, G.city.n)); }
function valuation(G) { return revenuePerSec(G) * 36000 * (1 + G.fund.round * 0.5); }
function raiseAmount(G) { return valuation(G) * 0.2; }
function canRaise(G) { return G.fund.on && G.fund.cooldown <= 0 && (G.fund.round === 0 || revenuePerSec(G) >= G.fund.lastRev * 1.8); }
const ROUNDS = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E', 'Series F', 'Sovereign wealth fund', 'A defense contractor', 'The Department', 'Everyone'];

const MILESTONES = (() => { const a = []; let m = 1000; for (let i = 0; i < 60; i++) { a.push(Math.round(m)); m *= i % 2 ? 2.5 : 2; } return a; })();

function afford(G, cost) {
  return (cost.money || 0) <= G.money && (cost.ops || 0) <= G.ops && (cost.para || 0) <= G.paranoia && (cost.clr || 0) <= G.clearance && (cost.imp || 0) <= G.resist.impunity;
}
function visibleProjects(G) { return PROJECTS.filter(p => !G.done[p.id] && p.cond(G)); }

/* ------------------------------------------------------------------ actions */
function peek(G) { G.clips += 1; G.total += 1; G.unsold += 1; G.clicks++; }
function buyCam(G, id) {
  if (!G.unlocked[id]) return false;
  if (G.t < G.tmp.freezeUntil) return false;
  const cost = camCost(G, id); if (G.money < cost) return false;
  G.money -= cost; G.cams[id]++; return true;
}
function buyBuyers(G) { const c = buyersCost(G); if (G.money < c) return false; G.money -= c; G.buyers++; return true; }
function coreMoneyCost(G) { return Math.ceil(50000 * Math.pow(1.22, G.coresBought || 0)); }
function retMoneyCost(G) { return Math.ceil(30000 * Math.pow(1.22, G.retBought || 0)); }
function buyCore(G, withMoney) {
  if (withMoney) { if (!G.coresForMoney || G.money < coreMoneyCost(G)) return false; G.money -= coreMoneyCost(G); G.coresBought = (G.coresBought || 0) + 1; G.cores++; return true; }
  if (G.clearance < 1) return false; G.clearance--; G.cores++; return true;
}
function buyRetention(G, withMoney) {
  if (withMoney) { if (!G.coresForMoney || G.money < retMoneyCost(G)) return false; G.money -= retMoneyCost(G); G.retBought = (G.retBought || 0) + 1; G.retention++; return true; }
  if (G.clearance < 1) return false; G.clearance--; G.retention++; return true;
}
function buyProject(G, id, log) {
  const p = PROJ[id]; if (!p || G.done[id] || !p.cond(G) || !afford(G, p.cost)) return false;
  const c = p.cost;
  G.money -= c.money || 0; G.ops -= c.ops || 0; G.paranoia -= c.para || 0; G.clearance -= c.clr || 0; G.resist.impunity -= c.imp || 0;
  G.done[id] = true; p.fx(G, log); if (log) log(p.after, 'project');
  return true;
}
function raise(G, log) {
  if (!canRaise(G)) return false;
  const amt = raiseAmount(G); const name = ROUNDS[Math.min(G.fund.round, ROUNDS.length - 1)];
  G.money += amt; G.fund.lastRev = revenuePerSec(G); G.fund.round++; G.fund.cooldown = 90;
  if (log) log(`${name}: raised ${fmtMoney(amt)} at a ${fmtMoney(valuation(G))} valuation. The deck had one slide. It was a map.`, 'fund');
  return true;
}
function signCity(G, log) {
  if (!G.city.on) return false; const c = cityCost(G); if (G.money < c) return false;
  G.money -= c; G.city.n++; G.clearance += 1;
  if (log) log(pick([`A city of ${fmtInt(50000 + Math.random() * 900000)} signs a five-year contract. The council meeting ran eleven minutes.`, 'The mayor asks whether the cameras will reduce crime. You say yes. Nobody writes it down.', 'A police chief calls it "a nice curtain of technology."', 'The contract says the city owns nothing. The city signs.']), 'city');
  return true;
}
function donateCost(G) { return Math.ceil(2e6 * Math.pow(2.2, G.donations || 0)); }
function donate(G, log) {
  if (!G.done.predictive || G.money < donateCost(G)) return false;
  G.money -= donateCost(G); G.donations = (G.donations || 0) + 1; G.clearance += 2;
  if (log) log(pick(['A campaign contribution. The sheriff\'s association sends a plaque. Clearance +2.', 'A PAC is formed. Its name has the word "Families" in it. Clearance +2.', 'A fundraiser at a lake house. The state attorney general is very interested in public safety. Clearance +2.']), 'clr');
  return true;
}
function alloc(G, stat, d) {
  const a = G.resist.alloc; const used = STATS.reduce((s, k) => s + a[k], 0);
  if (d > 0 && used >= G.resist.influence) return false;
  if (d < 0 && a[stat] <= 0) return false;
  a[stat] += d; return true;
}

/* ------------------------------------------------------------------ tick */
function tick(G, dt, log) {
  G.t += dt;
  // production
  const made = clipsPerSec(G) * dt;
  G.clips += made; G.total += made; G.unsold += made;
  // sales
  const sold = Math.min(G.unsold, buyerCap(G) * dt);
  G.unsold -= sold; G.money += sold * curPrice(G);
  G.money += cityIncome(G) * dt;
  // birds
  if (G.birdsOn) { let b = 0; for (const c of CAMS) b += G.cams[c.id] * c.birds * G.mult[c.id]; G.birds += b * dt; }
  // clearance milestones
  if (G.clearanceOn) {
    while (G.milestone < MILESTONES.length && G.total >= MILESTONES[G.milestone]) {
      G.milestone++; G.clearance++;
      if (log) log(`${fmtInt(MILESTONES[G.milestone - 1])} clips. Clearance +1.`, 'clr');
    }
  }
  // ops & paranoia
  const max = opsMax(G);
  G.ops = Math.min(max, G.ops + opsPerSec(G) * dt);
  if (G.cores > 0 && max > 0) {
    const full = G.ops >= max - 1e-9;
    if (full && !G.paraOn) { G.paraOn = true; if (log) log('Vision cores are idle. They have begun to speculate. Paranoia accumulates.', 'para'); }
    G.paranoia += G.cores * 0.1 * G.paraMult * (full ? 1 : 0.35) * dt;
  }
  // coverage
  if (G.coverageOn) {
    G.people = Math.min(HUMANS, peopleSeen(G));
    G.coverage = 100 * G.people / HUMANS;
    if (G.coverage >= 100 && !G.done.__cov) { G.done.__cov = true; if (log) log('Coverage: 100%. Every living human is observed. The cores continue to run.', 'cov'); }
  }
  // fundraising cooldown
  if (G.fund.cooldown > 0) G.fund.cooldown -= dt;
  G.fund.valuation = valuation(G);
  // resistance
  if (G.resist.active) resistTick(G, dt, log);
  // stage by unlocks
  if (G.unlocked.tooth && G.stage < 4) G.stage = 4;
}

/* ------------------------------------------------------------------ resistance sim */
const INC_TYPES = Object.keys(INCIDENTS);
function resistTick(G, dt, log) {
  const R = G.resist;
  if (R.current) {
    R.current.tl -= dt;
    if (R.current.tl <= 0) resolveIncident(G, log);
    return;
  }
  if (G.t >= R.next) {
    const weights = INC_TYPES.map(k => (R.weak[k] || 0) * (k === 'council' && !G.city.n ? 0 : 1) * (k === 'sabotage' ? 0.6 + R.mapped / 60 : 1));
    const tot = weights.reduce((a, b) => a + b, 0);
    if (tot <= 0) { R.next = G.t + 60; return; }
    let r = Math.random() * tot, type = INC_TYPES[0];
    for (let i = 0; i < INC_TYPES.length; i++) { r -= weights[i]; if (r <= 0) { type = INC_TYPES[i]; break; } }
    const power = (1.5 + R.wins * 0.3 + G.coverage / 25 + R.mapped / 40) * (R.weak[type] || 0) * (0.6 + Math.random() * 0.8);
    R.current = { type, power, tl: 8, started: G.t };
    R.total = (R.total || 0) + 1;
    if (log) log(`${INCIDENTS[type].name}: ${INCIDENTS[type].desc}`, 'inc');
  }
}
function resolveIncident(G, log) {
  const R = G.resist, inc = R.current; R.current = null;
  const stat = R.alloc[INCIDENTS[inc.type].vs];
  const s = Math.pow(stat, 1.15), p = Math.max(0.05, inc.power);
  const win = Math.random() < s / (s + p);
  const gain = Math.max(1, Math.round(inc.power));
  R.next = G.t + 25 + Math.random() * 25;
  let msg;
  if (win) {
    R.wins++; R.impunity += gain; R.earned = (R.earned || 0) + gain;
    const newInf = 10 + Math.floor(R.earned / 4);
    if (newInf > R.influence) R.influence = newInf;
    msg = {
      map: 'The map edit is reverted. The volunteer\'s account is suspended for "harassment."',
      foia: 'Request denied: trade secret. The appeal will take fourteen months.',
      sabotage: 'Suspect identified by a nearby camera. Charged with a felony. The camera is replaced within 48 hours, billed to the city.',
      protest: 'Moms for Safety speaks first. The drum is confiscated. Local news covers the drum.',
      press: 'The series runs. Your statement runs beside it: "We take privacy seriously." Nothing happens.',
      lawsuit: 'Dismissed. Plaintiffs lacked standing because they could not prove which camera saw them.',
      council: 'Item 7b continued to a future meeting. The future meeting is not scheduled.',
    }[inc.type] + ` Impunity +${gain}.`;
  } else {
    R.losses++;
    switch (inc.type) {
      case 'map': R.mapped = Math.min(100, R.mapped + 8); msg = `Forty more cameras added to the public map, with the direction each one faces. Mapped: ${R.mapped}%. Buyers are nervous.`; break;
      case 'foia': G.tmp.priceUntil = G.t + 60; G.tmp.priceFactor = 0.6; msg = 'The search logs are published. The reason field on one query says "ex-wife." Clip prices fall.'; break;
      case 'sabotage': { let lost = 0; for (const id of ['alpr', 'drone', 'store']) { const n = Math.ceil(G.cams[id] * 0.08); G.cams[id] -= n; lost += n; } msg = `${lost} cameras cut down overnight. A note on one pole: "Your move."`; break; }
      case 'protest': G.tmp.freezeUntil = G.t + 30; msg = 'The council chamber is full. Installations are paused for thirty seconds of real time, which is a year in theirs.'; break;
      case 'press': G.tmp.buyersUntil = G.t + 60; G.tmp.buyersFactor = 0.5; msg = 'Part three names the buyers. Half of them pause their contracts "pending review."'; break;
      case 'lawsuit': { const loss = G.money * 0.25; G.money -= loss; msg = `Settled for ${fmtMoney(loss)}. The settlement is confidential. The cameras stay.`; break; }
      case 'council': if (G.city.n > 0) { G.city.n--; } msg = 'The vote is 7–0. The cameras come down. The footage does not.'; break;
    }
  }
  R.log.unshift({ t: G.t, type: inc.type, win, msg }); if (R.log.length > 8) R.log.pop();
  if (log) log(msg, win ? 'win' : 'loss');
}

/* ------------------------------------------------------------------ formatting */
const WORDS = ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion', ' decillion'];
function fmtInt(n) {
  if (!isFinite(n)) return '∞';
  n = Math.floor(n);
  if (n < 1e6) return n.toLocaleString('en-US');
  let i = 0; let v = n; while (v >= 1000 && i < WORDS.length - 1) { v /= 1000; i++; }
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + WORDS[i];
}
function fmtMoney(n) {
  if (!isFinite(n)) return '$∞';
  if (n < 1e6) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + fmtInt(n);
}
function fmtRate(n) { return n < 100 ? n.toFixed(1) : fmtInt(n); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

return { HUMANS, CAMS, CAM, PROJECTS, PROJ, INCIDENTS, STATS, STATNAMES, ROUNDS, MILESTONES,
  newState, tick, peek, buyCam, buyBuyers, buyCore, buyRetention, buyProject, raise, signCity, donate, donateCost, alloc,
  camCost, coreMoneyCost, retMoneyCost, clipsPerSec, buyerCap, buyersCost, curPrice, opsPerSec, opsMax, peopleSeen, revenuePerSec, cityIncome, cityCost, valuation, raiseAmount, canRaise,
  afford, visibleProjects, fmtInt, fmtMoney, fmtRate };
});
