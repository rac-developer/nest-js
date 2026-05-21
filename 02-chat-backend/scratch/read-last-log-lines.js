const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\desar\\.gemini\\antigravity-cli\\brain\\90474844-0d84-4a83-af42-71db41bbca4f\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }

  console.log(`Total lines: ${lines.length}`);
  const lastLines = lines.slice(-20);
  lastLines.forEach((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      console.log(`\n--- Step ${parsed.step_index} (${parsed.type}, source: ${parsed.source}) ---`);
      if (parsed.content) {
        console.log(parsed.content.substring(0, 500));
      } else if (parsed.tool_calls) {
        console.log('Tool calls:', JSON.stringify(parsed.tool_calls));
      }
    } catch (e) {
      console.log(`Line ${idx}: Raw line too long or invalid JSON`);
    }
  });
}

main();
