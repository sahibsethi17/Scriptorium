// pages/api/templates/run-template.js
import { spawn } from 'child_process';
import fs from 'fs';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { templateId } = req.body;

  try {
    // Retrieve template data, including stdin and language
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { code, stdin, language } = template;
    const parsedStdin = stdin ? JSON.parse(stdin) : [];

    // Define commands for different languages
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
    const MAX_EXECUTION_TIME = 5000;

    // Write code to file
    fs.writeFileSync(codeFileName, code);

    // Compile step for compiled languages (C, C++, Java)
    if (compile) {
      await new Promise((resolve, reject) => {
        const compileProcess = spawn(compile, [codeFileName]);

        compileProcess.stderr.on('data', (data) => {
          return reject(`Compilation error: ${data.toString()}`);
        });

        compileProcess.on('close', (exitCode) => {
          if (exitCode !== 0) {
            return reject(`Compilation failed with code ${exitCode}`);
          }
          resolve();
        });
      });
    }

    // Run the compiled/interpreted code
    const runArgs = language === 'java' ? ['Main'] : [codeFileName];
    const runProcess = spawn(run, runArgs);

    const timeout = setTimeout(() => {
      runProcess.kill('SIGTERM');
    }, MAX_EXECUTION_TIME);

    if (parsedStdin.length > 0) {
      parsedStdin.forEach(input => runProcess.stdin.write(input + '\n'));
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

    runProcess.on('close', (exitCode) => {
      clearTimeout(timeout);

      if (exitCode === null) {
        return res.status(408).json({ error: 'Execution timed out' });
      }

      if (errors) {
        return res.status(400).json({ error: errors });
      }

      return res.status(200).json({ output, exitCode });
    });

    runProcess.on('error', (err) => {
      clearTimeout(timeout);
      return res.status(500).json({ error: `Execution error: ${err.toString()}` });
    });
  } catch (error) {
    console.error("Run template error:", error);
    return res.status(500).json({ error: 'Failed to run template', details: error.message });
  }
}