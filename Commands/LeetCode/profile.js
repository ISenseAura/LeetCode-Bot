const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const config = require('../../Configs/config');
const { db } = require('../../Structures/Database');
const { lchown } = require('fs');
const NewTools = require('js-helpertools');

let bts = require("./battle-entity");
const { battles } = require('./battle-entity');





module.exports = {
    help: {
        name: 'profile',
        aliases: ['profile', 'me'],
        description: 'Shows all the commands.',
        category: __dirname.split("Commands\\")[1]
    },
    run: async (client, message, args) => {

        let send = message.channel.send;
        let diffs = ["easy", "medium", "hard", "difficult"]
        let uData = Db.databases.handles[message.author.id];

        console.log(args)
     
            if(!uData) return message.channel.send("User doesnt have verified leetcode handle");
            if(Db.databases.leaderboard[message.author.id]) uData = Db.databases.leaderboard[message.author.id];
  if(args[0]) {
            let target = message.mentions.users.values().next().value;
            if(!target) return message.channel.send("You need to mention the user to see their profile");
            uData = Db.databases.handles[target.id];
            if(!uData) return message.channel.send("User doesnt have verified leetcode handle");
            if(Db.databases.leaderboard[target.id]) uData = Db.databases.leaderboard[target.id];
        }

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;


        const embeddd = new MessageEmbed()
        .setColor(config.embedcolor)
        .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
        .setDescription(`
    __**LeetCode Profile**__
    **•** \`Username:\` **${uData.username}**
     **•** \`Handle:\` **${uData.handle}**
     **•** \`Matches Played:\` **${uData.matches}**
     **•** \`Matches Won:\` **${uData.win}**
     **•** \`Matches Lost:\` **${uData.loses}**
     **•** \`Total Points:\` **${uData.points}**
     **•** \`Problems Solved:\` **${uData.problemSolved ? uData.problemSolved : 0}**
`)
        .setThumbnail(user.user.avatarURL({ dynamic: true }))
        .setTimestamp()
      
    message.channel.send(embeddd)

        
    }
}
