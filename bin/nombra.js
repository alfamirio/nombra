#!/usr/bin/env node
import { run } from '../src/cli.js';

// `nombra -n 1000 | head` closes the pipe early: that is not an error.
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') process.exit(0);
  throw error;
});

process.exitCode = run(process.argv.slice(2));
