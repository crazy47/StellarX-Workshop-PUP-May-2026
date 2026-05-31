import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, NFT_CONTRACT_ID } from './stellar';

const READ_SOURCE = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export function nftConfigured(): boolean {
  return Boolean(NFT_CONTRACT_ID);
}

export async function readNftTotalSupply(): Promise<number> {
  if (!NFT_CONTRACT_ID) return 0;
  const contract = new Contract(NFT_CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('total_supply'))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error('Could not read total supply.');
  }

  return scValToNative(sim.result.retval);
}

export async function buildMintNftXDR(
  admin: string,
  to: string,
  uri: string,
): Promise<string> {
  const contract = new Contract(NFT_CONTRACT_ID);
  const account = await server.getAccount(admin);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'mint',
        nativeToScVal(to, { type: 'address' }),
        nativeToScVal(uri, { type: 'string' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — the mint call would not succeed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}
