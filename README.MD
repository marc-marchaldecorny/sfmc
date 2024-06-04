# Vonage Cloud Runtime (VCR was NeRu) and Vonage Messages API Salesforce Marketing Cloud (SFMC) Custom Journey Activity Template

## Introduction

Starter template for creating a Vonage Messages API activity in the SFMC Journey Builder using VCR.
The custom activity allows you to send marketing campaign messages using Vonage Messages API through Salesforce Marketing Cloud.

## Getting Started

### Pre-Requisites

- Node.js and NPM.
- A Vonage account - you can sign up for a [Free Vonage account](https://ui.idp.vonage.com/ui/auth/registration).
- A SFMC Account with Journey Builder.
- Enable VCR for the Vonage Account.
- There are 2 packages: Messages API packages (SMS and MMS). If using MMS, a Capaign and Brand must be approved.
- Contact Vonage to get access to the [GitHub Repo](https://github.com/nexmo-se/template-neru-sfmc/tree/bs-sms) (SMS Repo).
- Fork and Clone one of the Repositories:
  - [SMS Repo](https://github.com/nexmo-se/template-neru-sfmc/tree/bs-sms).
  - [MMS Repo](https://github.com/nexmo-se/template-neru-sfmc/tree/bs-mms)

### Create a VCR Application

- Create a new VCR Application using the [VCR CLI](https://vonage-neru.herokuapp.com/neru/guides/cli).
- Configure the CLI to use the apiKey via `neru configure`.
- Update the CLI version via `neru version`.
- Create a VCR application via `neru app create --name "neru-app"`.
- Run `neru secrets add --name INTERNAL_API_SECRET --value "$(openssl rand -hex 12)"` (this will be only internally used at the moment, should be a secure random hash or equal)
- Create a neru.yml file via `neru init`. Select the VCR application you created and the region.
- Get the VCR Application URL via `neru deploy`. Save the 2nd Host URL for later use (allows iFrame).

### Vonage Application

- Now that you've created a Vonage Application using the VCR CLI, you can now link a Vonage Number to the new Vonage Application.

### Install Salesforce Marketing Cloud Custom Journey Package

- Log in to Marketing Cloud and at the top right, click on the profile icon and select Setup.
- Once in Setup, on the left pane, click on Apps and then select Installed Packages.
- Click on New, enter a Name e.g. SMS and then click Save.
- Click Add Component, select Journey Builder Activity and then click Next.
- Give the activity a Name e.g. SMS. Select the category where this activity will show up within Journey Builder;
  we will select Custom.
  Enter your VCR Host URL from earlier, then click Save.
- Copy the `Unique Key` value from the Journey Builder Activity panel and save it for later use.

### Create Data Extension

- You can use the [Data Extension CSV Sample](./../data-extension-sample.csv)
- Open Salesforce Marketing Cloud, navigate to `Email Studio > Email > Subscribers > Data Extension` and
  click Create to create a new Data Extension.
- Select Standard Data Extension
- Select Create from New
- Name e.g. Vonage Marketing
- External Key - leave blank
- Enable both: Is Sendable and Is Testable
- Click next and leave Data Retention Policy settings to Yes
- Enter fields with a record containing a Phone Number.
- Set a unique record data type as the `Primary Key`, ex. `ID`.
- Set the Phone Number to data type `Phone`.
- Set Send Relationship: Eg.`ID relates to Subscribers on Subscriber Key` and then click Create when done.
- Update the [Data Extension CSV Sample](./../data-extension-sample.csv) file with your contact's `Phone` numbers.
- Remember that your Primary Key Eg. ID must be unique.
- Navigate to the Data Extension you created > Records > import > Browse and select the file [Data Extension CSV Sample](./../data-extension-sample.csv) and click Next.
- Keep defaults `Map by Header Row` and click Next.
- Lastly click Import and close the modal.
- You will need to refresh and navigate to the Data Extension > Records to see the csv data we just imported.

### Configure Vonage Messages Activity

Edit [/public/config.json](../public/config.json)

- Replace `applicationExtensionKey` with the Journey Builder Activity `Unique Key` from ealier.
- Replace all instances of `VCR_HOST2_URL` with the VCR Host 2 URL from earlier:
  - <https://VCR_HOST2_URL/execute>
  - <https://VCR_HOST2_URL/publish>
  - <https://VCR_HOST2_URL/validate>
  - <https://VCR_HOST2_URL/stop>
  - <https://VCR_HOST2_URL/save>

### Deploy updated Custom Journey Activity Package

- Deploy Package updates to via `neru deploy`.

### Configure Journey Builder

- Navigate to Journey Builder > Journey Builder > click Create New Journey.
- Rename the Journey e.g. Vonage Marketing Campaign.
- Select Multi-Step Journey and then click the Create button hidden at the bottom.
- On the left pane in Entry Srouces, drag `Data Extension` to `Start with an Entry Source`.
- Click on the dragged Data Extension icon and then click on Select Data Extension.
- Select your Data Extension, click Summary and then click Done.
- On the left pane in Messages, drag and drop your Installed Package `SMS` to the area
  just before `1 day`.
- Click Save when done.
- Click on the package you just dragged `SMS` to see your Heroku App.

### Sending a campaign via SMS or WhatsApp Message

- Click on the package you dragged. You will see the Data Extenion fields populate on the right.
- Enter your Sender ID Eg. From Number
- Select the field to where the message should be sent to. Eg. Phone
- Enter a message Eg. `Hi there {FirstName} {LastName}!`.
- Click Done.

### Config Journey

- Click Save and then Validate. 2 errors will show up, so let's set this.
- Edit Entry Source, select Run Once, click Select and then click Done.
- Edit Settings, select Re-Entry anytime
- Click `Activate` and then click `Activate` to send the message. This will send a Message to all recipients in your CSV.
- If you look at the terminal where you ran the deploy you will see three executions.

### VCR Instance

- You can view the logs by going to the VCR Server Instance

```js
// If you have 3 records with a Phone Number
2022-10-14T21:06:54.869228+00:00 app[web.1]: ✅ Success: message_uuid= b16363e2-aa12-4796-aaf1-1f7b3b7f9901
2022-10-14T21:06:54.870964+00:00 app[web.1]: ✅ Success: message_uuid= 13dcf471-4bdd-4d23-a691-862c3022f4d2
2022-10-14T21:06:54.876695+00:00 app[web.1]: ✅ Success: message_uuid= 3643d0a9-2663-4534-8c77-e1567fde6d3d
```

- If you reply you see the response in the terminal

```js
// example response logged from inbound
inbound {
2022-10-13T23:48:58.472615+00:00 app[web.1]: to: 'YOUR_VONAGE_NUMBER',
2022-10-13T23:48:58.472616+00:00 app[web.1]: from: 'RESPONSE_FROM_NUMBER',
2022-10-13T23:48:58.472616+00:00 app[web.1]: channel: 'sms',
2022-10-13T23:48:58.472617+00:00 app[web.1]: message_uuid: 'xxxxxx',
2022-10-13T23:48:58.472619+00:00 app[web.1]: timestamp: '2022-10-13T23:48:58Z',
2022-10-13T23:48:58.472619+00:00 app[web.1]: usage: { price: '0.0057', currency: 'EUR' },
2022-10-13T23:48:58.472619+00:00 app[web.1]: message_type: 'text',
2022-10-13T23:48:58.472620+00:00 app[web.1]: text: 'Yes, I am interested in the promotion!',
2022-10-13T23:48:58.472621+00:00 app[web.1]: sms: { num_messages: '1' }
2022-10-13T23:48:58.472621+00:00 app[web.1]: }
```
