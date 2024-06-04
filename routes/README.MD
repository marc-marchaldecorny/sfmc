# README

Neru Instance:
https://neru-4f2ff535-template-neru-messages-dev.use1.serverless.vonage.com

Image to send:
https://info.thunderfunding.com/hubfs/beefree/Spanish%20Carrier/Thunder_Funding_Light_Grey_PNG_Final.png
Caption goes here!!!!

{{Event."DEAudience-c2ee3d4e-d6aa-fb88-5388-f2b8a16ad7e8"."Name"}}
{{Event."Name"}} - doesn't work

WORKS:
Hello {{Event."DEAudience-c2ee3d4e-d6aa-fb88-5388-f2b8a16ad7e8"."Name"}},
your email is {{Event."DEAudience-c2ee3d4e-d6aa-fb88-5388-f2b8a16ad7e8"."Email"}},
and your number is {{Event."DEAudience-c2ee3d4e-d6aa-fb88-5388-f2b8a16ad7e8"."MobilePhone"}}

{{Contact.Attribute.Person.FirstName}} - breaks
{{Contact.Default.MobilePhone}} didn't work
{{InteractionDefaults.MobilePhone}} - crashes. Even when set to MobilePhone

1. Create a new Journey
2. send a message
3. See source onActivity > execute > inArguments > Name

WORKS:
Name: {{Event."DEAudience-f4f65ee9-6b2a-7084-e11c-0512532d21a7"."Name"}}
ContactKey: {{Context.ContactKey}}
DefinitionId: {{Context.DefinitionId}}
