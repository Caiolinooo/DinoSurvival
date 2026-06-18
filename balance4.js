const fs = require("fs");
const js = fs.readFileSync("D:\\Projeto\\Desenvolvendo\\DinoSurvival\\tmp-game.js", "utf8");
const lines = js.split("\n");

let depth = 0;
let inString = false;
let strChar = "";
let inBlockComment = false;

// Find sections where depth goes up without coming back down
const depthHistory = [];

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
    
    // Track depth transitions
    if (prevDepth !== depth) {
        depthHistory.push({ line: li+1, afterDepth: depth, text: line.trim().substring(0, 80) });
    }
}

// Show depth transitions after the last time it was 0
let lastZeroIdx = -1;
for (let i = depthHistory.length - 1; i >= 0; i--) {
    if (depthHistory[i].afterDepth === 0) {
        lastZeroIdx = i;
        break;
    }
}

console.log("Depth transitions after last depth=0:");
for (let i = lastZeroIdx + 1; i < depthHistory.length; i++) {
    const h = depthHistory[i];
    console.log("  L" + h.line + " -> depth=" + h.afterDepth + "  |  " + h.text);
}
