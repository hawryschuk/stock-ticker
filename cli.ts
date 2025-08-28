#!/usr/bin/env node

const { argv } = require('yargs');
import { readFileSync, writeFileSync, readdirSync, write } from 'fs';
import { StockTickerService } from './business/game';
import { prompt } from 'prompts'

StockTickerService.play({ prompt })
