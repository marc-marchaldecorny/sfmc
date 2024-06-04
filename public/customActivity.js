define(["postmonger"], function (Postmonger) {
  "use strict";

  var connection = new Postmonger.Session();
  var activityData = {};
  var schema = {};
  var journeyData = {};
  var steps = [{ label: "Step 1", key: "step1" }];
  var currentStep = steps[0].key;
  var activityName = undefined;
  var senderID = "#senderID";
  var templateName = "#template-name";
  var templateLanguage = "#template-language";
  var templateText = "#template-text";
  var templatePlaceholders = "#template-placeholders";
  var placeholderListSelector = "#placeholder-list";
  var activityNameSelector = "input#activity-name-input";
  var phoneSelector = "#phone-parameter";
  var phoneSelectorValue = undefined;
  var dataExtensionWarningSelector = "#data-extension-warning";

  $(window).ready(onRender);

  connection.on("initActivity", onInitActivity);
  connection.on("requestedSchema", onRequestedSchema);
  connection.on("requestedInteraction", onRequestedInteraction);
  connection.on("clickedNext", onSave); // onSave() IS INVOKED WHEN DONE BUTTON IS PRESSED
  connection.on("gotoStep", onGotoStep);

  function onRender() {
    connection.trigger("ready");
    connection.trigger("requestSchema");
    connection.trigger("requestInteraction");

    $(phoneSelector).on("change", function () {
      onInputChange();
    });
  }

  function onInputChange() {
    var validInput = isValidInput();
    connection.trigger("updateButton", { button: "next", enabled: validInput });
  }

  // WHEN THE VONAGE ICON IS CLICKED
  function onInitActivity(data) {
    console.log("🟡 onInitActivity data:", data.arguments);
    if (data) {
      activityData = data;
      activityName = "WA Activity"; // activityData.name;
    }

    var hasInArguments = Boolean(
      activityData["arguments"] &&
        activityData["arguments"].execute &&
        activityData["arguments"].execute.inArguments &&
        activityData["arguments"].execute.inArguments.length > 0
    );

    var inArguments = hasInArguments
      ? activityData["arguments"].execute.inArguments
      : {};

    $.each(inArguments, function (index, inArgument) {
      $.each(inArgument, function (key, val) {
        // console.log('each inArguments key:', key, 'val:', val);
        if (key === "phone") {
          phoneSelectorValue = val;
        }

        if (key === "template-name") {
          // console.log('template-name val:', val);
          templateName = val;
          $("#template-name").val(val);
        }

        if (key === "template-language") {
          templateLanguage = val;
          $("#template-language").val(val);
        }

        if (key === "template-text") {
          templateText = val;
          $("#template-text").val(val);
        }

        if (key === "template-placeholders") {
          templatePlaceholders = val;
          $("#template-placeholders").val(val);
        }

        if (key === "senderID") {
          // console.log('senderID val:', val);
          senderID = val;
          $("#senderID").val(val);
        }
      });
    });

    if (activityName) {
      $(activityNameSelector).val(activityName);
    }
  }

  function onRequestedSchema(data) {
    schema = data["schema"];

    var schemaPresent = schema !== undefined && schema.length > 0;
    $(dataExtensionWarningSelector).toggle(!schemaPresent);

    schema;
    fillPlaceholderList(schema);
    fillPhoneCombobox(schema);
    connection.trigger("updateButton", {
      button: "next",
      enabled: isValidInput(),
    });
  }

  function fillPlaceholderList(schema) {
    if (schema !== undefined && schema.length > 0) {
      for (var i in schema) {
        var field = schema[i];
        var fieldName = extractFieldName(field);
        if (isEventDataSourceField(field)) {
          $(placeholderListSelector).append("<li>" + fieldName + "</li>");
        }
      }
    }
  }

  function fillPhoneCombobox(schema) {
    if (schema !== undefined && schema.length > 0) {
      for (var i in schema) {
        var field = schema[i];
        var fieldName = extractFieldName(field);
        var fieldValue = "{{" + sanitize(field.key) + "}}";
        if (isEventDataSourceField(field)) {
          var selected = fieldValue === phoneSelectorValue;
          $(phoneSelector).append(
            new Option(fieldName, fieldValue, false, selected)
          );
        }
      }
    }
  }

  function onRequestedInteraction(data) {
    journeyData = data;
    activityName = getActivityName();
    $(activityNameSelector).val(activityName);
  }

  function onSave() {
    console.log("onSave() activityData.arguments:", activityData.arguments);
    activityData.name = "template-neru-messages"; // getActivityName();
    configureInArguments();
    configureOutArguments();
    configureOutArgumentsSchema();

    activityData["metaData"].isConfigured = true;
    connection.trigger("updateActivity", activityData);
  }

  // WILL OVERRIDE THE CONFIG.JSON ARGUMENTS
  // IS EXECUTED WHEN CLICKING DONE
  function configureInArguments() {
    console.log("💡 templateName", $("#template-name").val());
    console.log("💡 templateText", $("#template-text").val()); // Hi {{1}}, how are you?
    console.log("💡 templateLanguage", $("#template-language").val());
    console.log("💡 templatePlaceholders", $("#template-placeholders").val()); // {Name}
    // SAVE UI INPUT VALUES
    senderID = $("#senderID").val();
    templateName = $("#template-name").val();
    templateText = $("#template-text").val();
    templateLanguage = $("#template-language").val();
    templatePlaceholders = $("#template-placeholders").val();

    var inArguments = [];
    inArguments.push({ senderID: senderID });
    inArguments.push({ templateName: templateName });
    inArguments.push({ templateText: templateText });
    inArguments.push({ templateLanguage: templateLanguage });
    inArguments.push({ templatePlaceholders: templatePlaceholders });
    inArguments.push({ phone: getPhone() });
    inArguments.push({ activityName: activityName });

    // LOOP THE DATA EXTENSION
    if (schema !== undefined && schema.length > 0) {
      for (var i in schema) {
        var field = schema[i];
        if (isEventDataSourceField(field)) {
          var fieldName = extractFieldName(field);
          // console.log('ℹ️ field:', field);
          // console.log('ℹ️ fieldName:', fieldName);
          saveFieldToInArguments(field, fieldName, inArguments);
        }
      }
    }

    activityData["arguments"].execute.inArguments = inArguments;
  }

  function configureOutArguments() {
    var outArguments = [];
    outArguments.push(createOutArgument("vonage_wa_message_id"));
    outArguments.push(
      createOutArgument("vonage_wa_message_preliminary_status")
    );
    activityData["arguments"].execute.outArguments = outArguments;
  }

  function createOutArgument(name) {
    var outArgument = {};
    outArgument[createOutArgumentName(name)] = "String";
    return outArgument;
  }

  function configureOutArgumentsSchema() {
    var outArgumentsSchemaEntries = [];
    outArgumentsSchemaEntries.push(
      createOutArgumentSchemaEntry("vonage_wa_message_id")
    );
    outArgumentsSchemaEntries.push(
      createOutArgumentSchemaEntry("vonage_wa_message_preliminary_status")
    );
    activityData.schema["arguments"].execute.outArguments =
      outArgumentsSchemaEntries;
  }

  function createOutArgumentSchemaEntry(name) {
    var outArgumentSchemaEntry = {};
    outArgumentSchemaEntry[createOutArgumentName(name)] = {
      dataType: "Text",
      direction: "out",
    };
    return outArgumentSchemaEntry;
  }

  function onGotoStep(step) {
    showStep(step);
    connection.trigger("ready");
  }

  function showStep(step, stepIndex) {
    if (stepIndex && !step) {
      step = steps[stepIndex - 1];
    }

    currentStep = step;

    $(".step").hide();

    switch (currentStep.key) {
      case "step1":
        $("#step1").show();
        connection.trigger("updateButton", {
          button: "next",
          text: "Done",
          visible: true,
        });
        break;
    }
  }

  function createOutArgumentName(name) {
    return getActivityName() + "-" + name;
  }

  function isEventDataSourceField(field) {
    return !field.key.startsWith("Interaction.");
  }

  function extractFieldName(field) {
    var index = field.key.lastIndexOf(".");
    return field.key.substring(index + 1);
  }

  function saveFieldToInArguments(field, fieldName, inArguments) {
    var obj = {};
    obj[fieldName] = "{{" + sanitize(field.key) + "}}";
    inArguments.push(obj);
  }

  function sanitize(objectPath) {
    var segments = objectPath.split(".");
    for (var i = 0; i < segments.length; i++) {
      var isAttributeSet = i === segments.length - 2;
      var isAttributeName = i === segments.length - 1;
      var isUserDefined = isAttributeSet || isAttributeName;
      if (isUserDefined) {
        var escapedSegment = '"' + segments[i] + '"';
        segments[i] = escapedSegment;
      }
    }
    return segments.join(".");
  }

  function getActivityName() {
    if (isEmptyString(activityName)) {
      activityName = "template-neru-messages"; // constructActivityName();
    }
    return activityName;
  }

  function getPhone() {
    return $(phoneSelector).val();
  }

  function isValidInput() {
    var phone = getPhone();

    var Missing = isEmptyString(phone);
    return !Missing;
  }

  function isEmptyString(text) {
    return !text || text.length === 0;
  }
});
