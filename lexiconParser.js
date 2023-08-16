const fs = require("fs");
const path = require("path");
const papaparse = require("papaparse");

/**
 *
 * @param {*} fileName
 * @returns
 */
function loadLexicon(fileName) {
  let lexicon = fs.readFileSync(path.resolve(__dirname, fileName), "utf8");

  let lexiconJSON = papaparse.parse(lexicon, {
    header: true,
    skipEmptyLines: true,
  });
  //if error

  return lexiconJSON.data;
}

/**
 * transform the raw lexicon into an usable object
 * the lexicon as the following header: ortho	phon	lemme	cgram	genre	nombre	freqlemfilms2	freqlemlivres	freqfilms2	freqlivres	infover	nbhomogr	nbhomoph	islem	nblettres	nbphons	cvcv	p_cvcv	voisorth	voisphon	puorth	puphon	syll	nbsyll	cv-cv	orthrenv	phonrenv	orthosyll	cgramortho	deflem	defobs	old20	pld20	morphoder	nbmorph
 *
 * ortho is the word
 * lemme is the lemma
 * cgram is the part of speech
 * genre is the gender of the word
 * nombre is the singularity of the word
 * freqlivres is how frequent is that word (maintain a max for futur normalization)
 *
 *
 *
 * for each line of the lexicon, we create an object with the following properties:
 * - word: the word itself
 * - lemma : the lemma
 * - length : the number of letter of the word
 * - gender : object
 *  - masculine : false iff genre is f
 *  - feminine : false  iff genre is m
 * - number : object
 *  - singular : false if nombre is p
 *  - plural : false if nombre is s
 * - pos
 *  - noun : true if cgram is NOM
 *  - verb : true if cgram is VER
 *  - adjective : true if cgram is ADJ
 *  - adverb : true if cgram is
 * - frequency : the frequency of the word
 *  - noun : freqlivres iff pos is noun or 0
 *  - verb : freqlivres iff verb is noun or 0
 *  - adjective : freqlivres iff adjective is noun or 0
 *  - adverb : freqlivres iff adverb is noun or 0
 * - hyphanated : if the word contains "-"
 * - hyphanationPattern : array of the lengths of each subword (ex. arc-en-ciel -> [3,2,4])
 *
 *
 * for processing keep a map of the words already added, if a word already exist merge them
 * with an or on all the boolean, keep the max for the frequency
 *
 * @param {*} lexicon
 * @returns
 */
function transformLexicon(lexicon) {
  const words = {};
  // lexicon is the data from papaparse. its an array of rows. each row is an object with the header as key
  lexicon.forEach((row) => {
    const { ortho: word, lemme: lemma, cgram, genre, nombre, freqlivres } = row;
    //if contains a space skip

    if (word.includes(" ")) return;
    if (word) {
      const existingWord = words[word];

      if (existingWord) {
        existingWord.gender.masculine =
          existingWord.gender.masculine || genre === "m";
        existingWord.gender.feminine =
          existingWord.gender.feminine || genre === "f";
        existingWord.number.singular =
          existingWord.number.singular || nombre === "s";
        existingWord.number.plural =
          existingWord.number.plural || nombre === "p";
        existingWord.pos.noun = existingWord.pos.noun || cgram === "NOM";
        existingWord.pos.verb = existingWord.pos.verb || cgram === "VER";
        existingWord.pos.adjective =
          existingWord.pos.adjective || cgram === "ADJ";
        existingWord.pos.adverb = existingWord.pos.adverb || cgram === "ADV";
        existingWord.frequency.noun = Math.max(
          existingWord.frequency.noun,
          cgram === "NOM" ? parseFloat(freqlivres) : 0
        );
        existingWord.frequency.verb = Math.max(
          existingWord.frequency.verb,
          cgram === "VER" ? parseFloat(freqlivres) : 0
        );
        existingWord.frequency.adjective = Math.max(
          existingWord.frequency.adjective,
          cgram === "ADJ" ? parseFloat(freqlivres) : 0
        );
        existingWord.frequency.adverb = Math.max(
          existingWord.frequency.adverb,
          cgram === "ADV" ? parseFloat(freqlivres) : 0
        );
        existingWord.hyphenated = existingWord.hyphenated || word.includes("-");
        existingWord.hyphenationPattern =
          existingWord.hyphenationPattern ||
          (word.includes("-")
            ? word.split("-").map((subword) => subword.length)
            : []);
      } else {
        words[word] = {
          word,
          lemma,
          length: word.length,
          gender: {
            masculine: genre === "m",
            feminine: genre === "f",
          },
          number: {
            singular: nombre === "s",
            plural: nombre === "p",
          },
          pos: {
            noun: cgram === "NOM",
            verb: cgram === "VER",
            adjective: cgram === "ADJ",
            adverb: cgram === "ADV",
          },
          frequency: {
            noun: cgram === "NOM" ? freqlivres : 0,
            verb: cgram === "VER" ? freqlivres : 0,
            adjective: cgram === "ADJ" ? freqlivres : 0,
            adverb: cgram === "ADV" ? freqlivres : 0,
          },
          hyphenated: word.includes("-"),
          hyphenationPattern: word.includes("-")
            ? word.split("-").map((subword) => subword.length)
            : [],
        };
      }
    }
  });

  return Object.values(words);
}

module.exports = {
  transformLexicon,
  loadLexicon,
};
