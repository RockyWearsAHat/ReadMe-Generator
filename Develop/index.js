// TODO: Include packages needed for this application
import chalk from "chalk";
import inquirer from "inquirer";

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

const RDMEsections = [];

const questions = [
  new InquirerQuestion(
    InquirerTypes.input,
    chalk.blue("What would you like to title this readme file?"),
    "title"
  ),
  new InquirerQuestion(
    InquirerTypes.confirm,
    "Would you like to create a new section in this file?",
    "selection"
  ),
  new InquirerQuestion(
    InquirerTypes.list,
    "Would you like to use a quick title or create a new section?",
    "sectionTitle",
    ["Install", "Usage", "Contributing", "(+) New"]
  ),
  new InquirerQuestion(
    InquirerTypes.input,
    chalk.blue("What would you like to title this section?"),
    "sectionTitle"
  ),
  new InquirerQuestion(
    InquirerTypes.confirm,
    "Is this layout good? Y to confirm N to edit, rearrange, or delete",
    "selection"
  ),
  new InquirerQuestion(
    InquirerTypes.input,
    "What would you like to rename this section to?",
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
      "Invalid question object passed to the inquirer question constructor, please either specifiy a valid array index in the questions array, or pass a valid question object"
    );
    return null;
  }
};

const printCurrentReadmeSections = () => {
  if (RDMEsections.length > 0) {
    console.log(chalk.bgGreen(" - Current Sections - "));
    RDMEsections.forEach((val) => console.log(val.name));
  } else {
    console.log(chalk.bgRed(" - Currently No Sections - "));
  }
};

const clearConsole = () => {
  console.clear();
};

const reindexReadMeSections = () => {
  console.log("reindexing!");
  let currentSectionIndex = 0;
  RDMEsections.forEach((val) => {
    val.value = currentSectionIndex;
    currentSectionIndex++;
  });
};

// TODO: Create an array of questions for user input

// TODO: Create a function to write README file
function writeToFile(fileName, data) {}

// TODO: Create a function to initialize app
async function init() {
  clearConsole();
  const q1Ans = await askInquirerQuestion(0);
  console.log(q1Ans.title);
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
        "Select section to edit",
        "section",
        //This inquirer question must be constructed here because the RDMEsections modify over time, constructing it before in the array will always have the
        //RDMEsections as blank
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
    } else if (
      typeof selectedSection.section === "string" &&
      selectedSection.section.toLowerCase() == "< back"
    ) {
    } else {
      let sectionAction = await askInquirerQuestion(
        new InquirerQuestion(
          InquirerTypes.list,
          //Yet again, because this question takes into account something that was constructed before rather than being static this object must be created here
          `What would you like to do with the section ${
            RDMEsections[selectedSection.section].name
          }`,
          "action",
          ["Move", "Rename", "Delete", "< Back"]
        )
      );

      switch (sectionAction.action) {
        case "Move":
          clearConsole();
          let nonSelectedSections = [];
          RDMEsections.forEach((val) => {
            if (val.name != RDMEsections[selectedSection.section].name)
              nonSelectedSections.push(val);
          });
          let sectionToMoveRelativeTo = await askInquirerQuestion(
            new InquirerQuestion(
              InquirerTypes.list,
              `Select section you would like to move ${
                RDMEsections[selectedSection.section].name
              } above/below`,
              "section",
              //Same as ln 150/151
              nonSelectedSections
            )
          );

          let sectionToMoveAction = await askInquirerQuestion(
            new InquirerQuestion(
              InquirerTypes.list,
              `How would you like to move the ${
                RDMEsections[selectedSection.section].name
              } section?`,
              "selectedAction",
              [
                `Above ${RDMEsections[sectionToMoveRelativeTo.section].name}`,
                `Below ${RDMEsections[sectionToMoveRelativeTo.section].name}`,
                "< Back",
              ]
            )
          );

          let removedSect, index;
          switch (true) {
            case sectionToMoveAction.selectedAction.indexOf("Above ") > -1:
              reindexReadMeSections();
              removedSect = RDMEsections[selectedSection.section];
              RDMEsections.splice(selectedSection.section, 1);
              console.log(sectionToMoveRelativeTo.section);
              RDMEsections.splice(
                sectionToMoveRelativeTo.section - 1 >= 0
                  ? sectionToMoveRelativeTo.section - 1
                  : 0,
                0,
                removedSect
              );
              reindexReadMeSections();
              break;
            case sectionToMoveAction.selectedAction.indexOf("Below ") > -1:
              reindexReadMeSections();
              removedSect = RDMEsections[selectedSection.section];
              RDMEsections.splice(selectedSection.section, 1);
              console.log(sectionToMoveRelativeTo.section);
              RDMEsections.splice(
                sectionToMoveRelativeTo.section + 1 <= RDMEsections.length
                  ? sectionToMoveRelativeTo.section + 1
                  : RDMEsections.length,
                0,
                removedSect
              );
              reindexReadMeSections();
              break;
            case sectionToMoveAction.selectedAction.indexOf("< Back") > -1:
              break;
          }
          break;
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

    // clearConsole();
    printCurrentReadmeSections();
    confirmSections = await askInquirerQuestion(4);
  }
}

// Function call to initialize app
init();
