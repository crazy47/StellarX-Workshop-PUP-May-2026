'use client';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import NFTMint from '@/components/NFTMint';
import Link from 'next/link';

export default function NFTPage() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">StellarX NFT Minting</h1>
            <p className="mt-2 text-sm text-gray-600">
              Workshop track: Soroban Smart Contracts
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to Payments
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <ConnectWallet {...wallet} />
        </div>

        <div className="space-y-8">
          <NFTMint publicKey={wallet.publicKey} />
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">NFT Ecosystem</h2>
            <p className="text-sm text-gray-600 mb-4">
              This NFT uses a custom Soroban contract that tracks ownership and metadata URIs. 
              In a real application, you would:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Upload assets to IPFS and use the CID as the Token URI.</li>
              <li>Implement a marketplace to list and buy these NFTs.</li>
              <li>Use standard SEP-41/Token interfaces for wallet compatibility.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
