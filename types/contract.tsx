export interface FanoutState {
    only_owner_can_register_beneficiary: boolean
    owner: string
}

export interface BeneficiaryListResponse {
    beneficiaries: string[]
}