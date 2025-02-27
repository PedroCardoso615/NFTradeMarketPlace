import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/nft');
        const data = await res.json(); // Await JSON parsing
        setNfts(data.data); // Use `data.data` instead of `data.nfts`
        console.log(data);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>NFT Listings</h1>
      {nfts.length > 0 ? (
        nfts.map((nft) => (
          <div key={nft._id}>
            <h2>{nft.NFTName}</h2>
            <p>{nft.description}</p>
            <p>Price: {nft.price} NFTokens</p>
            <p>Owner: {nft.owner.fullname}</p>
            <img src={nft.image} alt={nft.NFTName} width="200" />
          </div>
        ))
      ) : (
        <p>Loading NFTs...</p>
      )}
    </div>
  );
}

export default App;
