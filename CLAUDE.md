# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a market simulation tool for distributing internal and external (world) demand among players in each industry. The simulator is written in Node.js and processes CSV data to calculate market distribution based on economic formulas.

## Commands

### Run the simulation
```bash
node market_simulator.js
```

### Install dependencies
```bash
npm install
```

## Architecture

### Core Components

**market_simulator.js**
- Main simulation script implementing the market distribution algorithm
- Key phases:
  1. Data loading and parsing from CSV
  2. Iterative internal market distribution across players
  3. External (world) market distribution and final calculations
- Uses economic formulas with sensitivity parameters (RP_PARAMETR_SA)

### Data Flow

1. **Input**: CSV files containing player data for each industry
   - `input_data.csv` - main input file with player parameters
   - Rows with `k==0` represent "World" player (external market demand)
   
2. **Processing**: Groups data by industry (`a` field) and runs simulation for each
   
3. **Output**: Console tables showing distribution results including:
   - Internal sales (спрос_удовл_внутр)
   - Export/Import volumes
   - Realized vs potential demand
   - Remaining supply

### Key Algorithm Parameters

- **RP_PARAMETR_SA**: Market sensitivity to quality parameter (default: 1)
- **World demand**: Taken from CSV data for k==0 player per industry
- Iterative distribution runs for (playerCount + 1) iterations maximum

### CSV Data Structure

Required fields in input CSV:
- `a`: Industry identifier
- `k`: Player ID (0 = World/external market)
- `спрос_региона`: Regional demand
- `валовой_выпуск`: Gross output
- `уровень_нтп`: Technology level (affects quality score)

## Development Notes

- The simulation uses csv-parser library for CSV processing
- All numeric calculations preserve precision with floating point operations
- Console output formatted with tables for readability
- Comments in Russian explain domain-specific economic logic