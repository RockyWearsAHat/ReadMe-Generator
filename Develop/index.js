// TODO: Include packages needed for this application
import chalk from "chalk";
import inquirer from "inquirer";
import editor from "@inquirer/editor";

const InquirerTypes = {
  input: "input",
  number: "number",
  confirm: "confirm",
  list: "list",
  rawlist: "rawlist",
  expand: "expand",
  checkbox: "checkbox",
  password: "password",
  editor: "editor",
};

class InquirerQuestion {
  type = "";
  message = "";
  writeName = "";
  choices = [];

  constructor(
    type = InquirerTypes.confirm,
    message = "Default question",
    writeName = "val",
    choices = []
  ) {
    this.type = type;
    this.message = message;
    this.writeName = writeName;
    if (choices.length > 0) this.choices = choices;
  }
}

let RDMEsections = [];

const questions = [
  new InquirerQuestion(
    InquirerTypes.input,
    chalk.blue("What would you like to title this readme file?"),
    "title"
  ),
  new InquirerQuestion(
    InquirerTypes.confirm,
    chalk.blue("Would you like to add a new section?"),
    "selection"
  ),
  new InquirerQuestion(
    InquirerTypes.list,
    chalk.green("Select a default title or create your own"),
    "sectionTitle",
    ["Install", "Usage", "Contributing", "(+) New"]
  ),
  new InquirerQuestion(
    InquirerTypes.input,
    chalk.green("What would you like to title this section?"),
    "sectionTitle"
  ),
  new InquirerQuestion(
    InquirerTypes.confirm,
    chalk.blue("Confirm Base Layout?"),
    "selection"
  ),
  new InquirerQuestion(
    InquirerTypes.input,
    chalk.blue("What would you like to rename this section to?"),
    "name"
  ),
];

const askInquirerQuestion = async (questionIndexOrObj) => {
  if (typeof questionIndexOrObj === "number")
    return await inquirer.prompt({
      type: questions[questionIndexOrObj].type,
      message: questions[questionIndexOrObj].message,
      name: questions[questionIndexOrObj].writeName,
      choices: questions[questionIndexOrObj].choices,
    });
  else if (questionIndexOrObj instanceof InquirerQuestion)
    return await inquirer.prompt({
      type: questionIndexOrObj.type,
      message: questionIndexOrObj.message,
      name: questionIndexOrObj.writeName,
      choices: questionIndexOrObj.choices,
    });
  else {
    console.log(
      "Invalid question object passed to the inquirer question constructor"
    );
    return null;
  }
};

const printCurrentReadmeSections = () => {
  if (RDMEsections.length > 0) {
    console.log(chalk.green(" - All Sections - "));
    RDMEsections.forEach((val) => console.log(val.name));
  } else {
    console.log(chalk.red(" - No Sections Yet - "));
  }
};

const clearConsole = () => {
  console.clear();
};

const reindexReadMeSections = () => {
  let currentSectionIndex = 0;
  RDMEsections.forEach((val) => {
    val.value = currentSectionIndex;
    // console.log(val);
    currentSectionIndex++;
  });
};

// #region File Watcher AI Generated But No Way To Watch For File Closure
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import robot from "robotjs";
import os from "os";

//This is not a good way to edit content of a file, it cannot detect when the file is actually closed hence as soon as save is pressed it will read the file and return the content
//Doesn't matter if the user still has the editor open
const openFileAndWaitForUpdates = async (fileName, currentContent) => {
  // Create the file in the current working directory
  const filePath = path.join(process.cwd(), fileName);
  if (currentContent) {
    fs.writeFileSync(filePath, currentContent.fileContents);
  } else {
    fs.writeFileSync(filePath, "");
  }

  // Open the file with Visual Studio Code
  const editorCommand = "code";
  const editorArgs = [filePath];
  spawn(editorCommand, editorArgs);

  let lastModifiedTime = (await fs.promises.stat(filePath)).mtimeMs;

  return new Promise((resolve, reject) => {
    const watcher = fs.watch(filePath, async (eventType, filename) => {
      if (filename && eventType === "change") {
        try {
          const { mtimeMs: currentModifiedTime } = await fs.promises.stat(
            filePath
          );

          // Check if the modification time has changed
          if (currentModifiedTime > lastModifiedTime) {
            lastModifiedTime = currentModifiedTime;

            // Wait for the file to be unlocked (closed)
            await new Promise((resolve, reject) => {
              const intervalId = setInterval(async () => {
                try {
                  const fileHandle = await fs.promises.open(filePath, "r");
                  fileHandle.close();
                  clearInterval(intervalId);
                  resolve();
                } catch (err) {
                  // File is still locked, keep trying
                }
              }, 100);
            });

            const updatedContent = await fs.promises.readFile(filePath, "utf8");
            // console.log("File has been closed and saved.");
            // console.log("Updated content:", updatedContent);

            // Stop watching the file
            watcher.close();

            // Remove the file
            await fs.promises.unlink(filePath);

            // Close the editor
            const modifier = os.platform() === "win32" ? "control" : "command";
            robot.keyTap("w", modifier);

            // Resolve the promise with the updated content
            resolve(updatedContent);
          }
        } catch (err) {
          reject(err);
        }
      }
    });
  });
};
// #endregion

// TODO: Create a function to write README file
function writeToFile(fileName, data) {
  try {
    fs.writeFileSync("out/" + fileName, data);
    console.log(
      chalk.green(
        `File written successfully! Check the out folder for the generated result at ${path.resolve(
          "out/" + fileName
        )}`
      )
    );
  } catch (err) {
    console.log(chalk.red(err));
  }
}

// TODO: Create a function to initialize app
async function init() {
  clearConsole();
  const q1Ans = await askInquirerQuestion(0);
  if (q1Ans.title == "") q1Ans.title = "README";
  clearConsole();

  printCurrentReadmeSections();
  let newSection = await askInquirerQuestion(1);

  while (newSection.selection) {
    let newSectionTitle = await askInquirerQuestion(2);
    if (newSectionTitle.sectionTitle.toLowerCase() == "(+) new") {
      newSectionTitle = await askInquirerQuestion(3);
    }
    RDMEsections.push({
      name: newSectionTitle.sectionTitle,
      value: RDMEsections.length,
    });
    clearConsole();
    printCurrentReadmeSections();
    reindexReadMeSections();
    newSection = await askInquirerQuestion(1);
  }

  clearConsole();
  printCurrentReadmeSections();

  let confirmSections = await askInquirerQuestion(4);

  while (!confirmSections.selection) {
    let needToReIndexSections = false;
    clearConsole();
    let selectedSection = await askInquirerQuestion(
      new InquirerQuestion(
        InquirerTypes.list,
        chalk.blue("Select section to edit"),
        "section",
        [...RDMEsections, "(+) New", "< Back"]
      )
    );

    if (
      typeof selectedSection.section === "string" &&
      selectedSection.section.toLowerCase() == "(+) new"
    ) {
      let newSectionTitle = await askInquirerQuestion(3);
      RDMEsections.push({
        name: newSectionTitle.sectionTitle,
        value: RDMEsections.length,
      });
      reindexReadMeSections();
    } else if (
      typeof selectedSection.section === "string" &&
      selectedSection.section.toLowerCase() == "< back"
    ) {
    } else {
      let sectionAction = await askInquirerQuestion(
        new InquirerQuestion(
          InquirerTypes.list,
          //Yet again, because this question takes into account something that was constructed before rather than being static this object must be created here
          chalk.green(
            `What would you like to do with the section ${
              RDMEsections[selectedSection.section].name
            }`
          ),
          "action",
          ["Rename", "Delete", "< Back"]
        )
      );

      //I tried to make a move, but I'm struggling to get this done, I'm going to move on to the next part of the assignment and come back to this if I come back to this
      switch (sectionAction.action) {
        //         case "Move":
        //           clearConsole();
        //           const nonSelectedSections = RDMEsections.filter(
        //             (val) => val.value != RDMEsections[selectedSection.section].value
        //           );

        //           let sectionToMoveRelativeTo = await askInquirerQuestion(
        //             new InquirerQuestion(
        //               InquirerTypes.list,
        //               chalk.green(
        //                 `Select section you would like to move ${
        //                   RDMEsections[selectedSection.section].name
        //                 } above/below
        //  -- Sections in order -- `
        //               ),
        //               "section",
        //               nonSelectedSections
        //             )
        //           );

        //           let sectionToMoveAction = await askInquirerQuestion(
        //             new InquirerQuestion(
        //               InquirerTypes.list,
        //               chalk.green(
        //                 `How would you like to move the ${
        //                   RDMEsections[selectedSection.section].name
        //                 } section?`
        //               ),
        //               "selectedAction",
        //               [
        //                 `Above ${RDMEsections[sectionToMoveRelativeTo.section].name}`,
        //                 `Below ${RDMEsections[sectionToMoveRelativeTo.section].name}`,
        //                 "< Back",
        //               ]
        //             )
        //           );

        //           let storedSelectedSec;
        //           switch (true) {
        //             case sectionToMoveAction.selectedAction.indexOf("Above ") > -1:
        //               RDMEsections.splice(
        //                 RDMEsections[sectionToMoveRelativeTo.section].value < 0
        //                   ? 0
        //                   : RDMEsections[sectionToMoveRelativeTo.section].value,
        //                 0,
        //                 RDMEsections[selectedSection.section]
        //               );
        //               console.log(RDMEsections[selectedSection.section + 1].value + 1);
        //               // RDMEsections.splice(
        //               //   RDMEsections[selectedSection.section + 1].value + 1,
        //               //   1
        //               // );
        //               reindexReadMeSections();
        //               break;
        //             case sectionToMoveAction.selectedAction.indexOf("Below ") > -1:
        //               storedSelectedSec = RDMEsections[selectedSection.section];
        //               RDMEsections.splice(
        //                 RDMEsections[sectionToMoveRelativeTo.section].value + 1,
        //                 0,
        //                 RDMEsections[selectedSection.section]
        //               );

        //               console.log(storedSelectedSec);
        //               break;
        //             case sectionToMoveAction.selectedAction.indexOf("< Back") > -1:
        //               break;
        //           }
        //           break;
        case "Rename":
          clearConsole();
          let newSectionName = await askInquirerQuestion(5);
          RDMEsections[selectedSection.section].name = newSectionName.name;
          break;
        case "Delete":
          clearConsole();
          needToReIndexSections = true;
          RDMEsections.splice(selectedSection.section, 1);
          break;
        case "< Back":
          break;
      }

      if (needToReIndexSections) {
        reindexReadMeSections();
      }
    }

    printCurrentReadmeSections();
    confirmSections = await askInquirerQuestion(4);
  }

  //Once sections confirmed, ask for content for each section
  let addingContent = true;
  let content = [];
  while (addingContent) {
    clearConsole();
    const sectionToAddContentTo = await askInquirerQuestion(
      new InquirerQuestion(
        "list",
        "Select a section to add content to (when finished hit CMD+S or CTRL+S to save and close the file)",
        "section",
        [...RDMEsections, "< Exit Editing"]
      )
    );

    if (sectionToAddContentTo.section === "< Exit Editing") {
      addingContent = false;
      break;
    }

    const fileName = `${RDMEsections[sectionToAddContentTo.section].name}.md`;
    const currentContent = content.find(
      (val) => val.section === sectionToAddContentTo.section
    );

    // console.log(currentContent);
    const fileContents = await openFileAndWaitForUpdates(
      fileName,
      currentContent
    );
    // console.log("File contents:", fileContents);
    if (!currentContent) {
      content.push({ section: fileName, fileContents });
    } else {
      content.find(
        (val) => val.section === sectionToAddContentTo.section
      ).fileContents = fileContents;
    }
  }

  const liscenseChoice = await askInquirerQuestion(
    new InquirerQuestion(
      "list",
      "Select a liscense for your project",
      "liscense",
      ["MIT", "Apache 2.0", "GNU GPLv3.0", "ISC", "None"]
    )
  );

  const liscenseName = await askInquirerQuestion(
    new InquirerQuestion(
      "input",
      "What is your name/the organization name for this liscense?",
      "name"
    )
  );

  let liscenseYear = await askInquirerQuestion(
    new InquirerQuestion(
      "list",
      "What year would you like to use for the liscense?",
      "year",
      [new Date().getFullYear(), "Enter my own year"]
    )
  );

  if (liscenseYear.year == "Enter my own year") {
    liscenseYear = await askInquirerQuestion(
      new InquirerQuestion(
        "input",
        "What year(s) would you like to use for the liscense?",
        "year"
      )
    );
  }

  switch (liscenseChoice.liscense) {
    case "MIT":
      content.push({
        fileContents: `# Liscensing\n\nCopyright (c) ${liscenseYear.year} ${liscenseName.name}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.`,
      });
      break;
    case "Apache 2.0":
      content.push({
        fileContents: `# Liscensing\n\nCopyright ${liscenseYear.year} ${liscenseName.name}\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n\thttp://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.`,
      });
      break;
    case "GNU GPLv3.0":
      const programName = await askInquirerQuestion(
        new InquirerQuestion(
          "input",
          "What is the name of the program?",
          "name"
        )
      );
      const programDescription = await askInquirerQuestion(
        new InquirerQuestion(
          "input",
          "What is the description of the program?",
          "description"
        )
      );
      content.push({
        fileContents: `# Liscensing\n\n${programName.name} | ${programDescription.description}\nCopyright (C) ${liscenseYear.year} ${liscenseName.name}\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU General Public License as published by\nthe Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\nGNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.`,
      });
      break;
    case "ISC":
      content.push({
        fileContents: `# Liscensing\n\nCopyright (c) ${liscenseYear.year} ${liscenseName.name}\n\nPermission to use, copy, modify, and/or distribute this software for any\npurpose with or without fee is hereby granted, provided that the above\ncopyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\nREGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\nAND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\nINDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\nLOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\nOTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\nPERFORMANCE OF THIS SOFTWARE.`,
      });
      break;
  }

  writeToFile(
    `${q1Ans.title}.md`,
    content.map((val) => val.fileContents).join("\n\n")
  );
}

// Function call to initialize app
init();
