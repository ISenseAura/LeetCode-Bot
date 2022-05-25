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
        name: 'battle',
        aliases: ['battle', 'match', "bt"],
        description: 'Shows all the commands.',
        category: __dirname.split("Commands\\")[1]
    },
    run: async (client, message, args) => {

        let send = message.channel.send;
        let diffs = ["easy", "medium", "hard", "difficult"]

        if (!args[0]) {
            message.channel.send(`Use \`${config.prefix}battle challenge @user, <difficulty level (easy,medium or hard)>, <number of questions>, <time in minutes>\``);
            return;
        }


        switch (args[0]) {
            case "challenge": {
                console.log(args)
                if (args.length < 3 || args[2].split(",").length < 4) {
                    message.channel.send("ERROR : NOt enough arguments were specified")
                    return;
                }

                if (!Db.databases.handles[message.author.id]) return message.channel.send(`Please register your leetcode handle before participating`);

                let tgs = args[2].split(",");
                let diff = tgs[1]
                let noq = parseInt(tgs[2]);
                let time = parseInt(tgs[3]);
                if (bts.battles[message.author.id]) return message.channel.send("You are already challenging/battling someone");
                if (!message.mentions.users) return message.channel.send("You didnt mention the user you wanted to battle");
                let target = message.mentions.users.values().next().value;
                if (!Db.databases.handles[target.id]) return message.channel.send(`Please ask your opponent to register their leetcode handle before participating`);

                if (!diffs.includes(Tools.toId(diff).trim())) return message.channel.send("Invalid difficulty level provided");
                if (typeof noq != "number" || noq < 1 || noq > 6) return message.channel.send("Invalid number of questions entered (minimum 1, maximum 6)");
                if (!time || typeof time != "number") return message.channel.send("Invalid time entered");

                message.author.handle = Db.databases.handles[message.author.id].handle
                message.author.points = 0;
                message.mentions.users.values().next().value.handle = Db.databases.handles[target.id].handle
                message.mentions.users.values().next().value.points = 0;
                let players = [message.author, message.mentions.users.values().next().value]
                console.log(players)
                let data = { players, diff, time, noq, room: message.channel, chalBy: message.author, target };
                message.channel.send(`${players[0].username} has challenged ${players[1].username} for a battle.
 Use \`${config.prefix}battle accept @${players[0].username}\` to start the battle. \n
Rules :
   Total Questions : ${noq}
   Time : ${time} mins
   Level : ${diff}
`)

                console.log(battles)

                bts.challenges[players[0].id] = { challenger: players[0], status: "pending", timeChallenged: new Date(), target: players[1], data: data }
                bts.update();

            }

                break;

            case "withdraw": {
                if (!bts || !bts.battles[message.author.id]) return message.channel.send("You dont have an battle running");
                bts.battles[message.author.id].withdraw(message.author.id);
                bts.finished.push(bts.battles[message.author.id]);
                delete bts.battles[bts.battles[message.author.id].challengedBy.id];
                delete bts.battles[bts.battles[message.author.id].chalTo.id];

                bts.update();
                message.channel.send("You have withdrawn your challenge");
            }

            case "accept": {
                if (!args[1]) return message.channel.send(`Use \`${config.prefix}battle accept @username\` to accept a battle`)
                let target = message.mentions.users.values().next().value;
                if (!bts || !bts.challenges[target.id]) return message.channel.send("This user has not challenged you");
                if (bts.battles[message.author.id]) return message.channel.send("You cant start a new battle until you finish your current one!");
                bts.challenges[target.id].status = "accepted"
                bts.create(bts.challenges[target.id].data);
                message.channel.send(`The battle between ${target.username} and ${message.author.username} has started!`)


                /*
                 * With Discord now allowing messages to contain up to 10 embeds, we need to put it in an array.
                 */
                bts.start(target.id).then(() => {
                    console.log(bts);

                    let qs = "";
                    let pts = "";
                    let links = "";
                    const embed = new MessageEmbed()

                        /*
                         * Alternatively, use "#3498DB", [52, 152, 219] or an integer number.
                         */
                        .setColor(0x3498DB)
                        .setAuthor("Lockout Bot", "https://i.imgur.com/lm8s41J.png")
                        .setTitle(`${target.username} V/S ${message.author.username} `)
                        .setDescription(`The battle between ${target.username} and ${message.author.username} has started! (${Tools.toDurationString(new Date().getTime() - bts.battles[message.author.id].timestamp)}) \n `)
                        .setTimestamp()


                    bts.battles[target.id].questions.forEach((q) => {


                        qs += `[${q.title}](${q.link}) \n`;
                        pts += `${q.points} \n`;
                        ;
                    })

                    embed.addFields(
                        { name: "Questions", value: qs, inline: true },
                        { name: "Points", value: pts, inline: true },

                    )

                    message.channel.send(embed);

                });







            }

                break;

            case "submitted": {
                if (!bts.battles[message.author.id]) return message.channel.send("You are not in a battle!");
                bts.battles[message.author.id].checkAnswered(message.author.id, false, true);

            }

                break;

            case "leaderboard": {
                if (!Db.databases.leaderboard) return message.channel.send("There's nothing to show in leaderboard!");

                const embed = new MessageEmbed()
                    .setColor(config.embedcolor)
                    .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
                    .setTimestamp()

                let led = "";

                let t = {}
                Object.keys(Db.databases.leaderboard).forEach((q) => {
                    let u = Db.databases.leaderboard[q];
                
                    u.pos = Object.keys(t).length + 1;
                    if (t[u.points]) {
                        if (Array.isArray(t[u.points])) { t[u.points].push(u); }
                        else { t[u.points] = [t[u.points], u]; }
                    }
                    else { t[u.points] = u; }
                })

            

               let sorted = Tools.deepSortArray(Object.keys(t)).reverse();
                   for(let i = 0;i < sorted.length;i++ ) {
                   let dt = t[sorted[i]];
                   if(Array.isArray(dt)) {
                       dt.forEach((b) => {
                           led += `\n\n   __**#${i + 1}**__
                           **•** \`Username:\` **${b.username}**
                            **•** \`Match:\` **${b.matches}**
                            **•** \`Win:\` **${b.win}**
                            **•** \`Lose:\` **${b.loses}**
                            **•** \`Points:\` **${b.points}**                       `
                       })
                    }

                    else {
                        led += `\n\n   __**#${i + 1}**__
                        **•** \`Username:\` **${dt.username}**
                         **•** \`Match:\` **${dt.matches}**
                         **•** \`Win:\` **${dt.win}**
                         **•** \`Lose:\` **${dt.loses}**
                         **•** \`Points:\` **${dt.points}**                       `
                    }
                   }

                embed.setDescription(led);
                message.channel.send(embed);

            }

                break;






        }


    }
}
