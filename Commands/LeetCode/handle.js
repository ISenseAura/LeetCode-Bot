const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const config = require('../../Configs/config');
const { db } = require('../../Structures/Database');
const { lchown } = require('fs');
const NewTools = require('js-helpertools');

module.exports = {
    help: {
        name: 'handle',
        aliases: ['handle'],
        description: 'Shows all the commands.',
        category: __dirname.split("Commands\\")[1]
    },
    run: async (client, message, args) => {

        const embed = new MessageEmbed()
            .setColor(config.embedcolor)
            .setAuthor(`${message.guild.me.displayName}`, message.guild.iconURL())
            .setThumbnail(client.user.displayAvatarURL());

        if (!args[0]) {

            let commandCategories = [];

            let markedNSFW = false;
            client.commands.forEach(c => {
                if (!commandCategories.includes(c.help.category)) {
                    if (config.devs !== message.author.id && c.help.category === ('Owner')) return;
                    if (!message.channel.nsfw && c.help.category === 'Nsfw') {
                        if (!markedNSFW) {
                            markedNSFW = true;
                            embed.addField(`${emotes.nsfw} NSFW [3] -`, 'This section can only be used in an NSFW channel.');
                        }
                    }
                    else commandCategories.push(c.help.category);
                };
            })

            commandCategories.forEach(emote => {
                let cmds = client.commands.filter(c => c.help.category === (emote));
                embed.setDescription(`** Prefix Is \`${config.prefix}\`\n\nFor Help Related To A Particular Command Type -\n\`${config.prefix}help [command name] Or ${config.prefix}help [alias]\`**`)
                embed.addField(`${emotes[toID(emote)]} ${emote}  [${cmds.size}] -`, cmds.map(c => `\`${c.help.name}\``).join(" "));
            });
            embed.setTimestamp();

            return message.channel.send(embed);
        } else {
         switch(args[0]) {
             case "register" : {
                 if(!args[1]) return message.channel.send("No username provided \n Syntax : `" + config.prefix + "handle register leetcode_username`");
                 let user = message.author;
                 
                 if(Db.databases.handles[user.id]) {
                    message.channel.send(`You already have a handle registered which is \`${Db.databases.handles[user.id].handle}\` \n To remove old handle use :   \`${config.prefix}handle remove\` `);
                    return;
                 }
let aft = 60;
                 LC.getUser(args[1].trim()).then((a) => {
                     if(!a) return message.channel.send(`LeetCode username \`${args[1].trim()}\` not found`);
                     if(Db.databases.authkeys[user.id]) return message.channel.send(`You already have a auth key generated \n Go to https://leetcode.com/profile/ and add this key \`${Db.databases.authkeys[user.id]}\` in the name section of your profile `); 
                     let key = "P" + Tools.generateKey(16);
                     Db.databases.authkeys[user.id] = key;
                      message.channel.send(`Auth key for your handle verification successfully generated \n Go to https://leetcode.com/profile/ and add this key \`${Db.databases.authkeys[user.id]}\` in the name section of your profile within next ${aft} seconds to verify the handle
                     `); 

                     setTimeout(after60,aft * 1000);

                     function after60() {
                        LC.getUser(args[1].trim()).then((a) => {
                            let verified = false;
                            if(Db.databases.handles[user.id]) return;
                            if(a.profile.realName.trim() == Db.databases.authkeys[user.id].trim()) verified = true;
                            delete Db.databases.authkeys[user.id];
                            if(verified) {
                                Db.databases.handles[user.id] = {username : user.username, handle : args[1].trim()};
                                Db.exportDatabase("handles");
                                 return message.channel.send(`Your handle with LeetCode username \`${args[1]}\` is successfully verified \n Have fun~`)
                            }
                            message.channel.send(`For some reasons your handle with LeetCode username \`${args[1]}\` could not be verified`)
                          
                        })
                     }

                    })

             }
             break;

             case "verify" : {
                if(!args[1]) return message.channel.send("No username provided \n Syntax : `" + config.prefix + "handle verify leetcode_username`");
                let user = message.author;
         
                    if(!Db.databases.authkeys[user.id]) return message.channel.send(`There is no registration process running for handle  \`${args[1].trim()}\``);
                  //  if(Db.databases.authkeys[user.id]) return message.channel.send(`You already have a auth key generated \n Go to https://leetcode.com/profile/ and add this key \`${Db.databases.authkeys[user.id]}\` in the name section of your profile `); 
                  
                   let key = Db.databases.authkeys[user.id];
              
                       LC.getUser(args[1].trim()).then((a) => {
                        if(!a) return message.channel.send(`LeetCode username \`${args[1].trim()}\` not found`);

                           let verified = false;
                           if(a.profile.realName.trim() == Db.databases.authkeys[user.id].trim()) verified = true;
                           delete Db.databases.authkeys[user.id];
                           if(verified) {
                            Db.databases.handles[user.id] = {username : user.username, handle : args[1].trim()};
                            Db.exportDatabase("handles");
                                return message.channel.send(`Your handle with LeetCode username \`${args[1]}\` is successfully verified \n Have fun~`)
                           }
                           message.channel.send(`For some reasons your handle with LeetCode username \`${args[1]}\` could not be verified`)
                         
                       })
                    }

             
             break;
             

             case "remove" : {
                 if(args[1]) {
                    if (config.devs !== message.author.id) return message.channel.send(`Only the Developer can remove other user's handle, if you want to remove your handle then use 
                    \`${config.prefix}handle remove\` only`);
                    let target = message.mentions.users.values().next().value;
                    if(!Db.databases.handles[target.id]) return message.channel.send(`The handle is not registered`);
                    message.channel.send(`The handle ${Db.databases.handles[target.id].handle} has successfully been deleted`);
                    delete Db.databases.handles[target.id];
                    Db.exportDatabase("handles");
                    return;
                }
                    if(!Db.databases.handles[message.author.id]) return message.channel.send(`You haven't registered any handle`);
                     message.channel.send(`Your handle ${Db.databases.handles[message.author.id].handle} has successfully been deleted`);
                     delete Db.databases.handles[message.author.id];
                     Db.exportDatabase("handles");
                
             }
             break;

             case "list" : {
                 let hans = Db.databases.handles;
                 let keys = Object.keys(hans);
                 if(!keys.length) return message.channel.send("The list is empty");
                 let txt = `** Username            -    Handle ** \n\n`;
                 keys.forEach((a) => {
                   txt += `${hans[a].username}   ${hans[a].handle} \n`

                 })
                 message.channel.send(txt)
             }
break;
             case "show" : {
let u = Db.databases.handles[message.author.id] ? Db.databases.handles[message.author.id].handle : false;
if(args[1])  {
    u = Db.databases.handles[message.mentions.users.values().next().value.id] ? Db.databases.handles[message.mentions.users.values().next().value.id].handle : false;
}
                LC.getUser(u).then((a) => {
                    if(!a) message.channel.send("handle not found")
                    const embed = new MessageEmbed()
                    .setColor(config.embedcolor)
                    .setAuthor(`${message.guild.me.displayName}`, message.guild.iconURL())
                    .setThumbnail(a.profile.userAvatar);

                    embed.setDescription(`** ${message.author.username}'s LeetCode handle ** `)

                    embed.addField(`Username -`,  "" +  a.username);
                    embed.addField(`Github URL -`, "" +  a.githubUrl ? a.githubUrl : "none");
                    embed.addField(`Country -`,  "" + a.profile.countryName);
                 //   embed.addField(`Skills -`, "" + a.profile.skillTags.length ? a.profile.skillTags : "none");
                    embed.addField(`Star Rating -`,   "" + a.profile.starRating);

                   // embed.addField(`About -`, "" +  a.profile.aboutMe);

message.channel.send(embed)
                })
                

                
             }
             break;

             default : {
                return message.channel.send("embed")
             }
         }

            
        }
    }
}