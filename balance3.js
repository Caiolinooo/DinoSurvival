const fs = require("fs");
const js = fs.readFileSync("D:\\Projeto\\Desenvolvendo\\DinoSurvival\\tmp-game.js", "utf8");
const lines = js.split("\n");

let depth = 0;
let inString = false;
let strChar = "";
let inBlockComment = false;
let lastZeroDepth = 0;
let firstNonZeroAfter = 0;

for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        
        if (inBlockComment) {
            if (c === "*" && i+1 < line.length && line[i+1] === "/") {
                inBlockComment = false;
                i++;
            }
            continue;
        }
        
        if (c === "/" && i+1 < line.length) {
            if (line[i+1] === "/") break;
            if (line[i+1] === "*") { inBlockComment = true; i++; continue; }
        }
        
        if (!inString && (c === '"' || c === "'" || c === "`")) {
            inString = true;
            strChar = c;
            continue;
        }
        if (inString && c === strChar && (i === 0 || line[i-1] !== "\\")) {
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
    
    if (depth === 0) {
        lastZeroDepth = li + 1;
    }
}

console.log("Last time depth was 0: line " + lastZeroDepth);
console.log("Lines " + (lastZeroDepth + 1) + " to " + lines.length + " are at non-zero depth");
console.log("Total lines: " + lines.length);
console.log("Final depth: " + depth);

// Show context around where it got stuck
console.log("\nContext around last depth 0:");
const start = Math.max(0, lastZeroDepth - 3);
const end = Math.min(lines.length, lastZeroDepth + 10);
for (let j = start; j < end; j++) {
    console.log((j + 1) + ": " + lines[j]);
}
