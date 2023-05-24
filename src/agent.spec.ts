import { Interface } from "ethers";
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import agent from "./agent";
import {
  AGENT_REGISTRY_ADDRESS,
  CREATE_BOT_FUNCTION,
  DEPLOYER_ADDRESS,
} from "./utils";

describe("bot created by deployer bot", () => {
  let proxy = new Interface([CREATE_BOT_FUNCTION]);
  const createAgentFn = proxy.getFunction("createAgent");
  if (createAgentFn === null) {
    return;
  }
  let handleTransaction: HandleTransaction;

  const mockTxEventDeployer = createTransactionEvent({
    transaction: { from: DEPLOYER_ADDRESS.toLocaleLowerCase() },
  } as any);
  const mockTxEventStranger = createTransactionEvent({
    transaction: { from: "0xb0b" },
  } as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no deployments", async () => {
      let findings: Finding[];
      let txEvent: TestTransactionEvent;
      txEvent = new TestTransactionEvent()
        .setTo(AGENT_REGISTRY_ADDRESS)
        .setFrom("0xb0b")
        .addTraces({
          to: AGENT_REGISTRY_ADDRESS,
          function: createAgentFn,
          arguments: [1, "0x", "metadata", [137]],
        });

      findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("does not return a finding if there was a call to createAgent not from the deployer address", async () => {
      const mockCreateAgentFunctionCall = {
        args: {
          agentId: "test-agent-101",
          chainIds: "0xJest",
        },
      };
      mockTxEventStranger.filterFunction = jest
        .fn()
        .mockReturnValue([mockCreateAgentFunctionCall]);

      const findings = await handleTransaction(mockTxEventStranger);

      expect(findings).toStrictEqual([]);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledWith(
        CREATE_BOT_FUNCTION,
        AGENT_REGISTRY_ADDRESS
      );
    });

    it("returns a finding if there was a call to createAgent by bot deployer.", async () => {
      const mockCreateAgentFunctionCall = {
        args: {
          agentId: "test-agent-101",
          chainIds: "0xJest",
        },
      };
      mockTxEventDeployer.filterFunction = jest
        .fn()
        .mockReturnValue([mockCreateAgentFunctionCall]);

      const findings = await handleTransaction(mockTxEventDeployer);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "New bot created",
          description: `Bot created with id: ${mockCreateAgentFunctionCall.args.agentId}`,
          alertId: "Forta-Bot-Deployed",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            deployer: DEPLOYER_ADDRESS.toLocaleLowerCase(),
            agentId: mockCreateAgentFunctionCall.args.agentId,
            chainIds: mockCreateAgentFunctionCall.args.chainIds,
          },
        }),
      ]);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledWith(
        CREATE_BOT_FUNCTION,
        AGENT_REGISTRY_ADDRESS
      );
    });
  });
});
