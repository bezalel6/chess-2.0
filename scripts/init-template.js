#!/usr/bin/env node

/**
 * Template initialization script for Chess 2.0
 * Run this after cloning to customize the template for your project
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => {
  rl.question(query, resolve);
});

async function initTemplate() {
  console.log('🎮 Chess 2.0 Template Initializer\n');

  // Gather project information
  const projectName = await question('Project name (kebab-case): ');
  const projectTitle = await question('Project title: ');
  const authorName = await question('Author name: ');
  const githubUsername = await question('GitHub username: ');
  const description = await question('Project description: ');

  console.log('\n📝 Customizing template files...\n');

  const replacements = {
    'chess-2.0': projectName,
    'Chess 2.0': projectTitle,
    'Your Name': authorName,
    'yourusername': githubUsername,
    'A production-ready chess application template': description
  };

  // Files to update
  const filesToUpdate = [
    'package.json',
    'README.md',
    'README.template.md',
    '.template.config.json',
    'src/routes/+page.svelte',
    'src/routes/play/+page.svelte'
  ];

  // Update files with replacements
  for (const file of filesToUpdate) {
    try {
      let content = readFileSync(file, 'utf8');

      for (const [search, replace] of Object.entries(replacements)) {
        content = content.replaceAll(search, replace);
      }

      writeFileSync(file, content);
      console.log(`✅ Updated ${file}`);
    } catch (error) {
      console.log(`⚠️  Skipped ${file} (not found or error)`);
    }
  }

  // Ask about optional features
  console.log('\n🎯 Optional Features:\n');

  const enableMultiplayer = await question('Enable multiplayer support? (y/n): ');
  const enablePuzzles = await question('Enable puzzle mode? (y/n): ');
  const enableDatabase = await question('Enable game database? (y/n): ');
  const enableVariants = await question('Enable chess variants? (y/n): ');

  // Create feature flags
  const features = {
    multiplayer: enableMultiplayer.toLowerCase() === 'y',
    puzzles: enablePuzzles.toLowerCase() === 'y',
    database: enableDatabase.toLowerCase() === 'y',
    variants: enableVariants.toLowerCase() === 'y'
  };

  // Create feature configuration file
  const featureConfig = `// Feature configuration for ${projectTitle}
export const features = ${JSON.stringify(features, null, 2)};

// Add your feature-specific imports and initialization here
${features.multiplayer ? "// TODO: Import multiplayer service" : ""}
${features.puzzles ? "// TODO: Import puzzle store" : ""}
${features.database ? "// TODO: Import database service" : ""}
${features.variants ? "// TODO: Import variant rules" : ""}
`;

  writeFileSync('src/lib/config/features.ts', featureConfig);
  console.log('\n✅ Created feature configuration');

  // Provide next steps
  console.log('\n🚀 Template initialization complete!\n');
  console.log('Next steps:');
  console.log('1. Run "bun install" to install dependencies');
  console.log('2. Customize the color scheme in src/app.css');
  console.log('3. Configure Stockfish settings in src/lib/stores/engineConfig.svelte.ts');
  console.log('4. Replace sound effects in static/sounds/');
  console.log('5. Update the README with your project details');

  if (features.multiplayer) {
    console.log('6. Implement multiplayer in src/lib/services/multiplayer.ts');
  }
  if (features.puzzles) {
    console.log('7. Add puzzle mode in src/lib/stores/puzzles.svelte.ts');
  }
  if (features.database) {
    console.log('8. Set up database in src/lib/services/database.ts');
  }
  if (features.variants) {
    console.log('9. Implement variants in src/lib/chess/engine/variants.ts');
  }

  console.log('\n📚 Documentation: https://github.com/' + githubUsername + '/' + projectName);
  console.log('🐛 Issues: https://github.com/' + githubUsername + '/' + projectName + '/issues');

  rl.close();
}

// Run the initializer
initTemplate().catch(console.error);