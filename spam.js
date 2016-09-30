const jsmd5 = require('./jsmd5');
const request = (require('superagent-proxy')(require('superagent')));
const _ = require('underscore');
const Promise = require('bluebird');
const {ENTRY_METHODS} = require('./entry-methods');

const CAMPAIGN_KEY = 'OyyAH';
const EMAIL_BASE = process.argv[2];
const EMAIL_DOMAIN = process.argv[3] || 'gmail.com';
const REFERER = 'https://gleam.io/OyyAH/enter-to-win-3-tickets-to-marshmello-at-concord-music-hall';

const PROXY = 'http://localhost:8888';
const HOST = 'gleam.io';
const OWNER_TOKEN = 'owner_token';
const APP_SESSION = '_app_session';

// allow web proxies with self signed certs
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// this function hashes an entry method object, which must have an id and entry_type
const entryMethodHashed = ({contestant_id, entry_method: {id, entry_type}}) => {
  return jsmd5([-contestant_id, id, entry_type, CAMPAIGN_KEY].join("-"));
};

// hash a string with base
const fingerprintHash = (base) => {
  const isBad = false;
  return base + "." + jsmd5(base + (isBad ? "+" : ""))
};

const cookieValue = (header, name) => {
  const cookie = _.find(header['set-cookie'],
    cookie => cookie.indexOf(name + '=') == 0
  );
  if (!cookie) {
    return null;
  }
  return cookie.substring(
    name.length + 1,
    cookie.indexOf(';')
  );
};

const CSRF_TOKEN_PATTERN = new RegExp(/<meta name="csrf-token" content="([\w\d\/=\+]+)"/);

const visitBase = () => {
  return new Promise((resolve, reject) => {
    console.log('Getting an owner token');
    request.get('https://gleam.io/OyyAH/enter-to-win-3-tickets-to-marshmello-at-concord-music-hall')
      // .proxy(PROXY)
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err);
          reject(new Error('bad request'));
        } else {
          // console.log(res.text);
          const owner_token = cookieValue(res.header, OWNER_TOKEN),
            _app_session = cookieValue(res.header, APP_SESSION),
            csrf_token = CSRF_TOKEN_PATTERN.exec(res.text)[1];

          if (!owner_token || !_app_session || !csrf_token) {
            reject(new Error('could not find owner token'));
          } else {
            console.log(`Found owner token: ${owner_token} with session ${_app_session}`);
            resolve({csrf_token,owner_token, _app_session});
          }
        }
      });
  });
};

// first create a contestant and store the ID in here
const makeContestant = ({email, name = 'Moody', date_of_birth = '08/12/1990', owner_token, _app_session}) => {
  return new Promise((resolve, reject) => {
    console.info(`Creating contestant with e-mail ${email}, name: ${name}, DOB: ${date_of_birth}`);

    request.post('https://gleam.io/set-contestant')
      .send({
        campaign_key: CAMPAIGN_KEY,
        contestant: {name, email, date_of_birth},
        additional_details: true
      })
      // .proxy(PROXY)
      .set('Referer', REFERER)
      .set('Cookie', `${OWNER_TOKEN}=${owner_token}; ${APP_SESSION}=${_app_session}`)
      .end((err, res) => {
        if (err || !res.ok) {
          reject(new Error('failed: ' + res.body));
          console.error(`Failed to make contestant`);
        } else {
          const _app_session = cookieValue(res.header, APP_SESSION),
            new_owner_token = cookieValue(res.header, OWNER_TOKEN);

          if (!_app_session || !owner_token) {
            reject(new Error(`Failed to get session or owner token`));
          } else {
            console.log(`Made contestant: ${JSON.stringify(res.body)} and received session ID: ${_app_session}`);

            resolve({
              contestant: res.body,
              _app_session,
              owner_token: new_owner_token || owner_token
            });
          }
        }
      });
  });
};

const makeEntry = ({contestant_id, _app_session, entry_method, fingerprint, owner_token, csrf_token}) => {
  return new Promise((resolve, reject) => {
    const data = Object.assign(
      (entry_method.details ? {details: entry_method.details} : {}),
      {
        h: entryMethodHashed({contestant_id, entry_method}),
        // generate some fingerprint and its md5 hash
        fingerprint: fingerprintHash(fingerprint),
        grecaptcha_response: null
      }
    );

    console.log(`Creating entry using data: ${JSON.stringify(data)} and session: ${_app_session}`);

    const cookie = `_app_session=${_app_session}; owner_token=${owner_token};`;
    console.log('Using cookie: ' + cookie);
    console.log('Using csrf_token: ' + csrf_token);
    console.log(`Sending data: ${JSON.stringify(data)}`);

    request.post(`https://gleam.io/enter/${CAMPAIGN_KEY}/${entry_method.id}`)
      .send(data)
      // .proxy(PROXY)
      .set('Origin', 'https://gleam.io')
      .set('Referer', REFERER)
      .set('Host', HOST)
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrf_token)
      .end((err, res) => {
        if (err || !res.ok) {
          reject(new Error('failed: ' + res.body));
        } else {
          if (res.body.error) {
            reject(new Error(res.body.error));
          } else {
            resolve(res.body);
          }
        }
      });
  });
};

const randomFingerprint = (len = 32, possible = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'].join('')) => {
  let text = '';

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const MY_FINGERPRINT = 'de881b9a6ac81f573c9ce666de042607';
console.log("de881b9a6ac81f573c9ce666de042607.4d1ef1ec73cbf7abfc478d41be0b2f1d" == fingerprintHash(MY_FINGERPRINT));

console.log(entryMethodHashed({
    entry_method: {
      "id": "1463304",
      "entry_type": "instagram_visit_profile",
      "type_without_provider": "visit_profile",
      "config": {},
      "worth": 15,
      "provider": "instagram",
      "verified": false,
      "value_format": null,
      "must_verify": false,
      "requires_authentication": false,
      "can_authenticate": true,
      "requires_details": true,
      "display_information": null,
      "auth_for_details": false,
      "api_fallback": null,
      "auto_expandable": true,
      "expandable": true,
      "double_opt_in": false,
      "allowed_file_extensions": [],
      "config1": "https://www.instagram.com/concordhall/",
      "config2": "479476951",
      "config3": "concordhall",
      "config4": "Concord Music Hall",
      "config5": "Complete",
      "config6": "5",
      "config7": "",
      "config8": "",
      "config_selections": [],
      "iframe_url": null,
      "iframe_type": null,
      "uses_shortener": null,
      "accepts_file_types": null,
      "method_type": null,
      "config_toggle": false,
      "interval_seconds": 0,
      "actions_required": 0,
      "template": "",
      "normal_icon": "fa-instagram",
      "normal_icon_color": "",
      "unlocked_icon": "",
      "unlocked_icon_color": "",
      "completable": true,
      "maxlength": "",
      "restrict": null,
      "mandatory": false,
      "workflow": null,
      "timer_action": null,
      "limit": 0,
      "$$hashKey": "028",
      "information_expanded": false,
      "entering": true
    },
    contestant_id: 36872013
  }) == 'c0d888268c0b46797ca1a2b75b30ca5c');

// console.log(entryMethodHashed({contestant_id: 36991551, entry_method: {id: '1463305', entry_type: 'custom_action'}}));

visitBase()
  .then(({csrf_token, owner_token, _app_session}) => {
    console.log(csrf_token);
    return Promise.all([
      csrf_token,
      makeContestant({
        owner_token, _app_session,
        email: `${EMAIL_BASE}${randomFingerprint(5)}@${EMAIL_DOMAIN}`
      })
    ]);
  })
  .then(([csrf_token, {contestant, _app_session, owner_token}]) => {
    return makeEntry({
      contestant_id: contestant.id,
      csrf_token,
      _app_session,
      owner_token,
      fingerprint: MY_FINGERPRINT,
      entry_method: ENTRY_METHODS['1466179']
    });
  })
  .then((result) => {
    console.log(result);
  })
  .catch(err => console.error(err));
