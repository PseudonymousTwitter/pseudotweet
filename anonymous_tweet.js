require("dotenv").config({ path: "variables.env" });
const OAuth = require("oauth");

// TODO - add additional express-validator to confirm 280 characters and no invalid characters
// exports.tweet = async (req, res, next) => {
//   const tweet = req.body.tweet;
// };

exports.tweet = async (req, res, next) => {
  // get Twitter keys
  const twitter_application_consumer_key = process.env.API_KEY; // API Key
  const twitter_application_secret = process.env.API_SECRET; // API Secret
  const twitter_user_access_token = process.env.ACCESS_TOKEN; // Access Token
  const twitter_user_secret = process.env.ACCESS_SECRET; // Access Token Secret

  // create Twitter Auth
  const oauth = new OAuth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    twitter_application_consumer_key,
    twitter_application_secret,
    "1.0A",
    null,
    "HMAC-SHA1"
  );

  // get Tweet contents
  const postBody = {
    status: req.body.tweet,
  };

  // send tweet to @Littlebird_feed Twitter account
  oauth.post(
    "https://api.twitter.com/1.1/statuses/update.json",
    twitter_user_access_token, // oauth_token (user access token)
    twitter_user_secret, // oauth_secret (user secret)
    postBody, // post body
    "", // post content type ?
    function (err, data, cb) {
      if (err) {
        console.log(err);
      } else {
        const response = JSON.parse(data);
        const id = response.id_str;
        console.log(JSON.parse(data));
        res
          .status(301)
          .redirect(`https://twitter.com/LittleBird_feed/status/${id}`);
      }
    }
  );
};
