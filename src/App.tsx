/* eslint-disable eqeqeq */
import React from "react";
import "./App.css";
import { pxgLib, web3 } from "./pxgLib";
import tokens from "./tokens.json";
import abi from "./abi.json";

function App() {
  const [address, updateAddress] = React.useState("");
  const [value, updateValue] = React.useState("");
  const [error, updateError] = React.useState("");

  const [loading, updateLoading] = React.useState(true);
  const [nfts, updateNfts] = React.useState<any>(null);
  const [apiOffset, updateApiOffset] = React.useState(0);
  const [hideLoadMore, updateHideLoadMore] = React.useState(true);

  async function getNfts(offset = apiOffset) {
    updateLoading(true);
    const res = await fetch(
      `https://api.opensea.io/api/v1/assets?order_direction=asc&offset=${offset}&limit=${50}&asset_contract_address=0x8b7f316b8b771d7cb82192ef189ce5e3c29af532`,
      {
        headers: {
          "X-API-KEY": "72fdb7cff7064b70807e0f32d4ec3fa3",
        },
      }
    );

    if (!res.ok) {
      return;
    }

    const json = await res.json();

    if (Array.isArray(json?.assets) && json.assets.length === 0) {
      updateHideLoadMore(true);
    } else {
      updateHideLoadMore(false);
    }

    updateNfts((c: any) => [...(c ?? []), ...json?.assets]);
    updateLoading(false);
  }

  React.useEffect(() => {
    const fn = async () => {
      getNfts();
    };
    fn();
  }, [apiOffset]);

  const connect = async () => {
    try {
      await pxgLib.enable();
      if (!pxgLib.accounts?.[0]) return;
      updateAddress(pxgLib.accounts[0]);
    } catch (e) {
      // no op
    }
  };

  async function claim(e: any) {
    e.preventDefault();
    updateError("");

    if (!pxgLib.web3) return;

    const contract = new web3.eth.Contract(
      // @ts-ignore
      abi,
      "0x8B7F316B8B771d7Cb82192EF189cE5E3c29af532"
    );

    const num = parseInt(value);

    if (Number.isNaN(num)) {
      updateError("Enter a valid number");
      return;
    }

    // @ts-ignore
    const data = tokens.find((token) => token.bigGlyph == num);

    if (!data) {
      updateError("Enter a valid Pixelglyph token ID");
      return;
    }

    console.log(
      "Here is the data that will be submitted with the mint transaction. The leaf property is not used."
    );
    console.log(data);

    try {
      // await contract.methods
      //   .mint(data.bigGlyph, data.lilGlyph, data.proof)
      //   .send({
      //     from: address,
      //   });
      await web3.eth.getMaxPriorityFeePerGas().then((tip: any) => {
        web3.eth.getBlock("pending").then((block: any) => {
          const baseFee = Number(block.baseFeePerGas);
          const max = Number(tip) + baseFee - 1; // less than the sum
          return contract.methods
            .mint(data.bigGlyph, data.lilGlyph, data.proof)
            .send({
              from: pxgLib?.accounts?.[0],
              maxFeePerGas: (max * 1.4).toFixed(0),
              maxPriorityFeePerGas: (Number(tip) * 1.5).toFixed(0),
            });
        });
      });
    } catch (e) {
      // @ts-ignore
      updateError(e.message);
    }
  }

  return (
    <>
      <div style={{ maxWidth: "500px" }}>
        <h1>Lil' Glyphs</h1>
        {!pxgLib.hasProvider && (
          <p>Please install MetaMask to mint Lil' Glyphs.</p>
        )}

        {pxgLib.hasProvider && !address && (
          <div className="item">
            <button onClick={connect}>Connect to mint</button>
          </div>
        )}

        {address && (
          <div className="item">
            <form onSubmit={claim}>
              <div>
                <label>Enter original Pixelglyph token ID to claim:</label>
              </div>
              <div className="item">
                <input
                  placeholder="Token ID"
                  value={value}
                  onChange={(e) => updateValue(e.currentTarget.value)}
                  type="text"
                />
              </div>
              <div>
                <button>Claim</button>
              </div>
              {error && (
                <div style={{ color: "red" }} className="item">
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>
        )}

        <div className="item">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://etherscan.io/address/0x8b7f316b8b771d7cb82192ef189ce5e3c29af532#code"
          >
            Contract on Etherscan: 0x8b7f316b8b771d7cb82192ef189ce5e3c29af532
          </a>
        </div>

        <div className="item">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://opensea.io/collection/lil-glyphs"
          >
            View on OpenSea
          </a>
        </div>

        <div className="item">
          <p>
            Lil' Glyphs are fully on-chain little Pixelglyphs. The original{" "}
            <a href="https://pixelglyphs.io">Pixelglyphs</a> are on-chain in the
            sense that the image can be recreated using event data and script
            which are stored on-chain. There is nothing wrong with this
            approach, but Lil' Glyphs takes a different approach that allows for
            dynamic image and metadata creation directly within the NFT smart
            contract.
          </p>
          <p>
            Original Pixelglyphs are created using a 5x10 pixel matrix of 0's
            and 1's. The matrix is passed to a script which then renders the
            image in your browser. Lil' Glyphs puts this pixel matrix on-chain
            in an efficient way. The pixel matrix can be recreated at anytime
            directly from the smart contract. Lil' Glyphs packs each item of the
            pixel matrix into the first 50 bits of an unsigned 256 bit integer
            within the NFT smart contract. The result is a unique number which
            acts as the Lil' Glyph token ID. From this number the original pixel
            matrix can be re-created by looping through the first 50 bits.
          </p>
          <p>
            The image is a dynamic SVG created directly in the smart contract.
            The smart contract uses a Base64 library (taken from Loot) to Base64
            encode the JSON and the SVG within the standard tokenURI function.
            This means that Lil' Glyphs will never need to rely on anything
            other than the smart contract itself. All data is stored on and
            accessible directly from the smart contract.
          </p>
          <p>
            The Lil' Glyph smart contract uses a Merkle tree to allow
            participants to claim Lil' Glyphs in a trustless manner. It would
            not have been cost effective to add all 10,000 Lil' Glyph token IDs
            to the smart contract directly. Instead when you claim your Lil'
            Glyph you pass in the original token ID, the new Lil' Glyph token
            ID, and a proof. Using a Merkle tree ensures that the original token
            ID and new token ID <strong>must</strong> be the correct values.
            This also allows us to verify that the person claiming the Lil'
            Glyphs owns the Pixelglyph from which the Lil' Glyph is derived.
          </p>
        </div>
      </div>
      <div className="item nftWrap">
        {nfts && nfts.length > 0 && (
          <>
            {nfts.map((nft: any, i: number) => {
              return (
                <div key={i} className="nft">
                  <img src={nft.image_preview_url} />
                </div>
              );
            })}
            {!hideLoadMore && (
              <div style={{ alignSelf: "center" }}>
                <button
                  onClick={() => updateApiOffset((offset) => offset + 50)}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
