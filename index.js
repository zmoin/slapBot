const Discord = require('discord.js')
const client = new Discord.Client()

client.on('message', (receivedMessage) => {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) {
        return
    }
    //if the message starts with a ! then pass it on the the function
    if (receivedMessage.content.startsWith("!")) {
        slapCommand(receivedMessage)
    }
})

function slapCommand(receivedMessage) {
    // Remove the leading exclamation mark and the space
    let fullCommand = receivedMessage.content.substr(2)
        // Split the message up in to pieces for each space/simulate an array
    let splitCommand = fullCommand.split(" ")
        // The first word directly after the exclamation is the user to slap 
    let userName = splitCommand[0]
        // All other words are arguments/parameters/options for the command
    let arguments = splitCommand.slice(1)

    if (arguments.length > 0)
        receivedMessage.channel.send("slaps " + userName + " with a " + arguments);
    else
        receivedMessage.channel.send("slaps " + userName + " with a trout");


}



client.login('token');