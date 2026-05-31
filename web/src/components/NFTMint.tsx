'use client';
import { useState, useEffect, useCallback } from 'react';
import { nftConfigured, readNftTotalSupply, buildMintNftXDR } from '@/lib/nft';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function NFTMint({ publicKey }: { publicKey: string | null }) {
  const configured = nftConfigured();
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [loading, setLoading] = useState(configured);
  const [uri, setUri] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    try {
      setTotalSupply(await readNftTotalSupply());
    } catch (e: unknown) {
      console.error('Failed to read NFT state:', e);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mint = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildMintNftXDR(publicKey, publicKey, uri);
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg(`Success! NFT #${totalSupply} minted.`);
      setUri('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Minting failed');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">NFT Minting</h2>
        <p className="mt-2 text-sm text-gray-600">
          NFT contract not deployed. Run the deployment script to enable this panel:
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
          ./scripts/deploy_nft.sh
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Mint Your NFT</h2>

      {loading && <p className="text-sm text-gray-400">Loading supply data...</p>}

      {!loading && (
        <>
          <div className="mb-4 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm font-medium text-indigo-700">
              Total NFTs Minted: <span className="text-lg font-bold">{totalSupply ?? 0}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Metadata URI</label>
              <input
                type="text"
                placeholder="https://ipfs.io/ipfs/..."
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the URI for your NFT metadata. Only the contract admin can mint.
              </p>
            </div>

            <button
              onClick={mint}
              disabled={busy || !publicKey || !uri}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {busy ? 'Minting...' : 'Mint NFT'}
            </button>

            {!publicKey && (
              <p className="text-center text-xs text-red-500">
                Connect your wallet to mint.
              </p>
            )}
          </div>
        </>
      )}

      {msg && (
        <div className="mt-4 rounded-md bg-emerald-50 p-3">
          <p className="text-sm text-emerald-700">{msg}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
