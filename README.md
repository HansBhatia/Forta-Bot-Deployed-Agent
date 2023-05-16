# Bot Deployed By Nethermind Deployer Bot

## Description

This bot detects creations of forta bots by the forta deployer address.

## Supported Chains

- Polygon

## Alerts

- Forta-Bot-Deployed
  - Fired when the function `createAgent` is called on the Forta contract
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata contains:
    - Provides the deployer, agentId and chainIds

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x46c5a07d66aec71dc1b12dcf7a036c78c2299cc45c099d981d440f2c67501525 (One bot deployment)
