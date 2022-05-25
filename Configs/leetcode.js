let { LeetCode } = require("leetcode-query");
const { db } = require("../Structures/Database");
const leetcode = new LeetCode();

class LC {

    constructor() {
        if(!Db.databases.handles) Db.databases.handles= {};
        if(!Db.databases.authkeys) Db.databases.authkeys= {};
    }

     async getUser(username) {
        let user = await leetcode.get_user(username);
return user.matchedUser;
    }

    async getSubmissions(username) {
        let user = await leetcode.get_user(username);
return user.recentSubmissionList;
    }

    verifyUser(name,key) {
        let verified = false;
        this.getUser(name).then((a) => {
            if(a.profile.realName.trim() == key.trim()) verified = true;
            console.log(a.profile.realName.trim() == key.trim())
        })
        return verified;
    }

    

}
module.exports = new LC()
