import { Client, Databases, Account } from "appwrite";

const projectId = "6780c774003170c68252";
const databaseId ="67871d61002bf7e6bc9e";
const customersId = "679ed05e000d929edbe8";
const usersId = "679ecbe80015c69a3d6e";
const dealershipLevel1Id = "679ecb1b000c23a061e6";
const dealershipLevel2Id = "679ecb2b000cb12417fb"
const dealershipLevel3Id = "679ecb35001d764538f6" 
const appointmentsId = "679e2e5100067db83558" 
const bucketId = '679a6a24003b707de5c0';

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(projectId);

const databases = new Databases(client);
const account = new Account(client);

export { 
    client,
    databases, 
    account,
    projectId,
    databaseId,
    dealershipLevel1Id,
    dealershipLevel2Id,
    dealershipLevel3Id,
    customersId,
    usersId,
    appointmentsId,
    bucketId
};
