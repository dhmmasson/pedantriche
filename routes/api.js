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
  // Get from the query : number of letter, singularity, gender, start with a vowel, partofspeech, hyphanationPattern
  // ex.
  let nbLetter = parseInt(req.query.nbLetter);
  let singularity = req.query.singularity; // Possible values : singular, plural, both (default)
  let gender = req.query.gender; // Possible values : masculine, feminine, both (default)
  let startWithVowel = req.query.startWithVowel; // Possible values : true, false (default)
  let partOfSpeech = req.query.partOfSpeech; // Possible values : noun, verb, adjective, adverb, unspecified (default)
  let hyphanationPattern = req.query.hyphanationPattern; // (\d+-)+\d+
  let hyphanated = hyphanationPattern !== undefined;
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
  hyphanationPattern = hyphanationPattern.split("-").map((l) => parseInt(l));
  hyphanated =
    hyphanationPattern.length > 0 && !hyphanationPattern.includes(NaN);

  /** @type Word[]*/
  let lexicon = req.app.get("lexicon");

  // check if a lexicon for the right number of letter has been created
  if (nbLetter > 0) lexicon = lexicon.filter((e) => e.length == nbLetter);
  if (singularity != "both")
    lexicon = lexicon.filter((e) => e.number[singularity]);
  if (partOfSpeech != "unspecified")
    lexicon = lexicon.filter((e) => e.pos[partOfSpeech]);
  if (startWithVowel !== undefined)
    lexicon = lexicon.filter((e) => e.startWithVowel === startWithVowel);
  if (hyphanated !== undefined)
    lexicon = lexicon.filter((e) => e.hyphenated === hyphanated);
  if (hyphanationPattern.length > 0)
    lexicon = lexicon.filter(
      (e) =>
        e.hyphenationPattern.length === hyphanationPattern.length &&
        e.hyphenationPattern.every(
          (v, i) => v === hyphanationPattern[i] || hyphanationPattern[i] === -1
        )
    );

  //if pos is specified, sort by frequency
  if (partOfSpeech != "unspecified")
    lexicon = lexicon.sort(
      (a, b) => b.frequency[partOfSpeech] - a.frequency[partOfSpeech]
    );
  //if pos is unspecified, sort by frequency
  //sort by the first pos that is not unspecified
  else
    lexicon = lexicon.sort((a, b) => {
      for (let pos of partOfSpeechOptions) {
        if (a.frequency[pos] != b.frequency[pos]) {
          return b.frequency[pos] - a.frequency[pos];
        }
      }
      return 0;
    });

  res.json(lexicon);
});

module.exports = router;
