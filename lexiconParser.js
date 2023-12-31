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

const partOfSpeechOptions = ["noun", "verb", "adjective", "adverb"];
/**
 * A word object.
 * @typedef {Object} Word
 * @property {string} word - The word string.
 * @property {string} lemma - The lemma string.
 * @property {number} length - The length of the word string.
 * @property {Object} gender - The gender object.
 * @property {boolean} gender.masculine - Whether the word is masculine.
 * @property {boolean} gender.feminine - Whether the word is feminine.
 * @property {Object} number - The number object.
 * @property {boolean} number.singular - Whether the word is singular.
 * @property {boolean} number.plural - Whether the word is plural.
 * @property {Object} pos - The part of speech object.
 * @property {boolean} pos.noun - Whether the word is a noun.
 * @property {boolean} pos.verb - Whether the word is a verb.
 * @property {boolean} pos.adjective - Whether the word is an adjective.
 * @property {boolean} pos.adverb - Whether the word is an adverb.
 * @property {Object} frequency - The frequency object.
 * @property {number} frequency.noun - The frequency of the word as a noun.
 * @property {number} frequency.verb - The frequency of the word as a verb.
 * @property {number} frequency.adjective - The frequency of the word as an adjective.
 * @property {number} frequency.adverb - The frequency of the word as an adverb.
 * @property {boolean} hyphenated - Whether the word is hyphenated.
 * @property {number[]} hyphenationPattern - The hyphenation pattern of the word.
 * @property {boolean} startWithVowel - Whether the word starts with a vowel.
 */

/** A Lexicon
 *
 * * @typedef {Array<Word>} Lexicon
 */

/**
 * transform the raw lexicon into an array of Word
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
 * - hyphenated : if the word contains "-"
 * - hyphenationPattern : array of the lengths of each subword (ex. arc-en-ciel -> [3,2,4])
 * - startWithVowel : if first letter is "aeiouh"
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
          startWithVowel: "aeiouh".includes(word[0]),
        };
      }
    }
  });

  return Object.values(words);
}

/**
 * Filters the lexicon array based on the specified query parameters.
 * @param {Word[]} lexicon - The lexicon array to filter.
 * @param {number} nbLetter - The number of letters in the word.
 * @param {string} singularity - The singularity of the word.
 * @param {string} gender - The gender of the word.
 * @param {string} partOfSpeech - The part of speech of the word.
 * @param {boolean} startWithVowel - Whether the word starts with a vowel.
 * @param {boolean} hyphenated - Whether the word is hyphenated.
 * @param {number[]} hyphenationPattern - The hyphenation pattern of the word.
 * @returns {Word[]} The filtered lexicon array.
 */
function filterLexicon(
  lexicon,
  nbLetter,
  singularity = "both",
  gender = "both",
  partOfSpeech = "unspecified",
  startWithVowel = undefined,
  hyphenated = undefined,
  hyphenationPattern = []
) {
  if (hyphenationPattern.length > 0 && !hyphenationPattern.includes(NaN)) {
    nbLetter =
      hyphenationPattern.reduce((a, b) => a + b, 0) +
      hyphenationPattern.length -
      1;
  }
  if (nbLetter > 0) lexicon = lexicon.filter((e) => e.length == nbLetter);
  if (singularity != "both")
    lexicon = lexicon.filter((e) => e.number[singularity]);
  if (gender != "both") lexicon = lexicon.filter((e) => e.gender[gender]);
  if (partOfSpeech != "unspecified")
    lexicon = lexicon.filter((e) => e.pos[partOfSpeech]);
  if (startWithVowel !== undefined)
    lexicon = lexicon.filter((e) => e.startWithVowel === startWithVowel);
  if (hyphenated !== undefined)
    lexicon = lexicon.filter((e) => e.hyphenated === hyphenated);
  if (hyphenationPattern.length > 0)
    lexicon = lexicon.filter(
      (e) =>
        e.hyphenationPattern.length === hyphenationPattern.length &&
        e.hyphenationPattern.every((v, i) => v == hyphenationPattern[i])
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

  return lexicon;
}

/**
 * easy to use function to filter the lexicon, directly say feminine, singular, 6 letters, start with vowel as unordered string
 * @param {Word[]} lexicon - The lexicon array to filter.
 * @params {String...} args - The arguments to filter the lexicon.
 * @returns {Word[]} The filtered lexicon array.
 *
 * @example
 * filterLexiconEasy("feminine", "singular", "6", "startWithVowel")
 * filterLexiconEasy("feminine", "singular", "6", "startWithVowel", "hyphenated")
 * filterLexiconEasy("feminine", "singular", "6", "startWithVowel", "hyphenated", "3-3")
 * filterLexiconEasy("feminine", "singular", "6", "startWithVowel", "hyphenated", "3-3", "noun")
 */
function filterLexiconEasy(lexicon, ...args) {
  let nbLetter = -1;
  let singularity = "both";
  let gender = "both";
  let partOfSpeech = "unspecified";
  let startWithVowel = undefined;
  let hyphenated = undefined;
  let hyphenationPattern = [];

  for (let arg of args) {
    if (typeof arg === "number" || arg.match(/^\d+$/)) nbLetter = parseInt(arg);
    else if (arg.match(/^(m|f|masculine|feminine)$/i))
      gender = arg.match(/^(m|masculine)$/i) ? "masculine" : "feminine";
    else if (arg.match(/^(s|p|singular|plural)$/i))
      singularity = arg.match(/^(s|singular)$/i) ? "singular" : "plural";
    else if (arg.match(/^(n|noun|v|verb|adj|adjective|adv|adverb)$/i))
      partOfSpeech = arg.match(/^(n|noun)$/i)
        ? "noun"
        : arg.match(/^(v|verb)$/i)
        ? "verb"
        : arg.match(/^(adj|adjective)$/i)
        ? "adjective"
        : "adverb";
    else if (arg.match(/(vowel)/i)) startWithVowel = true;
    else if (arg.match(/(consonant)/i)) startWithVowel = false;
    else if (arg.match(/^(hyphenated|multi.*)$/i)) hyphenated = true;
    else if (arg.match(/^(mono.*)$/i)) hyphenated = false;
    else if (arg.match(/^\d+(-\d+)*$/)) {
      hyphenationPattern = arg.split("-").map((n) => parseInt(n));
      nbLetter =
        hyphenationPattern.reduce((a, b) => a + b, 0) +
        hyphenationPattern.length -
        1;
      hyphenated = true;
    }
  }
  return filterLexicon(
    lexicon,
    nbLetter,
    singularity,
    gender,
    partOfSpeech,
    startWithVowel,
    hyphenated,
    hyphenationPattern
  );
}

/**
 * pretty print word
 * @param {Word[]|Word} words - The word to print.
 * @returns {string} The pretty printed word.
 * e.g. "bonjour (bonjour) n.m.s. 7 letters, freq : 0.000000 "
 * "dormir (dormir) v. 6 letters, freq : 0.000000 "
 * "archi-connues (archi-connu) adj.f.p 11 letters, freq : 0.000000 "
 */
function prettyPrintWord(words) {
  if (Array.isArray(words)) {
    return words.map((word) => prettyPrintWord(word)).join("\n");
  }
  let word = words;
  let str = word.word;
  if (word.lemma != word.word) str += ` (${word.lemma})`;
  str += ` ${word.pos.noun ? "n." : ""}${word.pos.verb ? "v." : ""}${
    word.pos.adjective ? "adj." : ""
  }${word.pos.adverb ? "adv." : ""}`;
  if (word.gender.masculine) str += ".m";
  if (word.gender.feminine) str += ".f";
  if (word.number.singular) str += ".s";
  if (word.number.plural) str += ".p";
  str += ` ${word.length} letters, freq : ${word.frequency.noun}`;
  if (word.hyphenated)
    str += `, hyphenated : ${word.hyphenationPattern.join("-")}`;
  return str;
}

module.exports = {
  transformLexicon,
  loadLexicon,
  filterLexicon,
  prettyPrintWord,
  filterLexiconEasy,
};
