import { spawn } from 'child_process';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, code, stdin } = req.body;

  // Mapping languages to their respective execution commands
  const commands = {
    c: { compile: 'gcc', run: './a.out', fileExt: 'c' },
    cpp: { compile: 'g++', run: './a.out', fileExt: 'cpp' },
    java: { compile: 'javac', run: 'java', fileExt: 'java', fileName: 'Main.java' },
    python: { run: 'python3', fileExt: 'py' },
    javascript: { run: 'node', fileExt: 'js' },
  };

  if (!commands[language]) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const { compile, run, fileExt, fileName } = commands[language];
  const codeFileName = fileName || `temp_code.${fileExt}`;
  const MAX_EXECUTION_TIME = 5000; // 5 seconds

  try {
    // Write code to a file with correct naming for Java
    fs.writeFileSync(codeFileName, code);

    // Compile step for compiled languages
    if (compile) {
      await new Promise((resolve, reject) => {
        const compileProcess = spawn(compile, [codeFileName]);

        compileProcess.stderr.on('data', (data) => {
          return reject(`Compilation error: ${data.toString()}`);
        });

        compileProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(`Compilation failed with code ${code}`);
          }
          resolve();
        });
      });
    }

    // Run the compiled/interpreted code
    const runArgs = language === 'java' ? ['Main'] : [codeFileName];
    const runProcess = spawn(run, runArgs);

    // Timeout handling
    const timeout = setTimeout(() => {
      runProcess.kill('SIGTERM');
    }, MAX_EXECUTION_TIME);

    // Handling standard input (stdin)
    if (stdin) {
      runProcess.stdin.write(stdin);
      runProcess.stdin.end();
    }

    let output = '';
    let errors = '';

    runProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    runProcess.stderr.on('data', (data) => {
      errors += data.toString();
    });

    runProcess.on('close', (code) => {
      clearTimeout(timeout);

      if (code === null) {
        return res.status(408).json({ error: 'Execution timed out' });
      }

      if (errors) {
        return res.status(400).json({ error: errors });
      }

      return res.status(200).json({ output, exitCode: code });
    });

    runProcess.on('error', (err) => {
      clearTimeout(timeout);
      return res.status(500).json({ error: `Execution error: ${err.toString()}` });
    });
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
}