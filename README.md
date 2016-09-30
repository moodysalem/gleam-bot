# README
My valiant attempt at creating a script to submit entries to a gleam contest

It creates contestants and attempts to make an entry, but it gets a hash_error: true response when actually attempting to make entries
The hash functions are verified to work with a few different inputs collected from the site
It appears that the fingerprint is unimportant in a successful request, but it is important that the hash of the fingerprint is as expected


This curl sets the contestant, which results in a response that has a contestant ID and a Set-Cookie header for the important _app_session header

curl -v 'https://gleam.io/set-contestant' -H 'Accept-Language: en-US,en;q=0.8' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Referer: https://gleam.io/OyyAH/enter-to-win-3-tickets-to-marshmello-at-concord-music-hall' -H 'Connection: keep-alive' -H 'DNT: 1' --data-binary '{"campaign_key":"OyyAH","contestant":{"name":"moody salem","email":"****@gmail.com","date_of_birth":"09/01/1991"},"additional_details":true}' --compressed

The contestant id is used in hashing the entry method and the _app_session cookie identifies the contestant.