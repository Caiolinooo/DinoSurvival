const fs = require("fs");
const js = fs.readFileSync("D:\\Projeto\\Desenvolvendo\\DinoSurvival\\tmp-game.js", "utf8");

let depth = 0;
let inString = false;
let strChar = "";
let inBlockComment = false;
let inLineComment = false;

for (let i = 0; i < js.length; i++) {
    const c = js[i];

    if (c === "\n") { inLineComment = false; continue; }
    if (inLineComment) continue;

    if (!inString && !inBlockComment && c === "/" && js[i+1] === "/") {
        inLineComment = true;
        i++;
        continue;
    }
    if (!inString && !inBlockComment && c === "/" && js[i+1] === "*") {
        inBlockComment = true;
        i++;
        continue;
    }
    if (inBlockComment && c === "*" && js[i+1] === "/") {
        inBlockComment = false;
        i++;
        continue;
    }
    if (inBlockComment) continue;

    if (!inString && (c === '"' || c === "'" || c === "`")) {
        inString = true;
        strChar = c;
        continue;
    }
    if (inString && c === strChar && js[i-1] !== "\\") {
        inString = false;
        continue;
    }
    if (inString && c === "\\") {
        i++;
        continue;
    }

    if (c === "{") depth++;
    if (c === "}") depth--;
}

console.log("Final depth: " + depth);
if (depth > 0) console.log("Missing " + depth + " closing braces");
if (depth < 0) console.log("Extra " + (-depth) + " closing braces");
