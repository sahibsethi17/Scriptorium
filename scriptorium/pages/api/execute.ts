import { NextApiRequest, NextApiResponse } from 'next';
import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';

const docker = new Docker();

const languageConfigs: Record<
  string,
  { image: string; fileExt: string; compile?: string; run: string }
> = {
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
    const config = languageConfigs[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const { image, fileExt, compile, run } = config;
    fs.mkdirSync(tempDir, { recursive: true });

    // Handle Java specifics
    let fileName = `code.${fileExt}`;
    let javaClassName = '';
    if (language === 'java') {
      const classNameMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
      if (!classNameMatch) {
        throw new Error('Invalid Java code: No public class found');
      }
      javaClassName = classNameMatch[1];
      fileName = `${javaClassName}.java`;
    }

    // Write the code to the temp directory
    const codeFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(codeFilePath, code);

    // Write input to a file
    const inputFilePath = path.join(tempDir, 'input.txt');
    fs.writeFileSync(inputFilePath, (input || '').trim() + '\n');

    // Build the Docker commands
    const compileCommand = compile || (language === 'java' ? `javac ${fileName}` : '');
    const runCommand =
      language === 'java'
        ? `CLASSPATH=/usr/src/app java ${javaClassName} < /usr/src/app/input.txt`
        : `${run} < /usr/src/app/input.txt`;
    const fullCommand = compileCommand ? `${compileCommand} && ${runCommand}` : runCommand;

    // Create and start the container
    container = await docker.createContainer({
      Image: image,
      Cmd: ['/bin/bash', '-c', fullCommand],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      HostConfig: {
        Binds: [`${tempDir}:/usr/src/app`],
        Memory: 128 * 1024 * 1024, // 128MB memory limit
        NanoCpus: 500000000, // 0.5 CPU
      },
      WorkingDir: '/usr/src/app',
    });

    await container.start();

    // Capture container logs
    const logs = await new Promise<string>((resolve, reject) => {
      container!.logs({ stdout: true, stderr: true, follow: true }, (err, stream) => {
        if (err) return reject(err);
        let output = '';
        stream.on('data', (data) => (output += data.toString()));
        stream.on('end', () => resolve(output));
        stream.on('error', reject);
      });
    });

    const cleanedOutput = logs
      .replace(/^\s+/, '') // Remove leading whitespace
      .replace(/\r?\n/g, '\n') // Normalize line breaks
      .replace(/\s+$/, ''); // Remove trailing whitespace

    res.status(200).json({ output: cleanedOutput });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    // Cleanup container and temp directory
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
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}