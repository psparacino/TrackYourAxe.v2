const fs = require("fs");

async function main() {
  const InstrumentDeedToken = await ethers.getContractFactory(
    "InstrumentDeedToken"
  );
  const instrumentdeedtoken = await InstrumentDeedToken.deploy();

  fs.writeFileSync(
    "./src/deployedContractAddresses/instrumenttokenaddress.json",
    `{ "address": "${instrumentdeedtoken.address}" }`,
    (err) => {
      if (err) {
        console.log(err, "error");
      } else {
        console.log("InstrumentDeedToken address written successfully\n");
      }
    }
  );

  console.log("InstrumentDeedToken deployed to:", instrumentdeedtoken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
