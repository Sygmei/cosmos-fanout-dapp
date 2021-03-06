import type { NextPage } from 'next'
import Link from 'next/link'
import WalletLoader from 'components/WalletLoader'
import { useSigningClient } from 'contexts/cosmwasm'
import { useState } from 'react'
import { FanoutState } from 'types/contract'

const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FANOUT_CONTRACT_ADDRESS || ""


const Home: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient()
  const [showRegisterBeneficiary, setShowRegisterBeneficiary] = useState(false);

  signingClient?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, { get_state: {} }).then((contractState: FanoutState) => {
    if (!contractState.only_owner_can_register_beneficiary || contractState.owner == walletAddress) {
      setShowRegisterBeneficiary(true);
    } else {
      setShowRegisterBeneficiary(false);
    }
  });

  return (
    <WalletLoader>
      <h1 className="text-6xl font-bold">
        Welcome to <a className="link link-primary link-hover" href="#">
          {process.env.NEXT_PUBLIC_CHAIN_NAME} Fanout
        </a>
      </h1>

      <div className="mt-3 text-2xl">
        Your wallet address is:{' '}
        <pre className="font-mono break-all whitespace-pre-wrap">
          {walletAddress}
        </pre>
      </div>

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/donate" passHref>
          <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">Donate &rarr;</h3>
            <p className="mt-4 text-xl">
              Donate some funds to a list of beneficiaries
            </p>
          </a>
        </Link>
        {showRegisterBeneficiary && (<Link href="/register" passHref>
          <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">Register as a beneficiary &rarr;</h3>
            <p className="mt-4 text-xl">
              Register as a beneficiary to receive funds from the donations
            </p>
          </a>
        </Link>)}
      </div>
    </WalletLoader>
  )
}

export default Home
