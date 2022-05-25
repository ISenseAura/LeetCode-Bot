const { db } = require("../../Structures/Database")
const { MessageEmbed } = require('discord.js');

let { LeetCode } = require("leetcode-query");
const lc = new LeetCode();

class Battle {
    constructor(players, difficulty, time, room, noq, chalBy, chalTo) {

        this.playerIDs = [],
            players.forEach((a) => {
                this.playerIDs.push(a.id)
            })
        this.players = { [players[0].id]: players[0], [players[1].id]: players[1] },
            this.difficulty = Tools.toId(difficulty),
            this.solved = [],
            this.dateCreated = '',
            this.endedAt = false,
            this.timestamp = new Date().getTime();
        this.time = time,
            this.questions = [],
            this.room = room,
            this.noq = noq,
            this.challengedBy = chalBy
        this.challengedTo = chalTo
        this.winner = ""
        this.reason = ""
        this.status = "Running"
        this.qs = []
        this.timeout = false;

    }


    async getQuestions(id, obj) {
        if (this.qs.length || this.questions) {
            this.qs = [];
            this.questions = [];
        }
        let qs = Tools.sampleMany(Db.databases.qs[this.difficulty], this.noq);
        for (let i = 0; i < this.noq; i++) {
            let a = await lc.get_problem(qs[i].toLowerCase().trim());
            if (!a || !a.title) return this.getQuestions(id, obj);
            let q = {
                title: a.title, link: `https://leetcode.com/problems/${a.titleSlug}/`, likes: a.likes,
                dislikes: a.dislikes, points: 0, slug: a.titleSlug, solved: false, solvedBy: false, timeTaken: false
            }

            switch (Tools.toId(a.difficulty)) {
                case "easy": q.points = 100
                    break;
                case "medium": q.points = 200
                    break;
                case "difficulst": q.points = 300
                    break;
                case "hard": q.points = 300
                    break;

            }
            this.questions.push(q);
            this.qs.push(q.slug)

            this.timeout = setInterval(this.autoCheckAnswered, 15 * 1000, this);

        }
    }


    markQuestionSubmitted(slug, user, time) {
        if (!slug) return;
        let q = {};
        let index2 = this.qs.indexOf(slug);
        this.qs = Tools.removeElement(this.qs, index2);

        this.questions.forEach((u) => {
            if (u.slug == slug) {
                q = u;
                this.players[user.id].points += q.points;
                this.room.send(JSON.stringify(user));
                if(!Db.databases.leaderboard) Db.databases.leaderboard = {}
                if(!Db.databases.leaderboard[user.id]) Db.databases.leaderboard[user.id] = {}
                Db.databases.leaderboard[user.id].problemSolved = Db.databases.leaderboard[user.id].problemSolved + 1;
                Db.exportDatabase("leaderboard")

            }
        });
        let index = this.questions.indexOf(q);
        this.questions[index].solved = true;
        this.questions[index].solvedBy = user;
        this.questions[index].timeTaken = time;
    }

    end(reason, force,ref) {
        if (ref.qs.length > 0 && !force) return ref.room.send("There are still some questions left, use force end battle to forcefully end it");
        ref.status = "ended";
        ref.reason = reason;
        ref.winner = false;
        ref.playerIDs.forEach((playerId) => {
            let i = playerId;
            let a = ref.players[playerId];
            let bt = a;
            if (!ref.winner && !ref.winner.points) ref.winner = a;
            if (ref.winner && ref.winner.points < a.points) ref.winner = a;
            console.log(battles.battles[ref.playerIDs[0]]);
          
        })

        if (ref.winner.points == 0) ref.winner = "none";

        if(this.endedAt) return;
        ref.endedAt = new Date();
        
        clearInterval(ref.timeout);
        if (ref.winner.points == 0) ref.winner = "none";
        
        ref.playerIDs.forEach((i)=> {

            let a = ref.players[i];
            if (!Db.databases.leaderboard) Db.databases.leaderboard = {};
            if (!Db.databases.leaderboard[i]) Db.databases.leaderboard[i] = { username: a.username, handle: a.handle, matches: 0, win: 0, loses: 0, points: 0 };
            Db.databases.leaderboard[i].matches += 1;
          //  ref.room.send(`Debugging Purpose : \n ${JSON.stringify(ref.winner)} \n ${JSON.stringify(ref.winner)}}`)
            if (ref.winner.username == a.username) { Db.databases.leaderboard[i].win += 1; }
            else { Db.databases.leaderboard[i].loses += 1; }
            Db.databases.leaderboard[i].points += a.points ? a.points : 0;

            Db.exportDatabase("leaderboard");
        })
        ref.timeout = false;

    }

    checkAnswered(id, obj, custom) {

        if (this.winner) return;
        let dt = lc.get_user(this.players[id].handle);
        let qSubmitted = false;
        try {
            dt.then((c) => {
                c.recentSubmissionList.forEach((b) => {
                    if (this.qs.includes(b.titleSlug)) {
                        let time = Tools.toDurationString(Date.now() - (b.timestamp * 1000))
                        let timeTook = Tools.toDurationString((b.timestamp * 1000) - this.timestamp)
                        if (!(timeTook.includes("hour") || timeTook.includes("hours") || timeTook.includes("days") || timeTook.includes("months"))) {
                            let status = Tools.toId(b.statusDisplay);
                            let qs = "";
                            let pts = "";
                            let links = "";
                            if (status == "accepted") {
                                this.markQuestionSubmitted(b.titleSlug, this.players[id], time)


                                const embed = new MessageEmbed()
                                    .setColor(0x3498DB)
                                    .setAuthor("Lockout Bot", "https://i.imgur.com/lm8s41J.png")
                                    .setTitle(`${this.players[this.playerIDs[0]].username} V/S ${this.players[this.playerIDs[1]].username} `)
                                    .setDescription(`The battle between ${this.players[this.playerIDs[0]].username} and ${this.players[this.playerIDs[1]].username} has started! (${Tools.toDurationString(new Date().getTime() - this.timestamp)}) \n  ${this.players[id].username} submitted correct answer to ${b.title} in ${timeTook}`)
                                    .setTimestamp()
                                this.questions.forEach((q) => {
                                    qs += `[${q.title}](${q.link}) \n`;
                                    if (q.solved) { pts += `${q.points} to ${q.solvedBy.username} \n`; }
                                    else { pts += `${q.points} \n`; }
                                    ;
                                })

                                embed.addFields(
                                    { name: "Questions", value: qs, inline: true },
                                    { name: "Points", value: pts, inline: true },

                                )

                                this.room.send(embed);

                            }
                            else {

                                /*  const embed = new MessageEmbed()
                                  .setColor(0x3498DB)
                                  .setAuthor("Lockout Bot", "https://i.imgur.com/lm8s41J.png")
                                  .setTitle(`${this.players[this.playerIDs[0]].username} V/S ${this.players[this.playerIDs[1]].username} `)
                                  .setDescription(`The battle between ${this.players[this.playerIDs[0]].username} and ${this.players[this.playerIDs[1]].username} has started! (${Tools.toDurationString(new Date().getTime() - this.timestamp)}) \n 
                                 ${this.players[id].username} attempted the question ${b.title} but failed (Reason : ${b.statusDisplay})` )
                                  .setTimestamp()        
                                 this.questions.forEach((q) => {
              
                                  
                                  qs += `[${q.title}](${q.link}) \n`;
                                  if(q.solved) { pts += `${q.solvedBy.username} \n`;}
                                  else {pts += `${q.points} \n`;}
                                  ;
                                  })
                                  
                             embed.addFields(
                              { name: "Questions", value: qs, inline: true },
                              { name: "Points", value: pts, inline: true },
                             
                            )
              
                            this.room.send(embed);
      */

                                if (custom) this.room.send(`Solution submitted was rejected (${b.statusDisplay})` + "\n Time Taken to submit : " + timeTook);
                                //  this.markQuestionSubmitted(b.titleSlug,this.players[id],time)
                            }
                            qSubmitted = true;
                        }

                    }

                })

                if (!qSubmitted && custom) {
                    this.room.send("You havent submitted solution to any of the questions");

                }

            })
        } catch (e) {

            this.room.send("ERROR : " + e.message);
        }
    }

    async autoCheckAnswered(obj) {
        let users = Object.values(obj.players);

        try {
            users.forEach((a) => {
                if (!obj.players[a.id]) return;
                obj.checkAnswered(a.id);

            })
        } catch (e) {
            obj.room.send("ERROR : " + e.message);
        }
    }






    withdraw(id) {
        this.winner = Object.keys(this.players)[0] == id ? this.players[Object.keys(this.players)[1]] : this.players[Object.keys(this.players)[0]];
        this.reason = "Match withdrawn by " + this.players[id].username;
        this.status = "Finished"
    }


}


class Battles {
    constructor(data) {
        this.battles = {}
        this.finished = []
        this.autoEnd = {}
        this.challenges = {}

    }


    create(data) {
        this.leaderboard = Db.databases.leaderboard ? Db.databases.leaderboard : {};
        let ran = "";
        let id = data.players[0].id;
        let id2 = data.players[1].id;
        this.battles[id] = new Battle(data.players, data.diff, data.time, data.room, data.noq, data.chalBy, data.chalTo);
        this.battles[id2] = this.battles[id];


        global.battles = this;
        return true;
    }

    async start(id) {
        await this.battles[id].getQuestions(id, this);
        this.battles[id].playerIDs.forEach((a) => {
            this.autoEnd[a] = setTimeout(this.end, this.battles[a].time * 60 * 1000, a, this, "Timeout", true);

        })
    }
    async end(id, bts, reason, force) {
        if(!bts.battles[id]) return;
        bts.battles[id].playerIDs.forEach((i) => {
            let bt = bts.battles[i];
            bt.end(reason, force, bt);
        })
        bts.battles[id].room.send("The battle has ended (Reason : " + bts.battles[id].reason + " ).  The winner is " + (bts.battles[id].winner.username ? bts.battles[id].winner.username : "none") );

        bts.battles[id].playerIDs.forEach((i) => {
            let bt = bts.battles[i].players[i];

            delete bts.battles[i];
        })

    }

    update() {
        //  Db.databases["battles"] = this;
        //  Db.exportDatabase("battles");
    }


}
let bts = new Battles();
module.exports = bts;











