// pages/api/execute.js
import { spawn } from 'child_process';
import fs from 'fs';
import { prisma } from "@/utils/db";
import { verifyAuth } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Destructure request body with defaults
  const { language, code, stdin = [], saveAsTemplate = false, title = "", explanation = "", tags = "" } = req.body;
  const userId = await verifyAuth(req);

  // Validate that code is provided
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  // Ensure `stdin` is an array, even if a single string is provided
  const inputArray = typeof stdin === 'string' ? [stdin] : stdin;

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
  const MAX_EXECUTION_TIME = 5000;

  try {
    fs.writeFileSync(codeFileName, code);

    // Compile step for compiled languages
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

    // Timeout handling
    const timeout = setTimeout(() => {
      runProcess.kill('SIGTERM');
    }, MAX_EXECUTION_TIME);

    // Handling standard input (stdin), writing each entry in the inputArray as a new line
    if (inputArray.length > 0) {
      inputArray.forEach(input => runProcess.stdin.write(input + '\n'));
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

    runProcess.on('close', async (exitCode) => {
      clearTimeout(timeout);

      if (exitCode === null) {
        return res.status(408).json({ error: 'Execution timed out' });
      }

      if (errors) {
        return res.status(400).json({ error: errors });
      }

      // If `saveAsTemplate` is true, save the template with stdin as JSON string
      if (saveAsTemplate) {
        try {
          const template = await prisma.template.create({
            data: {
              userId,
              title,
              explanation,
              tags,
              code,
              stdin: inputArray.length > 0 ? JSON.stringify(inputArray) : null,
              language, 
            },
          });

          return res.status(200).json({
            output,
            exitCode: exitCode,
            templateId: template.id,
            message: 'Code executed and template saved successfully'
          });
        } catch (templateError) {
          console.error("Template saving error:", templateError);
          return res.status(500).json({
            error: 'Code executed, but template saving failed',
            details: templateError.message
          });
        }
      }

      // If not saving as template, return execution result only
      return res.status(200).json({ output, exitCode: exitCode });
    });

    runProcess.on('error', (err) => {
      clearTimeout(timeout);
      return res.status(500).json({ error: `Execution error: ${err.toString()}` });
    });
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
}