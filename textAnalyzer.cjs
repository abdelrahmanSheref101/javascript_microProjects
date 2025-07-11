
//import fs from 'node:fs/promises';
const fs = require("fs");
const fsPromises = require("fs").promises;
/*
 * read and validate target file
 * call other services
 * */
async function analyzeFile() {
        let targetPath = getTarget();
        let words = await getWrods(targetPath),
                wordsCount = generateWrodsCount(words);
        let keys =  [...wordsCount.keys()];
        let trie =  buildTrie(keys);

        console.log("words count: ", words.length);
        console.log("most frequent 10 words: ", getMostFreqTen(wordsCount));
        let input = "w";
        console.log(`completions for \"${input}\": `,trie.searchWithPrefix(input));

}

analyzeFile();

function getTarget() {
        let args = process.argv;
        if (args == null) {
                console.log("couldn't read the input");
                return null;
        }

        let filePath = args[2];

        //check for file type , it should  be .txt
        if (!(filePath.substring(filePath.length - 4) == ".txt")) {
                console.log("\tInvalid file type: ", filePath);
                return;
        }

        //check for file existance
        if (!fs.existsSync(filePath)) {
                console.log("FILE SYSTEM ERROR : file doesn't exist");
                return null;
        }

        return filePath;
}


async function getWrods(target) {
        const text = await fsPromises.readFile(target, "utf8");
        const words = text.split(/\W+/).filter((w) => w.length > 0);
        return words;
}

function generateWrodsCount(words) {
        let wordsCountMap = new Map();

        words.forEach((n) => {
                if (!wordsCountMap.has(n)) wordsCountMap.set(n, 1);
                else {
                        let val = wordsCountMap.get(n);
                        wordsCountMap.set(n, ++val);
                }
        });

        return wordsCountMap;
}

function getMostFreqTen(wordsCount) {
        //expanding map entries into an array then sorting it ascending (b[1] - a[1]) bassed on its value
        const sortedCount = new Map(
                [...wordsCount.entries()].sort((a, b) => b[1] - a[1]),
        );
        
        //keys() method returns mapiterators , so to convert it into an array we do [... ]
        let keys = [...sortedCount.keys()];
        return keys.length <= 10 ? keys : keys.slice(0, 10);
}

class Trie {
        isWord;
        children;

        constructor() {
                this.isWord = false;
                this.children = new Map();
        }

        insert(word, idx = 0) {
                if (word.length == idx) this.isWord = true;
                else {
                        if (!this.children.has(word[idx]))
                                this.children.set(word[idx], new Trie());
                        this.children.get(word[idx]).insert(word, idx + 1);
                }
        }

        printTrie(curChar = "ROOT") {
                console.log("CURRENT CHAR : ", curChar);
                if (this.isWord) console.log("\t=== WORD ===");
                console.log(this.children.keys());

                for (const [key, value] of this.children) {
                        value.printTrie(key);
                }
        }

        getWordsFromNode(curWrd, words) {
                debugger;
                if (curWrd && this.isWord) words.push(curWrd);

                for (const [key, value] of this.children) {
                        value.getWordsFromNode(curWrd + key, words);
                }
                return words;
        }

        getNodeOfExp(exp, curIdx = 0) {
                debugger;
                if (exp.length <= curIdx) {
                        return this;
                }
                if (this.children.has(exp[curIdx])) {
                        let child = this.children.get(exp[curIdx]);
                        return child.getNodeOfExp(exp, curIdx + 1);
                }

                return;
        }

        searchWithPrefix(prefix) {
                //1. get node where the prefix ends at
                //NOTE if  returned undefined just return null
                //2. get words starting from that node
                //3. add the prefix to the words from 2

                //1
                let node = this.getNodeOfExp(prefix);
                if (node === undefined) {
                        console.log("CAN'T find the prefix in our data");
                        return;
                }

                //2
                let words = [];
                node.getWordsFromNode("", words);

                //3
                let result = words.map((n) => prefix + n);

                if (node.isWord) result.push(prefix);

                //console.log(result);

                return result;
        }
}

function buildTrie(words) {
        let trie = new Trie();
        for (const word of words) trie.insert(word);

        return trie;
}

