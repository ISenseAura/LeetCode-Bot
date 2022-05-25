global.toID = function (text) {
    if (typeof text === 'string') return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}



global.config = require('../Configs/config');
global.emotes = require('../Configs/emotes')
global.filters = require('../Configs/filters')
global.Tools = require("js-helpertools")



'use strict';

const fs = require('fs');
const { battles } = require('../Commands/LeetCode/battle-entity');
const BACKUP_INTERVAL = 60 * 60 * 1000;

class Storage {
    constructor() {
      
        /**@type {{[k: string]: AnyObject}} */
        this.databases = {};
        /**@type {AnyObject} */
        this.globalDatabase = {};
        this.backupInterval = setInterval(() => this.exportDatabases(), BACKUP_INTERVAL);
    }

    /**
     * @param {string} id
     * @returns {AnyObject}
     */
    getDatabase(id) {
        if (!(id in this.databases)) this.databases[id] = {};
        // sync database properties

        return this.databases[id];
    }

    /**
     * @param {string} id
     */
    importDatabase(id) {
        let file = '{}';
        try {
            file = fs.readFileSync('./databases/' + id + '.json').toString();
        } catch (e) {}
        this.databases[id] = JSON.parse(file);
    }

    /**
     * @param {string} id
     */
    exportDatabase(id) {
        if (!(id in this.databases)) return;
        fs.writeFileSync('./databases/' + id + '.json', JSON.stringify(this.databases[id]));
    }

    importDatabases() {
        let databases = fs.readdirSync('./databases');
        for (let i = 0, len = databases.length; i < len; i++) {
            let file = databases[i];
            if (!file.endsWith('.json')) continue;
            this.importDatabase(file.substr(0, file.indexOf('.json')));
        }
    }

    exportDatabases() {
        for (let id in this.databases) {
            this.exportDatabase(id);
        }
    }

    /**
     * @param {number} points
     * @param {User} user
     * @param {string} id
     */
    addPoints(points, user, id) {
        if (isNaN(points)) return;
        if (!(id in this.databases)) this.databases[id] = {};
        let database = this.databases[id];
        if (!('leaderboard' in database)) database.leaderboard = {};
        if (!(user.id in database.leaderboard)) database.leaderboard[user.id] = {points: 0};
        database.leaderboard[user.id].points += points;
        let name = Tools.toAlphaNumeric(user.name);
        if (database.leaderboard[user.id].name !== name) database.leaderboard[user.id].name = name;
    }

    /**
     * @param {number} points
     * @param {User} user
     * @param {string} id
     */
    removePoints(points, user, id) {
        this.addPoints(-points, user, id);
    }

    /**
     * @param {User} user
     * @param {string} id
     */
    getPoints(user, id) {
        if (!(id in this.databases)) this.databases[id] = {};
        let database = this.databases[id];
        if (!('leaderboard' in database)) database.leaderboard = {};
        if (!(user.id in database.leaderboard)) return 0;
        return database.leaderboard[user.id].points;
    }
}

global.Db = new Storage();
global.LC = require('../Configs/leetcode')


Db.importDatabases();



