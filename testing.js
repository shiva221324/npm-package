import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";

// async function updatePackageJson(deployPath) {
//   const packageJsonPath = path.join(deployPath, "package.json");
//   console.log("packageJsonPath:", packageJsonPath); // Debugging log
//   const packageJson = await fs.readJson(packageJsonPath);
//   console.log("packageJson:", packageJson); // Debugging log
// }

// updatePackageJson("../tourism-plan");

const data=await exec("npm i gh-pages", { cwd: "../tourism-plan" });
console.log(data);
