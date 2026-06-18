const fs = require("fs");
const js = fs.readFileSync("D:\\Projeto\\Desenvolvendo\\DinoSurvival\\tmp-game.js", "utf8");
const lines = js.split("\n");

let depth = 0;
let inString = false;
let strChar = "";
let inBlockComment = false;

for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let prevDepth = depth;
    
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
            if (line[i+1] === "/") break; // line comment
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
    
    if (depth !== prevDepth) {
        console.log("L" + (li+1) + " [" + (depth - prevDepth > 0 ? "+" : "") + (depth - prevDepth) + "] depth=" + depth + " | " + line.trim().substring(0, 80));
    }
}

console.log("\n=== FINAL DEPTH: " + depth + " ===");
if (depth > 0) {
    console.log("Missing " + depth + " closing braces");
    console.log("\nLooking for last high-depth section...");
}
