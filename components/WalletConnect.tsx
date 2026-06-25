/*eslint-disable*/
'use client';

import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function WalletConnect() {
    const [accounts, setAccounts] = useState<string | null>(null);
    const [chainId, setChainId] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchChainId = async () => {
        try {
            setLoading(true);

            const chainId = await window.ethereum?.request({
                method: 'eth_chainId'
            }) as string;

            if (chainId) {
                setChainId(chainId);
            };
            toast.success('Chain Id fetched successfully', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch Chain Id', { position: 'top-center' })
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (!window.ethereum) {
                toast('Wallet not found', { position: 'top-center' });
                return;
            }
            try {
                setLoading(true);

                const accountFound = await window.ethereum.request({
                    method: 'eth_accounts'
                }) as string[];

                if (accountFound.length > 0) {
                    setAccounts(accountFound[0]);
                    setIsConnected(true);
                };

                toast.success('Account connected sucessully!', { position: 'top-center' });

            } catch (error) {
                console.error(error);
                toast.error('Account not connected!', { position: 'top-center' });

            } finally {
                setLoading(false);
            }
        };
        checkWalletConnection();
        fetchChainId();

        // have to add event listeners for account & chain changed 
        const handleAccountChanged = (account: string[]) => {
            try {
                setLoading(true);

                if (account.length > 0) {
                    setAccounts(account[0]);
                    setIsConnected(true);
                } else {
                    setAccounts(null);
                    setIsConnected(false);
                }

            } catch (error) {
                console.error(error);
                toast.error('Error changing Account', { position: 'top-center' })
            } finally {
                setLoading(false);
            }
        };

        const handleChainChanged = (chainId: string) => {
            setChainId(chainId);
        };

        window.ethereum?.on('accountsChanged', handleAccountChanged);
        window.ethereum?.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        }
    }, []);

    const connectWallet = async () => {
        try {
            setLoading(true);

            const requestAccounts = await window.ethereum!.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (requestAccounts.length > 0) {
                setAccounts(requestAccounts[0]);
                setIsConnected(true);
            };

            await fetchChainId();
            toast.success('Account connected sucessully!', { position: 'top-center' });

        } catch (error) {
            console.error(error);
            toast.error('Account not connected!', { position: 'top-center' });
        } finally {
            setLoading(false);
        }
    }

    const disconnectWallet = () => {
        try {
            setLoading(true);

            setAccounts(null);
            setIsConnected(false);

            toast.success('Wallet disconnected successfully!', { position: 'top-center' })

        } catch (error) {
            console.error(error);
            toast.error('Error disconnecting!', { position: 'top-center' })

        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {loading && (
                <Spinner />
            )}

            {accounts ? (
                <>
                    <Label>Account address: {accounts}</Label>
                    <Label>Chain Id: {chainId}</Label>
                    <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
                    {isConnected && <Label>Status: Conntected</Label>}
                </>
            ) : (
                <>
                    {!isConnected && <Label>Status: Diconnected</Label>}
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                </>
            )}
        </div>
    )
}