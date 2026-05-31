#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short, Symbol};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Name,
    Symbol,
    TotalSupply,
    Owner(u32),
    TokenURI(u32),
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    /// Initialize the contract with an admin, name, and symbol.
    pub fn init(env: Env, admin: Address, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0u32);
    }

    /// Mint a new NFT to a specific address with a URI. Returns the new token ID.
    pub fn mint(env: Env, to: Address, uri: String) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        admin.require_auth();

        let mut total_supply: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        let id = total_supply;
        total_supply += 1;

        env.storage().persistent().set(&DataKey::Owner(id), &to);
        env.storage().persistent().set(&DataKey::TokenURI(id), &uri);
        env.storage().instance().set(&DataKey::TotalSupply, &total_supply);

        id
    }

    /// Transfer an NFT from one address to another.
    pub fn transfer(env: Env, from: Address, to: Address, id: u32) {
        from.require_auth();

        let owner: Address = env.storage().persistent().get(&DataKey::Owner(id)).expect("Token does not exist");
        if owner != from {
            panic!("Not the owner");
        }

        env.storage().persistent().set(&DataKey::Owner(id), &to);
    }

    /// Get the owner of a specific token ID.
    pub fn owner_of(env: Env, id: u32) -> Address {
        env.storage().persistent().get(&DataKey::Owner(id)).expect("Token does not exist")
    }

    /// Get the URI of a specific token ID.
    pub fn token_uri(env: Env, id: u32) -> String {
        env.storage().persistent().get(&DataKey::TokenURI(id)).expect("Token does not exist")
    }

    /// Get the total supply of minted tokens.
    pub fn total_supply(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).expect("Not initialized")
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).expect("Not initialized")
    }
}

mod test;
