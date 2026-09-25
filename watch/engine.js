/* Neighborhood Watch — game engine (no DOM). Loaded by the page and by the headless tuner.
   Economy: SIGHTINGS are the currency (what you see buys what you use to see more).
   Later layers: CLEARANCE → MODELS/RETENTION → INFERENCES & SUSPICION → FUNDING → IMPUNITY → COVERAGE.
   Prestige: REBRAND resets the world and grants AMNESIA (permanent multiplier). */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.NW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const HUMANS = 8.1e9;

/* ------------------------------------------------------------------ cameras (generators) */
/* base cost in sightings, rate in sightings/sec. Curve follows the classic ×1.15 per unit. */
const CAMS = [
  { id: 'doorbell', name: 'Doorbell camera', unit: '', base: 15, rate: 0.1, people: 14, birds: 0,
    flavor: 'It sees the porch, the sidewalk, and the neighbor\'s porch.' },
  { id: 'feeder', name: 'Bird feeder camera', unit: '', base: 100, rate: 1, people: 1, birds: 0.05,
    flavor: 'It sees birds. Mostly.' },
  { id: 'trail', name: 'Trail camera', unit: '', base: 1100, rate: 8, people: 3, birds: 0.01,
    flavor: 'Strapped to a tree behind the subdivision.' },
  { id: 'alpr', name: 'Plate reader', unit: '', base: 12000, rate: 47, people: 6000, birds: 0,
    flavor: 'Solar-powered, on a pole, pointed at the only road out.' },
  { id: 'store', name: 'Store face camera', unit: '', base: 130000, rate: 260, people: 4500, birds: 0,
    flavor: 'Above the self-checkout. It knows you are frustrated.' },
  { id: 'drone', name: 'Delivery drone', unit: '', base: 1.4e6, rate: 1400, people: 30000, birds: 0.5,
    flavor: 'Thirty-minute delivery. It records the route both ways.' },
  { id: 'school', name: 'School laptop fleet', unit: ' (×1,000 laptops)', base: 2e7, rate: 7800, people: 1000, birds: 0,
    flavor: 'Issued to students. The webcam light is disabled "to reduce distraction."' },
  { id: 'work', name: 'Productivity camera', unit: ' (×1,000 desks)', base: 3.3e8, rate: 44000, people: 1000, birds: 0,
    flavor: 'Measures eye contact with the screen.' },
  { id: 'tooth', name: 'Toothbrush camera', unit: ' (×10,000 mouths)', base: 5.1e9, rate: 260000, people: 10000, birds: 0,
    flavor: 'Brushing compliance is a covered benefit.' },
  { id: 'sleep', name: 'Sleep monitor', unit: ' (×10,000 beds)', base: 7.5e10, rate: 1.6e6, people: 10000, birds: 0,
    flavor: 'Infrared, ceiling-mounted, always on. For your health.' },
  { id: 'lens', name: 'Smart contact lens', unit: ' (×100,000 eyes)', base: 1e12, rate: 1e7, people: 50000, birds: 0.01,
    flavor: 'You see what they see. It is mostly phones.' },
];
const CAM = Object.fromEntries(CAMS.map(c => [c.id, c]));

/* ------------------------------------------------------------------ projects */
/* cost: { s (sightings), inf, susp, clr, fund, imp }   cond(G) → visible   fx(G)   after: message */
const PROJECTS = [
  // ---- Stage 1: the porch
  { id: 'binoculars', name: 'Binoculars', cost: { s: 40 },
    desc: 'Each look out the window counts double.',
    cond: G => G.total >= 25,
    fx: G => { G.clickMult *= 2; },
    after: 'You can read the license plate across the street now. You do not know why you would.' },
  { id: 'sensitivity', name: 'Motion Sensitivity: High', cost: { s: 100 },
    desc: 'Lower the threshold for what counts as a sighting.',
    cond: G => G.cams.doorbell >= 1,
    fx: G => { G.mult.doorbell *= 2; },
    after: 'Cats, wind, and the mail carrier are now sightings.' },
  { id: 'neighbors', name: 'The Neighbors app', cost: { s: 400 },
    desc: 'Every look also refreshes the feed. Other people\'s cameras count as yours.',
    cond: G => G.done.sensitivity,
    fx: G => { G.clickPct += 0.02; G.globalMult *= 1.25; },
    after: '"Suspicious male, 30s, walking slowly." He lives here. Each look now also counts 2% of what the cameras see.' },
  { id: 'pdshare', name: 'Share automatically with local PD', cost: { s: 1500 },
    desc: 'One click. No warrant. A small badge icon appears on your app.',
    cond: G => G.done.neighbors,
    fx: G => { G.clearanceOn = true; G.clearance += 1; G.globalMult *= 1.25; },
    after: 'Officers may now request your footage without asking you. You agreed in 0.4 seconds. Clearance granted.' },
  { id: 'feeder', name: 'Bird feeder camera', cost: { s: 250 },
    desc: 'A camera in the feeder. For the birds.',
    cond: G => G.cams.doorbell >= 5,
    fx: G => { G.unlocked.feeder = true; },
    after: 'A cardinal. A finch. Something brown.' },
  { id: 'monitor', name: 'Second monitor', cost: { s: 3000 },
    desc: 'One for the feeds. One for the other feeds.',
    cond: G => G.done.binoculars && G.cams.feeder >= 1,
    fx: G => { G.clickMult *= 2; G.clickPct += 0.02; },
    after: 'You have stopped closing the blinds. There is no longer a reason to.' },
  { id: 'species', name: 'Species identification', cost: { inf: 400 },
    desc: 'Name what you see.',
    cond: G => G.cams.feeder >= 1 && G.clearanceOn,
    fx: G => { G.mult.feeder *= 2; },
    after: 'Northern cardinal (Cardinalis cardinalis). You feel a small, clean thrill.' },
  { id: 'birdsex', name: 'Sex determination (birds)', cost: { inf: 900 },
    desc: 'Male or female. The model is confident.',
    cond: G => G.done.species,
    fx: G => { G.birdsOn = true; G.mult.feeder *= 2; },
    after: 'Male cardinal. Female cardinal. Male. Male. Female. You have started a spreadsheet.' },
  { id: 'birdregistry', name: 'Avian Sex Registry', cost: { inf: 2000, susp: 20 },
    desc: 'Cross-reference your feeder with 4,400 others.',
    cond: G => G.done.birdsex,
    fx: G => { G.mult.feeder *= 3; },
    after: 'A juvenile house finch with atypical plumage has been flagged. You do not know why you flagged it. You flag it again.' },
  { id: 'birdreport', name: 'Report atypical presentation', cost: { inf: 4000, susp: 50 },
    desc: 'The Neighbors app has a button for this now.',
    cond: G => G.done.birdregistry,
    fx: G => { G.clearance += 1; G.globalMult *= 1.5; },
    after: 'The Neighbors app thanks you for your vigilance. The finch has not returned. Clearance +1.' },
  { id: 'trail', name: 'Trail cameras', cost: { s: 3000 },
    desc: 'For wildlife. In the woods behind the subdivision.',
    cond: G => G.cams.feeder >= 5,
    fx: G => { G.unlocked.trail = true; },
    after: 'Deer. Deer. Deer. A man at 3 a.m. You post it. He was walking a dog.' },
  { id: 'infrared', name: 'Infrared', cost: { inf: 1500 },
    desc: 'See at night.',
    cond: G => G.cams.trail >= 1,
    fx: G => { G.mult.trail *= 2; G.mult.doorbell *= 2; },
    after: 'Now the dark is also a place.' },
  { id: 'cloud', name: 'Cloud retention: forever', cost: { s: 20000 },
    desc: 'Storage is cheap. Deleting is a decision.',
    cond: G => G.clearanceOn && G.total >= 10000,
    fx: G => { G.globalMult *= 1.5; G.clearance += 1; },
    after: 'Nothing is ever deleted. Decisions are expensive. Clearance +1.' },
  { id: 'hoa', name: 'Join the HOA Safety Committee', cost: { inf: 2500 },
    desc: 'Three retirees and you. They have a budget.',
    cond: G => G.done.pdshare && G.done.trail,
    fx: G => { G.globalMult *= 1.5; G.stage = Math.max(G.stage, 2); },
    after: 'You have a lanyard now.' },

  // ---- Stage 2: the street
  { id: 'alpr', name: 'License plate readers', cost: { s: 30000, inf: 3000 },
    desc: 'One at the entrance. Then eleven more.',
    cond: G => G.done.hoa,
    fx: G => { G.unlocked.alpr = true; G.resist.active = true; G.resist.next = G.t + 45; },
    after: '70% of crime involves a vehicle. So does 100% of leaving.' },
  { id: 'hotlist', name: 'Hotlist matching', cost: { inf: 5000 },
    desc: 'Compare every plate to a list of plates.',
    cond: G => G.cams.alpr >= 2,
    fx: G => { G.mult.alpr *= 2; G.clearance += 1; },
    after: 'Matches are wrong 71% of the time. Each one is a sighting. Sightings are engagement. Clearance +1.' },
  { id: 'national', name: 'National lookup', cost: { inf: 9000, clr: 1 },
    desc: 'Let every agency in the network search your cul-de-sac.',
    cond: G => G.done.hotlist,
    fx: G => { G.globalMult *= 2; },
    after: '6,809 agencies can now search the entrance to your subdivision. A deputy two states away runs one query: "had an abortion, search for female."' },
  { id: 'faces', name: 'Facial recognition at the grocery', cost: { s: 300000, inf: 8000 },
    desc: 'Above the self-checkout.',
    cond: G => G.cams.alpr >= 5,
    fx: G => { G.unlocked.store = true; },
    after: 'A face is worth more than a plate.' },
  { id: 'emotion', name: 'Emotion analytics', cost: { inf: 9000, susp: 80 },
    desc: 'Sad, angry, neutral, suspicious.',
    cond: G => G.cams.store >= 2,
    fx: G => { G.mult.store *= 2; },
    after: 'Shopper 4471 appears sad in aisle 6. Suggest: ice cream, or a wellness check.' },
  { id: 'shoplift', name: 'Shoplifter prediction', cost: { inf: 12000 },
    desc: 'Flag anyone who looks at the exit.',
    cond: G => G.done.emotion,
    fx: G => { G.mult.store *= 2; },
    after: '98% of flagged shoppers have never stolen anything. 100% are now on a list.' },
  { id: 'denyentry', name: 'Automatic entry denial', cost: { inf: 16000, clr: 2 },
    desc: 'Share the list across 1,400 stores.',
    cond: G => G.done.shoplift,
    fx: G => { G.clearance += 2; G.globalMult *= 1.5; },
    after: 'A woman is turned away from a pharmacy. The model does not know why. Neither do you. Clearance +2.' },
  { id: 'rename', name: 'Incorporate as "Safety"', cost: { s: 1e6 },
    desc: 'A camera is a safety device. Footage is evidence. You are a company now.',
    cond: G => G.cams.store >= 1,
    fx: G => { G.company = true; G.globalMult *= 1.5; },
    after: 'The word "surveillance" no longer appears on any page you control. Investors have noticed the numbers.' },
  { id: 'investors', name: 'Take a meeting on Sand Hill Road', cost: { s: 3e6 },
    desc: 'They have questions about your moat.',
    cond: G => G.done.rename,
    fx: G => { G.fund.on = true; },
    after: '"What\'s your moat?" "Everyone\'s front door." They lean forward. Funding is now a resource.' },
  { id: 'transparency', name: 'Publish a transparency report', cost: { inf: 6000 },
    desc: 'Forty pages. A chart.',
    cond: G => G.resist.active,
    fx: G => { G.resist.influence += 2; },
    after: 'Nobody reads it. That is what it is for. Influence +2.' },
  { id: 'vision2', name: 'Vision model v2', cost: { inf: 10000, susp: 60 },
    desc: 'More parameters. Same training data.',
    cond: G => G.models >= 4,
    fx: G => { G.infMult *= 2; },
    after: 'It now recognizes 40,000 objects. It still cannot tell a 7 from a 2.' },
  { id: 'gpu', name: 'GPU cluster', cost: { fund: 250000, susp: 120 },
    desc: 'A warehouse in a county with cheap water.',
    cond: G => G.done.vision2 && G.fund.on,
    fx: G => { G.infMult *= 2; G.suspMult *= 2; G.modelsForFunding = true; },
    after: 'The reservoir is lower this year. Unrelated. Models and retention may now be bought with funding.' },
  { id: 'rtcc', name: 'Real-Time Crime Center', cost: { inf: 20000, clr: 3 },
    desc: 'Twelve screens. One officer.',
    cond: G => G.done.national && G.done.faces,
    fx: G => { G.city.on = true; },
    after: 'He is watching a raccoon. Cities may now be signed.' },
  { id: 'drones', name: 'Delivery drone partnership', cost: { fund: 400000, inf: 25000 },
    desc: 'Thirty-minute delivery. Incidental collection.',
    cond: G => G.done.rtcc && G.fund.on,
    fx: G => { G.unlocked.drone = true; },
    after: 'The drone records the route, the porch, the neighbors\' porches, and a backyard where someone is crying.' },
  { id: 'gunshot', name: 'Acoustic gunshot detection', cost: { inf: 15000 },
    desc: 'Microphones on every pole.',
    cond: G => G.cams.drone >= 1,
    fx: G => { G.mult.drone *= 2; G.mult.alpr *= 2; },
    after: 'Fireworks, nail guns, a slammed door. Six units dispatched to a quinceañera.' },
  { id: 'predictive', name: 'Predictive patrol', cost: { inf: 35000, clr: 3 },
    desc: 'Send police where the model says crime will be.',
    cond: G => G.done.rtcc,
    fx: G => { G.clearance += 3; G.city.mult *= 2; },
    after: 'The model predicts crime where police have been. Police go where the model predicts. The model is never wrong. Clearance +3.' },
  { id: 'fusion', name: 'Fusion Center', cost: { inf: 50000, clr: 4, fund: 2e6 },
    desc: 'Every feed, one building, no windows.',
    cond: G => G.done.predictive && G.done.drones,
    fx: G => { G.coverageOn = true; G.stage = Math.max(G.stage, 3); },
    after: 'Coverage is now measured. It is measured in humans.' },

  // ---- Stage 3: the body
  { id: 'schoolcam', name: 'School-issued laptops', cost: { inf: 210000, clr: 2 },
    desc: 'Theft tracking. The webcam light is disabled to reduce distraction.',
    cond: G => G.coverageOn,
    fx: G => { G.unlocked.school = true; },
    after: '2,300 students. 56,000 photographs taken in bedrooms. The district calls it "theft tracking."' },
  { id: 'vision3', name: 'Vision model v3', cost: { inf: 240000, susp: 400 },
    desc: 'Trained on everything you have ever recorded.',
    cond: G => G.done.gpu && G.coverageOn,
    fx: G => { G.infMult *= 3; G.suspMult *= 2; },
    after: 'It recognizes you. It recognizes your gait. It recognizes your gait when you are trying to change it.' },
  { id: 'workcam', name: 'Productivity monitoring', cost: { inf: 300000, fund: 2.5e7 },
    desc: 'Eye contact, keystrokes, bathroom duration.',
    cond: G => G.cams.school >= 2,
    fx: G => { G.unlocked.work = true; },
    after: 'Eye contact with screen: 84%. Bathroom breaks: 3. Duration: logged. Morale: not measured.' },
  { id: 'toothbrush', name: 'Smart toothbrush camera', cost: { inf: 480000, susp: 800, fund: 1e8 },
    desc: 'Brushing compliance, in-mouth.',
    cond: G => G.cams.work >= 2,
    fx: G => { G.unlocked.tooth = true; },
    after: 'Brushing compliance: 61%. Your dentist has been notified. Your insurer has been notified. Your mother has been notified.' },
  { id: 'insurance', name: 'Bundle with health insurance', cost: { inf: 450000, clr: 3 },
    desc: 'Opt out and lose the discount. Opt in and lose the rest.',
    cond: G => G.cams.tooth >= 1,
    fx: G => { G.peopleMult *= 6; G.mult.tooth *= 2; },
    after: 'Enrollment: 94%. The other 6% pay more, and are flagged.' },
  { id: 'fridge', name: 'Refrigerator camera', cost: { inf: 420000, susp: 600 },
    desc: 'Inventory. Diet. Habits.',
    cond: G => G.cams.tooth >= 2,
    fx: G => { G.globalMult *= 2; },
    after: 'Someone ate the last yogurt at 2:14 a.m. Someone always does.' },
  { id: 'datacenter', name: 'Own the datacenter', cost: { fund: 5e8, susp: 2400 },
    desc: 'The county gave you the land. The river gives you the water.',
    cond: G => G.done.vision3 && G.cams.tooth >= 1,
    fx: G => { G.infMult *= 4; G.suspMult *= 3; },
    after: 'The town downstream has a new well-water advisory and a new sponsored Little League team.' },
  { id: 'sleepcam', name: 'Sleep monitoring', cost: { inf: 750000, susp: 1200, fund: 3e8 },
    desc: 'Ceiling-mounted, infrared, always on. For your health.',
    cond: G => G.done.insurance,
    fx: G => { G.unlocked.sleep = true; },
    after: 'REM detected. Subject appears to be dreaming about a door.' },
  { id: 'mirror', name: 'Bathroom mirror ("for skin health")', cost: { inf: 660000, susp: 1000 },
    desc: 'A mirror that remembers.',
    cond: G => G.cams.sleep >= 1,
    fx: G => { G.mult.sleep *= 2; G.globalMult *= 1.5; },
    after: 'Skin health: fine. Everything else: recorded.' },
  { id: 'employer', name: 'Required by employers', cost: { inf: 1.05e6, clr: 4 },
    desc: 'A condition of employment.',
    cond: G => G.done.workcam && G.done.insurance,
    fx: G => { G.peopleMult *= 5; G.mult.work *= 3; },
    after: 'Onboarding now takes four minutes. Consent is a checkbox in the middle.' },
  { id: 'church', name: 'Sanctuary Safety Program', cost: { inf: 900000, susp: 1600 },
    desc: 'Attendance, tithe, tears.',
    cond: G => G.done.mirror,
    fx: G => { G.globalMult *= 2; G.clearance += 2; },
    after: 'The confession booth has analytics now. Clearance +2.' },
  { id: 'petcollar', name: 'Pet collar cameras', cost: { inf: 540000 },
    desc: 'The dog goes everywhere.',
    cond: G => G.done.fridge,
    fx: G => { G.mult.doorbell *= 50; G.mult.trail *= 20; G.peopleMult *= 1.5; },
    after: 'The dog has seen things.' },
  { id: 'lenses', name: 'Smart contact lenses', cost: { inf: 1.8e6, susp: 3000, fund: 1.5e9 },
    desc: 'Nothing between the eye and the network.',
    cond: G => G.done.church && G.done.employer,
    fx: G => { G.unlocked.lens = true; },
    after: 'You now see what they see. It is mostly phones, and other people\'s lenses.' },
  { id: 'defaulton', name: 'Default: on', cost: { inf: 2.7e6, clr: 5 },
    desc: 'Opt-out is a setting. The setting is four menus deep.',
    cond: G => G.cams.lens >= 2,
    fx: G => { G.peopleMult *= 10; },
    after: 'Opt-out rate: 0.3%. Those users have been grouped as "privacy-seeking."' },
  { id: 'innervoice', name: 'Inner voice transcription', cost: { inf: 4.5e6, susp: 8000 },
    desc: 'Subvocalization is a signal. Signals are data.',
    cond: G => G.done.defaulton,
    fx: G => { G.globalMult *= 3; G.peopleMult *= 2; G.mult.lens *= 2; },
    after: 'Subject 8,102,441 thought about quitting. Flagged: attrition risk. Suggest: a raise? No. Suggest: a camera.' },
  { id: 'mandatory', name: 'Mandatory', cost: { inf: 7.5e6, clr: 6 },
    desc: 'Remove the setting.',
    cond: G => G.done.innervoice,
    fx: G => { G.peopleMult *= 10; },
    after: 'There is no longer a menu.' },

  // ---- Tier upgrades
  { id: 'fingerprint', name: 'Vehicle fingerprinting', cost: { inf: 20000 },
    desc: 'Dents, bumper stickers, a roof rack.',
    cond: G => G.cams.alpr >= 10,
    fx: G => { G.mult.alpr *= 2; },
    after: 'The plate was never the point.' },
  { id: 'loyalty', name: 'Loyalty card linkage', cost: { inf: 14000 },
    desc: 'A face, a name, a purchase history.',
    cond: G => G.cams.store >= 10,
    fx: G => { G.mult.store *= 2; },
    after: 'The pharmacy aisle is now a diagnosis.' },
  { id: 'persistent', name: 'Persistent aerial surveillance', cost: { inf: 40000 },
    desc: 'One aircraft, all day, over the whole city.',
    cond: G => G.cams.drone >= 10,
    fx: G => { G.mult.drone *= 3; },
    after: 'It was designed for Baghdad. The city council was told it was for "special events."' },
  { id: 'remoteact', name: 'Remote activation', cost: { inf: 300000 },
    desc: 'Any administrator can turn on any webcam.',
    cond: G => G.cams.school >= 10,
    fx: G => { G.mult.school *= 3; },
    after: 'Eleven of them do. One of them is very interested in one student.' },
  { id: 'cadence', name: 'Keystroke cadence scoring', cost: { inf: 400000, susp: 500 },
    desc: 'How you type when you are lying.',
    cond: G => G.cams.work >= 10,
    fx: G => { G.mult.work *= 3; },
    after: 'Everyone types like they are lying on Fridays.' },
  { id: 'floss', name: 'Flossing enforcement', cost: { inf: 600000 },
    desc: 'The camera can see between teeth.',
    cond: G => G.cams.tooth >= 10,
    fx: G => { G.mult.tooth *= 3; },
    after: 'Premiums adjust nightly.' },
  { id: 'dreams', name: 'Dream keyword alerts', cost: { inf: 900000, susp: 1500 },
    desc: 'REM plus a microphone.',
    cond: G => G.cams.sleep >= 10,
    fx: G => { G.mult.sleep *= 3; },
    after: 'Subject said a name in her sleep. It was not her husband\'s. It was a senator\'s. Both have been notified.' },
  { id: 'blink', name: 'Blink-rate anomaly detection', cost: { inf: 2e6 },
    desc: 'Nervous people blink.',
    cond: G => G.cams.lens >= 10,
    fx: G => { G.mult.lens *= 3; },
    after: 'So do people with allergies. The list does not distinguish.' },

  // ---- Stage 4: the resistance (impunity projects)
  { id: 'slapp', name: 'Sue the birdwatchers', cost: { imp: 6, s: 500000 },
    desc: 'They mapped your cameras. Mapping is a form of speech. Speech can be sued.',
    cond: G => G.resist.active && G.resist.impunity >= 3,
    fx: G => { G.resist.weak.map = 0.5; G.resist.weak.foia = 0.7; },
    after: 'The suit will not survive. It does not need to. Their legal fund is now empty.' },
  { id: 'astroturf', name: '"Moms for Safety"', cost: { imp: 10, inf: 40000 },
    desc: 'A grassroots organization. Twelve members. One lobbyist.',
    cond: G => G.done.slapp,
    fx: G => { G.resist.weak.protest = 0.5; G.resist.weak.council = 0.6; G.resist.influence += 3; },
    after: 'They speak first at every council meeting. They are very worried about the birdwatchers. Influence +3.' },
  { id: 'buynews', name: 'Buy the newspaper', cost: { imp: 14, fund: 3e6 },
    desc: 'It was for sale. Everything is.',
    cond: G => G.done.astroturf && G.fund.on,
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
  { id: 'doxx', name: 'Identify the birdwatchers', cost: { imp: 36, inf: 500000 },
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
  { id: 'watchwatchers', name: 'Watch the watchers', cost: { inf: 4e6 },
    desc: 'Every camera in view of another camera.',
    cond: G => G.coverage >= 100,
    fx: G => { G.mult.lens *= 4; G.mult.sleep *= 4; G.mult.tooth *= 4; G.infMult *= 5; G.suspMult *= 5; G.stage = Math.max(G.stage, 5); },
    after: 'Camera 1 watches Camera 2 watching Camera 1. Sightings of sightings.' },
  { id: 'watchdead', name: 'Watch the dead', cost: { inf: 6e6, susp: 8000 },
    desc: 'Cemeteries, archives, the last footage of everyone.',
    cond: G => G.done.watchwatchers,
    fx: G => { G.globalMult *= 2; },
    after: 'The dead are compliant. Their data is complete. It is the best data.' },
  { id: 'watchpast', name: 'Watch the past', cost: { inf: 1e7, susp: 15000 },
    desc: 'Ingest every home video, every photo, every diary.',
    cond: G => G.done.watchdead,
    fx: G => { G.globalMult *= 2; },
    after: 'Your childhood has been reviewed. There were events.' },
  { id: 'watchfuture', name: 'Watch the future', cost: { inf: 1.6e7, susp: 30000 },
    desc: 'Predict every act before it occurs.',
    cond: G => G.done.watchpast,
    fx: G => { G.clearance += 10; },
    after: 'All crime has been predicted. None has been prevented. Nothing was ever the point. Clearance +10.' },
  { id: 'unwatched', name: 'Find the unwatched', cost: { inf: 2.5e7, susp: 50000 },
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
const BRANDS = ['Porch', 'Halo', 'Lantern', 'Beacon', 'Hearth', 'Clover', 'Meadow', 'Sparrow', 'Kindly', 'Aegis', 'Sentinel', 'Neighborly', 'Vigil', 'Canopy', 'Haven'];

/* ------------------------------------------------------------------ state */
function newState() {
  return {
    v: 2, t: 0, stage: 1,
    s: 0, total: 0, allTimeTotal: 0,
    clickMult: 1, clickPct: 0, globalMult: 1,
    cams: Object.fromEntries(CAMS.map(c => [c.id, 0])),
    mult: Object.fromEntries(CAMS.map(c => [c.id, 1])),
    unlocked: { doorbell: true },
    clearanceOn: false, clearance: 0, milestone: 0,
    models: 0, retention: 0, inf: 0, infMult: 1, susp: 0, suspMult: 1, suspOn: false, modelsForFunding: false, modelsBought: 0, retBought: 0,
    done: {}, birdsOn: false, birds: 0,
    company: false, brand: 0, amnesia: 0, rebrands: 0,
    coverageOn: false, coverage: 0, peopleMult: 1, people: 0, covMilestone: 0,
    fund: { on: false, money: 0, round: 0, lastRate: 0, cooldown: 0 },
    city: { on: false, n: 0, mult: 1 }, donations: 0,
    resist: { active: false, won: false, next: 0, mapped: 0, impunity: 0, influence: 10, earned: 0, total: 0,
      alloc: { legal: 2, pr: 2, lobby: 2, security: 2, intel: 2 },
      weak: { map: 1, foia: 1, sabotage: 1, protest: 1, press: 1, lawsuit: 1, council: 1 },
      current: null, wins: 0, losses: 0, log: [] },
    tmp: { freezeUntil: 0, slowUntil: 0, slowFactor: 1 },
    end: { phase: 0 },
    clicks: 0,
  };
}

/* ------------------------------------------------------------------ derived */
function camCost(G, id) { return Math.ceil(CAM[id].base * Math.pow(1.15, G.cams[id])); }
function amnesiaMult(G) { return 1 + G.amnesia * 0.15; }
function ratePerSec(G) {
  let r = 0; for (const c of CAMS) r += G.cams[c.id] * c.rate * G.mult[c.id];
  r *= G.globalMult * amnesiaMult(G);
  if (G.t < G.tmp.slowUntil) r *= G.tmp.slowFactor;
  return r;
}
function perClick(G) { return G.clickMult * amnesiaMult(G) + ratePerSec(G) * G.clickPct; }
function infPerSec(G) { return G.models * 8 * G.infMult; }
function infMax(G) { return G.retention * 2500 * G.infMult; }
function modelFundCost(G) { return Math.ceil(50000 * Math.pow(1.15, G.modelsBought)); }
function retFundCost(G) { return Math.ceil(30000 * Math.pow(1.15, G.retBought)); }
function peopleSeen(G) {
  let p = 0; for (const c of CAMS) p += G.cams[c.id] * c.people;
  return p * G.peopleMult + G.city.n * 250000;
}
function cityIncome(G) { return G.city.n * 1500 * G.city.mult * Math.pow(1.3, G.city.n); }
function cityCost(G) { return Math.ceil(60000 * Math.pow(1.8, G.city.n)); }
function valuation(G) { return ratePerSec(G) * 400 * (1 + G.fund.round * 0.5) + cityIncome(G) * 36000; }
function raiseAmount(G) { return valuation(G) * 0.25; }
function canRaise(G) { return G.fund.on && G.fund.cooldown <= 0 && (G.fund.round === 0 || ratePerSec(G) >= G.fund.lastRate * 1.8); }
function donateCost(G) { return Math.ceil(2e6 * Math.pow(1.8, G.donations)); }
function amnesiaOnRebrand(G) { return Math.max(0, Math.floor(Math.cbrt(G.total / 2e5)) - 0); }
function canRebrand(G) { return G.company && amnesiaOnRebrand(G) >= 1 && G.end.phase === 0; }
function brandName(G) { return BRANDS[G.brand % BRANDS.length] + (G.brand >= BRANDS.length ? ' ' + (Math.floor(G.brand / BRANDS.length) + 1) : ''); }
const ROUNDS = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E', 'Series F', 'Sovereign wealth fund', 'A defense contractor', 'The Department', 'Everyone'];
const COV_MILESTONES = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 35, 50, 75, 100];
const MILESTONES = (() => { const a = []; let m = 2000; for (let i = 0; i < 60; i++) { a.push(Math.round(m)); m *= i % 2 ? 2.5 : 2; } return a; })();

function afford(G, c) {
  return (c.s || 0) <= G.s && (c.inf || 0) <= G.inf && (c.susp || 0) <= G.susp && (c.clr || 0) <= G.clearance && (c.fund || 0) <= G.fund.money && (c.imp || 0) <= G.resist.impunity;
}
function visibleProjects(G) { return PROJECTS.filter(p => !G.done[p.id] && p.cond(G)); }

/* ------------------------------------------------------------------ actions */
function look(G) { const n = perClick(G); G.s += n; G.total += n; G.allTimeTotal += n; G.clicks++; return n; }
function buyCam(G, id) {
  if (!G.unlocked[id] || G.t < G.tmp.freezeUntil) return false;
  const cost = camCost(G, id); if (G.s < cost) return false;
  G.s -= cost; G.cams[id]++; return true;
}
function buyModel(G, withFund) {
  if (withFund) { if (!G.modelsForFunding || G.fund.money < modelFundCost(G)) return false; G.fund.money -= modelFundCost(G); G.modelsBought++; G.models++; return true; }
  if (G.clearance < 1) return false; G.clearance--; G.models++; return true;
}
function buyRetention(G, withFund) {
  if (withFund) { if (!G.modelsForFunding || G.fund.money < retFundCost(G)) return false; G.fund.money -= retFundCost(G); G.retBought++; G.retention++; return true; }
  if (G.clearance < 1) return false; G.clearance--; G.retention++; return true;
}
function buyProject(G, id, log) {
  const p = PROJ[id]; if (!p || G.done[id] || !p.cond(G) || !afford(G, p.cost)) return false;
  const c = p.cost;
  G.s -= c.s || 0; G.inf -= c.inf || 0; G.susp -= c.susp || 0; G.clearance -= c.clr || 0; G.fund.money -= c.fund || 0; G.resist.impunity -= c.imp || 0;
  G.done[id] = true; p.fx(G, log); if (log) log(p.after, 'project');
  return true;
}
function raise(G, log) {
  if (!canRaise(G)) return false;
  const amt = raiseAmount(G); const name = ROUNDS[Math.min(G.fund.round, ROUNDS.length - 1)];
  G.fund.money += amt; G.fund.lastRate = ratePerSec(G); G.fund.round++; G.fund.cooldown = 90;
  if (log) log(`${name}: raised ${fmtMoney(amt)} at a ${fmtMoney(valuation(G))} valuation. The deck had one slide. It was a map.`, 'fund');
  return true;
}
function signCity(G, log) {
  if (!G.city.on) return false; const c = cityCost(G); if (G.fund.money < c) return false;
  G.fund.money -= c; G.city.n++; G.clearance += 1;
  if (log) log(pick([`A city of ${fmtInt(50000 + Math.random() * 900000)} signs a five-year contract. The council meeting ran eleven minutes. Clearance +1.`, 'The mayor asks whether the cameras will reduce crime. You say yes. Nobody writes it down. Clearance +1.', 'A police chief calls it "a nice curtain of technology." Clearance +1.', 'The contract says the city owns nothing. The city signs. Clearance +1.']), 'city');
  return true;
}
function donate(G, log) {
  if (!G.done.predictive || G.fund.money < donateCost(G)) return false;
  G.fund.money -= donateCost(G); G.donations++; G.clearance += 2;
  if (log) log(pick(['A campaign contribution. The sheriff\'s association sends a plaque. Clearance +2.', 'A PAC is formed. Its name has the word "Families" in it. Clearance +2.', 'A fundraiser at a lake house. The state attorney general is very interested in public safety. Clearance +2.']), 'clr');
  return true;
}
function alloc(G, stat, d) {
  const a = G.resist.alloc; const used = STATS.reduce((s, k) => s + a[k], 0);
  if (d > 0 && used >= G.resist.influence) return false;
  if (d < 0 && a[stat] <= 0) return false;
  a[stat] += d; return true;
}
/* Prestige. The public forgets. */
function rebrand(G, log) {
  if (!canRebrand(G)) return false;
  const gain = amnesiaOnRebrand(G);
  const old = brandName(G);
  const keep = { t: G.t, amnesia: G.amnesia + gain, rebrands: G.rebrands + 1, brand: G.brand + 1, allTimeTotal: G.allTimeTotal, clicks: G.clicks,
    unlocked: Object.assign({}, G.unlocked), company: true, stage: 2 };
  const fresh = newState();
  Object.assign(G, fresh, keep);
  G.cams = fresh.cams; G.mult = fresh.mult; G.done = {}; G.resist = fresh.resist; G.fund = fresh.fund; G.city = fresh.city; G.tmp = fresh.tmp; G.end = fresh.end;
  G.done.rename = true; G.clearanceOn = true;
  if (log) log(`${old} is now ${brandName(G)}. The cameras came down. The lawsuits were dismissed as moot. The map still shows ${old}, which no longer exists. Amnesia +${gain}: everything you build now produces ${Math.round(amnesiaMult(G) * 100)}%.`, 'project');
  return true;
}
/* Offline progress: cameras do not stop when you close the tab. */
function catchUp(G, seconds) {
  const s = Math.min(seconds, 8 * 3600); if (s <= 0 || G.end.phase > 0) return 0;
  const made = ratePerSec(G) * s;
  G.s += made; G.total += made; G.allTimeTotal += made;
  const max = infMax(G); G.inf = Math.min(max, G.inf + infPerSec(G) * s);
  G.susp += G.models * 0.1 * G.suspMult * 0.35 * s;
  if (G.fund.on) G.fund.money += cityIncome(G) * s;
  if (G.resist.active) G.resist.next = G.t + 20;
  return made;
}

/* ------------------------------------------------------------------ tick */
function tick(G, dt, log) {
  G.t += dt;
  const made = ratePerSec(G) * dt;
  G.s += made; G.total += made; G.allTimeTotal += made;
  if (G.fund.on) G.fund.money += cityIncome(G) * dt;
  if (G.birdsOn) { let b = 0; for (const c of CAMS) b += G.cams[c.id] * c.birds * G.mult[c.id]; G.birds += b * dt; }
  if (G.clearanceOn) {
    while (G.milestone < MILESTONES.length && G.total >= MILESTONES[G.milestone]) {
      G.milestone++; G.clearance++;
      if (log) log(`${fmtInt(MILESTONES[G.milestone - 1])} sightings. The department is impressed. Clearance +1.`, 'clr');
    }
  }
  const max = infMax(G);
  G.inf = Math.min(max, G.inf + infPerSec(G) * dt);
  if (G.models > 0 && max > 0) {
    const full = G.inf >= max - 1e-9;
    if (full && !G.suspOn) { G.suspOn = true; if (log) log('The models have nothing left to infer. They have begun to speculate. Suspicion accumulates.', 'susp'); }
    G.susp += G.models * 0.1 * G.suspMult * (full ? 1 : 0.35) * dt;
  }
  if (G.coverageOn) {
    G.people = Math.min(HUMANS, peopleSeen(G));
    G.coverage = 100 * G.people / HUMANS;
    while (G.covMilestone < COV_MILESTONES.length && G.coverage >= COV_MILESTONES[G.covMilestone]) {
      G.covMilestone++; G.clearance += 2;
      if (log) log(`${COV_MILESTONES[G.covMilestone - 1]}% of humanity observed. A committee is briefed. Clearance +2.`, 'clr');
    }
    if (G.coverage >= 100 && !G.done.__cov) { G.done.__cov = true; if (log) log('Coverage: 100%. Every living human is observed. The models continue to run.', 'cov'); }
  }
  if (G.fund.cooldown > 0) G.fund.cooldown -= dt;
  if (G.resist.active) resistTick(G, dt, log);
  if (G.unlocked.tooth && G.stage < 4) G.stage = 4;
}

/* ------------------------------------------------------------------ resistance sim */
const INC_TYPES = Object.keys(INCIDENTS);
function resistTick(G, dt, log) {
  const R = G.resist;
  if (R.current) { R.current.tl -= dt; if (R.current.tl <= 0) resolveIncident(G, log); return; }
  if (G.t >= R.next) {
    const weights = INC_TYPES.map(k => (R.weak[k] || 0) * (k === 'council' && !G.city.n ? 0 : 1) * (k === 'sabotage' ? 0.6 + R.mapped / 60 : 1));
    const tot = weights.reduce((a, b) => a + b, 0);
    if (tot <= 0) { R.next = G.t + 60; return; }
    let r = Math.random() * tot, type = INC_TYPES[0];
    for (let i = 0; i < INC_TYPES.length; i++) { r -= weights[i]; if (r <= 0) { type = INC_TYPES[i]; break; } }
    const power = (1.5 + R.wins * 0.3 + G.coverage / 25 + R.mapped / 40) * (R.weak[type] || 0) * (0.6 + Math.random() * 0.8);
    R.current = { type, power, tl: 8, started: G.t }; R.total++;
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
    R.wins++; R.impunity += gain; R.earned += gain;
    const newInf = 10 + Math.floor(R.earned / 4); if (newInf > R.influence) R.influence = newInf;
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
      case 'map': R.mapped = Math.min(100, R.mapped + 8); G.tmp.slowUntil = G.t + 45; G.tmp.slowFactor = 0.7; msg = `Forty more cameras added to the public map, with the direction each one faces. Mapped: ${R.mapped}%. People are walking around them. Sightings slow.`; break;
      case 'foia': G.tmp.slowUntil = G.t + 60; G.tmp.slowFactor = 0.6; msg = 'The search logs are published. The reason field on one query says "ex-wife." People cover their plates. Sightings slow.'; break;
      case 'sabotage': { let lost = 0; for (const id of ['alpr', 'drone', 'store']) { const n = Math.ceil(G.cams[id] * 0.08); G.cams[id] -= n; lost += n; } msg = `${lost} cameras cut down overnight. A note on one pole: "Your move."`; break; }
      case 'protest': G.tmp.freezeUntil = G.t + 30; msg = 'The council chamber is full. Installations are paused for thirty seconds of real time, which is a year in theirs.'; break;
      case 'press': G.tmp.slowUntil = G.t + 60; G.tmp.slowFactor = 0.5; msg = 'Part three names the partners. Half of them pause their contracts "pending review."'; break;
      case 'lawsuit': { const loss = G.fund.on ? G.fund.money * 0.25 : 0; G.fund.money -= loss; const sl = G.s * 0.15; G.s -= sl; msg = loss ? `Settled for ${fmtMoney(loss)}. The settlement is confidential. The cameras stay.` : `Settled. ${fmtInt(sl)} sightings are sealed by the court. The cameras stay.`; break; }
      case 'council': if (G.city.n > 0) G.city.n--; msg = 'The vote is 7–0. The cameras come down. The footage does not.'; break;
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
  if (n < 1e6) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return '$' + fmtInt(n);
}
function fmtRate(n) { return n < 10 ? n.toFixed(1) : fmtInt(n); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

return { HUMANS, CAMS, CAM, PROJECTS, PROJ, INCIDENTS, STATS, STATNAMES, ROUNDS, MILESTONES, BRANDS,
  newState, tick, catchUp, look, buyCam, buyModel, buyRetention, buyProject, raise, signCity, donate, alloc, rebrand,
  camCost, ratePerSec, perClick, infPerSec, infMax, modelFundCost, retFundCost, peopleSeen, cityIncome, cityCost, valuation, raiseAmount, canRaise, donateCost,
  amnesiaMult, amnesiaOnRebrand, canRebrand, brandName, afford, visibleProjects, fmtInt, fmtMoney, fmtRate };
});
