#!/usr/bin/env node
// Cross-platform (macOS/Windows/Linux) interactive scaffolder for new posts.
// Run with: npm run new-post

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question, { default: def, required = false } = {}) {
  const suffix = def ? ` (${def})` : '';
  while (true) {
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    if (answer) return answer;
    if (def !== undefined) return def;
    if (!required) return '';
    console.log('This field is required.');
  }
}

async function askChoice(question, choices) {
  while (true) {
    const answer = (await rl.question(`${question} (${choices.join('/')}): `))
      .trim()
      .toLowerCase();
    if (choices.includes(answer)) return answer;
    console.log(`Please enter one of: ${choices.join(', ')}`);
  }
}

async function askYesNo(question, { default: def = false } = {}) {
  const hint = def ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) return def;
  return answer === 'y' || answer === 'yes';
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function yamlQuote(value) {
  return JSON.stringify(value);
}

function yamlList(values) {
  return `[${values.map(yamlQuote).join(', ')}]`;
}

async function main() {
  console.log("New build log entry — press Enter to accept a default shown in parens.\n");

  const type = await askChoice('Post type', ['print', 'code']);
  const title = await ask('Title', { required: true });
  const summary = await ask('One-sentence summary (shown in feed & RSS)', { required: true });
  const date = await ask('Date (YYYY-MM-DD)', { default: todayISO() });

  const fields = { type, title, date, summary };

  if (type === 'print') {
    fields.material = await ask('Material', { default: 'PLA' });
    fields.color = await ask('Color', { required: true });
    fields.layerHeight = await ask('Layer height', { default: '0.2mm' });
    fields.printTime = await ask('Print time (e.g. 6h40m)', { required: true });
  } else {
    const stackRaw = await ask('Stack (comma-separated, e.g. go, docker)', { required: true });
    fields.stack = stackRaw.split(',').map((s) => s.trim()).filter(Boolean);
    fields.repo = await ask('Repo URL (optional)');
  }

  const draft = await askYesNo('Mark as draft (hidden from the live site)?', { default: false });

  const slug = slugify(title);
  if (!slug) {
    console.error('Could not derive a filename from that title. Try a title with letters or numbers.');
    process.exitCode = 1;
    return;
  }

  const filePath = path.join(postsDir, `${slug}.md`);

  try {
    await access(filePath);
    console.error(`A post already exists at src/content/posts/${slug}.md — choose a different title.`);
    process.exitCode = 1;
    return;
  } catch {
    // doesn't exist yet, good
  }

  const lines = [
    '---',
    `type: ${fields.type}`,
    `title: ${yamlQuote(fields.title)}`,
    `date: ${fields.date}`,
    `summary: ${yamlQuote(fields.summary)}`,
  ];

  if (draft) lines.push('draft: true');

  if (type === 'print') {
    lines.push(
      `material: ${yamlQuote(fields.material)}`,
      `color: ${yamlQuote(fields.color)}`,
      `layerHeight: ${yamlQuote(fields.layerHeight)}`,
      `printTime: ${yamlQuote(fields.printTime)}`
    );
  } else {
    lines.push(`stack: ${yamlList(fields.stack)}`);
    if (fields.repo) lines.push(`repo: ${yamlQuote(fields.repo)}`);
  }

  lines.push('---', '', 'Write your post here.', '');

  await mkdir(postsDir, { recursive: true });
  await writeFile(filePath, lines.join('\n'), 'utf8');

  console.log(`\nCreated src/content/posts/${slug}.md`);
  console.log(draft
    ? 'It\'s marked draft, so it stays off the live site until you remove that line.'
    : 'Run `npm run dev` to preview it, then commit and push to publish.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
