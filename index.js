import inquirer from "inquirer";
import { deployToGitHub } from "./github.js";
// import { deployToVercel } from "./vercel.js";
// import { deployToNetlify } from "./netlify.js";

async function main() {
  const { service } = await inquirer.prompt([
    {
      type: "list",
      name: "service",
      message: "Which service do you want to deploy to?",
      choices: ["GitHub", "Vercel", "Netlify"],
    },
  ]);

  switch (service) {
    case "GitHub":
      await deployToGitHub();
      break;
    // case "Vercel":
    //   await deployToVercel();
    //   break;
    // case "Netlify":
    //   await deployToNetlify();
    //   break;
  }
}

main();
