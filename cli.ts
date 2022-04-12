#!/usr/bin/env node

const { argv } = require('yargs');
import { readFileSync, writeFileSync, readdirSync, write } from 'fs';
import { Game } from './business/game';
import { prompt } from 'prompts'

Game.play({ prompt })
