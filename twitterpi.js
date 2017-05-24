
var watson = require( 'watson-developer-cloud' );
// Create service wrapper for Personality Insights
var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
var personality_insights = new PersonalityInsightsV3({
  username: process.env.PERSONALITY_INSIGHTS_USERNAME || '{username}',
  password: process.env.PERSONALITY_INSIGHTS_PASSWORD || '{password}',
  version_date: '2016-10-20'
});

// Code to collect tweets for a given screen_name (or twitter handle)
var Twitter = require('twitter');

var twtclient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || '{consumer_key}',
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '{consumer_secret}',
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || '{access_token_key}',
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '{access_token_secret}'
});

function TwitterPI(handle,callback) {

  var twtparams = {
        screen_name: handle,
        count: 100
  };

  twtclient.get('statuses/user_timeline', twtparams, function(error, tweets, response) {
    if (error) {
        throw(error);
    }
    var tweetsList = "";
    for(var i=0; i < tweets.length; i++) {
      tweetsList = tweetsList + tweets[i].text;
    }
    var PIparms = {
        text: tweetsList,
        consumption_preferences: true,
        headers: {
          'accept-language': 'en',
          'accept': 'application/json'
        }
    }
    personality_insights.profile(PIparms, function(PIerr, PIresponse) {
        if(PIerr)
          console.log('PI error: ' + PIerr);
        else {
          var consumption_prefs = PIresponse.consumption_preferences;
          var prefList = '';
          for(var j=0; j < consumption_prefs.length; j++) {
            var name = consumption_prefs[j].consumption_preference_category_id;
            if (name == "consumption_preferences_music") {
              prefList = consumption_prefs[j].consumption_preferences;
            }
          }
          var maxScore = 0;
          var musicType = "none";
          for(var i=0; i < prefList.length; i++) {
            var score = prefList[i].score;
            var nm = prefList[i].consumption_preference_id;
            if(score > maxScore) {
             maxScore = score;
             var jnk = nm.split('_');
             musicType = jnk[jnk.length-1];
            }
          }
        }
	callback(musicType);

    });
  });
};
module.exports = TwitterPI;
