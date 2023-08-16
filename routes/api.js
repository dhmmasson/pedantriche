let express = require("express");
let router = express.Router();

const singularityOptions = ["singular", "plural", "both"];
const genderOptions = ["masculine", "feminine", "both"];
const partOfSpeechOptions = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "unspecified",
];
/* GET home page. */
router.get("/words", function (req, res, next) {
  // Get from the query : number of letter, singularity, gender, start with a vowel, partofspeech
  // ex. /words?nbLetter=5&singularity=both&gender=both&startWithVowel=false&partOfSpeech=verb
  let nbLetter = parseInt(req.query.nbLetter);
  let singularity = req.query.singularity; // Possible values : singular, plural, both (default)
  let gender = req.query.gender; // Possible values : masculine, feminine, both (default)
  let startWithVowel = req.query.startWithVowel; // Possible values : true, false (default)
  let partOfSpeech = req.query.partOfSpeech; // Possible values : noun, verb, adjective, adverb, unspecified (default)

  // Nb of letter is a number or -1 if not defined
  if (isNaN(nbLetter)) {
    nbLetter = -1;
  }
  singularity = singularityOptions.includes(singularity) ? singularity : "both";
  gender = genderOptions.includes(gender) ? gender : "both";
  partOfSpeech = partOfSpeechOptions.includes(partOfSpeech)
    ? partOfSpeech
    : "unspecified";
  startWithVowel = startWithVowel === "true" ? true : false;
});

module.exports = router;
