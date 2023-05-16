import { Finding, FindingSeverity, FindingType, HandleTransaction, TransactionEvent } from "forta-agent";

export const CREATE_BOT_FUNCTION =
  "function createAgent(uint256 agentId, address, string calldata metadata, uint256[] calldata chainIds) external";
export const AGENT_REGISTRY_ADDRESS = "0x61447385b019187daa48e91c55c02af1f1f3f863";
export const DEPLOYER_ADDRESS = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";

const provideHandleTransaction: () => HandleTransaction = () => {
  const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    if (txEvent.from !== DEPLOYER_ADDRESS.toLocaleLowerCase()) return findings;
    // filter the logs for createAgent calls
    const botDeployerCreateBotCalls = txEvent.filterFunction(CREATE_BOT_FUNCTION, AGENT_REGISTRY_ADDRESS);

    botDeployerCreateBotCalls.forEach((createBotEvent) => {
      // extract transfer event arguments
      const { agentId, chainIds } = createBotEvent.args;
      // report it
      findings.push(
        Finding.fromObject({
          name: "New bot created",
          description: `Bot created with id: ${agentId}`,
          alertId: "Forta-Bot-Deployed",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            deployer: txEvent.from,
            agentId: agentId,
            chainIds: chainIds,
          },
        })
      );
    });

    return findings;
  };
  return handleTransaction;
};

export default {
  handleTransaction: provideHandleTransaction(),
};
