import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import {
  AGENT_REGISTRY_ADDRESS,
  CREATE_BOT_FUNCTION,
  DEPLOYER_ADDRESS,
} from "./utils";

const provideHandleTransaction: (
  AGENT_REGISTRY_ADDRESS: string,
  CREATE_BOT_FUNCTION: string,
  DEPLOYER_ADDRESS: string
) => HandleTransaction = () => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    if (txEvent.from !== DEPLOYER_ADDRESS.toLocaleLowerCase()) return findings;
    // filter the logs for createAgent calls
    const botDeployerCreateBotCalls = txEvent.filterFunction(
      CREATE_BOT_FUNCTION,
      AGENT_REGISTRY_ADDRESS
    );

    botDeployerCreateBotCalls.forEach((call) => {
      // extract transfer event arguments
      const { agentId, chainIds, metadata, owner } = call.args;
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
            agentId: agentId.toString(),
            chainIds: chainIds.toString(),
            metadata: metadata.toString(),
            owner: owner.toString(),
          },
        })
      );
    });

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(
    AGENT_REGISTRY_ADDRESS,
    CREATE_BOT_FUNCTION,
    DEPLOYER_ADDRESS
  ),
};
