/* eslint-disable eqeqeq */
import React from "react";
import "./App.css";
import { pxgLib } from "./pxgLib";
import tokens from "./tokens.json";
import abi from "./abi.json";

function App() {
  const [address, updateAddress] = React.useState("");
  const [value, updateValue] = React.useState("");
  const [error, updateError] = React.useState("");

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
    const contract = new pxgLib.web3.eth.Contract(
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

    try {
      await contract.methods
        .mint(data.bigGlyph, data.lilGlyph, data.proof)
        .send({ from: address });
    } catch (e) {
      // @ts-ignore
      updateError(e.message);
    }
  }
  return (
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
          which are stored on-chain. There is nothing wrong with this approach,
          but Lil' Glyphs takes a different approach that allows for dynamic
          image and metadata creation directly within the NFT smart contract.
        </p>
        <p>
          Original Pixelglyphs are created using a 5x10 pixel matrix of 0's and
          1's. The matrix is passed to a script which then renders the image in
          your browser. Lil' Glyphs puts this pixel matrix on-chain in an
          efficient way. The pixel matrix can be recreated at anytime directly
          from the smart contract. Lil' Glyphs packs each item of the pixel
          matrix into the first 50 bits of an unsigned 256 bit integer within
          the NFT smart contract. The result is a unique number which acts as
          the Lil' Glyph token ID. From this number the original pixel matrix
          can be re-created by looping through the first 50 bits.
        </p>
        <p>
          The image is a dynamic SVG created directly in the smart contract. The
          smart contract uses a Base64 library (taken from Loot) to Base64
          encode the JSON and the SVG within the standard tokenURI function.
          This means that Lil' Glyphs will never need to rely on anything other
          than the smart contract itself. All data is stored and accessible
          directly from the smart contract.
        </p>
        <p>
          The Lil' Glyph smart contract uses a Merkle tree to allow participants
          to claim Lil' Glyphs in a trustless manner. It would not have been
          cost effective to add all 10,000 Lil' Glyph token IDs to the smart
          contract directly. Instead when you claim your Lil' Glyph you pass in
          the original token ID, the new Lil' Glyph token ID, and a proof. Using
          a Merkle tree ensures that the original token ID and new token ID{" "}
          <strong>must</strong> be the correct values. This also allows us to
          verify that the person claiming the Lil' Glyphs owns the Pixelglyph
          from which the Lil' Glyph is derived.
        </p>
      </div>
    </div>
  );
}

export default App;
