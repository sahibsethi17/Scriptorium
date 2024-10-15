import { promises as fs } from 'fs';
import Docker from 'dockerode';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const docker = new Docker();
const WORKDIR = '/usr/src/app';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code = '', language = 'python', input = '' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const fileId = uuidv4();
  
  // Determine filename and Docker image based on the selected language
  const codeFilenames = {
    python: `${fileId}.py`,
    javascript: `${fileId}.js`,
    java: `Main.java`, 
    c: `${fileId}.c`,
    cpp: `${fileId}.cpp`
  };
  
  const images = {
    python: 'python:3.10-slim',
    javascript: 'node:20',
    java: 'openjdk:20-slim',
    c: 'gcc:12',
    cpp: 'gcc:12'
  };

  const cmdMap = {
    python: `cat ${WORKDIR}/${fileId}.txt | python ${WORKDIR}/${codeFilenames.python}`,
    javascript: `cat ${WORKDIR}/${fileId}.txt | node ${WORKDIR}/${codeFilenames.javascript}`,
    java: `javac ${WORKDIR}/${codeFilenames.java} && cat ${WORKDIR}/${fileId}.txt | java -cp ${WORKDIR} Main`, 
    c: `gcc ${WORKDIR}/${codeFilenames.c} -o ${WORKDIR}/${fileId} && cat ${WORKDIR}/${fileId}.txt | ${WORKDIR}/${fileId}`,
    cpp: `g++ ${WORKDIR}/${codeFilenames.cpp} -o ${WORKDIR}/${fileId} && cat ${WORKDIR}/${fileId}.txt | ${WORKDIR}/${fileId}`
  };

  const codeFilename = codeFilenames[language];
  const inputFilename = path.join('/tmp', `${fileId}.txt`);
  const dockerImage = images[language];
  const Cmd = ["/bin/sh", "-c", cmdMap[language]];

  try {
    // Write code and input to temporary files
    await fs.writeFile(`/tmp/${codeFilename}`, code);
    await fs.writeFile(inputFilename, input);

    // Create and start Docker container
    const container = await docker.createContainer({
      Image: dockerImage,
      Cmd,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        Binds: [
          `/tmp/${codeFilename}:${WORKDIR}/${codeFilename}`,
          `/tmp/${fileId}.txt:${WORKDIR}/${fileId}.txt`
        ],
      }
    });

    await container.start();
    const stream = await container.logs({ stdout: true, stderr: true, follow: true });
    let output = '';

    // Collect output from logs
    stream.on('data', (chunk) => {
      output += chunk.toString();
    });

    // Wait for container to finish logging
    stream.on('end', async () => {
      // Ensure we send the response once
      if (!res.headersSent) {
        res.status(200).json({ output });
      }

      // Cleanup: stop and remove the container
      try {
        await container.stop();
      } catch (error) {
        if (error.statusCode !== 304) { // Ignore if container is already stopped
          console.error("Error stopping container:", error.message);
        }
      }

      try {
        await container.remove();
      } catch (error) {
        console.error("Error removing container:", error.message);
      }
    });
  } catch (error) {
    console.error("Error during execution:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Execution failed', details: error.message });
    }
  }
}