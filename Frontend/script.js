function sendMessage(){

let input=document.getElementById("userInput");
let message=input.value.trim();

if(message==="") return;

addUserMessage(message);

let reply=getBotResponse(message.toLowerCase());

setTimeout(()=>{
addBotMessage(reply);
},500);

input.value="";
}

function addUserMessage(text){

let chatBox=document.getElementById("chatBox");

let msg=document.createElement("div");
msg.className="user-message";
msg.innerText=text;

chatBox.appendChild(msg);

chatBox.scrollTop=chatBox.scrollHeight;
}

function addBotMessage(text){

let chatBox=document.getElementById("chatBox");

let msg=document.createElement("div");
msg.className="bot-message";
msg.innerText=text;

chatBox.appendChild(msg);

chatBox.scrollTop=chatBox.scrollHeight;
}

function getBotResponse(input){

if(input.includes("student") || input.includes("scholarship"))
return "You may be eligible for:\n• National Scholarship Portal\n• PM Scholarship Scheme\n• Post Matric Scholarship";

if(input.includes("farmer"))
return "You may be eligible for:\n• PM-Kisan Scheme\n• Kisan Credit Card\n• Soil Health Card Scheme";

if(input.includes("woman") || input.includes("women"))
return "You may be eligible for:\n• Beti Bachao Beti Padhao\n• Sukanya Samriddhi Yojana\n• Mahila E-Haat";

if(input.includes("senior") || input.includes("old"))
return "You may qualify for:\n• National Old Age Pension Scheme\n• Senior Citizen Savings Scheme";

if(input.includes("low income") || input.includes("poor"))
return "You may qualify for:\n• PM Awas Yojana\n• Ayushman Bharat Health Scheme";

return "Please tell me if you are a student, farmer, woman entrepreneur, senior citizen, or low-income family so I can suggest schemes.";
}