import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter, TrezorWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PublicKey, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';
import type { FC, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new UnsafeBurnerWalletAdapter(),
            new TrezorWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useWallet();

    const [signedTx, setSignedTx] = useState<Transaction | undefined>();
    const onClick = async () => {
        if (wallet.publicKey == null) {
            return;
        }

        setSignedTx(
            await wallet.signTransaction?.(
                new Transaction({
                    blockhash: '2p4rYZAaFfV5Uk5ugdG5KPNty9Uda9B3b4gWB8qnNqak',
                    lastValidBlockHeight: 50,
                    feePayer: wallet.publicKey,
                }).add(
                    SystemProgram.createAccount({
                        fromPubkey: wallet.publicKey,
                        newAccountPubkey: new PublicKey('AeDJ1BqA7ruBbd6mEcS1QNxFbT8FQbiBVuN9NqK94Taq'),
                        lamports: 20000000,
                        space: 1000,
                        programId: new PublicKey('11111111111111111111111111111111'),
                    })
                )
            )
        );
    };
    return (
        <>
            <WalletMultiButton />
            <button onClick={onClick}>Sign Transaction</button>
            <p>{signedTx?.signature}</p>
        </>
    );
};
