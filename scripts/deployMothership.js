const fs = require('fs')


const token = require('../src/deployedContractAddresses/instrumenttokenaddress.json').address

async function main() {

    
    const Mothership = await ethers.getContractFactory("Mothership");
    
    //pass token address into Mothership constructor
    const mothership = await Mothership.deploy(token);

    console.log("Mothership deployed to:", mothership.address);

  
    fs.writeFileSync('./src/deployedContractAddresses/mothershipaddress.json', `{ "address": "${mothership.address}" }`, (err) => {
      if (err) console.log(err); else { console.log("Mothership address written successfully\n"); }
      })

    
  }

  
  
  main()
    .then(() => process.exit(0))  
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


      

/*

  fs.appendFile('DeployedContractAddresses.txt', 
  'Mothership Address:' + `${contractAddress}`)
  .then(() => {

      // readFile() method reads the file
      // and returns buffer form of the data 
      return fs.promises.readFile('DeployedContractAddresses.txt')
  })

  .then(buff => {

      // Appended data
      const content = buff.toString()
      console.log(`Stored Mothership Address : ${content}`)
  })

  .catch(err => {
      console.log(err, "write error")
  })

*/

 