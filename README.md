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

- 0xf31c5dad590c84651338170883aa8cb4e4c414a06a8b6122816df44e368ef9fe (One bot deployment)
