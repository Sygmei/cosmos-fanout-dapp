import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useSigningClient } from "contexts/cosmwasm"
import { useState, useEffect } from "react";

interface Beneficiary {
    address: string
}

const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FANOUT_CONTRACT_ADDRESS || ""

function RemoveBeneficiary(signingClient: SigningCosmWasmClient | null, senderAddress: string, beneficiary: string) {
    console.log("Removing beneficiary", beneficiary);
    if (signingClient) {
        signingClient.execute(senderAddress, PUBLIC_CONTRACT_ADDRESS, { remove_beneficiary_as_owner: { beneficiary: beneficiary } }, "auto").catch((error) => {
            console.log('error', error)
        });
    }
}

function RestoreBeneficiary(signingClient: SigningCosmWasmClient | null, senderAddress: string, beneficiary: string) {
    console.log("Restoring beneficiary", beneficiary);
    if (signingClient) {
        signingClient.execute(senderAddress, PUBLIC_CONTRACT_ADDRESS, { register_beneficiary_as_owner: { beneficiary: beneficiary } }, "auto").catch((error) => {
            console.log('error', error)
        });
    }
}

let TARGET_QUERY: { [key: string]: Record<string, object>; } = {
    "current": { get_all_beneficiaries: {} },
    "removed": { get_all_removed_beneficiaries: {} }
}

function BeneficiariesList({ target }: { target: string }) {
    const { walletAddress, signingClient } = useSigningClient();
    const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
    useEffect(
        () => {
            let beneficiariesQueryPayload = TARGET_QUERY[target];
            signingClient?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, beneficiariesQueryPayload).then((data) => {
                setBeneficiaries(data.beneficiaries);
            });
        },
        []
    )
    return (
        <div className="overflow-x-auto w-full">
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Funds</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {beneficiaries.map(beneficiary => {
                        return (<tr className="hover">
                            <td><code>{beneficiary}</code></td>
                            <td>?</td>
                            {(target == "current" ? <th>
                                <label>
                                    <button className="btn btn-xs btn-error" onClick={() => { RemoveBeneficiary(signingClient, walletAddress, beneficiary) }}>Remove</button>
                                </label>
                            </th> : <th>
                                <label>
                                    <button className="btn btn-xs btn-success" onClick={() => { RestoreBeneficiary(signingClient, walletAddress, beneficiary) }}>Restore</button>
                                </label>
                            </th>
                            )}
                        </tr>)
                    })}
                </tbody>
                <tfoot>
                    <tr>

                        <th>Address</th>
                        <th>Funds</th>
                        <th></th>
                    </tr>
                </tfoot>

            </table>
        </div>
    )
}

export default BeneficiariesList
