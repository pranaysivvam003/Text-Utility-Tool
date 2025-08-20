// Tab switching logic
document.getElementById("charTab").onclick = () => {
  document.getElementById("charConverter").classList.remove("hidden");
  document.getElementById("textComparer").classList.add("hidden");
  document.getElementById("charTab").classList.add("active");
  document.getElementById("compareTab").classList.remove("active");
};
document.getElementById("compareTab").onclick = () => {
  document.getElementById("textComparer").classList.remove("hidden");
  document.getElementById("charConverter").classList.add("hidden");
  document.getElementById("compareTab").classList.add("active");
  document.getElementById("charTab").classList.remove("active");
};

// Character converter logic (UPDATED per V2: skip . , * / \ ( ) %)
function convertToHTMLEntities() {
  const input = document.getElementById("charInput").value;
  const chars = Array.from(input);
  const SKIP = new Set(['.', ',', '*', '/', '\\', '(', ')', '%',':',';', '&', '$', '!', '@', '#', '^','-', '_', '+', '=', '?', '<', '>']);

  const output = chars.map(c => {
    // keep letters, digits, whitespace, and the specified simple characters
    if (/^[A-Za-z0-9\s]$/.test(c) || SKIP.has(c)) {
      return c;
    }
    // convert everything else (symbols, punctuation, emojis, icons) to numeric entity
    return `&#${c.codePointAt(0)};`;
  }).join('');

  document.getElementById("charOutput").value = output;
}

function decodeHTML() {
  const input = document.getElementById('charInput').value.trim();
  if (!input) return;

  const temp = document.createElement('textarea');
  temp.innerHTML = input;
  const decoded = temp.value;

  document.getElementById('charOutput').value = decoded;
}

function clearCharFields() {
  document.getElementById("charInput").value = "";
  document.getElementById("charOutput").value = "";
}

function copyCharOutput() {
  const outputField = document.getElementById("charOutput");
  outputField.select();
  outputField.setSelectionRange(0, 99999); // for mobile
  document.execCommand("copy");
}

// Word-based diff for text comparison (UNCHANGED except identical check)
function compareText() {
  const raw1 = document.getElementById("version1").value;
  const raw2 = document.getElementById("version2").value;

  // NEW in V2: show popup if texts are identical
  if (raw1 === raw2) {
    alert("Two texts are identical");
    document.getElementById("comparisonResult").textContent = "Two texts are identical";
    return;
  }

  const a = raw1.trim().split(/\s+/);
  const b = raw2.trim().split(/\s+/);
  const diff = wordDiff(a, b);
  document.getElementById("comparisonResult").innerHTML = formatDiff(diff);
}

function clearCompareFields() {
  document.getElementById("version1").value = "";
  document.getElementById("version2").value = "";
  document.getElementById("comparisonResult").innerHTML = "";
}

// Simple word-diff algorithm (using LCS) — UNCHANGED
function wordDiff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array(n+1).fill(null).map(() => Array(m+1).fill(0));
  for (let i = n-1; i>=0; i--) {
    for (let j = m-1; j>=0; j--) {
      dp[i][j] = (a[i] === b[j]) ? dp[i+1][j+1] +1 : Math.max(dp[i+1][j], dp[i][j+1]);
    }
  }
  let i=0, j=0, res = [];
  while (i<n && j<m) {
    if (a[i] === b[j]) {
      res.push({type:'=', word:a[i]});
      i++; j++;
    } else if (dp[i+1][j] >= dp[i][j+1]) {
      res.push({type:'-', word:a[i]});
      i++;
    } else {
      res.push({type:'+', word:b[j]});
      j++;
    }
  }
  while (i<n) { res.push({type:'-', word:a[i++]}); }
  while (j<m) { res.push({type:'+', word:b[j++]}); }
  return res;
}

// Format diff into HTML — UNCHANGED
function formatDiff(diff) {
  return diff.map(d => {
    if (d.type === '=') return `<span class="unchanged">${d.word} </span>`;
    if (d.type === '+') return `<span class="added">${d.word} </span>`;
    if (d.type === '-') return `<span class="removed">${d.word} </span>`;
  }).join('');
}
