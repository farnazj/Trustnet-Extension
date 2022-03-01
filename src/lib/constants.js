//const BASE_URL = `http://localhost:3000`;
const BASE_URL = `https://developer.trustnet.csail.mit.edu`
//const CLIENT_URL = `http://localhost:8080`;
const CLIENT_URL = `https://trustnet.csail.mit.edu`;

const SITE_NAME = 'Trustnet';
const LENGTH_TO_HASH = 25;
const MAX_TITLE_LENGTH = 180;
const MIN_TITLE_LENGTH = 18;
const FINDING_TITLES_FUZZY_SCORE_THRESHOLD=0.77;
const IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD=0.77;

const ACCURACY_CODES = {'CONFIRMED': 1, 'REFUTED': -1, 'QUESTIONED': 0};

const GLOBAL_BLACKLISTED_DOMAINS = [
  'calendar.google.com',
  'drive.google.com',
  'scholar.google.com',
  'play.hbomax.com',
  'netflix.com',
  'hulu.com',
  'amazon.com',
  'weather.com',
  'paypal.com',
  'ups.com',
  'bankofamerica.com',
  'chase.com',
  'pnc.com',
  'betterment.com'
]

/*
Domains whose redirects should not be followed
*/
const DISALLOWED_DOMAINS = [
  'acm.dl.org'
]

/*
Domains where a resource is identified using a query parameter
*/
const DOMAINS_WITH_QUERY_PARAMS = [
  'facebook.com/photo/?fbid',
  'facebook.com/watch',
  'youtube.com/watch',
  'news.ycombinator.com/item'
]

export default {
  BASE_URL,
  CLIENT_URL,
  SITE_NAME,
  LENGTH_TO_HASH,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  FINDING_TITLES_FUZZY_SCORE_THRESHOLD,
  IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD,
  ACCURACY_CODES,
  GLOBAL_BLACKLISTED_DOMAINS,
  DISALLOWED_DOMAINS,
  DOMAINS_WITH_QUERY_PARAMS
}
