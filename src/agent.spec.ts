import { Finding, FindingSeverity, FindingType, HandleTransaction, createTransactionEvent } from "forta-agent";
import agent, { AGENT_REGISTRY_ADDRESS, CREATE_BOT_FUNCTION, DEPLOYER_ADDRESS } from "./agent";

describe("bot created by deployer bot", () => {
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
      mockTxEventDeployer.filterFunction = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEventDeployer);

      expect(findings).toStrictEqual([]);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledWith(CREATE_BOT_FUNCTION, AGENT_REGISTRY_ADDRESS);
    });

    it("does not return a finding if there was a call to createAgent not from the deployer address", async () => {
      const mockCreateAgentFunctionCall = {
        args: {
          agentId: "test-agent-101",
          chainIds: "0xJest",
        },
      };
      mockTxEventStranger.filterFunction = jest.fn().mockReturnValue([mockCreateAgentFunctionCall]);

      const findings = await handleTransaction(mockTxEventStranger);

      expect(findings).toStrictEqual([]);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledWith(CREATE_BOT_FUNCTION, AGENT_REGISTRY_ADDRESS);
    });

    it("returns a finding if there was a call to createAgent by bot deployer.", async () => {
      const mockCreateAgentFunctionCall = {
        args: {
          agentId: mockCreateAgentFunctionCall.args.agentId,
          chainIds: mockCreateAgentFunctionCall.args.chainIds,
        },
      };
      mockTxEventDeployer.filterFunction = jest.fn().mockReturnValue([mockCreateAgentFunctionCall]);

      const findings = await handleTransaction(mockTxEventDeployer);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "New bot created",
          description: `Bot created with id: ${"test-agent-101"}`,
          alertId: "Forta-Bot-Deployed",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            deployer: DEPLOYER_ADDRESS.toLocaleLowerCase(),
            agentId: "test-agent-101",
            chainIds: "0xJest",
          },
        }),
      ]);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEventDeployer.filterFunction).toHaveBeenCalledWith(CREATE_BOT_FUNCTION, AGENT_REGISTRY_ADDRESS);
    });
  });
});
