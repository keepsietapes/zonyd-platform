const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'src', 'agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip ZonydCore since it doesn't use generateSingleContent usually, but let's check
  if (!content.includes('generateSingleContent')) continue;

  // Add extractJson to import
  if (content.includes('require(\'../utils/aiClient\')') && !content.includes('extractJson')) {
    content = content.replace(/const\s+\{\s*generateSingleContent(?:,\s*generateAIContent)?\s*\}\s*=\s*require\('\.\.\/utils\/aiClient'\);/g, "const { generateSingleContent, extractJson } = require('../utils/aiClient');");
    if (!content.includes('extractJson')) {
       content = content.replace(/const\s+\{\s*generateAIContent,\s*generateSingleContent\s*\}\s*=\s*require\('\.\.\/utils\/aiClient'\);/g, "const { generateAIContent, generateSingleContent, extractJson } = require('../utils/aiClient');");
    }
  }

  // Replace match / JSON.parse block
  // Pattern 1:
  // const jsonMatch = rawResponse.match(/.../);
  // if (!jsonMatch) { ... }
  // const data = JSON.parse(jsonMatch[0]);
  content = content.replace(/const jsonMatch = [^;]+;\s*(?:if \(!jsonMatch\) \{[^}]+\}\s*)?(?:const (\w+) = JSON\.parse\(jsonMatch\[0\]\);|return \{ success: true, \.\.\.JSON\.parse\(jsonMatch\[0\]\) \};)/g, (match, varName) => {
    if (match.includes('return')) {
      return `const parsedData = extractJson(rawResponse);\n    return { success: true, ...parsedData };`;
    }
    return `const ${varName} = extractJson(rawResponse);`;
  });
  
  // For Spectral Engine, output.match
  content = content.replace(/const jsonMatch = output\.match\([^;]+\);\s*if \(!jsonMatch\) \{[^}]+\}\s*const (\w+) = JSON\.parse\(jsonMatch\[0\]\);/g, (match, varName) => {
    return `const ${varName} = extractJson(output);`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed agents JSON parsing!');
