import { Client, Databases, Account } from "appwrite";

const projectId = "6780c774003170c68252";
const databaseId ="67871d61002bf7e6bc9e";
const customersId = "678724210037c2b3b179";
const usersId = "679daed50032a47da1e8";
const dealershipLevel1Id = "679daae60025d4b49989";
const dealershipLevel2Id = "679daafa0037dc5dd246"
const dealershipLevel3Id = "679dab040015a9a5404d" 
const appointmentsId = "679e2e5100067db83558" 

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
    appointmentsId
};
