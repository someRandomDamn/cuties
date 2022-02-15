# Cuties

Commands


### Install dependencies

```
npm i
```

## Launch ganache

```
npm run ganache
```


## Deploy on Bsc testnet
``` 
npm run migrate-bscTestnet
```


## Deploy on development
Ganache should be launched, to run tests

```
npm run migrate-development
```

## Test
Ganache should be launched, to run tests

```
npm run test
```

## To verify
Instead of 0x5B73Fe4DD1bcCD70fA5F7DC038C8DAc7D1af498e - use your deployed smart contract address

```
./node_modules/.bin/truffle run verify CutiesToken@0x5B73Fe4DD1bcCD70fA5F7DC038C8DAc7D1af498e --network bscTestnet
```
