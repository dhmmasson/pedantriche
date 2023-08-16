const fs = require("fs");
const { transformLexicon, loadLexicon } = require("./lexiconParser");
const lexiconFile = "resources/lexique.org_databases_Lexique383_Lexique383.tsv";
const lexicon = loadLexicon(lexiconFile);
const words = transformLexicon(lexicon);

// write a file with the pretty json

fs.writeFileSync("lexicon.json", JSON.stringify(words, null, 2));
