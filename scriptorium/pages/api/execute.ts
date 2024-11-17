import { NextApiRequest, NextApiResponse } from 'next';
import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';

const docker = new Docker();

const languageConfigs: Record<string, { image: string; fileExt: string; compile?: string; run: string }> = {
  python: { image: 'python:3.10', fileExt: 'py', run: 'python code.py' },
  javascript: { image: 'node:18', fileExt: 'js', run: 'node code.js' },
  cpp: { image: 'gcc:latest', fileExt: 'cpp', compile: 'g++ code.cpp -o code', run: './code' },
  c: { image: 'gcc:latest', fileExt: 'c', compile: 'gcc code.c -o code', run: './code' },
  java: { image: 'openjdk:17', fileExt: 'java', run: '' },
  php: { image: 'php:8.0-cli', fileExt: 'php', run: 'php code.php' },
  ruby: { image: 'ruby:3.0', fileExt: 'rb', run: 'ruby code.rb' },
  go: { image: 'golang:1.16', fileExt: 'go', compile: 'go build -o code code.go', run: './code' },
  rust: { image: 'rust:latest', fileExt: 'rs', compile: 'rustc code.rs -o code', run: './code' },
  swift: { image: 'swift:5.8', fileExt: 'swift', run: 'swift code.swift' },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, code, input } = req.body;
  const tempDir = path.join('/tmp', `scriptorium-${Date.now()}`);
  let container: Docker.Container | null = null;

  try {
    const { image, fileExt, compile, run } = languageConfigs[language];
    fs.mkdirSync(tempDir, { recursive: true });

    let fileName = `code.${fileExt}`;
    let javaClassName = '';

    // Java-specific logic
    if (language === 'java') {
      const classNameMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
      if (!classNameMatch) {
        throw new Error('Invalid Java code: No public class found');
      }
      javaClassName = classNameMatch[1];
      fileName = `${javaClassName}.java`;
    }

    // Write the code to the appropriate file
    const codeFile = path.join(tempDir, fileName);
    fs.writeFileSync(codeFile, code);

    // Ensure the input file is cleared and properly reset
    const inputFile = path.join(tempDir, 'input.txt');
    fs.writeFileSync(inputFile, (input || '').trim() + '\n'); // Trim and ensure newline

    // Determine compile and run commands
    const compileCommand = language === 'java' ? `javac ${fileName}` : compile || '';
    const finalRunCommand =
      language === 'java'
        ? `CLASSPATH=/usr/src/app java ${javaClassName} < /usr/src/app/input.txt`
        : `${run} < /usr/src/app/input.txt`;

    const command = compileCommand ? `${compileCommand} && ${finalRunCommand}` : finalRunCommand;

    container = await docker.createContainer({
      Image: image,
      Cmd: ['/bin/bash', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: true,
      Tty: false,
      HostConfig: {
        Binds: [`${tempDir}:/usr/src/app`],
        Memory: 128 * 1024 * 1024,
        NanoCpus: 500000000,
      },
      WorkingDir: '/usr/src/app',
    });

    await container.start();

    const logsPromise = new Promise<string>((resolve, reject) => {
      container!.logs({ stdout: true, stderr: true, follow: true }, (err, stream) => {
        if (err) return reject(err);
        let output = '';
        stream.on('data', (data) => (output += data.toString()));
        stream.on('end', () => resolve(output));
        stream.on('error', reject);
      });
    });

    const rawOutput = await Promise.race([
      logsPromise,
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), 5000)
      ),
    ]);

    // Clean up stray or unwanted characters from output
    const cleanedOutput = rawOutput
      .replace(/^[^a-zA-Z0-9]+/, '')
      .replace(/\s+$/, '') 
      .trim();

    res.status(200).json({ output: cleanedOutput });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (container) {
      try {
        const containerInfo = await container.inspect();
        if (containerInfo.State.Running) {
          await container.stop({ t: 1 });
        }
        await container.remove();
      } catch (err) {
        console.error('Error during container cleanup:', err.message);
      }
    }

    // Ensure tempDir is fully removed
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}