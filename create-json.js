import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
import * as fs from "fs";

// console.log(neru.getAppUrl()); // https://api-us.vonage.com/v1/neru/i/neru-4f2ff535-debug-debug
// File path where you want to create the JSON file
const filePath = "./public/config.json";
let jsonData;

export function createFile(LANGUAGE, SFMC_APP_EXT_KEY) {
  // Data to be written to the JSON file
  const data = {
    workflowApiVersion: "1.1",
    metaData: {
      icon: "images/icon.png",
      iconSmall: "images/iconSmall.png",
      category: "message",
    },
    type: "REST",
    lang: {
      [`${LANGUAGE}`]: {
        name: "SMS",
        description:
          "Send Vonage Messages with Salesforce Marketing Cloud Journey Builder",
      },
    },
    arguments: {
      execute: {
        inArguments: [],
        outArguments: [],
        url: `${neru.getAppUrl()}/execute`,
      },
    },
    configurationArguments: {
      applicationExtensionKey: `${SFMC_APP_EXT_KEY}`,
      save: {
        url: `${neru.getAppUrl()}/save`,
      },
      publish: {
        url: `${neru.getAppUrl()}/publish`,
      },
      stop: {
        url: `${neru.getAppUrl()}/stop`,
      },
      validate: {
        url: `${neru.getAppUrl()}/validate`,
      },
    },
    wizardSteps: [
      {
        label: "Configuration",
        key: "step1",
      },
    ],
    userInterfaces: {
      configModal: {
        height: 900,
        width: 1200,
      },
    },
    schema: {
      arguments: {
        execute: {
          inArguments: [
            {
              textMessage: {
                dataType: "Text",
                isNullable: false,
                direction: "out",
              },
            },
          ],
          outArguments: [],
        },
      },
    },
  };
  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    console.error("File already exists. Aborting operation.");
    // readFile();
  } else {
    // Convert JavaScript object to JSON string
    jsonData = JSON.stringify(data, null, 2); // The second argument (null) is for replacer function and the third argument (2) is for indentation.

    // Write data to the file
    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been created successfully!");
        // readFile();
      }
    });
  }
}

export function readFile() {
  // Read existing data from JSON file
  fs.readFile(filePath, "utf8", (err, jsonData) => {
    if (err) {
      console.error("Error reading JSON file:", err);
    } else {
      try {
        // Parse JSON data from file
        const data = JSON.parse(jsonData);

        console.log(data);
      } catch (parseError) {
        console.error("Error parsing JSON file:", parseError);
      }
    }
  });
}
