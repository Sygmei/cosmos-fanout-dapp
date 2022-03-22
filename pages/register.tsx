import { useState, useEffect, MouseEvent } from 'react'
import type { NextPage } from 'next'
import { StdFee, Coin } from '@cosmjs/amino'
import { calculateFee, GasPrice } from "@cosmjs/stargate";

import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
} from 'util/conversion'

const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno'
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FANOUT_CONTRACT_ADDRESS || ""

const Send: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient()
  const [balance, setBalance] = useState('')
  const [loadedAt, setLoadedAt] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      return
    }
    setError('')
    setSuccess('')

    signingClient
      .getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      .then((response: any) => {
        const { amount, denom }: { amount: number; denom: string } = response
        setBalance(
          `${convertMicroDenomToDenom(amount)} ${convertFromMicroDenom(denom)}`
        )
      })
      .catch((error) => {
        setError(`Error! ${error.message}`)
        console.log('Error signingClient.getBalance(): ', error)
      })
  }, [signingClient, walletAddress, loadedAt])

  const handleRegister = (event: MouseEvent<HTMLElement>) => {
    console.log("Contract address ", PUBLIC_CONTRACT_ADDRESS);
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    let contractKey: Uint8Array = new Uint8Array([99, 111, 110, 116, 114, 97, 99, 116, 95, 105, 110, 102, 111]);
    signingClient?.queryContractRaw(PUBLIC_CONTRACT_ADDRESS, contractKey).then((value) => {
      console.log("value", value);
    }).catch((error) => {
      console.log("contract_key error", error);
    })

    signingClient?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, { register_beneficiary: {} }, "auto").then((resp) => {
      console.log('resp', resp);

      const message = `Success! Registered address ${walletAddress} as a beneficiary to receive ${convertFromMicroDenom(
        PUBLIC_STAKING_DENOM
      )}.`

      setLoadedAt(new Date())
      setLoading(false)
      setSuccess(message)
    }).catch((error) => {
      setLoading(false)
      setError(`Error! ${error.message}`)
      console.log('error', error)
    });
  }
  return (
    <WalletLoader loading={loading}>
      <p className="text-2xl">Your wallet has {balance}</p>

      <h1 className="text-5xl font-bold my-8">
        Click below to receive {convertFromMicroDenom(PUBLIC_STAKING_DENOM)} from donations
      </h1>
      <p>
        Your address is
        <pre className="font-mono break-all whitespace-pre-wrap">
          {walletAddress}
        </pre>
      </p>
      <div className="flex w-full max-w-xl">
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleRegister}
        >
          Register as a beneficiary
        </button>
      </div>
      <div className="mt-4 flex flex-col w-full max-w-xl">
        {success.length > 0 && (
          <div className="alert alert-success">
            <div className="flex-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="flex-shrink-0 w-6 h-6 mx-2 stroke-current flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <label className="flex-grow break-all">{success}</label>
            </div>
          </div>
        )}
        {error.length > 0 && (
          <div className="alert alert-error">
            <div className="flex-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path>
              </svg>
              <label className="flex-grow break-all">{error}</label>
            </div>
          </div>
        )}
      </div>
    </WalletLoader>
  )
}

export default Send
