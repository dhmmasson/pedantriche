const fs = require("fs");
const {
  transformLexicon,
  loadLexicon,
  filterLexicon,
  filterLexiconEasy,
  prettyPrintWord,
} = require("./lexiconParser");
// const lexiconFile = "resources/lexique.org_databases_Lexique383_Lexique383.tsv";
const lexiconFile = "resources/Lexique383/Lexique383.tsv";
const lexicon = loadLexicon(lexiconFile);
const words = transformLexicon(lexicon);

// write a file with the pretty json

fs.writeFileSync("lexicon.json", JSON.stringify(words, null, 2));

let words16 = filterLexiconEasy(words, 16);
let words16n = filterLexiconEasy(words, 16, "noun");
let words16f = filterLexiconEasy(words16, 16, "feminine");
let words16fs = filterLexiconEasy(words16f, 16, "f", "s");
let words16fsV = filterLexiconEasy(words16fs, 16, "f", "s", "vowel");
let words16fsVm = filterLexiconEasy(words16fsV, 16, "f", "s", "mono");

console.log("words16 : ", words16.length);
console.log("noun16 : ", words16n.length);
console.log("words16f : ", words16f.length);
console.log("words16fs : ", words16fs.length);
console.log("words16fsV : ", words16fsV.length);
console.log("words16fsVm : ", words16fsVm.length);

console.log(prettyPrintWord(words16fsVm.slice(0, 10)));

let fn10 = filterLexiconEasy(
  words,
  10,
  "feminine",
  "noun",
  "s",
  "mono",
  "consonant"
);
console.log("fn10 : ", fn10.length);

let fn5 = filterLexiconEasy(words, 5, "feminine", "noun", "s", "mono");
console.log("fn5 : ", fn5.length);
console.log(prettyPrintWord(fn5.slice(0, 50)));
console.log(fn5.findIndex((w) => w.word === "ville"));

let hyphanated = filterLexiconEasy(words, "noun", "10-6");
// hyphanated = filterLexiconEasy(words, 17, "hyphenated");
console.log("hyphenated : ", hyphanated.length);
console.log(prettyPrintWord(hyphanated.slice(0, 50)));

console.log(prettyPrintWord(filterLexiconEasy(words, "12-9").slice(0, 10)));

console.log(
  prettyPrintWord(filterLexiconEasy(words, "noun", "8", "vowel").slice(0, 10))
);

// Write an interactive part that ask for the filters and the filtered lexicon
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// while not quit
// ask for the filters
// print the filtered lexicon
