const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { mplTokenMetadata, createNft } = require('@metaplex-foundation/mpl-token-metadata');
const { keypairIdentity, generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const fs = require('fs');

const METADATA_URI = 'https://raw.githubusercontent.com/innovix360-SM/scaloneta-landing/main/ip_certificate.json';
const KEYPAIR_PATH = process.argv[2] || `${process.env.HOME}/.config/solana/id.json`;

async function mintCertificate() {
  console.log('Conectando a Solana mainnet...');
  const umi = createUmi('https://rpc.ankr.com/solana').use(mplTokenMetadata());

  const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairData));
  umi.use(keypairIdentity(keypair));

  console.log('Wallet:', keypair.publicKey);

  const nftSigner = generateSigner(umi);
  console.log('NFT address que se minteara:', nftSigner.publicKey);

  console.log('Minteando certificado IP on-chain...');
  const tx = await createNft(umi, {
    mint: nftSigner,
    name: 'LaScalonetaCoin — Certificado de Autoria IP',
    symbol: 'SCALONETA-IP',
    uri: METADATA_URI,
    sellerFeeBasisPoints: percentAmount(0),
    isMutable: false,
    creators: [{ address: keypair.publicKey, verified: true, share: 100 }],
  }).sendAndConfirm(umi);

  console.log('\n✅ CERTIFICADO IP MINTEADO EXITOSAMENTE');
  console.log('NFT Address:', nftSigner.publicKey);
  console.log('TX Signature:', Buffer.from(tx.signature).toString('base64'));
  console.log('\nVerificar en Solscan:');
  console.log('https://solscan.io/token/' + nftSigner.publicKey);
}

mintCertificate().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
