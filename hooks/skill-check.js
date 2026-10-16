const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const MAX = 1024;
const UPLOAD_DIR = 'D:\\Afia Insurance\\Projects\\Office\\skills-upload';
const PERSONAL = path.join(os.homedir(), '.claude', 'skills');

function frontmatter(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return fm ? fm[1].split(/\r?\n/) : null;
}

function readField(lines, key) {
  const i = lines.findIndex(l => new RegExp(`^${key}:`).test(l));
  if (i === -1) return null;
  const inline = lines[i].replace(new RegExp(`^${key}:\\s*`), '');
  if (/^[>|][-+]?\s*$/.test(inline)) {
    const block = [];
    for (let j = i + 1; j < lines.length && (/^\s+/.test(lines[j]) || lines[j] === ''); j++) block.push(lines[j].trim());
    return block.join(inline.startsWith('>') ? ' ' : '\n').replace(/\s+$/, '');
  }
  return inline.replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
}

function validate(file) {
  const dirName = path.basename(path.dirname(file));
  const lines = frontmatter(fs.readFileSync(file, 'utf8'));
  if (!lines) return `${file}: no frontmatter. Add name + description.`;
  const name = readField(lines, 'name');
  const desc = readField(lines, 'description');
  if (!desc) return `${file}: no description (max ${MAX} characters).`;
  if (desc.length > MAX)
    return `${file}: description is ${desc.length} characters; the limit is ${MAX}. Shorten it (what it is, key files, when to use it) and move trigger phrases / file lists into a "When to use" section in the body.`;
  if (name && name !== dirName)
    return `${file}: frontmatter name "${name}" must match the folder name "${dirName}" so the local copy and claude.ai upload use the same name. Rename one of them.`;
  return null;
}

const WORKBENCH = path.join(path.dirname(fs.realpathSync.native(__dirname)), 'skills');

function real(p) {
  try { return fs.realpathSync.native(p).toLowerCase(); } catch { return path.resolve(p).toLowerCase(); }
}

function isPersonal(dir) {
  const d = real(dir);
  return [PERSONAL, WORKBENCH].some(root => d.startsWith(real(root)));
}

function isLink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

function syncLocal(skillDir) {
  const dest = path.join(PERSONAL, path.basename(skillDir));
  if (isLink(dest) || real(dest) === real(skillDir))
    throw new Error(`${dest} is a link to my waris-claude-engine repo — not overwriting it. Rename one of the skills.`);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(skillDir, dest, { recursive: true });
  return dest;
}

function buildZips(skillDirs) {
  if (!skillDirs.length) return;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const q = s => `'${s.replace(/'/g, "''")}'`;
  const ps = ['Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem'];
  for (const src of skillDirs) {
    const name = path.basename(src);
    const zip = path.join(UPLOAD_DIR, `${name}.zip`);
    ps.push(
      `$src = ${q(src)}; $zip = ${q(zip)}; $name = ${q(name)}`,
      'if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }',
      '$archive = [IO.Compression.ZipFile]::Open($zip, "Create")',
      'try { Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {',
      '  $rel = $name + "/" + $_.FullName.Substring($src.Length).TrimStart("\\").Replace("\\", "/")',
      '  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $rel) } }',
      'finally { $archive.Dispose() }'
    );
  }
  execFileSync('powershell.exe', ['-NoProfile', '-Command', ps.join('\n')]);
}

function onEdit(filePath) {
  if (!filePath || path.basename(filePath) !== 'SKILL.md' || !fs.existsSync(filePath)) return 0;
  const problem = validate(filePath);
  if (problem) {
    console.error(problem);
    return 2;
  }
  const skillDir = path.dirname(filePath);
  const name = path.basename(skillDir);
  try {
    buildZips([skillDir]);
    console.log(`Skill "${name}" OK. Upload zip ready: ${path.join(UPLOAD_DIR, name + '.zip')}`);
  } catch (e) {
    console.error(`Skill "${name}" zip failed: ${e.message}`);
  }
  if (!isPersonal(skillDir)) {
    try {
      console.log(`Synced to ${syncLocal(skillDir)} (same name, same content).`);
    } catch (e) {
      console.error(`Sync of "${name}" failed: ${e.message}`);
    }
  }
  return 0;
}

function onSessionStart(cwd) {
  let root = cwd;
  try {
    root = execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {}
  const skillsDir = path.join(root, '.claude', 'skills');
  if (!root || isPersonal(skillsDir) || !fs.existsSync(skillsDir)) return 0;

  const synced = [];
  const skipped = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src = path.join(skillsDir, entry.name);
    const file = path.join(src, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const local = path.join(PERSONAL, entry.name, 'SKILL.md');
    if (fs.existsSync(local) && fs.readFileSync(local, 'utf8') === fs.readFileSync(file, 'utf8')) continue;
    if (fs.existsSync(local) && fs.statSync(local).mtimeMs > fs.statSync(file).mtimeMs) continue;
    const problem = validate(file);
    if (problem) {
      skipped.push(problem);
      continue;
    }
    try {
      syncLocal(src);
      synced.push(src);
    } catch (e) {
      skipped.push(`${entry.name}: ${e.message}`);
    }
  }
  try {
    buildZips(synced);
  } catch {}
  if (synced.length)
    console.log(
      `Skills synced to ~/.claude/skills and re-zipped in ${UPLOAD_DIR}: ${synced.map(s => path.basename(s)).join(', ')}. Remind me to re-upload these zips to claude.ai.`
    );
  if (skipped.length) console.log(`Skills not synced (fix these):\n- ${skipped.join('\n- ')}`);
  return 0;
}

let input = '';
process.stdin.on('data', c => (input += c));
process.stdin.on('end', () => {
  let data = {};
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const code =
    data.hook_event_name === 'SessionStart' ? onSessionStart(data.cwd || process.cwd()) : onEdit(data.tool_input?.file_path);
  process.exit(code);
});
