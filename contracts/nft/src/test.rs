#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_mint_and_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, NFTContract);
    let client = NFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.init(&admin, &String::from_str(&env, "Stellar NFT"), &String::from_str(&env, "SNFT"));

    assert_eq!(client.name(), String::from_str(&env, "Stellar NFT"));
    assert_eq!(client.total_supply(), 0);

    let uri = String::from_str(&env, "https://example.com/nft/0");
    let id = client.mint(&user1, &uri);

    assert_eq!(id, 0);
    assert_eq!(client.total_supply(), 1);
    assert_eq!(client.owner_of(&0), user1);
    assert_eq!(client.token_uri(&0), uri);

    client.transfer(&user1, &user2, &0);
    assert_eq!(client.owner_of(&0), user2);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_already_initialized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NFTContract);
    let client = NFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin, &String::from_str(&env, "Name"), &String::from_str(&env, "Symbol"));
    client.init(&admin, &String::from_str(&env, "Name"), &String::from_str(&env, "Symbol"));
}

#[test]
#[should_panic]
fn test_mint_requires_admin() {
    let env = Env::default();
    // No mock_all_auths() here to check auth failure
    let contract_id = env.register_contract(None, NFTContract);
    let client = NFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);

    client.init(&admin, &String::from_str(&env, "Name"), &String::from_str(&env, "Symbol"));
    
    // This should fail because admin auth is required
    client.mint(&user1, &String::from_str(&env, "uri"));
}
